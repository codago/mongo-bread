var mongoose = require('mongoose')
var MongoClient = require('mongodb').MongoClient;

class Bread {
  constructor() {
    this.url = 'mongodb://localhost:27017/breadDB';
  }

  createCollection(mc){
    mc.connect(this.url, function(err, db) {
      db.createCollection('data',function(err,res){
        if(err)throw err;
        console.log("Collection created!");
        db.close()
      })
    });
  }

  readAll(mc,cb){
    mc.connect(this.url, function(err, db) {
        db.collection('data').find({}).toArray(function(err,res){
          cb(res)
          db.close()
        })
    });
  }

  pageIndex(mc,skip, cb) {
    mc.connect(this.url, function(err, db) {
        db.collection('data').find().skip(skip).limit(5).toArray(function(err,res){
          // console.log(res);
          cb(res)
          db.close()
        })
    });
  }

  filterAll(mc,id, string, integer, float, startDate, endDate, boolean, cb) {
    let arrArg = [id,string,integer,float,boolean,startDate];
    let arrDatabase = ['_id','string','integer','float','boolean','date'];
    let tempStr = {};
    let count = 0;
    for(let i=0;i<arrArg.length;i++){


            if(i<5){

              if(arrArg[i] === "Choose the boolean ..."){
                arrArg[i] = null;
              }else if(arrArg[i] || arrArg[i] === false){
                if(i === 0){

                  if(arrArg[i].length < 24){
                    tempStr[arrDatabase[i]] = new mongoose.Types.ObjectId("59b622c22cdf0e00007927de")
                    count++
                  }else{
                    tempStr[arrDatabase[i]] = new mongoose.Types.ObjectId(arrArg[i])
                    count++
                  }
                }else{
                count++;
                if(count === 1){
                  tempStr[arrDatabase[i]] = arrArg[i]
                }else if(count > 1){
                  tempStr[arrDatabase[i]] = arrArg[i]
                }
              }
              }
            }else if(i>=5){
              arrArg[6] = endDate;
              if(arrArg[i] && arrArg[i+1] || arrArg[i] === false){
                count++;
                tempStr[arrDatabase[i]] = {"$gt":new Date(arrArg[i]),"$lt":new Date(arrArg[i+1])}
              }

              if(i === arrArg.length-2){
                if(count === 0){
                      tempStr['string'] = string
                }
              }
              arrArg.pop();
            }
  }

  mc.connect(this.url, function(err, db) {
      db.collection('data').find(tempStr).toArray(function(err,res){
        if(err)throw err;
        cb(res)
        db.close()
      })
  });

  }

  pageIndexFilter(mc,id, string, integer, float, startDate, endDate, boolean,skip, cb) {
    let arrArg = [id,string,integer,float,boolean,startDate];
    let arrDatabase = ['_id','string','integer','float','boolean','date'];
    let tempStr = {};
    let count =0;

    for(let i=0;i<arrArg.length;i++){

      if(i<5){

        if(arrArg[i] === "Choose the boolean ..."){
          arrArg[i] = null;
        }else if(arrArg[i] || arrArg[i] === false){
          if(i === 0){

            if(arrArg[i].length < 24){
              tempStr[arrDatabase[i]] = new mongoose.Types.ObjectId("59b622c22cdf0e00007927de")
              count++
            }else{
              tempStr[arrDatabase[i]] = new mongoose.Types.ObjectId(arrArg[i])
              count++
            }
          }else{
          count++;
          if(count === 1){
            tempStr[arrDatabase[i]] = arrArg[i]
          }else if(count > 1){
            tempStr[arrDatabase[i]] = arrArg[i]
          }
        }
        }
      }else if(i>=5){
        arrArg[6] = endDate;
        if(arrArg[i] && arrArg[i+1] || arrArg[i] === false){
          count++;
          tempStr[arrDatabase[i]] = {"$gt":new Date(arrArg[i]),"$lt":new Date(arrArg[i+1])}
        }

        if(i === arrArg.length-2){
          if(count === 0){
                tempStr['string'] = string
          }
        }
        arrArg.pop();
      }
  }
console.log(tempStr);
  mc.connect(this.url, function(err, db) {
      db.collection('data').find(tempStr).skip(skip).limit(5).toArray(function(err,res){
        if(err)throw err;
        // console.log(res);
        cb(res)
        db.close()
      })
  });

  }

  add(mc,string, integer, float, date, boolean) {
    mc.connect(this.url, function(err, db) {
        db.collection('data').insert([
          {string:string,integer:integer,float:float,date:new Date(date),boolean:boolean}
        ],function(err,res){
          db.close()
        })
    });
  }


  find(mc,date1,date2,string){
    mc.connect(this.url,function(err,db){
      if(err)throw err;
          db.collection('data').find({
            date:{
            "$gt":new Date(date1),
            "$lt":new Date(date2)
          },string:string}).toArray(function(err,res){
            console.log(res);
            db.close()
          })
    })
  }

  findByBoolean(mc,boolean){
    mc.connect(this.url, function(err, db) {
      if(err)throw err;
        db.collection('data').find({boolean:boolean}).toArray(function(err,res){
          console.log(res);
          db.close()
        })
    })
  }

  findById(mc,id,cb){
    mc.connect(this.url, function(err, db) {
      if(err)throw err;
        db.collection('data').find({_id:new mongoose.Types.ObjectId(id)}).toArray(function(err,res){
          console.log(res);
          cb(res)
          db.close()
        })
    })
  }

  edit(mc,id,string,integer,float,date,boolean){
    mc.connect(this.url, function(err, db) {
      if(err)throw err;
        db.collection('data').updateOne({_id:new mongoose.Types.ObjectId(id)},{$set:{string:string,integer:integer,float:float,date:new Date(date),boolean:boolean}},function(err,res){
          console.log("update success");
          db.close()
        })
    })
  }

  delete(mc,id){
      mc.connect(this.url,function(err,db){
        if(err)throw err;
        db.collection('data').deleteOne({_id:new mongoose.Types.ObjectId(id)},function(err,res){
          console.log("removed success");
          db.close();
        })
      })
  }
}

export {Bread as default}
