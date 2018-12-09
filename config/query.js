var mysql = require('mysql');

var con = mysql.createConnection({
	host: "localhost",
  user: "root",
  password:"password",
  database: "Store"
});

const selectQuery = q => {
  return new Promise((resolve, reject) => {
    con.query(q, (err, result) => {
      if(err){
        console.log(err);
        reject(err);
      }
      else
        resolve(result);
    });
  });
};

const insertQuery = (q,data) => {
  return new Promise((resolve, reject) => {
    con.query(q, data, (err, result) => {
      if(err){
        console.log(err);
        reject(err);
      }
      else
        resolve(result);
    });
  });
};

module.exports = {
  selectQuery: selectQuery,
  insertQuery: insertQuery
}
