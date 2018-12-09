var express=require("express");
var app=express();
var port=process.env.port || 8080;
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

app.listen(port, function(){
    console.log(" app 12345 running")
});