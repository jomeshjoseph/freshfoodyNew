const { response } = require('../app');
const adminHepler = require('../helpers/admin-hepler');
const categoryHelper = require('../helpers/category-helper');
const product_helper = require('../helpers/product_helper');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceid = process.env.TWILIO_AUTH_Sid;
const client = require("twilio")(accountSid, authToken);
const Swal = require('sweetalert');
const moment = require('moment');
const { error } = require('jquery');

module.exports = {
    adminlogin: (req, res) => {
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.");
        res.render('admin/admin-login', { layout: 'admin-layout' })
    },
    adminreg: (req, res) => {
        console.log(('jjjjjjjjjjjjjjjjjj'));
        res.render('admin/admin-signup', { layout: 'admin-layout' })
    },
    admininfo: async (req, res) => {
        console.log(req.body)

        await adminHepler.adminReg(req.body)
        res.render("admin/admin-login", { layout: 'admin-layout' })

    },
    adminhomepage: async (req, res) => {
        admin=req.session.admin
        let totalOrders = await adminHepler.getTotalOrders()
        let totalUsers = await adminHepler.getTotalUsers()
        let totalproduct=await adminHepler.getTotalproductcount()


        let yearly = await adminHepler.getYearlySalesGraph()
        let daily = await adminHepler.getDailySalesGraph()
        let weekly = await adminHepler.getWeeklySalesGraph()

        let dailySales = await adminHepler.getDailySales()
        let weeklySales = await adminHepler.getWeeklySales()
        let yearlySales = await adminHepler.getYearlySales()

        let data = await adminHepler.getAllData()
        console.log(data,'dataaaaaaaaa');
        let orderData = await adminHepler.getAllOrderData()

        console.log(totalOrders,'ordereeeeeeeeee');
        adminHepler.adminLogin(req.body).then((response) => {
            console.log(response, "rrrrrrrr")
            if (response) {
                console.log('5555555555');
                req.session.loggedIn = true
                req.session.admin = response.admin
                res.render('admin/admin-charts', { layout: 'admin-layout', admin: true ,totalOrders,totalUsers,totalproduct,dailySales,weeklySales,yearlySales,yearly,weekly,daily,data,orderData})
            } else {
                req.session.loginerr = "Invalid Username or Password"
                res.redirect('/admin')
            }
        })
    },
    adminhome:(req,res)=>{
        adminHepler.getallorderstoday().then((allorder)=>{
        res.render('admin/admin-charts',{layout:'admin-layout',admin:true,allorder})
    })
}
    ,

    adminallusers: async (req, res) => {
        console.log("llllllllllllllllllllllllllllllllll");
        adminHepler.getallusers().then((allusers) => {
            res.render('admin/admin-usertable', { layout: 'admin-layout', allusers, admin: true })

        })
    },

    adminBlockUser: (req, res) => {
        let blockUserId = req.params.id
      
        adminHepler.blockUser(blockUserId)
        res.redirect('/admin/allusers')


    },

    adminUnBlockUser: (req, res) => {
        let unblockUserId = req.params.id
        adminHepler.unblockUser(unblockUserId)
        res.redirect('/admin/allusers')
    },
    adminallproducts: async (req, res) => {
        adminHepler.getallproducts().then((allproducts) => {
            res.render('admin/admin-producttable', { layout: 'admin-layout', allproducts, admin: true })

        })
    },

    adminaddproductpage: (req, res) => {

        categoryHelper.getallcategory().then((getcategory)=>{
            res.render('admin/admin-addproduct', { layout: 'admin-layout', admin: true,getcategory })
        })
        
    },

    adminaddproduct: async (req, res) => {

        let image = []
        req.files.forEach(function (value, index) {
            image.push(value.filename)
        })
        req.body.image = image
        await adminHepler.addproduct(req.body)
        res.redirect('/admin/allproducts')

    },
    logout: (req, res) => {
        req.session.destroy()
        res.redirect('/admin')
    },
    admineditproduct: async (req, res) => {

        console.log('qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
        let usere = req.session.admin
        let product = await product_helper.getproductdetails(req.params.id)
      let category=await categoryHelper.getallcategory(req.params.id)
        console.log(product.image,"//////////////////////////////////////////////////////////////");
        console.log('cccccccc');
        res.render('admin/admin-editproduct', { layout: 'admin-layout', admin: true, product,usere,category })
    },

    adminupdateproduct: (req, res) => {
 
        console.log('mmmmmmmmmmmmmmmmmmmm');


        let image = []
        req.files.forEach(function (value, index) {
            image.push(value.filename)
            console.log(value.filename, 'valueeeeeeeeeee');

        })
        req.body.image = image
        console.log(image,"www>>>>>>>>>><<<<<<<<<<<<<<<<<");

        let proId = req.params.id
        let prodetails = req.body
        console.log(proId);
        console.log(prodetails,'detailsssssssssss');

        product_helper.productupdate(proId, prodetails).then(() => {
            // res.render('admin/admin-homepage', { layout: 'admin-layout', admin: true })
            res.redirect('/admin/allproducts')

        })
    },
    admindeleteproduct: async (req, res) => {
        let proId = req.params.id;

     
            product_helper.productdelete(proId).then((response)=>{
      
                res.redirect('/admin/allproducts')
          })
},

adminaddcategorypage:(req,res)=>{
    console.log('catorrrrrrr');
    res.render('admin/admin-category',{ layout: 'admin-layout', admin: true })
},
adminaddcatogory:async(req,res)=>{
console.log('addddcatg');
await adminHepler.addcategory(req.body).then((response)=>{
    response.success=true
    res.json({success:true,redirect:'/admin/allcategory'})
})
.catch((error)=>{
    res.status(400).json({success:false,error:error.error})
})


},

adminallcategory: async (req, res) => {
        console.log("alllllcattttt");
        adminHepler.getallcategory().then((allcategory) => {
           
            res.render('admin/admin-category', { layout: 'admin-layout',allcategory, admin: true })
        })
    },
admindeletecategory: async(req,res)=>{
        let proId = req.params.id;
console.log(proId);
        categoryHelper.categorydelete(proId).then((response)=>{
            res.redirect('/admin/allcategory')
        })
    
     },

     admineditcategory:async (req, res) => {

        console.log('editcataaaaaaaa');
        // let user = req.session.admin
        let category = await categoryHelper.getcategorydetails(req.params.id)
        console.log("getcataaaaaaaa");
    
        res.render('admin/admin-category', { layout: 'admin-layout', admin: true, category })
    },

    adminupdatecategory: (req, res) => {
        console.log('updateeeeeeee');


        let proId = req.params.id
        let catedetails = req.body
        console.log(proId);
        console.log(catedetails);

        categoryHelper.categoryupdate(proId, catedetails).then(() => {
            res.redirect('/admin/allcategory')

        })
    },

    adminallorders: async (req, res) => {
        console.log("ordersssssss");
        adminHepler.getallorders().then((allorders) => {
            res.render('admin/admin-ordertable', { layout: 'admin-layout', allorders, admin: true })

        })
    },getallreport: async (req, res) => {
        console.log("ordersssssss");
        adminHepler.getallorders().then((allorders) => {
            res.render('admin/admin-reports', { layout: 'admin-layout', allorders, admin: true })

        })
    },
    
    getorderstatus:(req,res)=>{
        let data=req.body
        console.log(data,'ffffffffff');
        adminHepler.changeorderstatus(data).then((response)=>{
            console.log(response,'responseeeeeeee');
           res.json(response)
           
        })
    },
    getorderproduct:(req, res)=> {
        const oneProductId = req.params.id
    
        console.log(oneProductId,"oooooooooo");
        product_helper.getOrderProduct(oneProductId).then((oneOrderProduct) => {
            res.render('admin/admin-orderproducts', { layout: 'admin-layout', admin:true, oneOrderProduct })
        })
    },  
    getorderdetails: async(req, res) => {
        const oneorderId = req.params.id;
     let oneOrderProduct=  await product_helper.getOrderProduct(oneorderId)
        // let orderproduct = product_helper.getOrderProduct(oneorderId).then((orderproduct))
        console.log(oneOrderProduct,'kdkddfkdfdfdf');
        console.log(oneorderId, "oooooooooo");
      
        adminHepler.singleorderdetails(oneorderId)
          .then((allorders) => {
            res.render('admin/admin-orderproducts', {
              layout: 'admin-layout',
              allorders,
              admin: true,
              oneOrderProduct
            });
          })
          .catch((error) => {
            // Handle any errors that occur during the process
            console.error('Error retrieving order details:', error);
            // Render an error page or send an error response
            res.status(500).send('Internal Server Error');
          });
      },
      viewOffer (req , res) {
       adminHepler.viewCoupens().then((coupen) => {
            res.render('admin/admin-view-offer' , {layout: 'admin-layout', admin:true,coupen , oferEror:req.session.Eror})
            req.session.Eror = null
        })
    },
    addCoupenPost (req , res) {
        const couponCode = Math.random().toString(36).substring(2, 10);
        adminHepler.addCoupen(req.body , couponCode).then((response) => {
            if(response.message){
                req.session.Eror = response.message
            }
            res.redirect('/admin/offer')
        })
    },

    productCoupen (req , res) {
        product_helper.getallproducts().then((product) => {       
            res.render('admin/productOffer' , { layout: 'admin-layout', admin:true, product})
        })
    },
    productOfferPost (req , res) {
        let prodId = req.params.id
        console.log(prodId,'prodIdddddddddddddddd');
        // const productCode = Math.random().toString(36).substring(2, 10);
        
         product_helper.addProductOffer(req.body , prodId ).then(async(response) => {
             let singleProduct = await product_helper.getproductdetails(prodId)
             product_helper.addOfferPrice(req.body , singleProduct).then((response) => {
             })
             res.redirect('/admin/productOffer')
         })
     },
      

    
    
  
            
    
    
            

           
    
    
}

      
    






