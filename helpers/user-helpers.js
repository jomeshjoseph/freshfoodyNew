var db=require('../config/connection')
const collections = require('../config/collection')
const bcrypt=require('bcrypt');
const { ObjectId } = require('mongodb');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceid= process.env.TWILIO_SERVICE_SID;
const client = require("twilio")(accountSid, authToken);

require('dotenv').config(); 

module.exports={
  
  userReg :(data)=>{
    console.log(data,"LLLL");
   return new Promise(async(resolve,reject)=>{

    data.repassword=await bcrypt.hash(data.repassword,10)

     db.get().collection(collections.USER_COLLECTION).insertOne(data)
      console.log(data,"LLLLpppp");
    resolve(data)

   })
  




  },

  userLogin: (data)=>{
    return new Promise (async(resolve,reject)=>{
      let loginstatus=false
      let response={}
      let user=await db.get().collection(collections.USER_COLLECTION).findOne({ email:data.email })
   
      console.log(user);
      if(user){
        
        if(user.isBlocked){
          reject({error:"user is blocked"})
        }else{
          bcrypt.compare(data.repassword,user.repassword).then((status)=>{
             console.log(data.repassword);
             console.log(user.repassword);
             console.log(status,'statusssssssss');
              if(status){
                console.log('login sucess');
                response.user=user
                response.status=true
                console.log(response);
                resolve(response)
              }else{
                console.log('login failed');
                response.status=false
                reject(response)
              }
            })
          }
        }
        else{
        console.log('login failed');
        reject({status:false})
      }
    })
  },

  doOtp : (Data) => {
    
    console.log(Data , 'aaaaaaaaaaa');
    return new Promise(async(resolve , reject) => {
    let response = {}
    
        let user =await db.get().collection(collections.USER_COLLECTION).findOne({phone: Data.phone})
console.log(user.phone,'lllllllll');
        if(user){
            response.status = true
            response.user = user

            client.verify.services(serviceid)
            .verifications
            .create({ to: `+91${Data.phone}`, channel: 'sms' })
            .then((data) => {

            })
            resolve(response)
        }
        else{
            response.status = false
            resolve(response)
            console.log(response);
        }
    })
},

otpConfirm : (confirmotp , userData) => {
  return new Promise((resolve , reject) => {

    let otp = confirmotp.digit1 +confirmotp .digit2 + confirmotp.digit3 + confirmotp.digit4;
console.log(otp);

      client.verify.services(serviceid)
      .verificationChecks
      .create({
          to: `+91${userData.phone}`,
          code: otp
      }).then((data) => {
          if(data.status == 'approved'){
              resolve({status : true})
          }
          else{
              resolve({status : false})
          }
      })
  })
},
doReOtp : (Data) => {
    
  console.log(Data , 'aaaaaaaaaaa');
  return new Promise(async(resolve , reject) => {
  let response = {}
  
      let user =await db.get().collection(collections.USER_COLLECTION).findOne({phone: Data.phone})
console.log(user.phone,'lllllllll');
      if(user){
          response.status = true
          response.user = user

          client.verify.services(serviceid)
          .verifications
          .create({ to: `+91${Data.phone}`, channel: 'sms' })
          .then((data) => {

          })
          resolve(response)
      }
      else{
          response.status = false
          resolve(response)
          console.log(response);
      }
  })
}


,

getallproducts:()=>{
  return new Promise (async(resolve,reject)=>{
    let allproducts=await db.get().collection(collections.PRODUCT_COLLECTION).find().sort({date:-1}).toArray()
    resolve(allproducts,"seeeeeee")
    console.log(allproducts)
  
  })
},

// getproductdetail:(data)=>{
//   return new Promise(async(resolve,reject)=>{
//     let viewdetail=await db.get().collection(collections.PRODUCT_COLLECTION).findOne({productname : data.productname})
//     resolve(viewdetail)
//   } )
// },

getproductDetails: (proId)=>{
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',proId);
  return new Promise((resolve,reject)=>{
      db.get().collection(collections.PRODUCT_COLLECTION).findOne({_id:ObjectId(proId)}).then((product)=>{
         console.log(product);
      resolve(product)
  })
})

}








}