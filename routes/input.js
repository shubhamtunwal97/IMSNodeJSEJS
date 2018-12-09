var express 	   							 = require('express'),
		{selectQuery, insertQuery} = require('../config/query.js'),
		bodyParser 	   						 = require('body-parser'),
		methodOverride 						 = require('method-override'),
		logger		  	 						 = require('../config/winston').input,
		app      	  	 						 = express.Router();

//=======================================================================================

app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static( __dirname + "/public"));

//=======================================================================================
//																		GET
//=======================================================================================

app.get("/input",async function(req,res){
	var q = "SELECT * FROM PO";
	await selectQuery(q)
						.then(POs => {
							POs = POs.filter(PO => PO.pending === 'Open');
							res.render("input",{POs:POs});
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

app.get("/input/:invoice_no",async (req, res) => {
	let q = `SELECT * FROM input WHERE invoice_no = '${ req.params.invoice_no }'`;
	await selectQuery(q)
						.then(raw_materials => {
							raw_materials.length !== 0 ? res.render("update_delete_input",{raw_materials:raw_materials}) : res.redirect("/input");
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

app.post("/input",async function(req,res){
	var q = 'SELECT P.*,r.price FROM (SELECT * FROM PO_detail WHERE  PO_code = "' + req.body.PO + '") AS P INNER JOIN raw_material AS r ON P.raw_desc = r.name';
	await selectQuery(q)
						.then(raw_materials => {
							res.render("input_with_PO",{raw_materials : raw_materials});
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

app.post("/input/update",async function(req,res){
	var raw_desc = req.body.raw_desc;
	var DTPL_code = req.body.DTPL_code;
	var quantity = req.body.Quantity;
	var PO_code = req.body.PO_code;
	var invoice = req.body.invoice_no;
	for(var i=0;i<raw_desc.length;i++){
		let q = 'UPDATE raw_material SET stock = stock + ' + quantity[i] + ' WHERE name ="' + raw_desc[i] + '"';
		await selectQuery(q)
							.then(async result => {
								logger.info({
									where: `${ req.method } ${ req.url } ${ q }`,
									time: (new Date()).toISOString()
								});
								q = 'UPDATE PO_detail SET quantity = quantity - ' + quantity[i] + ' WHERE PO_code = "' + PO_code + '" AND raw_desc = "' + raw_desc[i] + '" AND DTPL_code ="' + DTPL_code[i] + '"';
								await selectQuery(q)
													.then(async result => {
														logger.info({
															where: `${ req.method } ${ req.url } ${ q }`,
															time: (new Date()).toISOString()
														});
														q = "INSERT INTO input SET ?";
														var input = {
															PO_code: PO_code,
															invoice_no: invoice[i],
															raw_desc: raw_desc[i],
															DTPL_code: DTPL_code[i],
															quantity: quantity[i]
														};
														await insertQuery(q, input)
																			.then(result => {
																				logger.info({
																					where: `${ req.method } ${ req.url } ${ q }`,
																					what: req.body.raw_material,
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
	}
	// let q = 'SELECT * FROM PO_detail WHERE PO_code ="' + PO_code + '"';
	// con.query(q,async function(err,raw_materials){
	// 	var isFinished = true;
	// 	for(var i=0;i<raw_materials.length;i++){
	// 		if(raw_materials[i].quantity > 0)
	// 			isFinished = false;
	// 	}
	// 	if(isFinished){
	// 		q = 'UPDATE PO SET pending = "Closed" WHERE code = "' + PO_code + '"';
	// 		con.query(q,async function(err){
	// 			if(err)
	// 				throw err;
	// 		});
	// 	}
	// });
	res.redirect("/input");
});

//=======================================================================================
//																		DELETE
//=======================================================================================

app.delete("/input/:invoice_no",async (req, res) => {
	let q = `SELECT * FROM input WHERE invoice_no = '${ req.params.invoice_no }'`;
	await selectQuery(q)
						.then(async raw_materials => {
							await raw_materials.forEach(async raw_material => {
								q = `UPDATE raw_material SET stock = stock - ${ raw_material.quantity } WHERE name = '${ raw_material.raw_desc }'`;
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
							});
						})
						.then(async _ => {
							q = `DELETE FROM input WHERE invoice_no = '${ req.params.invoice_no }'`;
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
						})
						.then(_ => {
							res.redirect("/input");
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

app.delete("/input/:invoice_no/:raw_desc",async (req, res) => {
	let q = `SELECT * FROM input WHERE invoice_no = '${ req.params.invoice_no }' AND raw_desc = '${ req.params.raw_desc }'`;
	await selectQuery(q)
						.then(async raw_materials => {
							await raw_materials.forEach(async raw_material => {
								q = `UPDATE raw_material SET stock = stock - ${ raw_material.quantity } WHERE name = '${ raw_material.raw_desc }'`;
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
							});
						})
						.then(async _ => {
							q = `DELETE FROM input WHERE invoice_no = '${ req.params.invoice_no }' AND raw_desc = '${ req.params.raw_desc }'`;
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
						})
						.then(_ => {
							res.redirect(`/input/${ req.params.invoice_no }`);
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
