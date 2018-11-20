var express=require("express");
var app=express();
var bodyParser=require("body-parser");


var methodOverride = require("method-override");

app.use(express.static(__dirname+"/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));

//mongoose.connect('mongodb://varun:database1@ds155293.mlab.com:55293/knowyourdestination');

app.get("/", function(req, res){
    res.render("homepage.ejs");
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The server has started");
});
