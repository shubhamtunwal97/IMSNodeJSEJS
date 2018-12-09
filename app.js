var express 	   				 		 = require('express'),
	bodyParser 	  						 = require('body-parser'),
	methodOverride 						 = require('method-override'),
	logger    	 						   = require('./config/winston'),
	app 		  							   = express(),
	http 		   							   = require('http').Server(app),
	io 			   								 = require('socket.io')(http),
	{selectQuery, insertQuery} = require('./config/query.js');

var inventoryRoutes 	= require('./routes/inventory'),
	supplierRoutes  	= require('./routes/supplier'),

	finishedGoodRoutes  = require('./routes/finishedGood');

app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 1000000}));
app.use(methodOverride("_method"));
app.use(express.static( __dirname + "/public"));
app.use(inventoryRoutes);
app.use(supplierRoutes);
// app.use(inputRoutes);
// app.use(outputRoutes);
// app.use(reportRoutes);
app.use(finishedGoodRoutes);
app.set("view engine","ejs");



io.on('connection', async function(socket){

  socket.on('slip_no', async function(val){
  	var q = "SELECT COUNT(*) AS c FROM output WHERE slip_no = '" + val + "'";
		await selectQuery(q)
									.then(count => {
										if(count[0].c > 0){
						  				socket.emit('return_slip',true);
						  			} else {
						  				socket.emit('return_slip',false);
						  			}
									})
									.catch(err => {
										logger.error({
												error: err,
												where: `${ req.method } ${ req.url } ${ q }`,
												time: Date.now().toString()
										});
										res.render('error',{error: err})
									});
  });

	socket.on('check-stock', async function(val){
  	var q = "SELECT stock FROM raw_material WHERE name = '" + val + "'";
		await selectQuery(q)
									.then(stock => {
										socket.emit("return-check-stock",stock[0].stock);
									})
									.catch(err => {
										logger.error({
												error: err,
												where: `${ req.method } ${ req.url } ${ q }`,
												time: Date.now().toString()
										});
										res.render('error',{error: err})
									});
  });
});
//=================================

app.get("/",function(req,res){
	res.render("landing");
});

app.get("/temp",async function(req,res){
   var q = "SELECT r.code,r.name,r.stock,i.qu,o.q FROM raw_material AS r LEFT OUTER JOIN (SELECT SUM(quantity) AS qu,raw_desc FROM input WHERE date>='2018-09-01' GROUP BY raw_desc) AS i ON i.raw_desc = r.name LEFT OUTER JOIN (SELECT SUM(quantity) AS q,raw_material_code AS w FROM output WHERE date>='2018-09-01' GROUP BY w) AS o ON o.w = r.code ORDER BY r.code";
	 await selectQuery(q)
								 .then(raw_materials => {
									 res.render("temp",{raw_materials:raw_materials});
								 })
								 .catch(err => {
									 logger.error({
											 error: err,
											 where: `${ req.method } ${ req.url } ${ q }`,
											 time: Date.now().toString()
									 });
									 res.render('error',{error: err})
								 });
});
//=======================================
//              OTHERS
//=======================================

app.get("*",function(req,res){
	res.send("Oops you went on the wrong page!!!!");
});

//=======================================

http.listen(3000,"localhost",function(){
	console.log("Server has started at PORT  3000");
});