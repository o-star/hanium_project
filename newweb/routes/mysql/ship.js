const { PythonShell } = require("python-shell");
const path = require('path');
const { response } = require("express");
const pypath = path.join(__dirname, "/py_scripts");
let options = {
    scriptPath: pypath,
    args :[]
};

module.exports = function () {
    var route = require('express').Router();
    var conn = require('../../config/mysql/db')();
    var bodyParser = require('body-parser');

    route.use(bodyParser.urlencoded({extended : true}));

    route.get('/', function (req, res) {
        res.render('index')
    });

    route.get('/inquire', function (req, res) {
        var sql = 'SELECT * FROM record';
        conn.query(sql,function(err,results){
            if(err){
                console.log(err);
                res.status(500).send("DB Error");
            }
            res.render('inquire',{results :results});
        });
    
    });

    route.post('/inquire',function(req,res){
        var sql = 'SELECT * FROM record';
        
        var shipname=req.body.shipName;
        var entry=req.body.portEntry;
        var startdate=req.body.startDate;
        var starthour=req.body.startHour;
        var enddate=req.body.endDate;
        var endhour=req.body.endHour;

        conn.query(sql,function(err,fileds){
            
            var results=fileds;
            

            if(shipname){
                results=results.filter(function(curRow){
                    return curRow.ship_name==shipname;
                })
            }

            if(entry){
                results=results.filter(function(curRow){
                    return curRow.ship_direction==entry;
                })
            }

            if(startdate){
                results=results.filter(function(curRow){
                    return curRow.date>=startdate;
                })
            }
        
            if(starthour){
                results=results.filter(function(curRow){
                    return curRow.time>=startHour;
                })
            }

            if(enddate){
                results=results.filter(function(curRow){
                    return curRow.date<=enddate;
                })
            }

            if(endhour){
                results=results.filter(function(curRow){
                    return curRow.time<=endhour;
                })
            }

        
           res.render('inquire',{results : results});   
        });

    });
    route.get('/record', function(req, res){
        PythonShell.run("sound_recorder.py", options, function(err, data){
            if(err) throw err;
            //res.status(200).json({data: JSON.parse(data), success: true});
            console.log("음성 녹음완료 : " + data);
        });
        PythonShell.run("stt-parse.py", options, function(err, data){
            if(err) throw err;
            //res.status(200).json({data: JSON.parse(data), success: true});
            console.log("음성파일 파싱완료 : " + data);
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
                res.redirect('/add');
            }
        });
    });
    return route;
}


