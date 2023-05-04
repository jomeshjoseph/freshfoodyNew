const admin_controller= require('../controller/user_controller')
const adminHeplers=require('../helpers/user-helpers');
const { response } = require('../app');
const multer = require('multer');
const path = require('path')

var express = require('express');

var router = express.Router();
var MongoClient = require('mongodb').MongoClient

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/pro-images')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '- ' + Date.now() + path.extname(file.originalname))
    }
  })
  
  var uploadPro = multer({
    storage: storage
  })

const {adminlogin,adminreg,admininfo,adminhomepage,adminallusers,adminBlockUser, 
    adminUnBlockUser,adminallproducts,adminaddproductpage,adminaddproduct,logout,admineditproduct,adminupdateproduct} = require('../controller/admin_controller');


router.get('/',adminlogin)
router.get('/adminsignup',adminreg)
router.post('/adminsignup',admininfo)
router.post('/dashboard',adminhomepage)
router.get('/allusers',adminallusers)
router.get('/blockUser',adminBlockUser)
 router.get('/unBlockUser',adminUnBlockUser)
 router.get('/allproducts',adminallproducts)
 router.get('/addproductpage',adminaddproductpage)
 router.post('/addproduct',uploadPro.array('image') ,adminaddproduct)
 router.get('/logout',logout)
 router.get('/editproduct/:id',admineditproduct)
router.post('/editpro/:id',uploadPro.array('image'),adminupdateproduct)


module.exports = router;
