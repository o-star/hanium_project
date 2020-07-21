var express=require('express');

var app=express();
app.set('views','views');
app.set('view engine','ejs');

app.use(express.static(__dirname));

app.get('/',function(req,res){
    res.render('index');
});


app.listen(3000,function(){
console.log('Connected 3000 ! ')
});



