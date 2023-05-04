const userHepler=require('../helpers/user-helpers')
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceid=process.env.TWILIO_AUTH_Sid;
const client = require("twilio")(accountSid, authToken);
const Swal = require('sweetalert2')
require('dotenv').config(); 

const { response, render } = require('../app');
const collection = require('../config/collection');


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
        userHepler.getallproducts().then((allproducts)=>{
            console.log(allproducts,'home productsssss');
            res.render('user/homepage',{allproducts})
        })
       
       
    },
//     submit :(req,res)=>{
//         userHepler.userLogin(req.body).then((response)=>{
//             // console.log(response,"")
// if(response.response.status){
// req.session.loggedIn=true
// req.session.user=response.response.user
//     res.redirect('/profile')
// }else{
//    req.session.loginerr="Invalid Username or Password"
//     res.redirect('/login')
// }
//   })
       
//  },
submit :async(req,res)=>{
   await userHepler.userLogin(req.body).then((response)=>{
        console.log(response,"responseeee")

req.session.loggedIn=true
req.session.user=response.user
console.log(response.user,'res userrrrr');
res.redirect('/profile')

}).catch((error)=>{
    req.session.loginerr=true
    console.log('erorrrrrrrrrrrrr');
   
    res.render('user/user_login',{error:error.error})
  
 
})
   
},


 signupsub : async(req,res)=>{
        console.log(req.body,'bodyyyyyyyyyyyy')
        
       await userHepler.userReg(req.body).then((data)=>{
        req.session.loggedIn=true
        req.session.user=data
        res.redirect('/profile')
       }).catch((error)=>{
        req.session.loginerr=true
        console.log('erorrrrrrrrrrrrr');
        res.render('user/user_login',{error:error.error})
    })
       
//       await userHepler.userLogin(req.body).then((response)=>{
//         console.log(response,"resssssss")

// req.session.loggedIn=true
// req.session.user=response.response.user


// })
      
    //    res.redirect('/profile')
    
    }

,
    profile:(req,res)=>{
        if(req.session.loggedIn){
            let user=req.session.user
            console.log(user,">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            userHepler.getallproducts().then((allproducts)=>{
                console.log(allproducts,'prprprprprprrp');
                res.render('user/user_profile',{user,allproducts})
            })
           
        }else{
            res.redirect('/login')
        }
       
    },
    logout:(req,res)=>{
        req.session.destroy()
        res.redirect('/')
    },
    contact:(req,res)=>{
        res.render('user/contact')
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

    viewproducts:async(req,res)=>{
        console.log("pppppppppp");
        userHepler.getallproducts().then((allproducts)=>{
            // res.render('admin/admin-producttable', { layout: 'admin-layout',allproducts, admin: true })
            res.redirect('/profile')
    
        })
    },

    // viewdetail:async(req,res)=>{
    //     userHepler.getproductdetail().then((viewdetail)=>{
    //         res.ren('user/productdetails',{viewdetail})
    //     })
        
    // },

    singleproduct: async  (req, res)=> {
        console.log('qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
        let usere=req.session.users
        let product=await userHepler.getproductDetails(req.params.id)
            console.log("//////////////////////////////////////////////////////////////");
            res.render('user/productsingle', {user:true ,usere, product});
        
    }


   
     
    
   
}
