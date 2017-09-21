const express = require('express');
const app     = express();
const body    = require('body-parser');
const path    = require('path');
const mongo   = require('mongodb');
let MongoClient = require('mongodb').MongoClient;
let url         = "mongodb://localhost:27017/anggota_db";

app.set('view engine', 'ejs'); //deklarasikan view engine
app.set('views', path.join(__dirname, '../view'));
app.use(express.static(path.join(__dirname,'../public')));
app.use(body.urlencoded({extended:true}));

app.listen(3000, ()=>{
  console.log('siap bos');
})

app.get('/', (req, res)=>{
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    console.log("Database created!");
    res.render('index', {title:'Home'})
    db.close();
  });
});


app.get('/add', (req, res)=>{
  res.render('add', {title:'Add'})
});
