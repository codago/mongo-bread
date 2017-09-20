"use strict"
const express = require('express');
const app = express();
const path = require('path')
const bodyParser = require('body-parser');
const model = require("./model/model");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.get("/", (req,res) => {
  let userQuery = req.query
  let url = (req.url == "/") ? "/?page=1" : req.url;
  let page = Number(req.query.page) || 1
  if(url.indexOf('&submit=') != -1){
    page = 1;
  }
  url = url.replace('&submit=', '')
  let limit = 3
  let offset = (page-1) * 3
  model.getTableData(function(tableData, tableDataLength) {
      let pages = (tableDataLength == 0) ? 1 : Math.ceil(tableDataLength/limit)
      res.render('list',
        {
          tableData: tableData,
          query: userQuery,
          pagination:
            {
              page: page,
              limit: limit,
              offset: offset,
              pages: pages,
              total: tableDataLength,
              url: url
            }
          })
  }, userQuery, limit, offset)
});

app.get("/add", (req, res) => {
  res.render("add");
});

app.post("/add", (req, res) => {
  let datastring = req.body.datastring;
  let datainteger = parseInt(req.body.datainteger);
  let datafloat = parseFloat(req.body.datafloat);
  let datadate = req.body.datadate;
  let databoolean = (req.body.databoolean === "True") ? true : false;
  model.insertToTable(datastring, datainteger, datafloat, datadate, databoolean)
  res.redirect("/");
});

app.get("/edit/:id", (req, res) => {
  let id = req.params.id;
  model.searchEditTable((selectedData) => {
    res.render("edit", {selectedData: selectedData})
  }, id)
});

app.post("/edit/:id", function(req, res) {
  let id = req.body._id;
  let datastring = req.body.datastring;
  let datainteger = parseInt(req.body.datainteger);
  let datafloat = parseFloat(req.body.datafloat);
  let datadate = req.body.datadate;
  let databoolean = JSON.parse(req.body.databoolean);
  model.editDatabase(id, datastring, datainteger, datafloat, datadate, databoolean);
  res.redirect("/");
});


app.get("/delete/:id", function(req, res) {
    let id = req.params.id;
    model.deleteDatabase(id);
    res.redirect("/");
});

app.listen(3000, (err, res) => {
  console.log("server jalan");
})
