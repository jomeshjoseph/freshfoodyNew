const userHepler = require("../helpers/user-helpers");
const verifylogin = require("../middleware/user_session");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceid = process.env.TWILIO_AUTH_Sid;
const client = require("twilio")(accountSid, authToken);
const Swal = require("sweetalert");
const moment = require('moment');
var slug = require('slug')


const Razorpay = require("razorpay");
require("dotenv").config();

const { response, render } = require("../app");
const collection = require("../config/collection");
const product_helper = require("../helpers/product_helper");
const categoryHelper = require("../helpers/category-helper");
const orderHelper = require("../helpers/order-helper");

const usermiddle = require("../middleware/user_session");
const userHelpers = require("../helpers/user-helpers");
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
        console.log(response,'check userrrrrrr');
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
      console.log(response,'mobile otppppppppp');
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
      let userId=req.params.id
      console.log(userId);
let cartcount=await userHepler.getcartcount(userId)
      let user = await userHepler.getuserdetails(userId);
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
    let coupens = await userHepler.getcurrentcoupen()
    req.session.amount=grandtotal
console.log(coupens,'coupensssss');
    // console.log(req.session);

    if (grandtotal) {
      res.render("user/cart", {
        products,
        user: req.session.user._id,
        cartcount,
        grandtotal,
        coupens
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
    // let grandtotal = await userHepler.getgrandtotal(req.session.user._id);
    let grandtotal = req.session.amount
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
    try {
        let products = await userHepler.getcartproductlist(req.body.userId);
        let cartcount = await userHepler.getcartcount(req.session.user._id);
        let totalprice =req.session.amount

        userHepler.placeorder(req.body, products, totalprice).then((orderId) => {
            console.log(orderId, "order id");

            if (req.body["paymentmethod"] === "COD") {
                res.json({ CODsuccess: true,orderId });
            } else {
                userHepler.generateraorzpay(orderId, totalprice).then((response) => {
                    res.json(response);
                }).catch((error) => {
                    console.log(error);
                    const errorMessage = 'Error generating payment';
                    res.status(500).json({ error: errorMessage });
                });
            }
        });
    } catch (error) {
        console.log(error);
        const errorMessage = 'Error placing order';
        res.status(500).json({ error: errorMessage });
    }
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
    userHepler.verifypayment(req.body).then(()=>{
      userHepler.changepaymentstatus(req.body['order[receipt]']).then(()=>{
        console.log("payment syccessfuul");
        res.json({status:true})
      })
    }).catch((err)=>{
      console.log(err);
      res.json({status:false,errMsg:'Payment Failed'})
    })
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

 let allorders = await userHepler.singleorderdetails(oneProductId)
 console.log(allorders,'orderrrrrrrrrrrrrrrrr');
  product_helper.getOrderProduct(oneProductId).then((orderProduct)=>{
    res.render('user/orderdetail', {user: true,orderProduct,allorders});
  }).catch((error) => {
    // Handle any errors that occur during the process
    console.error('Error retrieving order details:', error);
    // Render an error page or send an error response
    res.status(500).send('Internal Server Error');
  })

},
getordersummary:async(req, res)=> {
  const oneProductId = req.params.id
  user=req.session.user
  console.log(oneProductId,"oooooooooo");

 let allorders = await userHepler.singleorderdetails(oneProductId)
 console.log(allorders,'orderrrrrrrrrrrrrrrrr');
  product_helper.getOrderProduct(oneProductId).then((orderProduct)=>{
    res.render('user/ordersummary', {user: true,user,orderProduct,allorders});
  }).catch((error) => {
    // Handle any errors that occur during the process
    console.error('Error retrieving order details:', error);
    // Render an error page or send an error response
    res.status(500).send('Internal Server Error');
  })

},

coupenVerify: (async (req, res) => {
  let user = req.session.user._id
  console.log(user,'userrrrcheckkkk');
  const date = new Date()
  let totalAmount = await userHepler.getgrandtotal(user)
  console.log(totalAmount, 'totalAmounttttttttttt');
  let total = totalAmount

  if (req.body.coupen == '') {
      res.json({
          noCoupen: true,
          total
      })
  }

  else {
      let coupenResponse = await userHepler.applyCoupen(req.body, user, date, totalAmount)
      console.log(coupenResponse, 'coupenResponseeeeeeeeeeeeeeee');
      if (coupenResponse.verify) {
          coupenResponse.originalPrice = totalAmount
          let discountAmount = (parseInt(totalAmount) * parseInt(coupenResponse.coupenData.value)) / 100
          console.log(discountAmount, "discountAmounttttttttttt");

          if (discountAmount > parseInt(coupenResponse.coupenData.maxAmount)) {
              discountAmount = parseInt(coupenResponse.coupenData.maxAmount)
          }
          let amount = totalAmount - discountAmount
          coupenResponse.discountAmount = Math.round(discountAmount)
          coupenResponse.amount = Math.round(amount)
          req.session.amount = Math.round(amount)
          coupenResponse.savedAmount = totalAmount - Math.round(amount)
          console.log(">>>>>>>>><<<<<<<<<<<<", coupenResponse, 'coupenResponse2222222222');
          res.json(coupenResponse)
      }
      else {
          coupenResponse.total = totalAmount
          res.json(coupenResponse)
      }
  }
}),
returnOrder: (async (req, res) => {
  let ordId = req.params.id
  let orderReturm =userHepler.returnOrder(ordId)
  let returnReason = await orderHelper.returnReason(req.body.returnReason, ordId)
  let oneOrder = await orderHelper.getStatusDetails(ordId)
  let orderProducts = await userHepler.getProductDetails(ordId)
  let status = oneOrder.status

  if (status === 'product returned') {
      for (let i = 0; i < orderProducts.length; i++) {
          await product_helper.cancelStockUpdate(orderProducts[i].item, orderProducts[i].quantity)
      }
      let oneOrderDetails = await orderHelper.getOneOrder(ordId)
      let totalAmount = oneOrderDetails.total
           
  }
  res.json({ status: true })
}),
placedOrderCancel: (async (req, res) => {
  let ordId = req.params.id
  console.log(ordId,'ordIddddddddddddd');
  console.log(req.body,'bodyyyyyyyyyyyyyyy reaaaaaaaaa');
  let reason = await orderHelper.reasonUpdate(req.body.reason, ordId)
 
  let ordCancel = await userHepler.orderCancel(ordId)
  console.log(ordCancel,'ordCancel');
  let singleOrder = await orderHelper.getStatusDetails(ordId)
  console.log("111111111111111111111",singleOrder,'singleOrder');
  let orderProduct = await userHepler.getProductDetails(ordId)
  let status = singleOrder.status
  

  if (status === 'order cancelled') {
      for (let i = 0; i < orderProduct.length; i++) {
          await product_helper.cancelStockUpdate(orderProduct[i].item, orderProduct[i].quantity)
      }
      let orderDetails = await orderHelper.getOneOrder(ordId)
      console.log(orderDetails,'orderDetailsssssssssssssss');
      let totalAmount = orderDetails.totalAmount
     
      
  }
  res.json({ status: true })
}),


};
