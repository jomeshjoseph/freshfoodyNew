var db = require("../config/connection");
const collections = require("../config/collection");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceid = process.env.TWILIO_SERVICE_SID;
const client = require("twilio")(accountSid, authToken);

require("dotenv").config();

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
    console.log(data);

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
    console.log(data);
    exist = await db
      .get()
      .collection(collections.CATEGORY_COLLECTION)
      .findOne({ productname: data.productname });
    if (!exist) {
      await db
        .get()
        .collection(collections.CATEGORY_COLLECTION)
        .insertOne(data);
    }
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


};
