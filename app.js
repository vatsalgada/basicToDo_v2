//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-vatsal:admin@cluster0.jurk8.mongodb.net/todov2', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const itemsSchema = {
  name:{
    type: String
  }
};
const Item = mongoose.model('Item', itemsSchema);

const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model('List', listSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
})
const item2 = new Item({
  name: "Hit the + button to add new items" 
})
const item3 = new Item({
  name: "<-- Hit the checkbox to delete an item"
})

const defaultItems = [item1, item2, item3];



const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

app.get("/", function(req, res) {



  Item.find({}, function(err, foundItems){
    if (foundItems.length === 0){
      Item.insertMany(defaultItems , function(err){
        if (err){
          console.log(err);
        } else{
          console.log("Succesfully saved default items to DB");  
        }
      }  )
      res.redirect('/');
    } else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    };
  })
  

  });

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect('/');
  } else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect('/' + listName);
    });
  }
});

app.post('/delete', function(req,res){
  const checkboxID = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkboxID, function(err){
      if (err) {
        console.log(err);
      } else{
        console.log('Succesfully removed task');
        res.redirect('/');
      }
    });
  } else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkboxID}}}, function(err,foundList){
      if(err){
        console.log(err);
      }else{
        res.redirect('/' + listName); 
      }
    })
  }
 
})

app.get("/:listName", function(req,res){
  const listName = _.capitalize(req.params.listName); 
  
  List.findOne({name: listName}, function(err, foundList){
    if(err){
      console.log(err);
    }else{
      if(!foundList){
        const list = new List({
          name: listName,
          items: defaultItems
        });
      
        list.save();
        res.redirect('/' + listName);
      }else {
        res.render('list', {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });



});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
