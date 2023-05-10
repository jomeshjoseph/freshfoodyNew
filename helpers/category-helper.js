var db = require('../config/connection')
const collections = require('../config/collection')
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const { response } = require('../app');

// import Swal from 'sweetalert2'
// const Swal = require('sweetalert')

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceid = process.env.TWILIO_SERVICE_SID;
const client = require("twilio")(accountSid, authToken);

require('dotenv').config();

module.exports={
    categorydelete: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CATEGORY_COLLECTION).deleteOne({_id: ObjectId(proId)}).then((response) => {
            resolve(response)
          })
        });
    
    
    
      },

      getcategorydetails: (proId) => {
        return new Promise((resolve, reject) => {
          db.get().collection(collections.CATEGORY_COLLECTION).findOne(({ _id: ObjectId(proId) })).then((category) => {
            console.log(category);
            resolve(category)
          })
    
        })
      },

      categoryupdate: (proid, catedetails) => {
        console.log(proid, 'catidddddddd');
    
        console.log(catedetails);
        return new Promise((resolve, reject) => {
          db.get().collection(collections.CATEGORY_COLLECTION)
            .updateOne({ _id: ObjectId(proid) }, {
              $set: {
                categoryname: catedetails.categoryname,
            
                
              }
            }).then((response) => {
              resolve()
            })
        })
      },

      getallcategory:()=>{

        return new Promise(async(resolve,reject)=>{

            let getcategory=await db.get().collection(collections.CATEGORY_COLLECTION).find().sort({date:-1}).toArray()
            resolve(getcategory)
        })
    }




}
