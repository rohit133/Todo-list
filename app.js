// jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname+"/date.js");
const app = express();
const items = []; 
const workItems = [];

// Setting the view engine to ejs and using the bodyParser 
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Converting Time and sending it to the List file 
app.get("/", function(req, res){
    const day = date.getDay();
    res.render("list",{listTitle: day , newListItems: items}); 
});



// Posting new Items to the list

app.post("/", function(req, res){
    
    console.log( req.body);
    const item = req.body.newItem; 

    if(req.body.list === "Work List"){
        workItems.push(item);
        res.redirect("/work");
    } else {
        items.push(item);
        res.redirect("/");
    }
});




// Work tToDo list
app.get("/work", function(req, res){
    res.render("list", {listTitle: "Work List", newListItems: workItems})
})

app.get("/about", function(req, res){
    res.render("about")
})

// initilizing Ports of the Server. 
app.listen(3000, function(){
    console.log("Server running on Port 3000");
})