var db = require("../config/connection");
const collections = require("../config/collection");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const { now } = require("mongoose");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceid = process.env.TWILIO_SERVICE_SID;
const client = require("twilio")(accountSid, authToken);
// const moment = require('moment');
require("dotenv").config();


const Handlebars = require('handlebars');
Handlebars.registerHelper('isEqual', function (value1, value2, options) {
  if (value1 === value2) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

module.exports = {
  adminReg: async (data) => {
    console.log(data);
    data.repassword = await bcrypt.hash(data.repassword, 10);

    await db.get().collection(collections.ADMIN_COLLECTION).insertOne(data);
  },

  adminLogin: (data) => {
    return new Promise(async (resolve, reject) => {
      console.log("8888888888");
      let loginstatus = false;
      let response = {};
      let admin = await db
        .get()
        .collection(collections.ADMIN_COLLECTION)
        .findOne({ email: data.email });

      console.log(admin);
      if (admin) {
        bcrypt.compare(data.repassword, admin.repassword).then((status) => {
          console.log(data.repassword);
          if (status) {
            console.log("login sucess");
            response.admin = admin;
            response.status = true;
            console.log(response);
            resolve({ response });
          } else {
            console.log("login failed");
            response.status = false;
            resolve({ response });
          }
        });
      } else {
        console.log("login failed");
        resolve({ status: false });
      }
    });
  },

  getallusers: () => {
    return new Promise(async (resolve, reject) => {
      let allusers = await db
        .get()
        .collection(collections.USER_COLLECTION)
        .find()
        .sort({ date: -1 })
        .toArray();
      resolve(allusers);
      console.log(allusers);
    });
  },
  blockUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(userId) },
          {
            $set: {
              isBlocked: true,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },

  unblockUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(userId) },
          {
            $set: {
              isBlocked: false,
            },
          }
        )
        .then((response) => {
          resolve();
        });
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
      resolve(allproducts);
      console.log(allproducts);
    });
  },

  addproduct: async (data) => {
    console.log(data, "wwwwwwwwwwwwwwwwwwwwwwwwwwww");
    data.price = parseInt(data.price);
    console.log(data, "eeeeeeeeeeeeeeeeeeeeeeeeeeeee");
    await db.get().collection(collections.PRODUCT_COLLECTION).insertOne(data);
  },

  getproductdetails: (proId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.PRODUCT_COLLECTION)
        .findOne({ _id })
        .then((product) => {
          console.log(product);
          resolve(product);
        });
    });
  },

  addcategory: async (data) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      try {
        console.log(data);
        exist = await db
          .get()
          .collection(collections.CATEGORY_COLLECTION)
          .findOne({ categoryname: data.categoryname });

        if (exist) {
          response.status = false;
          reject({ error: "This Name Already Exist", status: false });
        } else {
          response.success=true
          await db
            .get()
            .collection(collections.CATEGORY_COLLECTION)
            .insertOne(data);
          
            resolve({ data, success: true });
          
        }
      } catch (error) {
        reject({ error: "An error occurred", status: false });
      }
    });
  },

  getallcategory: () => {
    return new Promise(async (resolve, reject) => {
      let allcategory = await db
        .get()
        .collection(collections.CATEGORY_COLLECTION)
        .find()
        .sort({ date: -1 })
        .toArray();
      resolve(allcategory);
      console.log(allcategory);
    });
  },

  getallorders: () => {
    return new Promise(async (resolve, reject) => {
      let allorders = await db
        .get()
        .collection(collections.ORDER_COLLECTION)
        .find()
        .sort({ date: -1 })
        .toArray();
      resolve(allorders);
      console.log(allorders);
    });
  },
  getallorders: () => {
    return new Promise(async (resolve, reject) => {
      let allorders = await db
        .get()
        .collection(collections.ORDER_COLLECTION)
        .find()
        .sort({ date: -1 })
        .toArray();
      resolve(allorders);
      console.log(allorders);
    });
  },
  
  changeorderstatus: (data) => {
    let orderId = data.order;
    let value = data.valueChange;

    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.ORDER_COLLECTION)
        .updateOne({ _id: ObjectId(orderId) }, { $set: { status: value } })
        .then((response) => {
          resolve(response);
        });
    });
  },

  getTotalOrders: () => {
    return new Promise(async (resolve, reject) => {
      let totalCount = await db
        .get()
        .collection(collections.ORDER_COLLECTION)
        .find()
        .count();
      resolve(totalCount);
    });
  },

  getTotalUsers: () => {
    return new Promise(async (resolve, reject) => {
      let userCount = await db
        .get()
        .collection(collections.USER_COLLECTION)
        .find()
        .count();
      resolve(userCount);
    });
  },
  getTotalproductcount: () => {
    return new Promise(async (resolve, reject) => {
      let productCount = await db
        .get()
        .collection(collections.PRODUCT_COLLECTION)
        .find()
        .count();
      resolve(productCount);
    });
  },
  getDailySales: () => {
    return new Promise(async (resolve, reject) => {
      let salesData = await db
        .get()
        .collection(collections.ORDER_COLLECTION)
        .aggregate([
          {
            $project: {
              date: { $toDate: "$date" },
              totalAmount: 1,
            },
          },
          {
            $group: {
              _id: { day: { $dayOfYear: { $toDate: "$date" } } },
              total: { $sum: "$totalAmount" },
              count: { $sum: 1 },
            },
          },
          {
            $sort: { _id: -1 },
          },
          {
            $limit: 5,
          },
        ])
        .toArray();

      resolve(salesData[0]?.total || 0);
    });
  },

  getWeeklySales: () => {
    return new Promise(async (resolve, reject) => {
      let weeklySales = await db
        .get()
        .collection(collections.ORDER_COLLECTION)
        .aggregate([
          {
            $project: {
              date: { $toDate: "$date" },
              totalAmount: 1,
            },
          },
          {
            $group: {
              _id: { week: { $week: { $toDate: "$date" } } },
              total: { $sum: "$totalAmount" },
              count: { $sum: 1 },
            },
          },
          {
            $sort: { _id: -1 },
          },
          {
            $limit: 5,
          },
        ])
        .toArray();

      resolve(weeklySales[0]?.total || 0);
    });
  },

  getYearlySales: () => {
    return new Promise(async (resolve, reject) => {
      let yearlySales = await db
        .get()
        .collection(collections.ORDER_COLLECTION)
        .aggregate([
          {
            $project: {
              date: { $toDate: "$date" },
              totalAmount: 1,
            },
          },
          {
            $match: {
              date: {
                $gte: new Date(new Date().getFullYear(), 0, 1),
                $lte: new Date(new Date().getFullYear(), 11, 31),
              },
            },
          },
          {
            $group: {
              _id: { year: { $year: { $toDate: "$date" } } },
              total: { $sum: "$totalAmount" },
              count: { $sum: 1 },
            },
          },
          {
            $sort: { _id: -1 },
          },
          {
            $limit: 1,
          },
        ])
        .toArray();

      resolve(yearlySales[0]?.total || 0);
    });
  },
  singleorderdetails: (oneorderId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let orderDetail = await db.get().collection(collections.ORDER_COLLECTION).findOne({ _id: ObjectId(oneorderId) });
        resolve(orderDetail);
      } catch (error) {
        reject(error);
      }
    });
  }





};
