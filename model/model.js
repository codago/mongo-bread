const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
const url = 'mongodb://localhost:27017/mongobread';

function getTableData(cb, userQuery, limit, offset) {
  let filterQuery = {}

  if(userQuery.checkboxstring && userQuery.datastring){
    filterQuery['datastring'] = userQuery.datastring;
  }
  if(userQuery.checkboxinteger && userQuery.datainteger){
    filterQuery['datainteger'] = userQuery.datainteger;
  }
  if(userQuery.checkboxfloat && userQuery.datafloat){
    filterQuery['datafloat'] = userQuery.datafloat;
  }

  if(userQuery.checkboxdate && userQuery.startdate && userQuery.enddate){
    filterQuery['datadate'] = {$gte: userQuery.startdate, $lte: userQuery.enddate} ;
  }
  if(userQuery.checkboxboolean && userQuery.databoolean){
    filterQuery['databoolean'] = userQuery.databoolean;
  }

  MongoClient.connect(url, (error, db) => {
    if(error) {
      console.error(error);
    }
    const bread = db.collection('mongobreadcollection');
    const countData = db.collection('mongobreadcollection').count()
    bread.find(filterQuery).count((error, count) => {
      if(error) {
        console.error(error);
      }
      bread.find(filterQuery).skip(offset).limit(limit).toArray((error, docs) => {
        if(error) {
          console.error(error);
        }
        cb(docs, count);
      });
    });
  });
}

function insertToTable(datastring, datainteger, datafloat, datadate, databoolean) {
  MongoClient.connect(url, (error, db) => {
    if(error) {
      console.error(error);
    }
    const bread = db.collection('mongobreadcollection');
    bread.insertOne({
      datastring: datastring,
      datainteger: datainteger,
      datafloat: datafloat,
      datadate: datadate,
      databoolean: databoolean
      }
    )
  });
}

function searchEditTable(cb, id) {
  let ObjectId = require('mongodb').ObjectId;
  let o_id = new ObjectId(id);
  MongoClient.connect(url, (error, db) => {
    if(error) {
      console.error(error);
    }
    const bread = db.collection('mongobreadcollection');
    bread.find({_id: o_id}).toArray((error, doc) => {
      if(error) {
        console.error(error)
      }
      cb(doc[0])
    })
  });
}

function editDatabase(id, datastring, datainteger, datafloat, datadate, databoolean) {
  let ObjectId = require('mongodb').ObjectId;
  let o_id = new ObjectId(id);
  MongoClient.connect(url, (error, db) => {
    if(error) {
      console.error(error);
    }
    const bread = db.collection('mongobreadcollection');
    bread.update(
      {_id: o_id},
      {
        datastring: datastring,
        datainteger: datainteger,
        datafloat: datafloat,
        datadate: datadate,
        databoolean: databoolean
      }
    );
  });
}

function deleteDatabase(id) {
  let ObjectId = require('mongodb').ObjectId;
  let o_id = new ObjectId(id);
  MongoClient.connect(url, (error, db) => {
    const bread = db.collection('mongobreadcollection');
    bread.remove({_id: o_id})
  });
}


module.exports = {
  getTableData: getTableData,
  insertToTable: insertToTable,
  searchEditTable: searchEditTable,
  editDatabase: editDatabase,
  deleteDatabase: deleteDatabase
}

// module.exports = {
//   getTableData: getTableData,
//   getTableDataCount: getTableDataCount,
//   insertToTable: insertToTable,
//   searchEditDatabase: searchEditDatabase,
//   editDatabase: editDatabase,
//   deleteDatabase: deleteDatabase
// }
