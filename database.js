const mysql = require('mysql');

const connection = mysql.createConnection({
	host : '172.20.83.199',
	database : 'users',
	user : 'root2',
	password : '1234'
});

connection.connect(function(error){
	if(error)
	{
		throw error;
	}
	else
	{
		console.log('MySQL Database is connected Successfully');
	}
});

module.exports = connection;