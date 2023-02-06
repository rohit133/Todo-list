// jshint esversion:6

const dotenv = require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname+"/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();
const day = date.getDay();

// Setting the view engine to ejs and using the bodyParser 
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.set("strictQuery", false);
var username = process.env.db_admin;
var password = process.env.PASSWORD;

const db_url = "mongodb+srv://"+username+":"+password+"@cluster0.vgslnjp.mongodb.net/todolistDb";
console.log(db_url);
// connecting to MongoDB 
mongoose.connect(db_url);

const itemSchema = {
    name : String
};  

// Creating Model
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name :"Workout"
});

const item2 = new Item({
    name :"Item shopping"
});

const item3 = new Item({
    name :"Cook food"
});

defaultItem = [item1,item2,item3];

const listSchema = {
    name : String,
    items : [itemSchema]
} 
const List = mongoose.model("List", listSchema)



// Converting Time and sending it to the List file 
app.get("/", function(req, res){
    Item.find({}, function(err, result){
        if(result.length === 0){
            Item.insertMany(defaultItem, function(err){
                if(err){
                    console.log(err);
                } else {
                    console.log("Inserted Successfully.")
                }
            });
            res.redirect("/")
        } else {
            
            res.render("list",{listTitle: day , newListItems: result}); 
        }
       
    });
});

// Creating Custome name list
app.get("/:customList", function(req, res){
    const customlistName = _.capitalize(req.params.customList);

    List.findOne({name:customlistName}, function(err, result){
        if(!err){
            if(!result){
                // Create a new list
                const list = new List({
                    name : customlistName,
                    items : defaultItem
                });
                list.save();
                res.redirect("/"+customlistName);
            }else {
                // Show an existing list
                res.render("list",{listTitle: result.name , newListItems: result.items})
                
            }
        } 
    });


    // res.render("list", {listTitle: "Work List", newListItems: workItems})
})



// Posting new Items to the list

app.post("/", function(req, res){

    const itemName = req.body.newItem; 
    const listName = req.body.list

    const item = new Item({
        name : itemName
    });
    if(listName === day ){
        item.save(); 
        res.redirect("/");
    } else{
        List.findOne({name : listName}, function(err, result){
            result.items.push(item);
            result.save();
            res.redirect("/"+listName)
        });
    }  
});


// Deleting the Items from the list.
app.post("/delete", function(req, res){
    const checkedItem = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === day){
        Item.findByIdAndDelete({_id : checkedItem}, function(err){
            if(err){
                console.log(err);
            } else {
                console.log("Item removed");
            }
            res.redirect("/")
        });
    } else {
        List.findOneAndUpdate({name : listName}, {$pull: {items: {_id : checkedItem}}} ,function(err){
            if(!err){
                console.log("Item removed");
                res.redirect("/"+listName)
            }
        });
    }
});




app.get("/about", function(req, res){
    res.render("about")
})

// initilizing Ports of the Server. 
app.listen(3000, function(){
    console.log("Server running on Port 3000");
})