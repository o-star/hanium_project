var express = require('express');
var app = express();

app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname));
app.get('/', (req, res)=>{
    res.render('simpleExport');
});

app.listen(3000, ()=>{
    console.log("connected 3000");
})