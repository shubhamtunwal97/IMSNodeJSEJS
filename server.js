var express=require("express");
var app=express();
app.use(express.static(__dirname));

// Set view engine as EJS
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// app.get("/views",function(req,res){
//     res.render("landing")
// });



app.get("*",function(req,res){
    res.render("testmusic");
    // app.render
});

app.listen(process.env.PORT || 7890, function(){
    console.log(" app 12345 running")
});