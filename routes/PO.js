var express 	   						 	 = require('express'),
		{selectQuery, insertQuery} = require('../config/query.js'),
		bodyParser 	   						 = require('body-parser'),
		methodOverride 						 = require('method-override'),
		logger		  	 						 = require('../config/winston').PO,
		app      	   							 = express.Router();

//=======================================================================================

app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 1000000}));
app.use(methodOverride("_method"));
app.use(express.static( __dirname + "/public"));

//=======================================================================================
//																		GET
//=======================================================================================

app.get("/PO",async function(req,res){
	var q = "SELECT * FROM PO ORDER BY supplier_code,date";
	await selectQuery(q)
						.then(POs => {
							res.render("PO",{POs:POs});
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

app.get("/PO/new",async function(req,res){
	var q = "SELECT * FROM raw_material";
	await selectQuery(q)
						.then(async raw_materials => {
							q = "SELECT * FROM supplier";
							await selectQuery(q)
												.then(suppliers => {
													res.render("new_PO",{suppliers:suppliers,raw_materials:raw_materials});
												})
												.catch(err => {
													logger.error({
															error: err,
															where: `${ req.method } ${ req.url } ${ q }`,
															time: (new Date()).toISOString()
													});
													res.render('error',{error: err})
												});
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

app.get("/PO/:code",async function(req,res){
	var q = "SELECT * FROM PO_detail WHERE PO_code = '" + req.params.code + "'";
	await selectQuery(q)
						.then(async foundRaw => {
							q = "SELECT * FROM raw_material ORDER BY code";
							await selectQuery(q)
												.then(raw_materials => {
													res.render("update_delete_PO",{raw_materials:raw_materials,foundRaw:foundRaw});
												})
												.catch(err => {
													logger.error({
															error: err,
															where: `${ req.method } ${ req.url } ${ q }`,
															time: (new Date()).toISOString()
													});
													res.render('error',{error: err})
												});
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

app.get("/PO/:code/new",async function(req,res){
	var q = "SELECT * FROM raw_material ORDER BY name";
	await selectQuery(q)
						.then(async raw_materials => {
							q = "SELECT date FROM PO WHERE code ='" + req.params.code + "'";
							await selectQuery(q)
												.then(date => {
													res.render("add_new_PO",{raw_materials:raw_materials,PO:req.params.code,date:date[0].date});
												})
												.catch(err => {
													logger.error({
															error: err,
															where: `${ req.method } ${ req.url } ${ q }`,
															time: (new Date()).toISOString()
													});
													res.render('error',{error: err})
												});
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

app.get("/PO/:code/close",async function(req,res){
	var q = "UPDATE PO SET pending = 'Closed' WHERE code='" + req.params.code + "'";
	await selectQuery(q)
						.then(result => {
							logger.info({
									where: `${ req.method } ${ req.url } ${ q }`,
									time: (new Date()).toISOString()
							});
							res.redirect("/PO");
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

app.get("/PO/:code/:raw_code/delete",async function(req,res){
	var q = "DELETE FROM PO_detail WHERE PO_code ='" + req.params.code + "' AND raw_desc ='" + req.params.raw_code + "'";
	await selectQuery(q)
						.then(result => {
							logger.info({
									where: `${ req.method } ${ req.url } ${ q }`,
									time: (new Date()).toISOString()
							});
							res.redirect("/PO/" + req.params.code);
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

app.post("/PO/export",async function(req,res){
	res.render("export",{data:req.body,mock:false});
});

app.post("/PO/export/mock",async function(req,res){
	res.render("export",{data:req.body,mock:true});
});

app.post("/PO/new",async function(req,res){
	var q = "INSERT INTO PO SET ?",
		PO_no = req.body.PO.code,
		supplier_code = req.body.PO.supplier_code.split(","),
		supplier_name = supplier_code[0],
		product_code = req.body.product_code,
		product_name = req.body.product_name,
		date = req.body.PO.date,
		initial_quantity = req.body.quantity,
		product_DTPL_code = req.body.product_DTPL_code,
		quantity = req.body.quantity;
	supplier_code = supplier_code[1];
	var PO = {
		code : PO_no,
		supplier_code: supplier_code,
		date: date,
		pending: "Open"
	}
	await insertQuery(q, PO)
						.then(result => {
							logger.info({
								where: `${ req.method } ${ req.url } ${ q }`,
								what: PO,
								time: (new Date()).toISOString()
							});
						})
						.then(async _ => {
							q = "INSERT INTO PO_detail SET ?";
							var PO_obj;
							for(var i=0; i<quantity.length; i++){
								let ii = i;
								PO_obj = {
									PO_code: PO_no,
									date: date,
									quantity: quantity[ii],
									initial_quantity: quantity[ii],
									DTPL_code: product_DTPL_code[ii],
									raw_desc: product_name[ii],
									no: ii
								};
								await insertQuery(q, PO_obj)
													.then(result => {
														logger.info({
															where: `${ req.method } ${ req.url } ${ q }`,
															what: PO_obj,
															time: (new Date()).toISOString()
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
							}
						})
						.then( _ => {
							res.redirect("/PO");
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

app.post("/PO/:code/new",async function(req,res){
	var q = "SELECT COUNT(*)  AS count FROM PO_detail WHERE PO_code = '" + req.params.code + "'";
	var no;
	await selectQuery(q)
						.then(coun => {
							no = coun[0].count;
						})
						.then(async _ => {
							q = "INSERT INTO PO_detail SET ?";
							var quantity = req.body.quantity;
							var raw = req.body.raw.split("$");
							var PO = {
								PO_code: req.body.PO_no,
								date: req.body.date,
								raw_desc: raw[0],
								DTPL_code: raw[1],
								quantity: quantity,
								initial_quantity: quantity,
								no: no
							}
							await insertQuery(q, PO)
												.then(result => {
													logger.info({
														where: `${ req.method } ${ req.url } ${ q }`,
														what: PO,
														time: (new Date()).toISOString()
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
						})
						.then( _ => {
							res.redirect("/PO/"+req.params.code);
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

app.post("/PO/generate",async function(req,res){
	var POFull = req.body.PO;
	var Supplier = req.body.supplier;
	var PO = [], supplier = [];
	var raw = req.body.raw_name;
	var DTPL_code = req.body.DTPL_code;
	var quantity = req.body.quantity;
	var z = 0, lastPO;
	for(var k=0;k<POFull.length;k++){
		if(quantity[k] === 0 || POFull[k] === ""){
			continue;
		}
		if(lastPO != POFull[k])
			z=0;
		else
			z++;
		if(PO.indexOf(POFull[k]) === -1){
			PO.push(POFull[k]);
			supplier.push(Supplier[k]);
		}
		lastPO = POFull[k];
		q = "INSERT INTO PO_detail SET ?";
		var po = {
			PO_code: POFull[k],
			date: new Date().toISOString().substring(0,10),
			raw_desc: raw[k],
			quantity: quantity[k],
			initial_quantity: quantity[k],
			no: z,
			DTPL_code: DTPL_code[k]
		}
		await insertQuery(q, po)
							.then(result => {
								logger.info({
									where: `${ req.method } ${ req.url } ${ q }`,
									what: po,
									time: (new Date()).toISOString()
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
		q = `UPDATE raw_material SET monthly_requirement = ${ quantity[k] } WHERE name = '${ raw[k] }'`;
		await selectQuery(q)
									.then(result => {
										logger.info({
											where: `${ req.method } ${ req.url } ${ q }`,
											time: (new Date()).toISOString()
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
	}
	for(var k=0;k<PO.length;k++){
		q = "INSERT INTO PO SET ?";
		var po = {
			code: PO[k],
			supplier_code: supplier[k],
			date: new Date().toISOString().substring(0,10),
			pending: "Open"
		}
		await insertQuery(q, po)
							.then(result => {
								logger.info({
									where: `${ req.method } ${ req.url } ${ q }`,
									what: po,
									time: (new Date()).toISOString()
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
	}
	res.redirect("/PO");
});

//=======================================================================================
//																		PUT
//=======================================================================================

app.put("/PO/:code",async function(req,res){
	var raw = req.body.PO_code;
	var PO_no = req.body.PO_no;
	var date = req.body.PO_date;
	var q = `DELETE FROM PO_detail WHERE PO_code = '${ PO_no }'`;
	await selectQuery(q)
						.then(result => {
							logger.info({
									where: `${ req.method } ${ req.url } ${ q }`,
									time: (new Date()).toISOString()
							});
						})
						.catch(err => {
							logger.error({
									error: err,
									where: `${ req.method } ${ req.url } ${ q }`,
									time: (new Date()).toISOString()
							});
							res.render('error',{error: err})
						});
	for(var i=0;i<raw.length;i++){
		q = "INSERT INTO PO_detail SET ?";
		var PO = {
			PO_code: PO_no,
			date: date,
			raw_desc: raw[i].split("$")[0],
			DTPL_code: raw[i].split("$")[1],
			quantity: req.body.PO_quantity[i],
			initial_quantity: req.body.PO_quantity[i],
			no: i
		}
		await insertQuery(q, PO)
							.then(result => {
								logger.info({
									where: `${ req.method } ${ req.url } ${ q }`,
									what: PO,
									time: (new Date()).toISOString()
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
	}
	res.redirect("/PO");
});

//=======================================================================================
//																		DELETE
//=======================================================================================

app.delete("/PO/:code",async function(req,res){
	var q = 'DELETE FROM PO_detail WHERE PO_code = "' + req.params.code + '"';
	await selectQuery(q)
						.then(result => {})
						.then(async _ => {
							q = 'DELETE FROM PO WHERE code = "' + req.params.code + '"';
							await selectQuery(q)
												.then(result => {})
												.catch(err => {
													logger.error({
															error: err,
															where: `${ req.method } ${ req.url } ${ q }`,
															time: (new Date()).toISOString()
													});
													res.render('error',{error: err})
												});
						})
						.then( _ => {
							res.redirect("/PO");
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

module.exports = app;
