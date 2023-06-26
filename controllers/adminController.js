const User=require('../models/userModel')
const Order = require('../models/orderModel')
const Product = require('../models/productModel')
const bcrypt=require('bcrypt')


let message

const securePassword = async (password) => {
    try {
      const passwordMatch = await bcrypt.hash(password, 10);
      return passwordMatch;
    } catch (error) {
      console.log(error.message);
    }
  };

const loadLogin= async(req,res)=>{
    try{
        res.render('login',{message})
        message=null
    }catch(err){
        console.log(err.message);
    }
}

const verifyLogin= async(req,res)=>{
    try{
        const email=req.body.email
        const password=req.body.password
        const userData=await User.findOne({email:email})

        if(userData){
            const passwordMatch=await bcrypt.compare(password,userData.password)
            console.log(passwordMatch);
            if(passwordMatch){
             
                console.log(userData.is_admin);
                if(userData.is_admin===0){
                    res.render('login',{message:'Email and password incorrect'})
                }else{
                    req.session.auser_id=userData._id
                    res.redirect('/admin/dashboard')
                }
            }else{
                res.render('login',{message:'Email or password is incorrect'})
               
            }
        }else{
            res.render('login',{message:'Email and password incorrect'})
        }


    }catch(err){
        console.log(err.message);
    }
}

const logout=async(req,res)=>{
    try{

        req.session.destroy()
        res.redirect('/admin')

    }catch(err){
        console.log(err.message);
    }
}

const loadDashboard = async (req, res) => {
    try {
      const adminData = await User.findById({ _id: req.session.auser_id });
      const users = await User.find({is_block:false})
      const totalOrders = await Order.find();
      const totalProducts = await Product.find({ is_delete: false });
      const order = await Order.aggregate([{ $sort: { date: -1 } },]);
      const totalSaleResult = await Order.aggregate([
        {
          $match: {
            'products.status': 'Delivered'
          }
        },
        {
          $group: {
            _id: null,
            totalSale: {
              $sum: '$totalAmount'
            }
          }
        }
      ]);
  
      let totalSale = 0;
      if (totalSaleResult.length > 0) {
        totalSale = totalSaleResult[0].totalSale;
      }else {
        console.log('No orders found.');
      }



      const totalCodResult = await Order.aggregate([
        {
          $unwind: '$products'
        },
        {
          $match: { 'products.status': 'Delivered', paymentMethod: 'COD' }
        },
        {
          $group: {
            _id: null,
            totalCodAmount: { $sum: '$products.totalPrice' }
          }
        }
      ]);
  
      let totalCod = 0;
      if (totalCodResult.length > 0) {
        totalCod = totalCodResult[0].totalCodAmount;
      } else {
        console.log('No COD orders found.');
      }



      const totalOnlinePaymentResult = await Order.aggregate([
        {
          $unwind: '$products'
        },
        {
          $match: { 'products.status': 'Delivered', paymentMethod: 'onlinePayment' }
        },
        {
          $group: {
            _id: null,
            totalCodAmount: { $sum: '$products.totalPrice' }
          }
        }
      ]);
  
      let totalOnline = 0;
      if (totalOnlinePaymentResult.length > 0) {
        totalOnline = totalOnlinePaymentResult[0].totalCodAmount;
      } else {
        console.log('No online orders found.');
      }


     


      const weeklySalesCursor = Order.aggregate([
        {
          $unwind: "$products"
        },
        {
          $match: {
            'products.status': 'Delivered'
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%d-%m-%Y", date: "$date" } },
            sales: { $sum: '$products.totalPrice' }
          }
        },
        {
          $sort: { _id: 1 }
        },
        {
          $limit: 7
        }
      ]);
  
      const weeklySales = await weeklySalesCursor.exec();
      console.log(weeklySalesCursor);
  
      const dates = weeklySales.map(item => item._id);
      const sales = weeklySales.map(item => item.sales);
      const salesSum = (weeklySales.reduce((accumulator, item) => accumulator + item.sales, 0)).toFixed(2);
  
      console.log(sales, dates);


      const totalWalletResult = await Order.aggregate([
        {
          $unwind: '$products'
        },
        {
          $match: { 'products.status': 'Delivered', paymentMethod: 'walletpayment' }
        },
        {
          $group: {
            _id: null,
            totalCodAmount: { $sum: '$products.totalPrice' }
          }
        }
      ]);
  
      let totalWallet = 0;
      if (totalWalletResult.length > 0) {
        totalWallet = totalWalletResult[0].totalCodAmount;
      } else {
        console.log('No wallet orders found.');
      }
  
      res.render('dashboard', {
        admin: adminData,
        activePage: 'dashboard',
        users,
        totalOrders,
        totalProducts,
        totalSale,
        totalCod,
        totalOnline,
        totalWallet,
        order,
        sales,
        dates
      });
    } catch (error) {
      console.log(error.message);
    }
  };


  //loading sales report page 

const loadSalesReport = async(req,res) =>{
  try {
    const adminData = await User.findById({ _id: req.session.auser_id });
   const order = await Order.aggregate([
  { $unwind: "$products" },
  { $match: { 'products.status': 'Delivered' } },
  { $sort: { date: -1 } },
  {
    $lookup: {
      from: 'products',
      let: { productId: { $toObjectId: '$products.productId' } },
      pipeline: [
        { $match: { $expr: { $eq: ['$_id', '$$productId'] } } }
      ],
      as: 'products.productDetails'
    }
  },  
  {
    $addFields: {
      'products.productDetails': { $arrayElemAt: ['$products.productDetails', 0] }
    }
  }
]);
    res.render("salesReport", { order ,admin:adminData });
  } catch (error) {
    console.log(error.message);
  }
}




  const newUserLoad= async(req,res)=>{
    try{
      const userData = await User.find({is_admin:0})
      const adminData = await User.findById({ _id: req.session.auser_id });
        res.render('userList',{users:userData,admin:adminData})
    }catch(err){
        console.log(err.message);
    }
  }
    
  const addUser=async(req,res)=>{
    try{
        const spassword=await securePassword(req.body.password)
        console.log(req.body);
        const user =new User({
            name:req.body.name,
            email:req.body.email,
            mobile:req.body.mob,
            password:spassword,
            is_admin:0,
        })

    const userData= await user.save()

    if(userData){
        const userData = await User.findById({ _id: req.session.user_id })
        res.redirect("/admin/userList")
    }else{
        res.render('userList',{message:"Your registration has been failed"})
    }

    }catch(err){
        console.log(err);
    }
  }

  const block=async (req,res)=>{
    try{
  
      const userData = await User.findByIdAndUpdate(req.query.id,{$set:{is_block:true}})
      req.session.users=null
      res.redirect('/admin/userList')

    }catch(error){
      console.log(error.message);
    }
  }

  const unblock=async (req,res)=>{
    try{
      const userData = await User.findByIdAndUpdate(req.query.id,{$set:{is_block:false}})
      
      res.redirect('/admin/userList')

    }catch(error){
      console.log(error.message);
    }
  }


  
module.exports={
    loadLogin,
    verifyLogin,
    logout,
    loadDashboard,
    newUserLoad,
    addUser,
    block,
    unblock,
    loadSalesReport
    
}