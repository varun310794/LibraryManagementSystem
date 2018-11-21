var express=require("express");
var app=express();
var bodyParser=require("body-parser");
var mongoose=require("mongoose");

var methodOverride = require("method-override");
app.set("view engine", "ejs");
app.use(express.static(__dirname+"/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));

mongoose.connect("mongodb://localhost/lms",{useNewUrlParser: true});

//schema------------------------------------------

var bookSchema=new mongoose.Schema({
    name:String,
    author:String,
    id:Number
});

var book=mongoose.model("book",bookSchema);


// homepage----------------------------------------
app.get("/", function(req, res){
    res.render("homepage.ejs");
});
//new books------------------------------------------
app.get("/newbooks", function(req, res){
    res.render("newbooks.ejs");
});

app.get("/books", function(req, res){
    book.find({}, function(err, allbooks){
        if(err){
            console.log(err);
        }else{
            res.render("books.ejs",{allbooks:allbooks});
        }
    });
});

app.post("/books", function(req, res){
    var name=req.body.name;
    var author=req.body.author;
    var id=req.body.id;
    var newBook={name:name, author: author, id: id};
    book.create(newBook,function(err, theBook){
        if(err){
            console.log(err);
        }else{
            res.redirect("/books");
        }
    });
});

//new customers---------------------------------------- 
app.get("/customers", function(req, res){
    res.render("customers.ejs");
});
//new employees---------------------------------------
app.get("/employees", function(req, res){
    res.render("employees.ejs");
});



app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The server has started");
});
