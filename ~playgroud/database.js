const mysql = require('mysql');
// const fs = require('fs');

// const password = fs.readFileSync(process.env.DB_PASSWORD_FILE, 'utf8').trim();

const pool = mysql.createPool({
    connectionLimit: 10,
    host: '10.1.0.16', // or the appropriate host
    user: 'root', // your MySQL username
    password: 'V7I4nnQZ84J0XTCTLtklTJ1cZBmXQY4MszFGL4A6Wqk=', 
    database: 'synergy_inventory' // your database name
});
module.exports = pool;
