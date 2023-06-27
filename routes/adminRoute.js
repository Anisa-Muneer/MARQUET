const express =require('express')
const admin_route=express()
const multer=require('multer')
const upload=require('../config/multer')
const dotenv = require('dotenv')
dotenv.config();

const session=require('express-session')

//admin_route.use(session({secret:config.sessionSecret}))
admin_route.use(session({
    secret: process.env.secret, // Secret key used to sign the session ID cookie
    resave: false, // Set to false to prevent session from being saved on every request
    saveUninitialized: true // Set to true to save uninitialized sessions
  }));
  

admin_route.set('views','./views/admin')

const auth=require('../middleware/adminAuth')

const adminController=require('../controllers/adminController');
const categoryController  = require('../controllers/categoryController');
const productController = require('../controllers/productController')
const adminOrderController = require('../controllers/adminorderController')
const bannerController = require('../controllers/bannerController')
const coupenController = require('../controllers/coupenController')

admin_route.get('/',auth.isLogout,adminController.loadLogin)
admin_route.post('/',adminController.verifyLogin)

admin_route.get('/dashboard',auth.isLogin,adminController.loadDashboard)
admin_route.get("/salesReport", auth.isLogin, adminController.loadSalesReport);


admin_route.get('/logout',auth.isLogin,adminController.logout)

admin_route.get('/userList',auth.isLogin,adminController.newUserLoad)
admin_route.get('/blockUser',auth.isLogin,adminController.block)
admin_route.get('/unblockUser',auth.isLogin,adminController.unblock)

admin_route.get('/categoryList',auth.isLogin,categoryController.categoryList);
admin_route.post('/insertCategory',auth.isLogin,categoryController.insertCategory);
admin_route.get('/unlistCategory',auth.isLogin,categoryController.unlistCategory);
admin_route.get('/listCategory',auth.isLogin,categoryController.listCategory);
admin_route.get('/editCategory',auth.isLogin,categoryController.editCatogary);
admin_route.post('/editCategory',auth.isLogin,categoryController.saveCatogary);


admin_route.get('/addproduct',auth.isLogin,productController.AddProducts);
admin_route.post('/addproduct',upload.upload.array('image',10),productController.insertproduct);
admin_route.get('/productlist',auth.isLogin,productController.productList);
admin_route.get('/deleteProduct',auth.isLogin,productController.deleteProduct);
admin_route.get('/editProductList/:id',auth.isLogin,productController.editproduct);
admin_route.post('/editProductList/:id',upload.upload.array("image", 10), productController.updateProduct);
admin_route.get('/deleteimg/:imgid/:prodid', auth.isLogin, productController.deleteimage);

admin_route.get('/orderList',auth.isLogin,adminOrderController.loadOrderList)
admin_route.get('/singleOrderList/:id',adminOrderController.loadSingleOrderList)
admin_route.post('/changeStatus',adminOrderController.changeStatus);


admin_route.get('/banner',auth.isLogin,bannerController.bannerList)
admin_route.get('/addBanner',auth.isLogin,bannerController.addBanner)
admin_route.post('/addBanner',upload.upload.array('image',1),bannerController.insertBanner);
admin_route.get('/deleteBanner',auth.isLogin,bannerController.deleteBanner)
admin_route.get('/editBanner/:id',auth.isLogin,bannerController.editBanner);
admin_route.post('/editBanner/:id',upload.upload.array("image", 1), bannerController.updateBanner);

admin_route.get('/coupenList',auth.isLogin,coupenController.loadCoupen)
admin_route.post('/insertCoupen',coupenController.insertCoupen)




module.exports=admin_route