var express 	   						 	 = require('express'),
		{selectQuery, insertQuery} = require('../config/query.js'),
		bodyParser 	   						 = require('body-parser'),
		methodOverride 						 = require('method-override'),
		logger		  	 						 = require('../config/winston').inventory,
		app      	   							 = express.Router();

//=======================================================================================

app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 1000000}));
app.use(methodOverride("_method"));
app.use(express.static( __dirname + "/public"));

//=======================================================================================
//																		GET
//=======================================================================================

app.get("/inventory",async function(req,res){
	var q = "SELECT * FROM raw_material ORDER BY code";
	await selectQuery(q)
						.then(raw_materials => {
							res.render("inventory",{raw_materials:raw_materials,totalPrice:0,stock:0,storePrice:0,linePrice:0});
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

app.get("/inventory/master",async (req,res) => {
	let q = `SELECT * FROM raw_material ORDER BY code`;
	let raw_materials = await selectQuery(q);
	res.render("inventory-master",{raw_materials: raw_materials});
});

app.get("/inventory/new",async function(req,res){
	var q = "SELECT code FROM supplier ORDER BY name";
	await selectQuery(q)
						.then(supplier_code => {
							res.render("new_raw_material",{supplier_code:supplier_code});
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

app.get("/inventory/:code",async function(req,res){
	var q = 'SELECT * FROM raw_material WHERE code = "' + req.params.code + '"';
	await selectQuery(q)
						.then(async raw_material => {
							q = "SELECT code FROM supplier ORDER BY name";
							await selectQuery(q)
												.then(supplier_code => {
													res.render("update_delete_raw_material",{raw_material:raw_material[0],supplier_code:supplier_code});
												})
												.catch(err => {
													logger.error({
															error: err,
															where: `${ req.method } ${ req.url } ${ q }`,
															time: (new Date()).toISOString()
													});
													res.render('error',{error: err});
												});
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

app.get("/inventory/:code/requirement",async function(req,res){
	var q = "SELECT Q.*,finished_goods.name FROM (SELECT * FROM finished_goods_detail WHERE raw_material_code ='" + req.params.code + "') AS Q INNER JOIN finished_goods ON Q.code = finished_goods.code";
	await selectQuery(q)
						.then(finished_goods => {
							res.render("raw_material_requirement",{finished_goods:finished_goods,raw:req.params.code});
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
//																		POST
//=======================================================================================

app.post("/inventory/search/category",async function(req,res){
	var q = "SELECT * FROM raw_material WHERE category = '" + req.body.category + "' ORDER BY code";
	await selectQuery(q)
						.then(raw_materials => {
							res.render("inventory",{raw_materials:raw_materials,totalPrice:0,storePrice:0,linePrice:0});
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

app.post("/inventory/search/name",async function(req,res){
	var q = "SELECT * FROM raw_material WHERE code = '" + req.body.name_code.split(",")[1] + "'";
	await selectQuery(q)
						.then(raw_material => {
							res.render("inventory",{raw_materials:raw_material,totalPrice:0,storePrice:0,linePrice:0});
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

app.post("/inventory/new",async function(req,res){
	var q = "INSERT INTO raw_material SET ?";
	await insertQuery(q, req.body.raw_material)
						.then(result => {
							logger.info({
								where: `${ req.method } ${ req.url } ${ q }`,
								what: req.body.raw_material,
								time: (new Date()).toISOString()
							});
							res.redirect("/inventory");
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

app.put("/inventory/:code",async function(req,res){
	var q = 'UPDATE raw_material SET ? WHERE code = "' + req.params.code + '"';
	await insertQuery(q, req.body.raw_material)
						.then(result => {
							logger.info({
								where: `${ req.method } ${ req.url } ${ q }`,
								what: req.body.raw_material,
								time: (new Date()).toISOString()
							});
							res.redirect("/inventory");
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

app.delete("/inventory/:code",async function(req,res){
	var q = 'DELETE FROM raw_material WHERE code = "' + req.params.code + '"';
	await selectQuery(q)
						.then(result => {
							logger.info({
								where: `${ req.method } ${ req.url } ${ q }`,
								what: `Code: ${ req.params.code }`,
								time: (new Date()).toISOString()
							});
							res.redirect("/inventory");
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

module.exports = app;
