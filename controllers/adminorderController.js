const User = require('../models/userModel');
const Order = require('../models/orderModel');
const Category = require('../models/categoryModel');


const loadOrderList = async (req,res,next)=>{
    try{
        const session = req.session.Auser_id
      const categoryData = await Category.find();
      const adminData = await User.findById({ _id: req.session.auser_id }); 
      const DeletePending = await Order.deleteMany({status:'pending'})
      const orderData = await Order.find().populate("products.productId")
      if(orderData.length > 0){
        res.render('orderList', {session, categoryData ,admin: adminData, activePage: 'orderList',order:orderData});
      }else{
        res.render('orderList', {session, categoryData ,admin: adminData, activePage: 'orderList',order:[]});
      }
      
    }catch(err){
      next(err);
    }
  }


  const loadSingleOrderList = async (req,res,next)=>{
    try{
        
        const session = req.session.Auser_id
        const categoryData = await Category.find();
      const id = req.params.id;
      const adminData = await User.findById({ _id: req.session.auser_id });
      const orderData = await Order.findOne({_id:id}).populate("products.productId")
      res.render('orderDetails', {session,admin: adminData, activePage: 'orderList',order:orderData});
    }catch(err){
      next(err);
    }
  }


  const changeStatus = async(req,res,next)=>{
    try{
      const status = req.body.status;
      const orderId = req.body.orderId;
      const userId = req.body.userId;
      const updateOrder = await Order.findOneAndUpdate(
        {
          userId: userId,
          'products._id': orderId
        },
        {
          $set: {
            'products.$.status': status
          }
        },
        { new: true }
      );
      if(updateOrder){
        res.json({success:true})
      }

    }catch(err){
      next(err)
    }
  }



  module.exports = {
    loadOrderList,
    loadSingleOrderList,
    changeStatus
  }