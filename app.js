var express=require("express");
var app=express();
var bodyParser=require("body-parser");
var mongoose=require("mongoose");
var passport=require("passport");
var localStrategy=require("passport-local");
var passportLocalMongoose=require("passport-local-mongoose");
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
//-------------------------------------------------

var userSchema=new mongoose.Schema({
    username:String,
    password:String
});
userSchema.plugin(passportLocalMongoose);
var user=mongoose.model("user", userSchema);

//passport configuration
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   next();
});


// homepage----------------------------------------

app.get("/", function(req, res){
    res.render("homepage.ejs");
});
//books
app.get("/books/new",isLoggedIn, function(req, res){
    res.render("newbooks.ejs");
});

app.get("/books", isLoggedIn, function(req, res){
    book.find({}, function(err, allbooks){
        if(err){
            console.log(err);
        }else{
            res.render("books.ejs",{allbooks:allbooks});
        }
    });
});

app.post("/books",isLoggedIn, function(req, res){
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

app.delete("/:id",isLoggedIn, function(req, res){
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

app.get("/customers/new",isLoggedIn, function(req, res){
    res.render("newcustomers.ejs");
});

app.get("/customers",isLoggedIn, function(req, res){
    customer.find({}, function(err, allcustomers){
        if(err){
            console.log(err);
        }else{
            res.render("customers.ejs",{allcustomers:allcustomers});
        }
    });
});

app.post("/customers",isLoggedIn, function(req, res){
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

app.delete("/customers/:id",isLoggedIn, function(req, res){
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

app.get("/customers/:id",isLoggedIn, function(req, res){
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
app.post("/customers/:id/checkout",isLoggedIn, function(req, res){
    customer.findById(req.params.id, function(err, foundcustomer){
        if(err){
            console.log(err);
        }else{
            var fid=req.body.id;
            book.findOne({id:fid}, function(err, foundbook){
                if(err){
                    console.log(err);
                }else{
                    foundcustomer.books.push(foundbook);
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
});

//---------------------------------------------------------
 app.post("/customers/:cid/:bid/checkin",isLoggedIn, function(req, res){
    
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

app.get("/employees", isLoggedIn, function(req, res){
    user.find({}, function(err, data){
        if(err){
            console.log(err);
        }else{
            res.render("employees.ejs", {data:data});
        }
    });
});

// Authentication-------------------------------------------------------
//show sign up form
 
 app.get("/register", function(req, res){
     res.render("register.ejs");
 });
//Sign UP logic

app.post("/register", function(req, res){
    var newUser = new user({username: req.body.username});
    user.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register.ejs");
        }
        passport.authenticate("local")(req, res, function(){
           res.redirect("/"); 
        });
    });
});
// show login form
app.get("/login", function(req, res){
   res.render("login.ejs"); 
});
// login logic
app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/",
        failureRedirect: "/login"
    }), function(req, res){
}); 

// logic route
app.get("/logout", function(req, res){
   req.logout();
   res.redirect("/login");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

//-----------------------------------------------------
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The server has started");
});

