var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const https = require('https');
const http = require('http');
const fs = require('fs');

const options = {

    ca: fs.readFileSync('/etc/letsencrypt/live/www.9shipcontrol.com/fullchain.pem'),
    key: fs.readFileSync('/etc/letsencrypt/live/www.9shipcontrol.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/www.9shipcontrol.com/cert.pem')
    
    };
   
http.createServer(app).listen(80);
https.createServer(options, app).listen(443);

app.use(function(req,res,next){
	if(!req.secure){
		res.redirect("https://"+"9shipcontrol.com"+req.url);
	}else{
		next();
	}
});


app.use(bodyParser.urlencoded({ extended: false }));
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname));
var ship = require('./routes/mysql/ship')();

app.use('/', ship);

app.listen(3000, function () {
    console.log('Connected 3000 ! ')
});
