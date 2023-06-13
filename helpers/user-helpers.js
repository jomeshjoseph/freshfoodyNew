var db = require("../config/connection");
const collections = require("../config/collection");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const { response } = require("../app");
const moment = require('moment');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceid = process.env.TWILIO_SERVICE_SID;
const client = require("twilio")(accountSid, authToken);

require("dotenv").config();

const Razorpay = require("razorpay");

var instance = new Razorpay({
  key_id: "rzp_test_8Hsl6IOam7xUhL",
  key_secret: "MgZnJczEHCQ5baBRTY7h4ga6",
});

module.exports = {
  userReg: (data) => {
    console.log(data, "LLLL");
    return new Promise(async (resolve, reject) => {
      try {
        let userWithEmail = await db
          .get()
          .collection(collections.USER_COLLECTION)
          .findOne({ email: data.email });
  
        let userWithPhone = await db
          .get()
          .collection(collections.USER_COLLECTION)
          .findOne({ phone: data.phone });
  
        if (userWithEmail) {
         
          reject({ error: "Email Already Exists", status: false });
        } else if (userWithPhone) {
         
          reject({ error: "Phone number already exists", status: false });
        } else {
        //   response.status=true
        //   client.verify
        //   .services(serviceid)
        //   .verifications.create({ to: `+91${data.phone}`, channel: "sms" })
        //   .then((data) => {});
        // resolve(response);     
        data.repassword = await bcrypt.hash(data.repassword, 10);
          db.get().collection(collections.USER_COLLECTION).insertOne(data);
          resolve({user:data,status:true});
          console.log(data, "LLLLpppp");    
        }
      } catch (error) {
        reject({ error: "An error occurred", status: false });
      }
    });
  },
  

  userLogin: (data) => {
    return new Promise(async (resolve, reject) => {
      let loginstatus = false;
      let response = {};
      try{
      let user = await db
        .get()
        .collection(collections.USER_COLLECTION)
        .findOne({ email: data.email });

      console.log(user);
      if (user) {
        if (user.isBlocked) {
          reject({error:"user is blocked"});
        } else {
          bcrypt.compare(data.repassword, user.repassword).then((status) => {
            console.log(data.repassword);
            console.log(user.repassword);
            console.log(status, "statusssssssss");
            if (status) {
              console.log("login sucess");
              response.user = user;
              response.status = true;
              console.log(response);
              resolve({user, status:true});
            } else {
              console.log("login failed");
              response.status = false;
              reject({error:"Invalid Password",status:false});
            }
          });
        }
      } else {
        console.log("login failed");
        reject({ error:"User Not Found",status: false });
      }
    }catch(error)
    {
      reject({error:"An error occurred",status:false})
    }
    });
  },

  doOtp: (Data) => {
    console.log(Data, "aaaaaaaaaaa");
    return new Promise(async (resolve, reject) => {
      let response = {};

      let user = await db
        .get()
        .collection(collections.USER_COLLECTION)
        .findOne({ phone: Data.phone });
      console.log(user, "lllllllll");
      if (user) {
        response.status = true;
        response.user = user;

        client.verify
          .services(serviceid)
          .verifications.create({ to: `+91${Data.phone}`, channel: "sms" })
          .then((data) => {});
        resolve(response);
      } else {
        response.status = false;
        resolve(response);
        console.log(response);
      }
    });
  },

  otpConfirm: (confirmotp, userData) => {
    return new Promise((resolve, reject) => {
      let otp =
        confirmotp.digit1 +
        confirmotp.digit2 +
        confirmotp.digit3 +
        confirmotp.digit4;
      console.log(otp);

      client.verify
        .services(serviceid)
        .verificationChecks.create({
          to: `+91${userData.phone}`,
          code: otp,
        })
        .then((data) => {
          if (data.status == "approved") {
            resolve({ status: true });
          } else {
            resolve({ status: false });
          }
        });
    });
  },
  doReOtp: (Data) => {
    console.log(Data, "reeee");
    return new Promise(async (resolve, reject) => {
      let response = {};

      let user = await db
        .get()
        .collection(collections.USER_COLLECTION)
        .findOne({ phone: Data.phone });
      console.log(user.phone, "REElllllllll");
      if (user) {
        response.status = true;
        response.user = user;

        client.verify
          .services(serviceid)
          .verifications.create({ to: `+91${Data.phone}`, channel: "sms" })
          .then((data) => {});
        resolve(response);
      } else {
        response.status = false;
        resolve(response);
        console.log(response);
      }
    });
  },

  getallproducts: () => {
    return new Promise(async (resolve, reject) => {
      let allproducts = await db
        .get()
        .collection(collections.PRODUCT_COLLECTION)
        .find()
        .sort({ date: -1 })
        .toArray();
      resolve(allproducts, "seeeeeee");
      console.log(allproducts);
    });
  },

  // getproductdetail:(data)=>{
  //   return new Promise(async(resolve,reject)=>{
  //     let viewdetail=await db.get().collection(collections.PRODUCT_COLLECTION).findOne({productname : data.productname})
  //     resolve(viewdetail)
  //   } )
  // },

  getproductDetails: (proId) => {
    return new Promise(async (resolve , reject) => {
      let product = await db.get().collection(collections.PRODUCT_COLLECTION).findOne({_id : ObjectId(proId)})
      resolve(product)
    })
  },


  // return new Promise((resolve, reject) => {
  //   db.get()
  //     .collection(collections.PRODUCT_COLLECTION)
  //     .findOne({_id : ObjectId(proId)} )
  //     .then((product) => {
  //       console.log(product , "vannuuuuuuuu");
  //       resolve(product);
  //     });
  // });

  getuserdetails: (userId) => {
    // return new Promise (async(resolve,reject)=>{
    //   let userdetails=await db.get().collection(collections.USER_COLLECTION).find().sort({date:-1}).toArray()
    // // let   user=await db.get().collection(collections.USER_COLLECTION).findOne({ email:data.email })
    //   resolve(userdetails,"seeeeeee")
    //   console.log(userdetails)

    // })
    console.log(">>>>>>>>>>>>>>>",userId);
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.USER_COLLECTION)
        .findOne({ _id: ObjectId(userId) })
        .then((user) => {
          console.log(user);
          resolve(user);
        });
    });
  },

  userupdate: (proid, prodetails) => {
    console.log(proid, "7updateuserrr");

    console.log(prodetails);
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(proid) },
          {
            $set: {
              firstname: prodetails.firstname,
              lastname: prodetails.lastname,
              email: prodetails.email,
              phone: prodetails.phone,
              address: prodetails.address,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },

  addtocart: (prodId, userId) => {
    let proobj = {
      item: ObjectId(prodId),
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      let usercart = await db
        .get()
        .collection(collections.CART_COLLECTION)
        .findOne({ user: ObjectId(userId) });

      if (usercart) {
        let proexist = usercart.products.findIndex(
          (product) => product.item == prodId
        );
        console.log(proexist);

        if (proexist != -1) {
          db.get()
            .collection(collections.CART_COLLECTION)
            .updateOne(
              { user: ObjectId(userId), "products.item": ObjectId(prodId) },
              {
                $inc: { "products.$.quantity": 1 },
              }
            )
            .then(() => {
              resolve();
            });
        } else {
          db.get()
            .collection(collections.CART_COLLECTION)
            .updateOne(
              { user: ObjectId(userId) },
              {
                $push: { products: proobj },
              }
            )
            .then((response) => {
              resolve();
            });
        }
      } else {
        let cartobj = {
          user: ObjectId(userId),
          products: [proobj],
        };

        db.get()
          .collection(collections.CART_COLLECTION)
          .insertOne(cartobj)
          .then((response) => {
            resolve();
          });
      }
    });
  },

  getcartproducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartitems = await db
        .get()
        .collection(collections.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: ObjectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collections.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: 1,
              total: {
                $sum: {
                  $multiply: ["$quantity", { $toInt: "$product.price" }],
                },
              },
            },
          },
        ])
        .toArray();
      console.log(cartitems);

      resolve(cartitems);
    });
  },
  //   removefromcart:(cartId)=>{
  //     return new Promise((resolve, reject) => {
  //       db.get().collection(collections.CART_COLLECTION).deleteOne({ _id: ObjectId(proId) }).then((response) => {
  //         resolve(response)
  //       })

  //   })
  // },
  getcartcount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cart = await db
        .get()
        .collection(collections.CART_COLLECTION)
        .findOne({ user: ObjectId(userId) });
      if (cart) {
        count = cart.products.length;
      }
      resolve(count);
    });
  },

  changeproductquantity: (details) => {
    details.count = parseFloat(details.count);
    details.price = parseFloat(details.price);

    details.quantity = parseFloat(details.quantity);
    let pertotal = details.price * (details.quantity + details.count);
    console.log(details.pertotal, ">>>>>>>>>>>>>>>>");
    return new Promise((resolve, reject) => {
      if (details.count == -0.25 && details.quantity == 0.25) {
        db.get()
          .collection(collections.CART_COLLECTION)
          .updateOne(
            { _id: ObjectId(details.cart) },
            {
              $pull: { products: { item: ObjectId(details.product) } },
            }
          )
          .then((response) => {
            resolve({ removeproduct: true });
          });
      } else {
        db.get()
          .collection(collections.CART_COLLECTION)
          .updateOne(
            {
              _id: ObjectId(details.cart),
              "products.item": ObjectId(details.product),
            },
            {
              $inc: { "products.$.quantity": details.count },
            }
          )
          .then(() => {
            resolve({ status: true });
          });
      }
    });
  },

  getgrandtotal: (userId) => {
    return new Promise(async (resolve, reject) => {
      let grandtotal = await db
        .get()
        .collection(collections.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: ObjectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collections.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
          {
            $group: {
              _id: null,
              grandtotal: {
                $sum: {
                  $multiply: ["$quantity", { $toInt: "$product.price" }],
                },
              },
            },
          },
        ])
        .toArray();

      resolve(grandtotal[0]?.grandtotal);
    });
  },
  
  
  placeorder: (order, products, totalprice) => {
    return new Promise(async (resolve, reject) => {
      console.log(order, products, totalprice, "3333333333333333");
      let status = order.paymentmethod === "COD" ? "placed" : "pending";
      let orderobj = {
        deliverydetails: {
          firstname:order.firstname,
          mobile: order.phone,
          address: order.address,
          pincode: order.pincode,
         
        },
        userId: ObjectId(order.userId),
        paymentmethod: order.paymentmethod,
        products: products,
        date: moment().format('MMM Do YYYY, HH:MM ' ),
        totalAmount: totalprice,
        status: status,
      };
      let orderId;
      await db
        .get()
        .collection(collections.ORDER_COLLECTION)
        .insertOne(orderobj)
        .then((response) => {
          db.get()
            .collection(collections.CART_COLLECTION)
            .deleteOne({ user: ObjectId(order.userId) });
          console.log(response.insertedId, "qqqqqqqqqqq");
          orderId = response.insertedId;
          resolve(response.insertedId);
        });
      // console.log(orderDetails,'oooooooooo');
      // console.log(orderId,'tttttttttttttt');
      // resolve(orderId);
    });
  },
  getcartproductlist: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db
        .get()
        .collection(collections.CART_COLLECTION)
        .findOne({ user: ObjectId(userId) });
      resolve(cart.products);
    });
  },
  viewTotalProduct: (pageNum, limit) => {
    let skipNum = parseInt((pageNum - 1) * limit);
    // console.log(skipNum, pageNum, limit, "skipppp");
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collections.PRODUCT_COLLECTION)
        .find()
        .skip(skipNum)
        .limit(limit)
        .toArray();
      resolve(products);
    });
  },

  getuserorders: (userId) => {
    console.log(userId);
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collections.ORDER_COLLECTION)
        .find({ userId: ObjectId(userId) })
        .toArray();
      resolve(orders);
    });
  },

  removefromcart: (proId, userId) => {
    console.log(userId, "ersssssss");
    console.log(proId, "ffffffffffffffff");
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.CART_COLLECTION)
        .updateOne(
          { user: ObjectId(userId) },
          {
            $pull: { products: { item: ObjectId(proId) } },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });

    // console.log(proId);
    // return new Promise(async(resolve,reject)=>{
    //    await db.get()
    //   .collection(collections.CART_COLLECTION)
    //   .deleteOne({ products: ObjectId(proId) });
    // resolve();
    // })
  },
  generateraorzpay: (orderId, total) => {
    let orderIdS=orderId.toString()
    console.log(typeof orderId, orderId);
    console.log(total);
    return new Promise(async (resolve, reject) => {
      let options = {
        amount: total*100, // amount in the smallest currency unit
        currency: "INR",
        receipt: orderIdS,
      };
      console.log(options, "optionssssss");
      instance.orders.create(options, function (err, order) {
        if (err) {
          console.log(err);
          reject(err)
        } else {
          console.log(order, "nulllllllll");
          resolve(order);
        }
      });

      // console.log(createdInstance,'Instance created');
      // resolve(createdInstance)
    });
  },
  verifypayment: (details) => {

    return new Promise((resolve, reject) => {

      const crypto = require('crypto')
      let hmac = crypto.createHmac('sha256', 'MgZnJczEHCQ5baBRTY7h4ga6')
      hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
      const calculatedSignature = hmac.digest('hex')
     
  
      if (calculatedSignature === details['payment[razorpay_signature]']) {
        console.log("Signature is valid")
        let name='mghgh'
        resolve(name)
      } else {
        console.log("Signature is invalid")
        reject()
      }
    })
  },

  changepaymentstatus: (orderId) => {
    return new Promise((resolve, reject) => {
        db.get().collection(collections.ORDER_COLLECTION).updateOne(
            { _id: ObjectId(orderId) },
            {
                $set: {
                    status: 'placed'
                }
            }
        ).then(() => {
            resolve();
        }).catch((err) => {
            // Handle the error here
            // No action required for order not continued
            const errorMessage = 'Error updating payment status';
            reject(errorMessage);
        });
    });
},
getTotalAmount:(userId)=>{
  return new Promise(async(resolve,reject)=>{

      let total=await db.get().collection(collections.CART_COLLECTION).aggregate([
          {
              $match:{user: ObjectId(userId)}
          },
          { 
              $unwind: '$products'
          },
          {
              $project: {
                  item: '$products.item',
                  quantity: '$products.quantity',
                  user: 1
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
                  user: 1,
                  product: {
                      $arrayElemAt: ['$product', 0]
                  }
              }
          },
          {
              $group:{
                  _id:null,
                  total:{$sum:{$multiply:['$quantity',parseInt('$product.price')]}}
              }
          }
         
          
      ]).toArray()
      
      
      resolve(total[0]?.total);

  })

},
applyCoupen : (details , userId , date , totalAmount) => {
  return new Promise(async(resolve , reject) => {
      let response = {}
      let coupen = await db.get().collection(collections.COUPON_COLLECTION).findOne({ code : details.coupon , status : true })
      
      if(coupen) {
          const expDate = new Date(coupen.endingDate)
          response.coupenData = coupen
          let user = await db.get().collection(collections.COUPON_COLLECTION).findOne({ code : details.coupon , users : ObjectId(userId) })

          if(user){
              response.used = "coupen is already used"
              resolve(response)
          }
          else{
              if(date <= expDate){
                  response.dateValid = true
                  resolve(response)

                  let total = totalAmount

                  if(total >= coupen.minAmount){
                      response.veriftminAmount = true
                      resolve(response)

                      if(total <= coupen.maxAmount){
                          response.verifymaxAmount = true
                          resolve(response)
                      }
                      else{
                          response.veriftminAmount = true
                          response.verifymaxAmount = true
                          resolve(response)
                      }
                  }
                  else{
                      response.minAmountMsg = 'your min purchase should be : ' + coupen.minAmount
                      response.minAmount = false
                      resolve(response)
                  }
              }
              else{
                  response.invalidDateMsg = 'Coupen Expired'
                  response.invalidDate = true
                  response.Coupenused = false

                  resolve(response)
              }
          }
      }
      else{
          response.invalidCoupen = true
          response.invalidCoupenMsg = 'Invalid Coupen'
          resolve(response)

      }
      if(response.dateValid && response.veriftminAmount && response.verifymaxAmount){
          response.verify = true

          db.get().collection(collections.CART_COLLECTION).updateOne({ user : ObjectId(userId) } , 
          {
              $set : {
                  coupen : ObjectId(coupen._id)
              }
          }
          )
          resolve(response)
      }else{
        response.verify=false
      }
  })
},
getcurrentcoupen: () => {
  return new Promise(async (resolve, reject) => {
    let coupons = await db
      .get()
      .collection(collections.COUPON_COLLECTION)
      .find()
      .toArray();

    resolve(coupons);
  });
},
singleorderdetails: (orderId) => {
  return new Promise(async (resolve, reject) => {
  
      let orderDetail = await db
        .get()
        .collection(collections.ORDER_COLLECTION)
        .findOne({ _id: ObjectId(orderId) });
      resolve(orderDetail);
    
  });
},
returnOrder: (ordId) => {
  return new Promise((resolve, reject) => {
      let ordReturn = db.get().collection(collections.ORDER_COLLECTION).updateOne({ _id: ObjectId(ordId) },
          {
              $set: {
                  status: "product returned"
              }
          }
      )
      resolve(ordReturn)
  })
},
getProductDetails: (ordId) => {
        
  return new Promise(async (resolve, reject) => {
      let productDetails = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
          {
              $match: { _id: ObjectId(ordId) }
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
      resolve(productDetails)
  })
},
orderCancel: (ordId) => {
  return new Promise(async(resolve, reject) => {
      let ordCancel =await db.get().collection(collections.ORDER_COLLECTION).updateOne({ _id: ObjectId(ordId) },
          {
              $set: {
                  status: "order cancelled"
              }
          }
      )
      resolve(ordCancel)
  })

},





};
