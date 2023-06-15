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
            stock:prodetails.stock

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
cancelStockUpdate : (prodId , quantity) => {
  return new Promise((resolve , reject) => {
      db.get().collection(collections.PRODUCT_COLLECTION).updateOne({_id : ObjectId(prodId)} , {$inc : {stock : quantity}})
      resolve()
  })
},

cancelStockUpdate : (prodId , quantity) => {
  return new Promise((resolve , reject) => {
      db.get().collection(collections.PRODUCT_COLLECTION).updateOne({_id : ObjectId(prodId)} , {$inc : {stock : quantity}})
      resolve()
  })
},
addProductOffer: (details, prodId) => {
  return new Promise(async (resolve, reject) => {
      let response = {}
      let prodIdExist = await db.get().collection(collections.PRODUCT_OFFER).findOne({ prodId: prodId })
      if (prodIdExist) {
          db.get().collection(collections.PRODUCT_OFFER).updateOne({prodId : prodId},{
              $set: {
                  discount: details.discount,
                  startDate: details.startdate,
                  endDate: details.endingdate,
              }
          }).then((response) => {
              resolve(response)
          })
      }
      else {
          db.get().collection(collections.PRODUCT_OFFER).insertOne(
              {
                  prodId: prodId,
                  discount: details.discount,
                  startDate: details.startdate,
                  endDate: details.endingdate,
                  status: true
              }
          ).then((response) => {
              resolve(response)
          })
      }

  })
},

addOfferPrice : async (data , product) => {
  let price = product.price
  let discount = data.discount
  let prodId = product._id
  const response = await new Promise((resolve, reject) => {
      let offerPriceInt = Math.floor(price - (price * discount) / 100);
      let offerPrice = offerPriceInt.toString();
      db.get().collection(collections.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(prodId) }, { $set: { offerPrice: offerPrice, discount: discount } });
  });
  resolve(response);
},
editStock : ((prodId , details) => {
        
  return new Promise((resolve , reject) => {
      db.get().collection(collections.PRODUCT_COLLECTION).updateOne({_id : ObjectId(prodId)} , {$set : {stock : details.stock}}).then((response) => {
          resolve()
      })           
  })
}),
updateStock : (prodId , quantity) => {
  console.log(prodId,'>>>>>>>>>>><<<<<<<<<<');
  console.log(quantity,'quantityyyyyyyyyyy');
  return new Promise((resolve , reject) => {
      db.get().collection(collections.PRODUCT_COLLECTION).updateOne({_id : ObjectId(prodId)} , {$inc : {stock : -quantity}})
      resolve()
  })
},




}