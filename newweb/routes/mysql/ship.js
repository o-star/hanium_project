const e = require('express');

module.exports = function () {
    var route = require('express').Router();
    var conn = require('../../config/mysql/db')();
    var bodyParser = require('body-parser');
    const fs = require('fs');
    const multer = require('multer');
    const upload = multer();
    const { PythonShell } = require("python-shell");
    const path = require('path');
    const { response } = require("express");
    const pypath = path.join(__dirname, "../../py_scripts");

    //	const play = require('audio-play');
    //const load = require('audio-loader');
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

    route.post('/add', upload.single('soundBlob'), (req, res) => {
        var fileName = "result.wav";
        console.log(req.file); // see what got uploaded
        let uploadLocation = __dirname + "/../../audio_record/" + fileName // where to save the file to. make sure the incoming name has a .wav extension
        fs.writeFileSync(uploadLocation, Buffer.from(new Uint8Array(req.file.buffer))); // write the blob to the server as a file

        var status = req.params.status;

        PythonShell.run("stt-parse.py", options, function (err, data) {
            if (err) {
                throw err;
            }
            //res.status(200).json({data: JSON.parse(data), success: true});
            else {
                var value = data[0].split(' ');

                console.log('음성 데이터 들어온 것' + value);

                var sql =
                    `
                INSERT INTO temp (ship_name, weight_ton, ship_direction, port_position, date, time)
                VALUES ("${value[0]}", ${value[1]}, "${value[2]}", "${value[3]}", "${value[4]}", "${value[5]}");
                `;

                conn.query(sql, function (err, result) {
                    if (err) {
                        console.log(err);
                        res.status(500).send('Internal Server Error');
                    } 
                });

                sql = `SELECT id FROM temp WHERE ship_name='${value[0]}' AND weight_ton=${value[1]}
                AND ship_direction='${value[2]}' AND port_position='${value[3]}' AND date='${value[4]}' AND time='${value[5]}'`;

                conn.query(sql, function(err, result){
                    if (err) {
                        console.log(err);
                        res.status(500).send('Internal Server Error');
                    } 
                    else{
                        var id = result[0].id;
                        console.log('result='+result);
                        console.log('id='+id);

                        var transcript = "선박명은 " + value[0] + ", 톤수는 " + value[1] + ", " + value[2] + ", " + value[3] + ", 날짜는 " + value[4] + ", 시간은 " + value[5];

                        var tts_path = "/home/ubuntu/hanium_project/newweb/py_scripts/";
                        console.log(tts_path);
                        var options = {
                            scriptPath: tts_path,
                            args: [transcript , id]
                        };
                        console.log(transcript);
                        PythonShell.run("tts.py", options, function (err, data) {
                            if (err) {
                                console.log(data);
                                throw err;
                            }
                            else{
                                console.log(data);
                                var status = {
                                    "status": 200,
                                    "message": 'login success'
                                }
                                res.end(JSON.stringify(status));
                            }
                        });
                    }
                });
            }

        });
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
                fs.unlink('/home/ubuntu/hanium_project/newweb/py_scripts/audioFile/result'+id+'.mp3', (err)=>{
                    throw err;
                });
                res.redirect('/add');
            }
        });
    });

    route.get('/listen/:id', function (req, res) {
        var id = req.params.id;
        sql = `SELECT * FROM temp WHERE id=?`;

        conn.query(sql, [id], function (err, rows, fields) {
            if (err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {

            }
        });
    });




    return route;
}
