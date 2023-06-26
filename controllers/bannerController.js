const User = require('../models/userModel')
const Product = require('../models/productModel')
const Banner = require('../models/bannerModel')




const addBanner = async (req,res)=>{
    
    try {
        const adminData = await User.findById({ _id: req.session.auser_id });
console.log(adminData);
        res.render('addBanner',{admin:adminData}) 
    } catch (error) {
        console.log(error.message);
    }
    
}


// Adding the banner 
const insertBanner = async (req,res,next)=>{
    try {
        const image = [];
        for(i=0;i<req.files.length;i++){
            image[i]=req.files[i].filename;
        }
        const new_banner = new Banner({
            
            image : image,
            
            description : req.body.description,
        })
        const bannerData = await new_banner.save();
        console.log(bannerData + "its me banner");
        if(bannerData){
            res.redirect('/admin/banner')
        }
        else{
            console.log('error');
        }
    } catch (error) {
        next(error)
    }
}



// Listing the Product 
const bannerList = async (req,res,next)=>{
    try {
        
        const adminData = await User.findById({ _id: req.session.auser_id });

            const bannerData = await Banner.find();
            res.render('banner',{banners:bannerData,admin:adminData})
        
    } catch (error) {
        next(error)
    }
}



//Deleting the banner
const deleteBanner = async(req,res)=>{
    try {
       const dlt = await Banner.deleteOne({_id:req.query.id},{$set:{is_delete:true}})
       
       if(dlt){
        res.redirect('/admin/banner')
       }
       else{
        res.redirect('/admin/banner')
       }
    } catch (error) {
        console.log(error.message);
    }
}



//Edit Banner
const editBanner = async(req,res)=>{
    try {
        const BanData = await Banner.findById({_id:req.params.id});
        const adminData = await User.findById({_id:req.session.auser_id});
        res.render('editBanner',{banners:BanData,admin:adminData})

    } catch (error) {
        console.log(error.message);
    }
}


const updateBanner = async (req,res) =>{
    if( req.body.description.trim() === "" ) {
        const id = req.params.id
        const bannerData = await Banner.findOne({_id:id})
        
        const adminData = await User.findById({_id:req.session.auser_id})
        res.render('editBanner',{admin:adminData,banners: bannerData, message:"All fields required"})
    }else{
        try {
            const arrayimg = []
            for(file of req.files){
                arrayimg.push(file.filename)
            } 
            const id = req.params.id
            let c = await Banner.updateOne({_id:id},{$set:{
                
                description:req.body.description,
            }})
          
            res.redirect('/admin/banner')
        } catch (error) {
            console.log(error.message);
        }
      }
  }




module.exports={
    addBanner,
    bannerList,
    insertBanner,
    deleteBanner,
    editBanner,
    updateBanner
}