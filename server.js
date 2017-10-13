"use strict"

const express = require('express')
const app = express()
const path = require('path')
const moment = require('moment');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const mongodb = require('mongodb')

MongoClient.connect("mongodb://localhost:27017/bread", function(err, db) {
  if (err) {
    return console.dir(err);
  }
  const collection = db.collection('datahasil');

  app.use(bodyParser.urlencoded({extended : true}))
  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'ejs')
  app.use(express.static(path.join(__dirname, 'public')))

  app.get('/', function(req, res) {

    let filter = {  }
    let url = (req.url == "/") ? "/?page=1" : req.url;
    let page = Number(req.query.page) || 1
    if(url.indexOf('&cari=') != -1){
      page =1;
    }
    url = url.replace('&cari=','');

    //  if(typeof req.query.cek_id !== 'undefined'){
    //    filter['string'] = req.query.id;
    //  }

    if(typeof req.query.cek_string !== 'undefined'){
      filter['string'] = req.query.string;
    }

    if(typeof req.query.cek_integer  !== 'undefined'){
      filter['integer'] = Number(req.query.integer);
    }

    if(typeof req.query.cek_float  !== 'undefined'){
      filter['float']   = parseFloat(req.query.float);
    }

    if(typeof req.query.cek_date  !== 'undefined'){
      filter['date'] = req.query.date
    }

    if(typeof req.query.cek_boolean  !== 'undefined'){
      filter['boolean'] =(req.query.boolean);
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
    let offset = (page-1) * limit
    collection.find(filter).count((err, count) => {
      if(err) {
        console.error(err);
      }
      let total = count
      let pages = (total == 0) ? 1 : Math.ceil(total/limit);
      collection.find(filter).skip(offset).limit(limit).toArray(function (err, data) {
        if (err) {
          console.error(err);
          return res.send(err);
        }

        res.render('list', {title: "BREAD", data: data, page:page,get_link:get_link,limit: limit, offset: offset, pages: pages,total:total, url: url, query: req.query });
      });
    })
  });

  app.get('/add', (req, res) => {
    res.render('add', {title: "Add"});
  });

  app.post('/add', (req, res)=>{

    let string = req.body.string
    let integer = parseInt(req.body.integer)
    let float = parseFloat(req.body.float)
    let date = req.body.date
    let boolean = req.body.boolean
    collection.insertOne({string:string, integer:integer, float:float , date: date, boolean: boolean}, (err) =>{
      if(err) {
        console.error(err)
        return res.send(err);
      }
      res.redirect('/');
    })
  })

  app.get('/edit/:id', (req, res)=>{
    let id = req.params.id;
    console.log(id);
    collection.findOne({_id:new mongodb.ObjectID(id)}, (err, data)=> {
      console.log(data);
      if (err) {
        console.error(err);
        return res.send(err);
      }
      if(data){
        res.render('edit', {data: data});
      }
    })
  })


  app.post('/edit/:id', (req, res)=>{
    let id = req.params._id;
    let string = req.body.string;
    let integer = parseInt(req.body.integer);
    let float = parseFloat(req.body.float);
    let date = req.body.date;
    let boolean = req.body.boolean;
    collection.updateOne({ id: id}, { $set:{string:string, integer:integer, float:float, date:date, boolean:boolean}}, (err)=>{
      if (err) {
        console.error(err);
        return res.send(err);
      }
      res.redirect('/');
    })
  })


  app.get('/delete/:id', (req, res)=>{
    let id = req.params._id;
    collection.deleteOne({id:id}, (err)=>{
      if (err) {
        console.error(err);
        return res.send(err);
      }
      res.redirect('/');
    })
  })


  app.listen(3000, function(){
    console.log("server jalan di port 3000");
  })
});
