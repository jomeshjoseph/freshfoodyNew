var express = require("express");
var router = express.Router();
var MongoClient = require("mongodb").MongoClient;

const user_controller = require("../controller/user_controller");
const userHeplers = require("../helpers/user-helpers");

const { response } = require("../app");

const verifylogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    req.redirect("/login");
  }
};

router.get("/", user_controller.productPagination);

router.get("/login", user_controller.loginPage);
router.post("/login", user_controller.submit);
router.get("/profile", user_controller.nocache, user_controller.profile);
router.get("/logout", user_controller.logout);
router.post("/signup", user_controller.signupsub);
router.get("/contact", user_controller.contact);
router.get("/mobile_page", user_controller.mobilepage);
router.post("/mobile_sent", user_controller.mobilesent);
router.post("/resent", user_controller.Reotp);
router.post("/OTP_verify", user_controller.OTP_verify);
router.get("/viewproduct", user_controller.viewproducts);
router.get("/productdetails/:id", user_controller.singleproduct);
router.get("/userdetails/:id", user_controller.userdetails);
router.get("/edituserdetails", user_controller.edituserdetailspage);
router.post("/updateuserdetails/:id", user_controller.updateuserdetails);
router.get("/passwardchange", user_controller.editpassword);
router.get("/add-to-cart/:id", verifylogin, user_controller.addtocart);
router.get("/cart", verifylogin, user_controller.getcartpage);
router.get("/orderpage", verifylogin, user_controller.getorderpage);
router.post("/change-product-quantity", user_controller.changeproductquantity);
router.post("/place-order", user_controller.placeorder);
router.get("/productPagination", user_controller.productPagination);
router.post("/filter", user_controller.categoryFilter);
router.get("/orderlist", user_controller.orderlist);

module.exports = router;
