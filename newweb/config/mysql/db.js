module.exports = function () {
    var mysql = require('mysql');
    var conn = mysql.createConnection({
        host: 'localhost',
        user: 'gongdae',
        password: '9ghrhks',
        database: 'ship',
    });
    conn.connect();
    return conn;
}