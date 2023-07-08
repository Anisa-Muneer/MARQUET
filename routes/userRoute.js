const express=require("express")
const user_route=express()
const session=require('express-session')
const auth = require('../middleware/auth')


user_route.use(session({
    secret:process.env.secret,
    resave:false,
    saveUninitialized:false}))



user_route.set('views','./views/users')


const userController=require("../controllers/userController")
const cartController=require("../controllers/cartController")
const wishlistController = require ('../controllers/wishlistController');
const productController = require ('../controllers/productController');
const addressController = require ('../controllers/addressController');
const orderController = require('../controllers/orderController')
const couponController = require('../controllers/couponController')

user_route.get('/',auth.isBlock,userController.homeLoad)

user_route.get('/login',auth.isLogout,auth.isBlock,userController.loginLoad)
user_route.post('/login',auth.isBlock,userController.verifyLogin)
user_route.get('/logout',auth.isBlock,auth.isLogin,userController.logout)


user_route.get('/register',auth.isLogout,auth.isBlock,userController.loadRegister)
user_route.post('/register',auth.isBlock,userController.insertUser)

user_route.get('/shop',auth.isBlock,userController.loadProducts)
user_route.get('/singleProduct/:id',auth.isBlock,userController.loadSingle)


// user_route.post( "/enterotp" , userController.verifyotp);
// user_route.get('/logout',auth.isBlock,userController.logout)

user_route.get('/verify',auth.isLogout,userController.loadVerfication);
user_route.post('/verify',userController.verifyLoad);
// user_route.get('/verifyOtp',userController.loadVerfication);
// user_route.post('/verifyOtp',userController.verifyLoad);


user_route.get('/forget',auth.isBlock,auth.isLogout,userController.forgetLoad)
user_route.post('/forget',auth.isBlock,userController.forgetVerify)
user_route.get('/changePassword',auth.isBlock,auth.isLogout,userController.loadchangePassword)
user_route.post('/verifyOtp',userController.verifyForgetOtps)
user_route.post('/changePassword',userController.changePassword)
user_route.get('/reSend',userController.reSendMail)

user_route.get('/profile',auth.isLogin,userController.loadProfile);



user_route.get('/cart',auth.isLogin,auth.isBlock,cartController.loadCart)
user_route.post('/addToCart',auth.isLogin,auth.isBlock,cartController.addToCart)
user_route.post("/deleteCart",auth.isBlock , auth.isLogin, cartController.deletecart);

user_route.get('/wishlist',auth.isLogin,wishlistController.wishlistLoad);
user_route.post('/addToWishlist',auth.isLogin,wishlistController.addToWishlist);


user_route.post('/deleteWishlist',auth.isBlock,auth.isLogin,wishlistController.deleteWishlist)
user_route.get('/filterCategory/:id',userController.filterCategory)
user_route.post('/changeQuantity',cartController.changeProductCount)
user_route.get('/price-sort/:id',userController.priceSort)




user_route.get("/addAddress", auth.isLogin, cartController.loadAddAddress);
user_route.post("/addAddress", addressController.insertAddress);
user_route.post("/deleteAddress",auth.isBlock , auth.isLogin, addressController.deleteAddress);
user_route.get('/editAddress/:id',auth.isLogin,addressController.loadEditAddress)
user_route.post('/editAddress/:id',auth.isLogin,addressController.editAddress)


user_route.get('/checkout',cartController.loadCheckout)
user_route.post('/checkout',orderController.placeOrder)
user_route.post('/verify-payment',orderController.verifyPayment)

user_route.get('/myOrders',auth.isLogin,orderController.loadOrder)
user_route.get('/singleOrder/:id',orderController.loadSingleOrder)
user_route.post('/cancelOrder',auth.isLogin,orderController.orderCancel)
user_route.post('/returnOrder', orderController.returnOrder);


user_route.get('/invoiceDownload/:id',addressController.loadinvoice);

user_route.post('/apply-coupon',couponController.applyCoupon)

module.exports= user_route