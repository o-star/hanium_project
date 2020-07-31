var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname));
var ship = require('./routes/mysql/ship')();

app.use('/', ship);

app.listen(3000, function () {
    console.log('Connected 3000 ! ')
});