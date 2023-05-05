var db = require('../config/connection')
const collections = require('../config/collection')
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const { response } = require('../app');

// import Swal from 'sweetalert2'
const Swal = require('sweetalert')

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceid = process.env.TWILIO_SERVICE_SID;
const client = require("twilio")(accountSid, authToken);

require('dotenv').config();


module.exports = {



  getallproducts: () => {
    return new Promise(async (resolve, reject) => {
      let allproducts = await db.get().collection(collections.PRODUCT_COLLECTION).find().sort({ date: -1 }).toArray()
      resolve(allproducts, "seeeeeee")
      console.log(allproducts)

    })
  },
  getproductdetails: (proId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collections.PRODUCT_COLLECTION).findOne(({ _id: ObjectId(proId) })).then((product) => {
        console.log(product);
        resolve(product)
      })

    })
  },

  productupdate: (proid, prodetails) => {
    console.log(proid, '7777777777777777777');

    console.log(prodetails);
    return new Promise((resolve, reject) => {
      db.get().collection(collections.PRODUCT_COLLECTION)
        .updateOne({ _id: ObjectId(proid) }, {
          $set: {
            productname: prodetails.productname,
            category: prodetails.category,
            description: prodetails.description,
            price: prodetails.price,
            image: prodetails.image,

          }
        }).then((response) => {
          resolve()
        })
    })
  },
  productdelete: (proId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collections.PRODUCT_COLLECTION).deleteOne({ _id: ObjectId(proId) }).then((response) => {
        resolve(response)
      })
    });



  }









}