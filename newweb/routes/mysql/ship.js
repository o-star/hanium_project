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

        var input={
        
            shipname:req.body.shipName,
            entry:req.body.portEntry,
             startdate:req.body.startDate,
            starthour:req.body.startHour,
            enddate:req.body.endDate,
            endhour:req.body.endHour
        };

        conn.query(sql,function(err,fields){
            
            var results=fields;

            function dateBiggerCheck(curRow){
                var dbArray=curRow.date.split('-'); // DB값
                var inputArray=input.startdate.split('-'); // 조회입력값

               // 2020- 05-06 , 2020-05-12

               for(var i=0;i<inputArray.length;i++){
                   if(inputArray[i]<dbArray[i])
                        return true;
                    else if(inputArray[i]==dbArray[i])
                        continue;
                    else
                        return false;
               }
                return true;
            
              }
            
            
            
            function dateSmallerCheck(curRow){
               
                var dbArray=curRow.date.split('-'); 
                var inputArray=input.enddate.split('-'); 
                
                for(var i=0;i<inputArray.length;i++){
                    if(inputArray[i]>dbArray[i])
                         return true;
                    else if(inputArray[i]==dbArray[i])
                        continue;
                    else
                        return false;
                }

                return true;
            
            }

                

            function hourBiggerCheck(curRow){
                var dbArray=curRow.time.split(':');
                var inputArray=input.starthour.split(':');

                for(var i=0;i<inputArray.length;i++){
                    if(inputArray[i]<dbArray[i])
                         return true;
                     else if(inputArray[i]==dbArray[i])
                         continue;
                     else
                         return false;
                }
                 return true;
                
            }

            function hourSmallerCheck(curRow){

                var dbArray=curRow.time.split(':');
                var inputArray=input.endhour.split(':');

                for(var i=0;i<inputArray.length;i++){
                    if(inputArray[i]>dbArray[i])
                         return true;
                    else if(inputArray[i]==dbArray[i])
                        continue;
                    else
                        return false;
                }

                return true;
            }
            

            if(input.shipname){
                results=results.filter(function(curRow){
                    return curRow.ship_name==input.shipname;
                })
            }

            if(input.entry){
                results=results.filter(function(curRow){
                    return curRow.ship_direction==input.entry;
                })
            }

            if(input.startdate){
                results=results.filter(dateBiggerCheck);
            }
        
            if(input.starthour){
                results=results.filter(hourBiggerCheck);
            }

            if(input.enddate){
                results=results.filter(dateSmallerCheck);
            }

            if(input.endhour){
                results=results.filter(hourSmallerCheck);
            }

        
           res.render('inquire',{results : results});   
        });

    });
    route.get('/record', function(req, res){
        console.log("test" + pypath);
        PythonShell.run("stt-parse.py", options, function(err, data){
            if(err) throw err;
            //res.status(200).json({data: JSON.parse(data), success: true});
            var value = data[3].split(' ');
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
            }   else{
                console.log("Number of records inserted: " + result.rowsAffected);
                res.redirect('/add');
            }
            });
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


