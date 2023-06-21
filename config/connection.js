
require('dotenv').config(); 
const mongoClient=require('mongodb').MongoClient

const state={
  db:null
}


module.exports.connect = (done)=> {
  // const url='mongodb://0.0.0.0:27017' 
  const url=process.env.MONGODB_ACCOUNT
  const dbname='foody'
  mongoClient.connect(url, async (err,data)=> {
    if (err) return err;
    state.db = await data.db(dbname);
    done();
  });
};


module.exports.get = ()=>{
  return state.db
}
