const User= require('../models/userModel')
const bcrypt=require('bcrypt')
const session=require('express-session')
const Product=require('../models/productModel')
const Category=require('../models/categoryModel')
const randomString = require("randomstring")
const nodemailer=require("nodemailer")
const userModel = require('../models/userModel')
const { name } = require('ejs')
const Address = require("../models/addressModel");
const Banner = require('../models/bannerModel')



let otp
let message
let otp3

const securePassword= async(password)=>{
    try{
        const passwordHash=await bcrypt.hash(password,10)
        return passwordHash
    }catch(err){
        console.log(err.message);
    }
}

//for sent mail

const sendverifyMail=async(name,email,otp)=>{
  try {
    const transporter=nodemailer.createTransport({
      host:'smtp.gmail.com',
      port:587,
      secure:false,
      requireTLS:true,
      auth:{
        user:process.env.useremail,
        pass: process.env.password
      }
    });
    const mailOption={
      form:process.env.useremail,
      to:email,
      subject:'For Verification mail',
      html:'<p>Hi '+name+', please click here to <a href="http://localhost:2040/otp">verify</a> and enter the for your verification' +email+' this is your otp' +otp+ '</p>',
    
  }
  transporter.sendMail(mailOption,function(error,info){
    if (error) {
      console.log(error);
    } else {
      console.log("Email has been send",info.response);
      console.log(otp,"uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu");
    }
  })

}
catch (error) {
    console.log(error.message);
  }
}




//for reset password send mail

const sendResetPasswordMail=async(name,email,token)=>{
  try {
    const transporter=nodemailer.createTransport({
      host:'smtp.gmail.com',
      port:587,
      secure:false,
      requireTLS:true,
      auth:{
        user:process.env.useremail,
        pass: process.env.password
      }
    });
    const mailOption={
      form:process.env.password,
      to:email,
      subject:'For Reset Password',
      html:'<p>Hi '+name+', please click here to <a href="http://localhost:2040/forgetPassword?token='+token+' ">Reset </a>  your password. </p>',
    
  }
  transporter.sendMail(mailOption,function(error,info){
    if (error) {
      console.log(error);
    } else {
      console.log("Email has been send",info.response);
      console.log(otp,"3333333333333333333333333333333333333333333333333333333333333333");
    }
  })

}
catch (error) {
    console.log(error.message);
  }
}



//  Updating and Saving Profile of the User 
const saveProfile = async(req,res,next)=>{
    try {
       const userData = await User.findOneAndUpdate({'_id':req.session.user_id},{$set:{name:req.body.name,mobile:req.body.mobile}})
       res.redirect('/profile');

    } catch (error) {
        next(error)
    }
}


const loadRegister= async(req,res,next)=>{
    try{
        res.render('registration')
    }catch (error) {
      next(error)
    }
}

let name1
let email;
const insertUser=async(req,res,next)=>{
    try{
      const spassword=await securePassword(req.body.password)
      const user =new User({
        name:req.body.name,
        email:req.body.email,
        mobile:req.body.mobile,
        password:spassword,
        is_admin:0
        
    })

    email=user.email;
    const name=req.body.name;
    name1=name

       const existingUser=await User.findOne({email: req.body.email})
       if(existingUser){
        return res.render("registration",{message: "Email already registered"})
       }
       if(req.body.name.trim().length===0){
        return res.render("registration",{message: "Please enter a valid name"})
       }
       if(req.body.password!==req.body.confirmpassword){
        return res.render("registration",{message: "Wrong password"})
       }
       
    else{
      const userData= await user.save()
      if (userData) {
        randomnumber=Math.floor(Math.random()*9000)+1000;
         otp=randomnumber
            console.log(otp,"===",req.body.email);
            sendverifyMail(name,req.body.email,randomnumber)
            res.redirect("/verify")
      }else{
        res.render("registration",{
          message:"Your registration has been failed"
        })
      }
    }

    }
  catch (error) {
    next(error)
  }
};


const reSendMail = async(req,res,next)=>{
  try {
    console.log(name + email + otp,"dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd");
    sendverifyMail(name,email,otp)
  } catch (error) {
    next(error)
  }
}

const loginLoad= async(req,res,next)=>{
    try{
      const session=null
        res.render('login',{message,session})
        message=null
    }catch (error) {
      next(error)
    }
}

const verifyLogin= async(req,res,next)=>{
  try {
   
    // const session = null;
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email });
    const bannerData = await Banner.find();
    const productData = await Product.find();

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      console.log(passwordMatch);
      if (passwordMatch) {
        if(userData.is_verified === 1){
          if(userData.is_block === true){
            res.render('login',{message:"User is blocked"})
          }else{
            req.session.user_id = userData._id;
            res.render('home',{session,productData,userData,banners:bannerData})
          }
        }else{
          res.render('login', {message: "User not verfied"})
        }
        
        
      } else {
        res.render("login", {message: "Email or password is incorrect"});
      
      }
    } else {
      res.render("login",{message: "s incorrect"});
    }
  } catch (error) {
    next(error)
  }
    
}

const homeLoad= async(req,res,next)=>{
    try{
      var search = '';
      if(req.query.search){
        console.log(req.query.search);
        search = req.query.search;
      }

      const bannerData = await Banner.find();
      
        const productData=await Product.find({})
        if(req.session.user_id){
           
            const session = req.session.user_id
            const userData = await User.findById({_id: req.session.user_id})
            
            res.render('home',{userData:userData,session:session,products:productData,banners:bannerData})
        }else{
         
           
            const session=null
            res.render('home',{session,products:productData,banners:bannerData})
        }
    }catch(error){
     next(error)
    }
}

//  Verifying the users otp and redirecting to login page
//  =====================================================
const verifyLoad = async (req,res,next)=>{
  const otp2= req.body.otp;

  try { 
      if(otp2==otp){
       
          const userData = await User.findOneAndUpdate({email:email},{$set:{is_verified:1}});
          // const userData = await User.findOne({ email: email });
          
          if(userData){
          // res.redirect('/')
          req.session.user_id = userData._id;
          res.render('home',{session,userData})
          }
          else{
            
          }
      }
      else{
          res.render('verify',{message:"Please Check the OTP again!"})
      }
  } catch (error) {
    next(error)
  }
}

// verification page of user
// ==========================
const loadVerfication = async(req,res,next)=>{
 
  try {
    const session = req.session.user_id;
    
    if (!session) {
      return res.render("verify",{session:session});
    }

    const userData = await User.findById({_id:req.session.user_id});
    if (userData) {
      return res.render("verify", { user: userData,session});
    } else {
      const session = null
      return res.render("verify",{session});
    }
  } catch (error) {
    next(error)
  }
  }
 


const logout = async(req,res,next)=>{
    try {
        req.session.user_id=null
        res.redirect('/')

    } catch (error) {
      next(error)
    }
}


//-------- Product page loading section  -----------//
const loadProducts = async (req,res,next)=>{
    try {
       var search = '';
      if(req.query.search){
       search = req.query.search;
      }

      var page = 1;
      if(req.query.page){
        
        page = req.query.page;
      }

      const limit = 6;
      
      const session = req.session.user_id;
      const productData = await Product.find({is_delete:false,
          $or:[
            {product:{$regex:'.*'+search+'.*',$options:'i'}},
            {price:{$regex:'.*'+search+'.*'}},
            {description:{$regex:'.*'+search+'.*',$options:'i'}},
          ]
        })
        .limit(limit * 1)
        .skip((page-1) * limit ) 
        .exec()

        const count = await Product.find({is_delete:false,
          $or:[
            {product:{$regex:'.*'+search+'.*',$options:'i'}},
            {price:{$regex:'.*'+search+'.*'}},
            {description:{$regex:'.*'+search+'.*',$options:'i'}},
          ]
        })
        .countDocuments();
        const categoryData = await Category.find({is_delete:false});
        if (!session) {
          return res.render("shop",{session:session,category:categoryData,products:productData,   
            totalPages:Math.ceil(count/limit),currentPage:page});
        }
    
        const userData = await User.findById({_id:req.session.user_id});
        if (userData) {
          return res.render("shop", {userData,session,category:categoryData,products:productData,
            totalPages:Math.ceil(count/limit),currentPage:page});
        } else {
          const session = null
          return res.render("shop",{session,category:categoryData,products:productData,
            totalPages:Math.ceil(count/limit),currentPage:page});
        }
      } catch (error) {
        next(error)
      }
}
  const loadSingle = async(req,res,next)=>{
    
    try{
      if(req.session.user_id){
        const session = req.session.user_id
        const id = req.params.id;
        const userData = await User.findById({_id:req.session.user_id});
        const productData = await Product.findOne({_id:id});
        const catData = await Category.find({is_delete:false});
        res.render('singleProduct',{products: productData,Category: catData,session,userData : userData})

      }else{
        const session=null
        const id=req.params.id
        const data = await User.findOne({_id:id})
        const productData = await Product.findOne({_id:id});
        res.render('singleProduct',{products:productData,session})
      }
       


    }catch(error){
      next(error)
    }
  }

  
  //forget password

  const forgetLoad = async(req,res,next)=>{
    try {
      res.render('forget')
    } catch (error) {
      next(error)
    }
  }

  const sendResetPassword=async(name,email,otp3)=>{
    try {

      otp_to_verify=otp3
      const transporter=nodemailer.createTransport({
        host:'smtp.gmail.com',
        port:587,
        secure:false,
        requireTLS:true,
        auth:{
          user:process.env.useremail,
          pass:process.env.password
        }
      });
      const mailOption={
        form:process.env.useremail,
        to:email,
        subject:'For Verification mail',
        html:'<p>Hi '+name+', please click here to <a href="http://localhost:2040/otp">verify</a> and enter the for your verification' +email+' this is your otp' +otp3+ '</p>',
      
    }
    transporter.sendMail(mailOption,function(error,info){
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been send",info.response);
      
      }
    })
  }
  catch (error) {
      console.log(error.message);
    }
  }
  
  //forget password
  const forgetVerify = async (req, res,next) => {
    try {
      const email = req.body.email;
      // emalreset=email
      
      
      const userData = await User.findOne({ email: email });
      if (userData) {
        randomnumber = Math.floor(Math.random() * 9000) + 1000;
        otp3 = randomnumber;
        if (userData.is_verified == false) {
          res.render("forget", { message: "please Verify Your mail"});
        } else {
          randomnumber = Math.floor(Math.random() * 9000) + 1000;
          otp3 = randomnumber;
          
          sendResetPassword(userData.name,userData.email,otp3)
          console.log(otp3,"ppppppp554564646543213454651131ppppppppppppppppppppppppppppppppppppppp");
          res.render('forget',{message:'please check mail and enter OTP'})
        }
      }else{
        res.render('forget',{message:'email is incorrect'})
      }
    } catch (error) {
      next(error)
    }
  };
  
  const verifyForgetOtps = async (req, res,next) => {
    try {
     
      const otp4 = req.body.otp4

    
      if(otp4 == otp_to_verify){

       res.render('changePassword')
      }else{
        res.render('forget',{message:"something went wrong"})
      }
    } catch (error) {
      next(error)
    }
  };
  
  const loadchangePassword = async(req,res,next)=>{
    try {
      res.render('changePassword',{message:'password is not matching'})
    } catch (error) {
      next(error)
    }
  }
  
  
  const changePassword=async(req,res,next)=>{
    try {
      const password=req.body.password;
      const confPassword=req.body.confPassword;
      const passwordHash=await bcrypt.hash(password,10)
      
      if(password==confPassword){
        const user1=await User.findOneAndUpdate({email:emalreset},{$set:{password:passwordHash}})
       
        res.redirect('/login')
      }else{
        res.render('changePassword',{message:'password is not matching'})
      }
  
    } catch (error) {
      next(error)
    }
  }

  //   Loading the profile page of the user 
 const loadProfile = async(req,res,next)=>{
  try {
      const session = req.session.user_id;
      const userData = await User.findOne({_id:req.session.user_id});
      const userName =await User.findOne({_id:req.session.user_id});
      const addressData = await Address.findOne({ userId: req.session.user_id});
      
      res.render('profile',{userData,userName,session,address:addressData});
  } catch (error) {
    next(error)
  }
  
}

const filterCategory = async (req,res,next)=>{
  try{
    var search = '';
    if(req.query.search){
      search = req.query.search;
    }
    
    var page = 1;
    if(req.query.page){
      
      page = req.query.page;
    }
    const id = req.params.id;
    const limit = 3;
    const count = await Product.find({is_delete:false,
      $or:[
        {product:{$regex:'.*'+search+'.*',$options:'i'}},
        {categoryName:{$regex:'.*'+search+'.*',$options:'i'}},
        // {description:{$regex:'.*'+search+'.*',$options:'i'}},
      ]
    })
    .countDocuments();
    const session = req.session.user_id;
    const categoryData = await Category.find({is_delete:false});
    const userData = await User.find({})
    const productData = await Product.find({Category:id,is_delete:false,
      $or:[
        {product:{$regex:'.*'+search+'.*',$options:'i'}},
        {price:{$regex:'.*'+search+'.*'}},
        {description:{$regex:'.*'+search+'.*',$options:'i'}},
      ]
    })
    .limit(limit * 1)
        .skip((page-1) * limit ) 
        .exec()
    
    if(categoryData.length > 0){
      res.render('shop',{totalPages:Math.ceil(count/limit),products:productData,session,category:categoryData,userData});
    }else{
      res.render('shop',{totalPages:Math.ceil(count/limit),product:[],session,category:categoryData,userData});
      
    }


  }catch(error){
    next(error)
  }
}


//sorting using price

const priceSort = async(req,res,next) =>{
  try {
    var search = '';
    if(req.query.search){
      search = req.query.search;
    }
    var page = 1;
    if(req.query.page){
      
      page = req.query.page;
    }
    const limit = 6;
    const count = await Product.find({is_delete:false,
      $or:[
        {product:{$regex:'.*'+search+'.*',$options:'i'}},
        {categoryName:{$regex:'.*'+search+'.*',$options:'i'}},
        // {description:{$regex:'.*'+search+'.*',$options:'i'}},
      ]
    })
    .countDocuments();
    const id = parseInt(req.params.id)
   
    const userData = await User.find()
    const categoryData = await Category.find({ is_delete: false });
    const session = req.session.user_id;
    const sortData = await Product.find({is_delete:false,
      $or:[
        {product:{$regex:'.*'+search+'.*',$options:'i'}},
        {price:{$regex:'.*'+search+'.*'}},
        {description:{$regex:'.*'+search+'.*',$options:'i'}},
      ]
    })

    .sort({Price:id}).limit(limit * 1)
        .skip((page-1) * limit ) 
        .exec()
   
    if(sortData){
      res.render("shop", {
        totalPages:Math.ceil(count/limit),
        products: sortData,
        session,
        userData,
        category: categoryData,
      });
    }else{
        res.render("shop", {totalPages:Math.ceil(count/limit), product: [], session, category: categoryData });

    }
  } catch (error) {
    console.log(error.message);
  }
}







module.exports={
    loadRegister,
    insertUser,
    loginLoad,
    verifyLogin,
    homeLoad,
    logout,
    loadProducts,
    loadSingle,
    verifyLoad,
    sendverifyMail,
    loadVerfication,
    forgetLoad,
    forgetVerify,
    loadchangePassword,
    changePassword,
    verifyForgetOtps,
    loadProfile,
    reSendMail,
    filterCategory,
    priceSort
    
    
    
}