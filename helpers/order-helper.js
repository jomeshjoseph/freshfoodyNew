var db = require("../config/connection");
const collections = require("../config/collection");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const { response } = require("../app");
const moment = require("moment");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceid = process.env.TWILIO_SERVICE_SID;
const client = require("twilio")(accountSid, authToken);

require("dotenv").config();

module.exports = {
  returnReason: (reason, ordId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.ORDER_COLLECTION)
        .updateOne(
          { _id: ObjectId(ordId) },
          { $set: { returnReason: reason } }
        );
      resolve();
    });
  },

  getStatusDetails: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let status = await db
        .get()
        .collection(collections.ORDER_COLLECTION)
        .findOne({ _id: ObjectId(orderId) });
      resolve(status);
    });
  },

  getOneOrder: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let orderDetails = await db
        .get()
        .collection(collections.ORDER_COLLECTION)
        .findOne({ _id: ObjectId(orderId) });
      resolve(orderDetails);
    });
  },
  reasonUpdate: (reason, ordId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.ORDER_COLLECTION)
        .updateOne({ _id: ObjectId(ordId) }, { $set: { reason: reason } });
      resolve();
    });
  },

  getUserOrders: (userId) => {
    try {
      return new Promise(async (resolve, reject) => {
        let ordrecount = await db
          .get()
          .collection(collections.ORDER_COLLECTION)
          .countDocuments({ userId: ObjectId(userId) });
        resolve(ordrecount);
      });
    } catch (error) {
      reject(error);
    }
  },
};
