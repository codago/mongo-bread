const express = require('express');
const app     = express();
const body    = require('body-parser');
const path    = require('path');


app.set('view engine', 'ejs'); //deklarasikan view engine
app.set('views', path.join(__dirname, '../view'));
app.use(express.static(path.join(__dirname,'../public')));
app.use(body.urlencoded({extended:true}));

app.listen(3000, ()=>{
  console.log('siap bos');
})

app.get('/', (req, res)=>{
  res.render('index', {title:'Home'})
});


app.get('/add', (req, res)=>{
  res.render('add', {title:'Add'})
});
