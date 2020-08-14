module.exports = function () {
    var route = require('express').Router();
    var conn = require('../../config/mysql/db')();
    var bodyParser = require('body-parser');
    const { PythonShell } = require("python-shell");
    const path = require('path');
    const { response } = require("express");
    const pypath = path.join(__dirname, "../../py_scripts");
    let options = {
        scriptPath: pypath,
        args: ["선박명", "총톤수", "입/출항", "외/내항", "날짜", "시간"]
    };


    route.use(bodyParser.urlencoded({ extended: true }));

    route.get('/', function (req, res) {
        var sql = 'SELECT * FROM record ORDER BY date, time';
        //구해야할것
        //올해 관제량, 금월 관제량, 금주 관제량, 금일 관제량

        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const date = today.getDate();
        const day = today.getDay();
        const monday = date - day + (day == 0 ? -6 : 1);
        const sunday = monday + 6;

        let info = [0, 0, 0, 0];

        conn.query(sql, function (err, rows) {

            function sameCheck(curRow) {
                const dbArray = curRow.date.split('-'); // DB값
                const dbYear = dbArray[0];
                const dbMonth = dbArray[1];
                const dbDate = dbArray[2];

                if (dbYear == year) {
                    info[0]++;
                    if (dbMonth == month) {
                        info[1]++;
                        if (dbDate == date)
                            info[3]++;
                        if (date >= monday && date <= sunday)
                            info[2]++;
                    }
                }
            }
            for (i in rows) {
                sameCheck(rows[i]);
            }
            res.render('index', { info: info });
        });
    });

    route.get('/inquire', function (req, res) {

        var sql = 'SELECT * FROM record ORDER BY date, time';

        conn.query(sql, function (err, results) {
            if (err) {
                console.log(err);
                res.status(500).send("DB Error");
            }
            res.render('inquire', { results: results });
        });

    });


    route.post('/inquire', function (req, res) {
        var option = req.body.option;
        var sql = '';

        if (!option) sql = 'SELECT * FROM record ORDER BY date, time';
        else if (option == 'time') sql = 'SELECT * FROM record ORDER BY time';
        else if (option == 'weight_ton') sql = 'SELECT * FROM record ORDER BY weight_ton';
        else sql = 'SELECT * FROM record ORDER BY ship_name';

        var input = {

            shipname: req.body.shipName,
            entry: req.body.portEntry,
            startdate: req.body.startDate,
            starthour: req.body.startHour,
            enddate: req.body.endDate,
            endhour: req.body.endHour
        };

        conn.query(sql, function (err, fields) {

            var results = fields;

            function dateBiggerCheck(curRow) {
                var dbArray = curRow.date.split('-'); // DB값
                var inputArray = input.startdate.split('-'); // 조회입력값


                for (var i = 0; i < inputArray.length; i++) {
                    if (inputArray[i] < dbArray[i])
                        return true;
                    else if (inputArray[i] == dbArray[i])
                        continue;
                    else
                        return false;
                }
                return true;

            }


            function dateSmallerCheck(curRow) {

                var dbArray = curRow.date.split('-');
                var inputArray = input.enddate.split('-');

                for (var i = 0; i < inputArray.length; i++) {
                    if (inputArray[i] > dbArray[i])
                        return true;
                    else if (inputArray[i] == dbArray[i])
                        continue;
                    else
                        return false;
                }

                return true;

            }


            function hourBiggerCheck(curRow) {
                var dbArray = curRow.time.split(':');
                var inputArray = input.starthour.split(':');

                for (var i = 0; i < inputArray.length; i++) {
                    if (inputArray[i] < dbArray[i])
                        return true;
                    else if (inputArray[i] == dbArray[i])
                        continue;
                    else
                        return false;
                }
                return true;

            }

            function hourSmallerCheck(curRow) {

                var dbArray = curRow.time.split(':');
                var inputArray = input.endhour.split(':');

                for (var i = 0; i < inputArray.length; i++) {
                    if (inputArray[i] > dbArray[i])
                        return true;
                    else if (inputArray[i] == dbArray[i])
                        continue;
                    else
                        return false;
                }

                return true;
            }


            if (input.shipname) {
                results = results.filter(function (curRow) {
                    return curRow.ship_name == input.shipname;
                })
            }

            if (input.entry) {
                results = results.filter(function (curRow) {
                    return curRow.ship_direction == input.entry;
                })
            }

            if (input.startdate) {
                results = results.filter(dateBiggerCheck);
            }

            if (input.starthour) {
                results = results.filter(hourBiggerCheck);
            }

            if (input.enddate) {
                results = results.filter(dateSmallerCheck);
            }

            if (input.endhour) {
                results = results.filter(hourSmallerCheck);
            }
            res.render('inquire', { results: results });
        });

    });

    route.get('/recorder/:status', function (req, res) {
        var status = req.params.status;
        if (status == 'start') {
            PythonShell.run("realtime_recording.py", options, function (err, data) {
                if (err) {
                    console.log('여기서 에러터짐!!');
                    throw err;
                }
                //res.status(200).json({data: JSON.parse(data), success: true});
                else {
                    var value = data[0].split(' ');

                    console.log('음성 데이터 들어온 것' + value);
                    console.log(value);

                    var sql =
                        `
                INSERT INTO temp (ship_name, weight_ton, ship_direction, port_position, date, time)
                VALUES ("${value[0]}", ${value[1]}, "${value[2]}", "${value[3]}", "${value[4]}", "${value[5]}");
                `;

                    console.log(value);
                    conn.query(sql, function (err, result) {
                        if (err) {
                            console.log(err);
                            res.status(500).send('Internal Server Error');
                        } else {
                            res.redirect('/add');
                        }
                    });
                }
            });
        }
    })

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