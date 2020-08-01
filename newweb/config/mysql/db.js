module.exports = function () {
    var mysql = require('mysql');
    var conn = mysql.createConnection({
        host: 'localhost',
        user: 'mook',
        password: 'rlackd12',
        database: 'ship',
    });
    conn.connect();
    return conn;
}