const User = require('../models/userModel')
const Product = require('../models/productModel')
const Coupen = require('../models/coupenModel')

const loadCoupen =async(req,res)=>{
    try {
        const adminData = await User.findById({_id:req.session.auser_id})
        const coupenData = await Coupen.find()
        res.render('coupenList',{admin:adminData,coupen:coupenData})
    } catch (error) {
        console.log(error.message);
    }
}
//insert coupen
const insertCoupen = async(req,res)=>{
    try {
        console.log("Helooooo");
        const adminData = await User.findById({ _id: req.session.auser_id });
        const coupenData = await Coupen.find()

        //exist code in coupon checking

        const existCode = await Coupen.findOne({code:req.body.code})
        if(existCode){
           return res.render('coupenList',{ admin:adminData , coupen:coupenData , message:'coupon code already used'})
        }

        //discount pecentage validation

        if(req.body.percentage < 0){
            return res.render('coupenList',{ admin:adminData , coupen:coupenData , message:'negative not allowed'})
        }else if(req.body.percentage > 80){
            return res.render('coupenList',{ admin:adminData , coupen:coupenData , message:'maximum discount is 80 !!!'})

        }

        // date validation 

        const startDate = new Date(req.body.startdate);
        const endDate = new Date(req.body.expirydate);

        if (isNaN(startDate) || startDate < new Date() || isNaN(endDate) || endDate <  new Date() ) {
          return res.render('coupenList', { admin: adminData, coupen: coupenData, message: 'Invalid date' });
        }
        
        const coupen = new Coupen({
            code:req.body.code.trim(),
            discountType:req.body.discount.trim(),
            startDate:req.body.startdate,
            expiryDate:req.body.expirydate,
            discountPercentage:req.body.percentage.trim(),
        })

        const coupenDatas = await coupen.save()
        if(coupenDatas){
            res.redirect('/admin/coupenList')
        }else{
            res.redirect('/admin/coupenList')
        } 
    } catch (error) {
        console.log(error.message);
    }
} 

module.exports={
    loadCoupen,
    insertCoupen
}
