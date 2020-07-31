module.exports = function () {
    var route = require('express').Router();
    var conn = require('../../config/mysql/db')();

    route.get('/', function (req, res) {
        res.render('index')
    });

    route.get('/inquire', function (req, res) {
        res.render('inquire')
    });

    route.get('/add', function (req, res) {
        var sql = 'SELECT * FROM temp';
        conn.query(sql, function (err, records, fields) {
            if (err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            }
            res.render('add', { records: records });
        });
    });

    route.get('/add/:id', function (req, res) {
        var id = req.params.id;
        var sql =
            `
    INSERT INTO record (ship_name, weight_ton, ship_direction, port_position, date, time) 
    SELECT ship_name, weight_ton, ship_direction, port_position, date, time 
    FROM temp
    WHERE id = ?`
            ;

        conn.query(sql, [id], function (err, rows, fields) {
            if (err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                sql = `DELETE FROM temp WHERE id=?`;
                conn.query(sql, [id], function (err, rows, fields) {
                    if (err) {
                        console.log(err);
                        res.status(500).send('Internal Server Error');
                    } else {
                        res.redirect('/add');
                    }
                });
            }
        });
    });

    route.get('/delete/:id', function (req, res) {
        var id = req.params.id;
        sql = `DELETE FROM temp WHERE id=?`;

        conn.query(sql, [id], function (err, rows, fields) {
            if (err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                res.redirect('/add');
            }
        });
    });
    return route;
}


