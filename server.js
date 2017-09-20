"use strict"

const express = require('express');
const app = express();
const path = require('path')
const moment = require('moment');

const bodyParser = require('body-parser');
const mongodb = require('mongodb')

const MongoClient = mongodb.MongoClient
let url = 'mongodb://localhost:27017/breaddb';
MongoClient.connect(url, (err, db)=>{
  const bread = db.collection('bread');


  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');

  app.use(express.static(path.join(__dirname,'public')))

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));

  app.use((req, res, next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-control', 'no-cache');
    next();
  });

  app.get('/', (req, res)=>{
    let filter = {};
    if(req.query.cstring && req.query.string){
      filter['string'] = req.query.string
    }
    if(req.query.cinteger && req.query.integer){
      filter['integer'] = Number(req.query.integer)
    }
    if(req.query.cfloat && req.query.float){
      filter['float'] = parseFloat(req.query.float)
    }
    if(req.query.cdate && req.query.startdate && req.query.enddate){
      filter['date'] = {$gte: req.query.startdate, $lte: req.query.enddate}
    }
    if(req.query.cboolean && req.query.boolean){
      filter['boolean'] = JSON.parse(req.query.boolean)
    }


    let url = (req.url == "/") ? "/?page=1" : req.url
    let page = Number(req.query.page) || 1
    let offset = (page - 1) * 3
    let limit = 3


    bread.find(filter).count((error, count)=>{
      if(error){
        console.error(error);
      }
      let total = count
      let pages = (total == 0) ? 1 : Math.ceil(total/limit)
      bread.find(filter).skip(offset).limit(limit).toArray((err, docs) =>{
        if(err){
          console.error(err);
          return res.send(err);
        }
        res.render('list', {title: "Mongo BREAD",header:"BREAD", rows: docs, pagination:{page: page, limit: limit, offset: offset, pages: pages, total: total, url: url}, query: req.query});
      })
    })
  })

  app.get('/add', (req, res)=>{
    res.render('add', {title: "Mongo BREAD"});
  })

  app.post('/add', (req, res)=>{
    let string = req.body.string
    let integer = parseInt(req.body.integer)
    let float = parseFloat(req.body.float)
    let date = req.body.date
    let boolean = JSON.parse(req.body.boolean)

    bread.insertOne({string: string, integer: integer, float: float, date: date, boolean: boolean}, (err, result)=>{
      if(err){
        console.error(err);
        return res.send(err);
      }
      res.redirect('/')
    })
  })

  app.get('/edit/:id', (req, res) =>{
    let id = req.params.id;
    bread.findOne({"_id": new mongodb.ObjectID(id)}, (err, data) =>{
      console.log(data);
      if(err){
        console.error(err);
        return res.send(err);
      }
      if(data){
        data.date = moment(data.date).format('DD-MM-YYYY');
        res.render('edit', {title: 'edit', item: data});
      }else{
        res.send('data tidak ditemukan')
      }
    })
  })
  app.post('/edit/:id', (req, res) =>{
    let id = req.params.id
    let string = req.body.string
    let integer = parseInt(req.body.integer)
    let float = parseFloat(req.body.float)
    let date = req.body.date
    let boolean = JSON.parse(req.body.boolean)
    bread.updateOne({"_id": new mongodb.ObjectID(id)}, {$set :{string: string, integer: integer, float: float, date: date, boolean: boolean}}, (err, result)=>{
      if(err){
        console.error(err);
        return res.send(err);
      }else{
        console.log("update sukses");
        res.redirect('/');
      }
    })
  })
  app.get('/delete/:id', (req, res)=>{
    let id= req.params.id
    bread.deleteOne({"_id": new mongodb.ObjectID(id)}, (err, result)=>{
      if(err){
        console.error(err);
        return res.send(err);
      }
      res.redirect('/')
    })
  })
  app.listen(3000, () => {
    console.log('Server Terhubung')
  })
});
