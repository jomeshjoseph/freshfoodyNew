const userHepler=require('../helpers/user-helpers')
const verifylogin=require('../middleware/user_session')
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceid=process.env.TWILIO_AUTH_Sid;
const client = require("twilio")(accountSid, authToken);
const Swal = require('sweetalert')
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
    profile:async(req,res)=>{
        if(req.session.loggedIn){
            let user=req.session.user
            console.log(user,">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
let cartcount=await userHepler.getcartcount(user._id)
            userHepler.getallproducts().then((allproducts)=>{
                console.log(allproducts,'prprprprprprrp');
                res.render('user/user_profile',{user,allproducts,cartcount})
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

    Reotp : ((req , res) => {
        console.log(req.body,'tttttttto');
        userHepler.doReOtp(req.body)
    })
    
    ,


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
        
    },

    // userdetails:(req,res)=>{
    //     let user=await db.get().collection(collections.USER_COLLECTION).findOne({ email:data.email })
    //     let user=req.session.user
    //    res.render('user/userdetails',{user:true,user})
    // },

    userdetails:async(req,res)=>{
        if(req.session.loggedIn){
            // let user=req.session.user
            

           
            let user = await userHepler.getuserdetails(req.params.id)
            console.log(user,"yyyyyyyyy");
                res.render('user/userdetails',{user})
        
       
    }


},
edituserdetailspage:(req,res)=>{
    if(req.session.loggedIn){
        let user=req.session.user
        console.log(user,"edituserrrrrrr");

       
           
            res.render('user/edit-userdetails',{user})
    
   
}

},
updateuserdetails: (req, res) => {
 
    console.log('userrrrrrrrupdateee');
    let user=req.session.user
    
    let proId = req.params.id
    let prodetails = req.body
    console.log(proId);
    console.log(prodetails,'detailsssssssssss');

    userHepler.userupdate(proId, prodetails).then(() => {
        // res.render('admin/admin-homepage', { layout: 'admin-layout', admin: true })
        res.render('user/userdetails',{user})

    })
},
editpassword:async(req,res)=>{
    if(req.session.loggedIn){
        // let user=req.session.user
        

       
        let user = await userHepler.getuserdetails(req.params.id)
        console.log(user,"paswwww");
            res.render('user/password-change',{user})
    
   
}

},
getcartpage:async(req,res)=>{

    let products= await userHepler.getcartproducts(req.session.user._id )
    let cartcount=await userHepler.getcartcount(req.session.user._id)
   
    console.log(req.session.user._id);
    console.log(products,'carttttttttttttproddddd');
   

    res.render('user/cart',{products, user:req.session.user,cartcount})
},

addtocart:(req,res)=>{
    console.log(req.params.id,'idddddd');
    console.log(req.session.user._id);
    userHepler.addtocart(req.params.id,req.session.user._id).then(()=>{
       res.json({status:true})
        res.redirect('/profile')
    })
},

getorderpage:async(req,res)=>{

    let eachproducttotal=await userHepler.geteachproducttotal(req.session.user._id)
    if(req.session.loggedIn){
        let user=req.session.user

        res.render('user/order',{user,eachproducttotal})
    }
   
},

changeproductquantity:(req,res,next)=>{
userHepler.changeproductquantity(req.body).then((response)=>{
    res.json(response)

})

}
     
    
   
}
