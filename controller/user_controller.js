const userHepler = require("../helpers/user-helpers");
const verifylogin = require("../middleware/user_session");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceid = process.env.TWILIO_AUTH_Sid;
const client = require("twilio")(accountSid, authToken);
const Swal = require("sweetalert");
const moment = require('moment');

const Razorpay = require("razorpay");
require("dotenv").config();

const { response, render } = require("../app");
const collection = require("../config/collection");
const product_helper = require("../helpers/product_helper");
const categoryHelper = require("../helpers/category-helper");

const usermiddle = require("../middleware/user_session");
module.exports = {
  loginPage: (req, res) => {
    if (req.session.loggedIn) {
      res.redirect("/profile");
    } else {
      res.render("user/user_login", { loginerr: req.session.loginerr });
      req.session.loginerr = false;
    }
  },
  registerPage:(req, res) => {
    if (req.session.loggedIn) {
      res.redirect("/profile");
    } else {
      res.render("user/user_register", { loginerr: req.session.loginerr });
      req.session.loginerr = false;
    }
  },


  homePage: (req, res) => {
    userHepler.getallproducts().then((allproducts) => {
      // console.log(allproducts,'home productsssss');
      res.render("user/homepage", { allproducts });
    });
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
  // submit: async (req, res) => {
  //   await userHepler
  //     .userLogin(req.body)
  //     .then((response) => {
  //       // console.log(response,"responseeee")

  //       req.session.loggedIn = true;
  //       req.session.user = response.user;
  //       // console.log(response.user,'res userrrrr');
  //       res.redirect("/profile");
  //     })
  //     .catch((error) => {
  //       req.session.loginerr = true;
  //       console.log(error,"erorrrrrrrrrrrrr");

  //       res.render("user/user_login", { error: error.message });
  //     });
  // },
  submit: async (req, res) => {
    await userHepler
      .userLogin(req.body)
      .then((response) => {
        req.session.loggedIn = true;
        req.session.user = response.user;
        res.json({ success: true, redirect: '/profile' });
      })
      .catch((error) => {
        req.session.loginerr = true;
        res.status(400).json({ success: false, error:error.error });
      });
  },
  
  signupsub: async (req, res) => {
    console.log(req.body, "bodyyyyyyyyyyyy");

    await userHepler
      .userReg(req.body)
      .then((response) => {
        req.session.loggedIn = true;
        req.session.user = response.user;
        res.json({success:true, redirect:'/profile'})
      
      })
      .catch((error) => {
        req.session.loginerr = true;
        res.status(400).json({success:false, error:error.error})
      });

    //       await userHepler.userLogin(req.body).then((response)=>{
    //         console.log(response,"resssssss")

    // req.session.loggedIn=true
    // req.session.user=response.response.user

    // })

    //    res.redirect('/profile')
  },

  profile: async (req, res) => {
    if (req.session.loggedIn) {
      let user = req.session.user;
      console.log(user, ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
      let cartcount = await userHepler.getcartcount(user._id);
      // userHepler.getallproducts().then((allproducts)=>{
      //     console.log(allproducts,'prprprprprprrp');
      //     res.render('user/user_profile',{user,allproducts,cartcount})
      // })

      let pageCount = req.query.id || 1;

      let pageNum = parseInt(pageCount);
      let limit = 4;
      console.log(pageNum);

      userHepler.viewTotalProduct(pageNum, limit).then(async (product) => {
        let pages = [];
        product_helper.getAllProducts().then((product) => {
          let totalProducts = product.length;
          let limit = 4;

          for (let i = 1; i <= Math.ceil(totalProducts / limit); i++) {
            pages.push(i);
          }
          console.log("prof2", pages);
          console.log(pages, "kkkkkkkkkk");
        });

        let catFilter = await categoryHelper.getallcategory();

        res.render("user/user_profile", {
          user,
          product,
          pages,
          cartcount,
          catFilter
        });
      });
    } else {
      res.redirect("/login");
    }
  },

  logout: (req, res) => {
    req.session.destroy();
    res.redirect("/");
  },
  contact: (req, res) => {
    res.render("user/contact");
  },
  nocache: (req, res, next) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.header("Expires", "-1");
    res.header("Pragma", "no-cache");
    next();
  },
  OTP_verify: (req, res) => {
    userHepler.otpConfirm(req.body, signupData).then((response) => {
      if (response.status) {
        req.session.loggedIn = true;
        req.session.user = signupData;

        res.redirect("/profile");
      } else {
        res.render("user/OTP_verify", { error: "incorrect otp" });
      }
    });
  },

  mobilepage: (req, res) => {
    res.render("user/mobile_page");
  },

  Reotp: (req, res) => {
    console.log(req.body, "tttttttto");
    userHepler.doReOtp(req.body);
  },

  mobilesent: (req, res) => {
    // res.render('user/OTP_verify')
    userHepler.doOtp(req.body).then((response) => {
      console.log("qqqqqqqqqq");
      if (response.status) {
        signupData = response.user;
        res.render("user/OTP_verify");
      } else {
        console.log(">>>>>>>>>>");
        res.render("user/mobile_page", { error: "invalid mobile number" });
      }
    });
  },

  viewproducts: async (req, res) => {
    console.log("pppppppppp");
    userHepler.getallproducts().then((allproducts) => {
      // res.render('admin/admin-producttable', { layout: 'admin-layout',allproducts, admin: true })
      res.redirect("/profile");
    });
  },

  // viewdetail:async(req,res)=>{
  //     userHepler.getproductdetail().then((viewdetail)=>{
  //         res.ren('user/productdetails',{viewdetail})
  //     })

  // },

  singleproduct: async (req, res) => {
    
    let usere = req.session.users;
    let productId = req.params.id; // Corrected line
    let product = await userHepler.getproductDetails(productId);
    console.log(product , "bbbbbbbbbbbbbbbbbbbbbbbbb");
    // res.send("dddddddddd")
    res.render('user/productsingle', { product,usere });
  },
     
  // userdetails:(req,res)=>{
  //     let user=await db.get().collection(collections.USER_COLLECTION).findOne({ email:data.email })
  //     let user=req.session.user
  //    res.render('user/userdetails',{user:true,user})
  // },

  userdetails: async (req, res) => {
    if (req.session.loggedIn) {
      // let user=req.session.user
let cartcount=await userHepler.getcartcount(req.params.id)
      let user = await userHepler.getuserdetails(req.params.id);
      console.log(user, "yyyyyyyyy");
      res.render("user/userdetails", { user,cartcount });
    }
  },
  edituserdetailspage:async (req, res) => {
    if (req.session.loggedIn) {
      let cartcount=await userHepler.getcartcount(req.params.id)

      let user = await userHepler.getuserdetails(req.params.id);;
      console.log(user, "edituserrrrrrr");

      res.render("user/edit-userdetails", { user,cartcount });
    }
  },
  updateuserdetails:async (req, res) => {
    let proId = req.params.id;
   
    let cartcount=await userHepler.getcartcount(req.params.id)

    
    let prodetails = req.body;
    console.log(proId);
   

    userHepler.userupdate(proId, prodetails).then(async () => {
      let user = await userHepler.getuserdetails(proId);
      // res.render('admin/admin-homepage', { layout: 'admin-layout', admin: true })
      res.render("user/userdetails", { user,cartcount });
    });
  },
  editpassword: async (req, res) => {
    if (req.session.loggedIn) {
      // let user=req.session.user

      let user = await userHepler.getuserdetails(req.params.id);
      console.log(user, "paswwww");
      res.render("user/password-change", { user });
    }
  },
  getcartpage: async (req, res) => {
    let products = await userHepler.getcartproducts(req.session.user._id);
    let cartcount = await userHepler.getcartcount(req.session.user._id);
    let grandtotal = await userHepler.getgrandtotal(req.session.user._id);

    // console.log(req.session);

    if (grandtotal) {
      res.render("user/cart", {
        products,
        user: req.session.user._id,
        cartcount,
        grandtotal,
      });
    } else {
      res.redirect("/profile");
    }
  },

  addtocart: (req, res) => {
    console.log(req.params.id, "idddddd");
    console.log(req.session.user._id);
    userHepler.addtocart(req.params.id, req.session.user._id).then(() => {
      //  res.json({status:true})
      res.redirect("/profile");
    });
  },
  removefromcart: (req, res) => {
    userId = req.session.user._id;
    proId = req.params.id;

    // userHepler.removefromcart(proId,userId).then((response))

    //
    //  console.log(,'bodyyyyyyyyyyy');
    userHepler.removefromcart(proId, userId).then(async (response) => {
      console.log(response, "removeeeeeeee");
      // res.json(response);
      res.redirect("/cart");
      
    });
  },
  getorderpage: async (req, res) => {
    let grandtotal = await userHepler.getgrandtotal(req.session.user._id);
    let cartcount = await userHepler.getcartcount(req.session.user._id);
    if (req.session.loggedIn) {
      let user = req.session.user;

      res.render("user/order1", { user, grandtotal,cartcount });
    }
  },

  changeproductquantity: (req, res, next) => {
    userHepler.changeproductquantity(req.body).then(async (response) => {
      response.pertotal;
      response.grandtotal = await userHepler.getgrandtotal(req.body.user);
      console.log(response, "yyyyyyyyyyyyyyyyyyyyyy");
      res.json(response);
    });
  },
  placeorder: async (req, res) => {
    let products = await userHepler.getcartproductlist(req.body.userId);
    let cartcount = await userHepler.getcartcount(req.session.user._id);
    let totalprice = await userHepler.getgrandtotal(req.body.userId);
    userHepler.placeorder(req.body, products, totalprice).then((orderId) => {
      console.log(orderId, "order id");
if(req.body["paymentmethod"] === "COD"){
  res.json({ CODsuccess:true });
}else{
  userHepler.generateraorzpay(orderId,totalprice).then((response)=>{
    res.json(response)
    
    // console.log(response);
  })
}
    
    });
    // console.log(req.body);
  },

  productPagination: async (req, res) => {
    let user = req.session.user;
    console.log(user, req.query, "jdklllllllllllllllllll");
    let catFilter = await categoryHelper.getallcategory();
    let pageCount = req.query.id || 1;
    console.log(pageCount, "mmmmmmmmmmmmmmmmmmmmmmmmmm");
    let pageNum = parseInt(pageCount);
    let limit = 4;
    console.log(pageNum);

    userHepler.viewTotalProduct(pageNum, limit).then((product) => {
      let pages = [];
      product_helper.getAllProducts().then((product) => {
        let totalProducts = product.length;
        let limit = 4;

        for (let i = 1; i <= Math.ceil(totalProducts / limit); i++) {
          pages.push(i);
        }
        console.log("profufffffffffffff1", pages);
        console.log(pages, "kkkkkkkkkkkkkkkkkkkkkkkkkkppppppppppppppppp");
      });

      res.render("user/homepage", { user, product, pages, catFilter });
    });
  },
  productPaginationforproduct: async (req, res) => {
    let user = req.session.user;
    // console.log(user, req.query, "jdklllllllllllllllllll");
    let catFilter = await categoryHelper.getallcategory();
    let pageCount = req.query.id || 1;
    // console.log(pageCount, "mmmmmmmmmmmmmmmmmmmmmmmmmm");
    let pageNum = parseInt(pageCount);
    let limit = 4;
    console.log(pageNum);
    // let catFilter = await categoryHelper.getallcategory();
    userHepler.viewTotalProduct(pageNum, limit).then((product) => {
      let pages = [];
      product_helper.getAllProducts().then((product) => {
        let totalProducts = product.length;
        let limit = 4;

        for (let i = 1; i <= Math.ceil(totalProducts / limit); i++) {
          pages.push(i);
        }
        // console.log("profufffffffffffff1", pages);
        // console.log(pages, "kkkkkkkkkkkkkkkkkkkkkkkkkkppppppppppppppppp");
      });
      console.log(user,pages,'checkkkkkk');
      res.render("user/productpage", { user, product, pages, catFilter });
    });
  },

  categoryFilter: async (req, res) => {
    let buttonclicked;
    let user = req.session.user;
    let category = req.body.category;
    let product = await product_helper.getFilterProduct(category);
    let catFilter = await categoryHelper.getallcategory();
    if (product[0].categoryname === catFilter[0].categoryname) {
      buttonclicked = true;
    } else {
      buttonclicked = false;
    }
    console.log(buttonclicked);
    res.render("user/user_profile", {
      user,
      product,
      catFilter,
      buttonclicked,
    });
  },

  orderlist: async (req, res) => {
    let userId = req.session.user._id;
    console.log(userId);
    let orders = await userHepler.getuserorders(userId);
// let user=await userHepler.getuserdetails(userId)
// let shipto=user.firstname
// console.log(shipto,'userrrrrrrrrr');
    let cartcount = await userHepler.getcartcount(userId);
  // let formatdate = moment(deliverdate).format("MMMM Do YYYY")
  // console.log(formatdate,'dateeeeeeeee');
  // let formatdate=moment(deliverdate).format('LLL')


    // console.log(orders,'dateeeeeeeeee' );
    res.render("user/orderlist", { user: userId, orders,cartcount});

  },

  paymentverify:(req,res)=>{
    console.log(req.body);
  },
//   getorderproduct:async(req, res)=> {
//     const oneProductId = req.params.id
//     let userId = req.session.user._id;
//     let orders = await userHepler.getuserorders(userId);
//     console.log(orders);
//     console.log(oneProductId,"oooooooooo");
//     product_helper.getOrderProduct(oneProductId).then((oneOrderProduct) => {
//         res.render('user/orderdetail', { user: userId, oneOrderProduct ,orders})
//     })
// }
getorderproduct:async(req, res)=> {
  const oneProductId = req.params.id
  console.log(oneProductId,"oooooooooo");
  product_helper.getOrderProduct(oneProductId).then((oneOrderProduct) => {
      res.render('user/orderdetail', {user: true,oneOrderProduct})
  })
},

};
