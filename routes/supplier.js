var express 	  							 = require('express'),
		{selectQuery, insertQuery} = require('../config/query.js'),
		bodyParser 	  						 = require('body-parser'),
		methodOverride 						 = require('method-override'),
		logger		  	 						 = require('../config/winston').supplier,
		app      	   							 = express.Router();

//=======================================================================================

app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static( __dirname + "/public"));

//=======================================================================================
//																		GET
//=======================================================================================

app.get("/supplier",async function(req,res){
	var q = "SELECT * FROM supplier ORDER BY name";
	await selectQuery(q)
						.then(suppliers => {
							res.render("supplier",{suppliers:suppliers});
						})
						.catch(err => {
							logger.error({
									error: err,
									where: `${ req.method } ${ req.url } ${ q }`,
									time: (new Date()).toISOString()
							});
							res.render('error',{error: err})
						});
});

app.get("/supplier/new",async function(req,res){
	res.render("new_supplier");
});

app.get("/supplier/:code",async function(req,res){
	var q = 'SELECT * FROM supplier WHERE code = "' + req.params.code + '"';
	await selectQuery(q)
						.then(supplier => {
							res.render("update_delete_supplier",{supplier:supplier[0]});
						})
						.catch(err => {
							logger.error({
									error: err,
									where: `${ req.method } ${ req.url } ${ q }`,
									time: (new Date()).toISOString()
							});
							res.render('error',{error: err})
						});
});

//=======================================================================================
//																		POST
//=======================================================================================

app.post("/supplier/new",async function(req,res){
	var q = "INSERT INTO supplier SET ?";
	await insertQuery(q, req.body.supplier)
						.then(result => {
							logger.info({
								where: `${ req.method } ${ req.url } ${ q }`,
								what: req.body.supplier,
								time: (new Date()).toISOString()
							});
							res.redirect("/supplier");
						})
						.catch(err => {
							logger.error({
									error: err,
									where: `${ req.method } ${ req.url } ${ q }`,
									time: (new Date()).toISOString()
							});
							res.render('error',{error: err});
						});
});

//=======================================================================================
//																		PUT
//=======================================================================================

app.put("/supplier/:code",async function(req,res){
	var q = 'UPDATE supplier SET ? WHERE code = "' + req.params.code + '"';
	await insertQuery(q, req.body.supplier)
						.then(result => {
							logger.info({
								where: `${ req.method } ${ req.url } ${ q }`,
								what: req.body.supplier,
								time: (new Date()).toISOString()
							});
							res.redirect("/supplier");
						})
						.catch(err => {
							logger.error({
									error: err,
									where: `${ req.method } ${ req.url } ${ q }`,
									time: (new Date()).toISOString()
							});
							res.render('error',{error: err});
						});
});

//=======================================================================================
//																		DELETE
//=======================================================================================

app.delete("/supplier/:code",async function(req,res){
	var q = 'DELETE FROM supplier WHERE code = "' + req.params.code + '"';
	await selectQuery(q)
						.then(result => {
							res.redirect("/supplier");
						})
						.catch(err => {
							logger.error({
									error: err,
									where: `${ req.method } ${ req.url } ${ q }`,
									time: (new Date()).toISOString()
							});
							res.render('error',{error: err})
						});
});

module.exports = app;
