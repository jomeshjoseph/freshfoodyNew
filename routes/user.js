var express = require("express");
var router = express.Router();
var MongoClient = require("mongodb").MongoClient;
const Razorpay = require('razorpay');
const user_controller = require("../controller/user_controller");
const userHeplers = require("../helpers/user-helpers");
const usermiddle=require("../middleware/user_session")
// var moment = require('moment'); // require
var slug = require('slug')


const verifylogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    req.redirect("/login");
  }
};

router.get("/", user_controller.productPagination);
router.get('/products',user_controller.productPaginationforproduct)

router.get("/login",user_controller.loginPage);
router.get("/register" ,user_controller.registerPage);
router.post("/loginsubmit", user_controller.submit);
router.get("/profile",usermiddle.sessionCheck,user_controller.profile);
router.get("/logout",usermiddle.sessionCheck, user_controller.logout);
router.post("/signup", user_controller.signupsub);
router.get("/contact",usermiddle.sessionCheck, user_controller.contact);
router.get("/mobile_page", user_controller.mobilepage);
router.post("/mobile_sent", user_controller.mobilesent);
router.post("/resent",usermiddle.sessionCheck, user_controller.Reotp);
router.post("/OTP_verify", user_controller.OTP_verify);
router.get("/viewproduct",usermiddle.sessionCheck, user_controller.viewproducts);
router.get("/productdetails/:id",usermiddle.sessionCheck, user_controller.singleproduct);
router.get("/userdetails/:id",usermiddle.sessionCheck, user_controller.userdetails);
router.get("/edituserdetails/:id",usermiddle.sessionCheck, user_controller.edituserdetailspage);
router.post("/updateuserdetails/:id", user_controller.updateuserdetails);
router.get("/passwardchange",usermiddle.sessionCheck, user_controller.editpassword);
router.get("/add-to-cart/:id",usermiddle.sessionCheck, verifylogin, user_controller.addtocart);
router.get("/cart", verifylogin, user_controller.getcartpage);
router.get('/removeitem/:id',user_controller.removefromcart)
router.get("/orderpage",usermiddle.sessionCheck, user_controller.getorderpage);
router.post("/change-product-quantity",usermiddle.sessionCheck, user_controller.changeproductquantity);
router.post("/place-order", user_controller.placeorder);
router.get("/productPagination", user_controller.productPagination);
router.post("/filter", user_controller.categoryFilter);
router.get("/orderlist", user_controller.orderlist);
router.post("/verify-payment",user_controller.paymentverify)
router.get('/orderdetailpage/:id',user_controller.getorderproduct)
router.post('/coupen-verify' ,user_controller.coupenVerify)
router.post('/returnorder/:id',usermiddle.sessionCheck ,user_controller.returnOrder)
router.post('/placedordercancel/:id' ,user_controller.placedOrderCancel)
router.get('/ordersummary/:id',user_controller.getordersummary)
router.get('/wallet',user_controller.wallet)
module.exports = router;
