  var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient

const user_controller= require('../controller/user_controller')
const userHeplers=require('../helpers/user-helpers');
const { response } = require('../app');

router.get('/',user_controller.homePage)
    
router.get('/login',user_controller.loginPage)
router.post('/login',user_controller.submit)
router.get('/profile',user_controller.nocache,user_controller.profile)
router.get('/logout',user_controller.logout)
router.post('/signup',user_controller.signupsub)
router.get('/contact',user_controller.contact)
router.get('/mobile_page',user_controller.mobilepage)
router.post('/mobile_sent' ,user_controller.mobilesent)
router.post('/OTP_verify',user_controller.OTP_verify)
router.get('/viewproduct',user_controller.viewproducts)
router.get('/productdetails/:id',user_controller. singleproduct)



module.exports = router;
