const userModel=require("../models/userModel")

const isLogin = async (req, res, next) => {
    try {
      if (req.session.user_id) {
        // User is logged in, continue to next middleware or route handler
        next();
      } else {
        // User is not logged in, redirect to login page
        res.redirect("/");
      }
    } catch (err) {
      console.log(err.message);
      next(err)
    }
  };
  
  const isLogout = async (req, res, next) => {
    try {
      if (req.session.user_id) {
        // User is logged in, redirect to home page
        res.redirect("/");
      } else {
        // User is not logged in, continue to next middleware or route handler
        next();
      }
    } catch (err) {
      console.log(err.message);
       next(err)
    }
  };

  let message
  const isBlock =async(req,res,next)=>{
    try {
      if(req.session.user_id ){
      const userData= await userModel.findOne({_id:req.session.user_id}) 
      if(userData.is_block==false && userData.is_admin==0){
        next()
        console.log('bloked');
      }else{
        console.log('note blked');
        req.session.destroy()
        message = 'User is blocked';
        res.redirect("/login")
       
      }
      }else{
        next()
        }
    } catch (err) {
      console.log(err.message);
      next(err);
    }
  }
  
  module.exports = {
    isLogin,
    isLogout,
    isBlock
  };
  