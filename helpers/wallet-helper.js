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
  GET_ORDER_WALLET: (userId, paymentmethod) => {
    return new Promise(async (resolve, reject) => {
      let orderDetails = await db
        .get()
        .collection(collections.ORDER_COLLECTION)
        .find({ userId: userId, paymentmethod: paymentmethod })
        .toArray();
      resolve(orderDetails);
      // .catch((error) => {
      //   console.log(error);
      //   reject(error);
      // });
    });
  },
  GET_WALLET: (userId) => {
    return new Promise(async (resolve, reject) => {
      const walletDetails = await db
        .get()
        .collection(collections.ORDER_COLLECTION)
        .findOne({
          userId: userId,
        });

      resolve(walletDetails);
    });
  },

  WALLET_BALANCE: (userId) => {
    return new Promise(async (resolve, reject) => {
      const balance = await db
        .get()
        .collection(collections.WALLET_COLLECTION)
        .findOne({ userId: userId });
      resolve(balance);
    });
  },
  CREATE_WALLET: (userId) => {
    return new Promise((resolve, reject) => {
      const walletDetails = db
        .get()
        .collection(collections.WALLET_COLLECTION)
        .insertOne({
          userId: userId,
          balance: 0.0,
        });
      resolve();
    });
  },
  UPDATE_WALLET: (userId, amount) => {
    console.log(userId, "emailllllllllll");
    console.log(amount, "amountttttttttttt amount");
    return new Promise(async (resolve, reject) => {
      if (isNaN(amount)) {
        reject(new Error("Invalid amount. Amount must be a number."));
        return;
      }

      let status = await db
        .get()
        .collection(collections.WALLET_COLLECTION)
        .updateOne(
          {
            userId: userId,
          },
          {
            $inc: {
              balance: amount,
            },
          }
        );
      resolve(status);
    });
  },
};
