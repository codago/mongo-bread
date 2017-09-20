"use strict"

const express = require('express')
const app = express();
const path = require('path');
const moment = require('moment');
const bodyParser = require('body-parser');
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
var url = 'mongodb://localhost:27017/breadDB';
MongoClient.connect(url, function(err, db) {
  const bread = db.collection('bread');
  console.log("Server is connected");

  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'ejs')
  app.set('portMarkus', 3000)
  app.use(express.static(path.join(__dirname, 'public')))
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));

  app.use(function (req, res, next){
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache');
    next()
  });

  //router
  app.get('/', function(req, res) {

    let url = (req.url == "/") ? "/?page=1" : req.url;
    let page = Number(req.query.page) || 1
    if(url.indexOf('&search=') != -1){
      page = 1;
    }
    url = url.replace('&search=', '')

    //filter
    let filter = {}
    if(req.query.cstring && req.query.string){
      filter['string'] = req.query.string;
    }
    if(req.query.cinteger && req.query.integer){
      filter['integer'] = Number(req.query.integer);
    }
    if(req.query.cfloat && req.query.float){
      filter['float'] = parseFloat(req.query.float);
    }
    if(req.query.cdate && req.query.startdate && req.query.enddate){
      filter['date'] = {$gte: req.query.startdate, $lte: req.query.enddate};
    }
    if(req.query.cboolean && req.query.boolean){
      filter['boolean'] = JSON.parse(req.query.boolean);
    };

    // pagination
    let limit = 3
    let offset = (page-1) * 3
    //itu apa?

    bread.find(filter).count((error, count) => {
      if(error) {
        console.error(error);
        }
          let total = count
          let pages = (total == 0) ? 1 : Math.ceil(total/limit);
          bread.find(filter).skip(offset).limit(limit).toArray((err, docs) => {
            if (err) {
              console.error(err);
              return res.send(err);
            }
            console.log("test:",docs);
            res.render('list', {title: "BREAD",header: "BREAD", rows: docs, pagination:{page: page, limit: limit, offset: offset, pages: pages, total: total, url: url}, query: req.query});
          });
      })
  });


  //ADD
  app.get('/add', function(req,res) {
    res.render('add', {title: "Test | add"});
  });


  app.post('/add', function(req,res) {
    let string = req.body.string;
    let integer = parseInt(req.body.integer);
    let float = parseFloat(req.body.float);
    let date = req.body.date;
    let boolean = JSON.parse(req.body.boolean);
    console.log(req.body.boolean, boolean);

    bread.insertOne({string:string, integer:integer, float:float, date:date, boolean:boolean}, function(err, data){
      if (err) {
        console.error(err);
        return res.send(err);
      }
      res.redirect('/');
    })
  });

  app.get('/edit/:id', function(req,res) {
    let id = req.params.id;
    // console.log(id);
    bread.findOne ({"_id": new mongodb.ObjectID(id)}, function(err, data){
      if (err) {
        console.error(err);
        return res.send(err);
      }
      if (data) {
        data.date = moment(data.date).format('YYYY-MM-DD');
        res.render('edit', {title: "Test | edit", item: data });
      } else{
        res.send('Undefined!')
      }
    });
  });

  app.post('/edit/:id', function(req,res) {
    let id = req.params.id;
    let string = req.body.string;
    let integer = parseInt(req.body.integer);
    let float = parseFloat(req.body.float);
    let date = req.body.date;
    let boolean = JSON.parse(req.body.boolean);

    bread.updateOne({"_id": new mongodb.ObjectID(id)}, {$set:{string:string, integer:integer, float:float, date:date, boolean:boolean}}  ,function(err){
      res.redirect('/');
    }) ;
  });

  app.get('/delete/:id', function(req, res){
    var id = req.params.id;
    bread.deleteOne({"_id": new mongodb.ObjectID(id)}, function(err, rows){
      if (err) {
        console.error(err);
        return res.send(err);
      }
      res.redirect('/');
    })
  });

  app.listen(3000, function(){
    console.log("server jalan di port 3000");
  })
})
