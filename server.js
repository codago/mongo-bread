"use strict"

const express = require ('express');
const app = express();
const path = require('path');
const bodyParser= require('body-parser')
const moment=require('moment')
const mongodb= require('mongodb')
const MongoClient= mongodb.MongoClient
let url='mongodb://localhost:27017/breaddb';
MongoClient.connect(url,function(err,db){
  const bread=db.collection('data')

  app.use(bodyParser.urlencoded({extended:true}))
  app.set('views', path.join(__dirname,'views'));
  app.set('view engine','ejs');
  app.use(express.static(path.join(__dirname,'public')))
  app.use(function(req, res, next){
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Cache-Control','no-cache');
    next();
  });

  app.get('/', function(req, res) {
    // let string,integer,float,date,boolean,filter=false;
    let bagianWhere = {  }
    let url = (req.url == "/") ? "/?page=1" : req.url;
    let halaman = Number(req.query.page) || 1
    if(url.indexOf('&cari=') != -1){
      halaman =1;
    }
    url = url.replace('&cari=','');
    //filter

    if(typeof req.query.cek_string !== 'undefined'){
      bagianWhere['string'] = req.query.string;
    }
    if(typeof req.query.cek_integer  !== 'undefined'){
      bagianWhere['integer'] = Number(req.query.integer);
    }
    if(typeof req.query.cek_float  !== 'undefined'){
      bagianWhere['float']   = parseFloat(req.query.float);
    }
    if(typeof req.query.cek_date  !== 'undefined'){
      bagianWhere['date'] = req.query.date
    }
    if(typeof req.query.cek_boolean  !== 'undefined'){
      bagianWhere['boolean'] =(req.query.boolean);
    }
    let get_links = req.originalUrl;
    var the_arr = get_links.split('&page');
    if(get_links.includes("?page"))
    the_arr = get_links.split('?page');
    let get_link = the_arr[0];

    if(get_link.length > 1){
      get_link = get_link + "&";
    }else {
      get_link = get_link + "?";
    }

    // pagination
    let limit = 3
    let offset = (halaman-1) * limit

    bread.find(bagianWhere).count((err, count) => {
      if(err) {
        console.error(err);
      }
      let total = count
      let jumlahHalaman = (total == 0) ? 1 : Math.ceil(total/limit);

      bread.find(bagianWhere).skip(offset).limit(limit).toArray(function (err, docs) {
        if (err) {
          console.error(err);
          return res.send(err);
        }
        res.render('list', {title: "BREAD", data: docs, halaman:halaman,get_link:get_link,limit: limit, offset: offset, jumlahHalaman: jumlahHalaman,total:total, url: url, query: req.query });
      });
    })
  });


  app.get('/add', function(req,res) {
    res.render('add', {title: "Add"});
  });

  app.post('/add', function(req,res) {
    let string = req.body.string
    let integer = parseInt(req.body.integer)
    let float = parseFloat(req.body.float)
    let date = req.body.date
    let boolean = (req.body.boolean)

    bread.insertOne({string:string, integer:integer, float:float, date: date, boolean: boolean}, function(err, result) {
      if(err) {
        console.error(err)
        return res.send(err);
      }
      res.redirect('/');
    })
  });

  app.get ('/edit/:id', function (req, res){
    let id = req.params.id;
    bread.findOne({"_id": new mongodb.ObjectID(id)}, function(err, data) {
      if(err) {
        console.error(err)
        return res.send(err);
      }
      if(data){
        data.date = moment(data.date).format('YYYY-MM-DD');
        res.render('edit', {title: 'edit',  data});
      }else{
        res.send('Data Not Found');
      }
    })
  })

  app.post('/edit/:id', function(req,res) {
    let id = req.params.id
    let string = req.body.string
    let integer = parseInt(req.body.integer)
    let float = parseFloat(req.body.float)
    let date = req.body.date
    let boolean = (req.body.boolean)

    bread.updateOne({"_id": new mongodb.ObjectID(id)}, {$set: {string:string, integer:integer, float:float, date:date, boolean:boolean}}, function(err, result){
      if(err) {
        console.error(err);
        res.send(err);
      } else {
        res.redirect('/');
      }
    })
  })

  app.get ('/delete/:id', function(req,res) {
    let id = req.params.id
    bread.deleteOne({"_id": new mongodb.ObjectID(id)}, (err,result) =>{
      if(err) {
        console.error(err)
        return res.send(err);
      }
      res.redirect('/');
    })
  })

  app.listen(3000, function() {
    console.log("server jalan di port 3000")
  });
});
