var db = require('../config/connection')
const collections = require('../config/collection')
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const { response } = require('../app');
const { Razorpay } = require('razorpay');
// const { default: orders } = require('razorpay/dist/types/orders');


// import Swal from 'sweetalert2'
// const Swal = require('sweetalert')

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
            // categoryname: prodetails.categoryname,
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



  },
  getorderProducts: (proId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collections.PRODUCT_COLLECTION).findOne(({ _id: ObjectId(proId) })).then((products) => {
        console.log(products);
        resolve(products)
      })

    })
  },

  
getAllProducts: () => {
  return new Promise(async (resolve, reject) => {
      let product = await db.get().collection(collections.PRODUCT_COLLECTION).find().toArray()
      
      resolve(product)

  })
},


getFilterProduct : (category) => {
  return new Promise(async(resolve , reject) => {
    let product =await db.get().collection(collections.PRODUCT_COLLECTION).find({categoryname : category}).toArray()
    resolve(product)
  })
},
getOrderProduct: (oneProId) => {
  return new Promise(async (resolve, reject) => {
      let orderProduct = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
          {
              $match: { _id: ObjectId(oneProId) }
          },
          {
              $unwind: '$products'
          },
          {
              $project: {
                item: '$products.item',
                quantity: '$products.quantity'

              }
          },
          {
              $lookup: {
                  from: collections.PRODUCT_COLLECTION,
                  localField: 'item',
                        foreignField: '_id',
                  as: 'product'
              }
          },
          {
              $project: {
                item: 1,
                quantity: 1,

                  product: { $arrayElemAt: ['$product', 0] }
              }
          }

      ]).toArray()
     
      resolve(orderProduct)
  })
},










}