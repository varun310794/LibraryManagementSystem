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

//BookSchema------------------------------------------

var bookSchema=new mongoose.Schema({
    name:String,
    author:String,
    id:Number,
    customers:[
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "customer"
                }
        ]
});

var book=mongoose.model("book",bookSchema);

//-------------------------------------------------

var customerSchema=new mongoose.Schema({
    name:String,
    id:Number,
    books:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "book"
        }
    ]
});
var customer=mongoose.model("customer", customerSchema);
// homepage----------------------------------------

app.get("/", function(req, res){
    res.render("homepage.ejs");
});
//books
app.get("/books/new", function(req, res){
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

app.delete("/:id", function(req, res){
   //res.send("hi");
   book.findByIdAndRemove(req.params.id, function(err, removedbook){
       if(err){
           console.log(err);
       }else{
           res.redirect("/books");
       }
   }); 
});
//------------------------------------------------------------

app.get("/customers/new", function(req, res){
    res.render("newcustomers.ejs");
});

app.get("/customers", function(req, res){
    customer.find({}, function(err, allcustomers){
        if(err){
            console.log(err);
        }else{
            res.render("customers.ejs",{allcustomers:allcustomers});
        }
    });
});

app.post("/customers", function(req, res){
    var name=req.body.name;
    var id=req.body.id;
    var newcustomer={name:name, id: id};
    customer.create(newcustomer,function(err, thecustomer){
        if(err){
            console.log(err);
        }else{
            res.redirect("/customers");
        }
    });
});

app.delete("/customers/:id", function(req, res){
   //res.send("hi");
   customer.findByIdAndRemove(req.params.id, function(err, removedcustomer){
       if(err){
           console.log(err);
       }else{
           res.redirect("/customers");
       }
   }); 
});

//----------------------------------------------------

app.get("/customers/:id", function(req, res){
    customer.findById(req.params.id).populate("books").exec(function(err, fcustomer){
        if(err){
            console.log(err);
        }
        else{
            
            res.render("show.ejs", {fcustomer:fcustomer});
        }
    });    
});

//--------------------------------------------------------
app.post("/customers/:id/checkout", function(req, res){
    customer.findById(req.params.id, function(err, foundcustomer){
        if(err){
            console.log(err);
        }else{
            var fid=req.body.id1;
            book.findOne({id:fid}, function(err, foundbook){
                if(err){
                    console.log(err);
                }else{
                    foundcustomer.books.push(foundbook);
                    foundcustomer.save(function(err, data){
                        if(err){
                            console.log(err)
                        }else{
                            var sid=req.body.id2;
                            book.findOne({id:sid}, function(err, foundBook){
                                if(err){
                                    console.log(err);
                                }else{
                                    foundcustomer.books.push(foundBook);
                                    foundcustomer.save(function(err, data){
                                        if(err){
                                            console.log(err);
                                        }else{
                                            res.redirect("/customers/" + req.params.id);                                            
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
            
        }
    });    
});
//---------------------------------------------------------
app.post("/customers/:cid/:bid/checkin", function(req, res){
    
customer.findById(req.params.cid, function(err, foundcustomer){
        if(err){
            console.log(err);
        }else{
            book.findById(req.params.bid, function(err, foundbook){
                
                if(err){
                    console.log(err);
                }else{
                    foundcustomer.books.pull(foundbook);
                    foundcustomer.save(function(err, data){
                        if(err){
                            console.log(err);
                        }else{
                            res.redirect("/customers/" + req.params.cid);
                        }
                    });
                }
            });
        }
    });
    
});
    
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The server has started");
});