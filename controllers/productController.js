const Product = require ('../models/productModel');
const Category = require('../models/categoryModel.js')
const User = require('../models/userModel');
const fs = require('fs')
const path = require('path')



//  Loading the add products
const AddProducts = async (req,res,next)=>{
    try {
        const adminData = await User.findById({ _id: req.session.auser_id });

        const categoryData = await Category.find({is_delete:false})
        res.render('AddProduct',{category:categoryData,admin:adminData})
    } catch (error) {
        next(error)
    }
 }

// Adding the Products 
const insertproduct = async (req,res,next)=>{
    try {
        const image = [];
        for(i=0;i<req.files.length;i++){
            image[i]=req.files[i].filename;
        }
        const new_product = new Product({
            product : req.body.productName,
            Price : req.body.price,
            image : image,
            Category : req.body.category,
            stock : req.body.StockQuantity,
            description : req.body.description,
        })
        const productData = await new_product.save();
        if(productData){
            res.redirect('/admin/productList')
        }
        else{
            console.log('error');
        }
    } catch (error) {
        next(error)
    }
}

// Listing the Product 
const productList = async (req,res,next)=>{
    try {
        const adminData = await User.findById({ _id: req.session.auser_id });
        const productData = await Product.find({is_delete:false});
            res.render('productList',{products:productData,admin:adminData})
        
    } catch (error) {
        next(error)
    }
}

// Deleting the Product
 const deleteProduct =async(req,res,next)=>{
    try {
        const dlt = await Product.updateOne({_id:req.query.id },{$set:{is_delete:true}})
        if(dlt){
            res.redirect('/admin/productList');
        }
        else{
            res.redirect('/admin/productList');
            
        }
        
    } catch (error) {
        next(error)
    }
}

//  ------------- Edit product  section
const editproduct = async(req,res,next) => {
    try {
      const id = req.params.id
      const productData = await Product.findOne({_id:id}).populate('Category')
      const categoryData = await Category.find({is_delete:false})
      const adminData = await User.findById({_id:req.session.auser_id})
       res.render('editProductList',{admin:adminData,activePage: 'productList',category:categoryData,product:productData})
    } catch (error) {
        next(error)
    }
}

//  ------------- Update product  section
const updateProduct = async (req,res,next) =>{
  if(req.body.product.trim() === "" || req.body.category.trim() === "" || req.body.description.trim() === "" || req.body.stock.trim() === "" || req.body.price.trim() === "") {
      const id = req.params.id
      const productData = await Product.findOne({_id:id}).populate('Category')
      const categoryData = Category.find()
      const adminData = await User.findById({_id:req.session.auser_id})
      res.render('editProductList',{admin:adminData,product: productData, message:"All fields required",category:categoryData})
  }else{
      try {
          const arrayimg = []
          for(file of req.files){
              arrayimg.push(file.filename)
          } 
          const id = req.params.id
          let c = await Product.updateOne({_id:id},{$set:{
              product:req.body.product,
              category:req.body.category,
              stock:req.body.stock,
              Price:req.body.price,
              description:req.body.description,
          }})
        
          res.redirect('/admin/productList')
      } catch (error) {
        next(error)
      }
    }
}

//Delete image in the edit section
const deleteimage = async (req, res, next) => {
    try {
      const imgid = req.params.imgid;
      const prodid = req.params.prodid;
      fs.unlink(path.join(__dirname, "../public/adminAsset/adminImages", imgid), () => { })
      const productimg = await Product.updateOne({ _id: prodid }, { $pull: { image: imgid } })
      res.redirect('/admin/editProductList/' + prodid)
    } catch (err) {
      next(err);
    }
  }

module.exports = {
    AddProducts,
    insertproduct,
    productList,
    deleteProduct,
    deleteimage,
    editproduct,
    updateProduct,    
 }