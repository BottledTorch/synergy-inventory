const mysql = require('mysql');
const fs = require('fs');

const password = fs.readFileSync(process.env.DB_PASSWORD_FILE, 'utf8').trim();

const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST, // or the appropriate host
    user: process.env.DB_USER, // your MySQL username
    password: password, 
    database: process.env.DB_DATABASE // your database name
});

module.exports = pool;
