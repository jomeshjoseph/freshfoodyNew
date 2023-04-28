const userHepler=require('../helpers/user-helpers')
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceid=process.env.TWILIO_AUTH_Sid;
const client = require("twilio")(accountSid, authToken);
require('dotenv').config(); 

const { response, render } = require('../app');


module.exports={
    
    loginPage : (req,res)=>{
        if(req.session.loggedIn){
            res.redirect('/profile')
        }else{
            res.render('user/user_login',{"loginerr":req.session.loginerr})
            req.session.loginerr=false
        }
        
        
     
    },
    homePage : (req,res)=>{
        
        res.render('user/homepage')
       
    },
    submit :(req,res)=>{
        userHepler.userLogin(req.body).then((response)=>{
            // console.log(response,"")
if(response.response.status){
req.session.loggedIn=true
req.session.user=response.response.user
    res.redirect('/profile')
}else{
   req.session.loginerr="Invalid Username or Password"
    res.redirect('/login')
}
  })
       
 },
 signupsub : async(req,res)=>{
        console.log(req.body)
        
       await userHepler.userReg(req.body)
       res.render("user/user_login")
   
    },
    profile:(req,res)=>{
        if(req.session.loggedIn){
            let user=req.session.user
            console.log(user,">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
            res.render('user/user_profile',{user})
        }else{
            res.redirect('/login')
        }
       
    },
    logout:(req,res)=>{
        req.session.destroy()
        res.redirect('/')
    },
    contact:(req,res)=>{
        res.render('user/otplogin')
    },
    nocache : (req, res, next) => {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        next();
      },
      OTP_verify:((req , res) => {
        
        userHepler.otpConfirm(req.body , signupData).then((response) => {
            if(response.status){
                req.session.loggedIn = true
                req.session.user = signupData;

                
                res.redirect('/profile')
            }
            else{
                res.render('user/OTP_verify' , {error : 'incorrect otp'})
            }
        })
        
    }),

    mobilepage : ((req , res) => {
        res.render('user/mobile_page')
    }),


    mobilesent : ((req , res) => {
        // res.render('user/OTP_verify')
        userHepler.doOtp(req.body).then((response) => {
            console.log("qqqqqqqqqq");
            if(response.status){
                signupData = response.user
                res.render('user/OTP_verify')
            }
            else{
                console.log('>>>>>>>>>>');
                res.render('user/mobile_page' , { error: 'invalid mobile number' })
               
            }
        })
    }),

   
     
    
   
}
