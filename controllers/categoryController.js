const Category = require('../models/categoryModel');
const usermodal=require('../models/userModel')
const uc = require('upper-case');
const session=require('express-session')

let message=''



//  Listing the catagory
const categoryList = async (req,res)=>{
    try {
        const CatData = await Category.find({});
        const adminData= await usermodal.findById({_id:req.session.auser_id})
        res.render('categoryList',{Category:CatData, admin: adminData,message: message || ''});
    } catch (error) {
        console.log(error.message);
    }
}


//  Adding the catagory
const insertCategory = async (req,res)=>{
    
    try {
        const catName = uc.upperCase(req.body.categoryName.trim());
        const existingCategory = await Category.findOne({ categoryName: catName });
        const reupdate = await Category.updateOne({ categoryName: catName },{$set:{is_delete:false}});
        if (existingCategory) {
          message = 'category is already exists';
          res.redirect('/admin/categoryList');
          return;
        }
    
        const category = new Category({
          categoryName: catName,
        });
    
        const categoryData = await category.save();
    
        if (categoryData) {
          message = 'category is added';
          res.redirect('/admin/categoryList');
        } else {
          message = 'Something went wrong';
          res.redirect('/admin/categoryList');
        }
      } catch (error) {
        console.log(error.message);
        message = 'something went wrong';
        res.redirect('/admin/categoryList');
      }
 }



//  Editing the catagory 
const  editCatogary= async (req,res)=>{
    try {
        const id = req.query.id;
       const catDATA = await Category.findById({_id:id});
       const adminData= await usermodal.findById({_id:req.session.auser_id})
       res.render('editCategory',{Category:catDATA,admin:adminData,message: message || ''})
    } catch (error) {
        console.log(error.message);
    }
}


//  updating and saving the catagory 
const  saveCatogary= async (req,res)=>{
    try {
        const name = uc.upperCase(req.body.categoryName)
       const catDATA = await Category.findOneAndUpdate({_id:req.query.id},{$set:{categoryName:name}});
       if(catDATA){
        res.redirect('categoryList')
        
       }
    } catch (error) {
        console.log(error.message);
    }
}

const unlistCategory = async (req, res) => {
    try {
        const categoryData = await Category.findByIdAndUpdate({_id:req.query.id},{$set:{is_delete : true}})
        
        res.redirect("/admin/categoryList")
    } catch (error) {
        console.log(error.message);
    }
     
  };
const listCategory = async (req, res) => {
    try {
        const categoryData = await Category.findByIdAndUpdate({_id:req.query.id},{$set:{is_delete: false}})
        res.redirect("/admin/categoryList")
    } catch (error) {
        console.log(error.message);
    }
}



module.exports={
    categoryList,
    saveCatogary,
    insertCategory,
    // AddCategory, 
    editCatogary,
    saveCatogary,
    listCategory,
    unlistCategory
}