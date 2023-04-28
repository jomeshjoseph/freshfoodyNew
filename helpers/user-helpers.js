var db=require('../config/connection')
const collections = require('../config/collection')
const bcrypt=require('bcrypt')

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceid= process.env.TWILIO_SERVICE_SID;
const client = require("twilio")(accountSid, authToken);

require('dotenv').config(); 

module.exports={
  
  userReg :async (data)=>{
   
   
    // console.log(data);
data.repassword=await bcrypt.hash(data.repassword,10)

await db.get().collection(collections.USER_COLLECTION).insertOne(data)
  

  },

  userLogin: (data)=>{
    return new Promise (async(resolve,reject)=>{
      let loginstatus=false
      let response={}
      let user=await db.get().collection(collections.USER_COLLECTION).findOne({ email:data.email })
   
      console.log(user);
      if(user){
        
        bcrypt.compare(data.repassword,user.repassword).then((status)=>{
        //  console.log(data.repassword);
          if(status){
            console.log('login sucess');
            response.user=user
            response.status=true
            console.log(response);
            resolve({response})
          }else{
            console.log('login failed');
            response.status=false
            resolve({response})
          }
        })
      }else{
        console.log('login failed');
        resolve({status:false})
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

      client.verify.services(serviceid)
      .verificationChecks
      .create({
          to: `+91${userData.phone}`,
          code: confirmotp.otp
      }).then((data) => {
          if(data.status == 'approved'){
              resolve({status : true})
          }
          else{
              resolve({status : false})
          }
      })
  })
}

}