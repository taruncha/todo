const express = require("express");
const bodyParser = require("body-parser");
const todayDate = require(__dirname+"/todayDate");
const mongoose = require("mongoose");
const app = express();



app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolistDB",{ useNewUrlParser: true })

const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name:"Welcome to todolist",
});
const item2 = new Item({
  name:"Hit + to add item"
});
const item3 = new Item({
  name:"<-- press this to delete item"
});

 const defaultItem = [item1, item2, item3];
 const listSchema = {
   name: String,
   items: [itemsSchema]
 };
 const List = mongoose.model("list", listSchema);


app.get ("/", function(req, res){

const date = todayDate.getDate();

Item.find({}, function(err, results){

  if (results.length === 0) {
    Item.insertMany(defaultItem, function(err){
      if (err) {
        console.log(err);
      } else {
        console.log("successfully added");
      }
    });
    res.redirect("/");
  }else {
    console.log("results: "+results.name);
    res.render("list", {workItem: date, newListItem: results});
  }

});
});
app.post("/",function(req, res){
    const itemName= req.body.newItem;
    const item = new Item({
      name: itemName,
    });
  item.save();
  res.redirect("/");
});
app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  Item.findByIdAndRemove(checkedItemId, function(err){
    if (err) {
      console.log(err);
    } else {
      console.log("Deleted successfully");
    }
  })
  res.redirect("/");
});
app.get("/:customListName",function(req, res){
  const customListName = req.params.customListName;
List.findOne({name: customListName}, function(err, foundItem){
  if (!foundItem) {
    //adding a list
    const list = new List({
      name: customListName,
      items: defaultItem
    })
    list.save();
    res.redirect("/"+ customListName)
  }else {
    //already have list
    res.render("list", {workItem: foundItem.name, newListItem: foundItem.items});
  }
})
});

app.get("/about", function(req,res){
  res.render("about");
});


app.listen(3000, function(){
  console.log("Server started");
});
