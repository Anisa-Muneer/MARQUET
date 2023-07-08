const User = require('../models/userModel')
const Product = require('../models/productModel')
const Coupon = require('../models/couponModel')

//Load coupon page
const loadCoupon =async(req,res)=>{
    try {
        const adminData = await User.findById({_id:req.session.auser_id})
        const CouponData = await Coupon.find()
        res.render('couponList',{admin:adminData,Coupon:CouponData})
    } catch (error) {
        console.log(error.message);
    }
}
//insert Coupon
const insertCoupon = async(req,res)=>{
    try {
        console.log("Helooooo");
        const adminData = await User.findById({ _id: req.session.auser_id });
        const CouponData = await Coupon.find()

        //exist code in coupon checking

        const existCode = await Coupon.findOne({code:req.body.code})
        if(existCode){
           return res.render('couponList',{ admin:adminData , Coupon:CouponData , message:'coupon code already used'})
        }

        //discount pecentage validation

        if(req.body.percentage < 0){
            return res.render('couponList',{ admin:adminData , Coupon:CouponData , message:'negative not allowed'})
        }else if(req.body.percentage > 80){
            return res.render('couponList',{ admin:adminData , Coupon:CouponData , message:'maximum discount is 80 !!!'})

        }

        // date validation 

        const startDate = new Date(req.body.startdate);
        const endDate = new Date(req.body.expirydate);

        if (isNaN(startDate) || startDate < new Date() || isNaN(endDate) || endDate <  new Date() ) {
          return res.render('couponList', { admin: adminData, Coupon: CouponData, message: 'Invalid date' });
        }
        
        const coupon = new Coupon({
            code:req.body.code.trim(),
            discountType:req.body.discount.trim(),
            startDate:req.body.startdate,
            expiryDate:req.body.expirydate,
            discountPercentage:req.body.percentage.trim(),
        })

        const CouponDatas = await coupon.save()
        if(CouponDatas){
            res.redirect('/admin/couponList')
        }else{
            res.redirect('/admin/couponList')
        } 
    } catch (error) {
        console.log(error.message);
    }
} 

//update coupen
const updateCoupen = async(req,res,next)=>{
    try {
        const id = req.params.id
        const adminData = await User.findById({ _id: req.session.auser_id });
        const CouponData = await Coupon.find()

 
         //discount pecentage validation
 
         if(req.body.percentage < 0){
             return res.render('coupen-list',{ admin:adminData , Coupon:CouponData , message:'negative not allowed'})
         }else if(req.body.percentage > 80){
             return res.render('coupen-list',{ admin:adminData , Coupon:CouponData , message:'maximum discount is 80 !!!'})
 
         }
 
         // date validation 
 
         const startDate = new Date(req.body.startdate);
         const endDate = new Date(req.body.expirydate);
 
         if (isNaN(startDate) || startDate < new Date() || isNaN(endDate) || endDate <  new Date() ) {
           return res.render('coupen-list', { admin: adminData, Coupon: CouponData, message: 'Invalid date' });
         }


        const updateCoupen = await Coupon.findOneAndUpdate({_id:id},{
            $set:{
                code:req.body.code.trim(),
                discountType:req.body.discount.trim(),
                startDate:req.body.startdate,
                expiryDate:req.body.expirydate,
                discountPercentage:req.body.percentage.trim(),
            }
        })
        if(updateCoupen){
            res.redirect('/admin/couponList')
        }else{
            message='something error'
            res.redirect('/admin/couponList')
        }
    } catch (error) {
        console.log(error.message);
    }
}

// Deleting the Coupon
const deleteCoupon = async(req,res)=>{
    try {
        const dlt = await Coupon.deleteOne({_id:req.query.id})
        if(dlt){
            res.redirect('/admin/couponList')
        }else{
            res.redirect('/admin/couponList')
        }
    } catch (error) {
        console.log(error.message);
    }
}

//applying coupen in user side
const applyCoupon = async(req,res,next)=>{
    try {
      const code = req.body.code;
      const amount = Number(req.body.amount)
      const userExist = await Coupon.findOne({code:code,user:{$in:[req.session.user_id]}})
      if(userExist){
        res.json({user:true})
      }else{
        const coupondata = await Coupon.findOne({code:code})
        if(coupondata){
            if(coupondata.expiryDate <= new Date()){
                res.json({date:true})
            }else{
                await Coupon.findOneAndUpdate({_id:coupondata._id},{$push:{user:req.session.user_id}}) 
                const perAmount = Math.round((amount * coupondata.discountPercentage)/100 )
                const disTotal =Math.round(amount - perAmount)
                return res.json({amountOkey:true,disAmount:perAmount,disTotal})
            }
        }
      }
      res.json({invalid:true})
    } catch (error) {
        console.log(error.message);
    }
}

module.exports={
    loadCoupon,
    insertCoupon,
    updateCoupen,
    deleteCoupon,
    applyCoupon
}
