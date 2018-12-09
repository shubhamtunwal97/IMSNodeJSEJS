var express 	   							 = require('express'),
		{selectQuery, insertQuery} = require('../config/query.js'),
		bodyParser 	   						 = require('body-parser'),
		methodOverride  					 = require('method-override'),
		logger    	    					 = require('../config/winston').output,
		app      		    					 = express.Router();

//=======================================================================================

app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static( __dirname + "/public"));

//=======================================================================================
//																		GET
//=======================================================================================

app.get("/output",async function(req,res){
	var q = "SELECT * FROM raw_material";
	await selectQuery(q)
						.then(raw_materials => {
							res.render("output",{raw_materials:raw_materials});
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

app.get("/output/:slip_no", async (req, res) => {
	var q = `SELECT * FROM output WHERE slip_no = '${ req.params.slip_no }'`;
	await selectQuery(q)
						.then(raw_materials => {
							raw_materials.length !== 0 ? res.render("update_delete_output",{raw_materials:raw_materials}) : res.redirect("/output");
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

app.post("/output",async function(req,res){
	for(var i=0;i<req.body.product_code.length;i++){
		let o = {
			slip_no: req.body.slip_no[0],
			raw_material_code: req.body.product_code[i],
			quantity: req.body.Quantity[i]
		}
		var q = "INSERT INTO output SET ?";
		await insertQuery(q, o)
							.then(async result => {
								logger.info({
									where: `${ req.method } ${ req.url } ${ q }`,
									what: o,
									time: (new Date()).toISOString()
								});
								q = "UPDATE raw_material SET stock = (stock - " + o.quantity + "), line_stock = (line_stock + " + o.quantity + ") WHERE code = '" + o.raw_material_code + "'";
								await selectQuery(q)
													.then(result => {
														logger.info({
															where: `${ req.method } ${ req.url } ${ q }`,
															what: o,
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
							.catch(err => {
								logger.error({
										error: err,
										where: `${ req.method } ${ req.url } ${ q }`,
										time: (new Date()).toISOString()
								});
								res.render('error',{error: err});
							});
	}
	res.redirect("/output");
});

//=======================================================================================
//																		DELETE
//=======================================================================================

app.delete("/output/:slip_no", async (req,res) => {
	var q = `SELECT * FROM output WHERE slip_no = '${ req.params.slip_no }'`;
	await selectQuery(q)
						.then(async raw_materials => {
							await raw_materials.forEach(async raw_material => {
								q = `UPDATE raw_material SET stock = (stock + ${ raw_material.quantity }), line_stock = (line_stock - ${ raw_material.quantity }) WHERE code = '${ raw_material.raw_material_code }'`;
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
							q = `DELETE FROM output WHERE slip_no = ${ req.params.slip_no }`;
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
						.then( _ => {
							res.redirect(`/output`);
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

app.delete("/output/:slip_no/:raw_material_code", async (req,res) => {
	var q = `SELECT * FROM output WHERE slip_no = '${ req.params.slip_no }' AND raw_material_code = '${ req.params.raw_material_code }'`;
	await selectQuery(q)
						.then(async raw_materials => {
							await raw_materials.forEach(async raw_material => {
								q = `UPDATE raw_material SET stock = stock + ${ raw_material.quantity }, line_stock = line_stock - ${ raw_material.quantity } WHERE code = '${ raw_material.raw_material_code }'`;
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
							q = `DELETE FROM output WHERE slip_no = '${ req.params.slip_no }' AND raw_material_code = '${ req.params.raw_material_code }'`;
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
						.then( _ => {
							res.redirect(`/output/${ req.params.slip_no }`);
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
