var db = require("../config/connection");
const collections = require("../config/collection");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const { response } = require("../app");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceid = process.env.TWILIO_SERVICE_SID;
const client = require("twilio")(accountSid, authToken);

require("dotenv").config();

module.exports = {
  userReg: (data) => {
    console.log(data, "LLLL");
    return new Promise(async (resolve, reject) => {
      data.repassword = await bcrypt.hash(data.repassword, 10);

      db.get().collection(collections.USER_COLLECTION).insertOne(data);
      console.log(data, "LLLLpppp");
      resolve(data);
    });
  },

  userLogin: (data) => {
    return new Promise(async (resolve, reject) => {
      let loginstatus = false;
      let response = {};
      let user = await db
        .get()
        .collection(collections.USER_COLLECTION)
        .findOne({ email: data.email });

      console.log(user);
      if (user) {
        if (user.isBlocked) {
          reject({ error: "user is blocked" });
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
              resolve(response);
            } else {
              console.log("login failed");
              response.status = false;
              reject(response);
            }
          });
        }
      } else {
        console.log("login failed");
        reject({ status: false });
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
      console.log(user.phone, "lllllllll");
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
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", proId);
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.PRODUCT_COLLECTION)
        .findOne({ _id: ObjectId(proId) })
        .then((product) => {
          console.log(product);
          resolve(product);
        });
    });
  },

  getuserdetails: (userId) => {
    // return new Promise (async(resolve,reject)=>{
    //   let userdetails=await db.get().collection(collections.USER_COLLECTION).find().sort({date:-1}).toArray()
    // // let   user=await db.get().collection(collections.USER_COLLECTION).findOne({ email:data.email })
    //   resolve(userdetails,"seeeeeee")
    //   console.log(userdetails)

    // })

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
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity);

    return new Promise((resolve, reject) => {
      if (details.count == -1 && details.quantity == 1) {
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
            resolve(true);
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

      resolve(grandtotal[0].grandtotal);
    });
  },
  placeorder: (order, products, totalprice) => {
    return new Promise((resolve, reject) => {
      console.log(order, products, totalprice);
      let status = order.paymentmethod === "COD" ? "placed" : "pending";
      let orderobj = {
        deliverydetails: {
          mobile: order.phone,
          address: order.address,
          pincode: order.pincode,
          date: new Date(),
        },
        userId: ObjectId(order.userId),
        paymentmethod: order.paymentmethod,
        products: products,
        totalAmount: totalprice,
        status: status,
      };
      db.get()
        .collection(collections.ORDER_COLLECTION)
        .insertOne(orderobj)
        .then((response) => {
          db.get()
            .collection(collections.CART_COLLECTION)
            .deleteOne({ user: ObjectId(order.userId) });
          resolve();
        });
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
};
