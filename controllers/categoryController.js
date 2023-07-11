const Category = require('../models/categoryModel');
const usermodal=require('../models/userModel')
const uc = require('upper-case');
const session=require('express-session')

let message=''



//  Listing the catagory
const categoryList = async (req,res,next)=>{
    try {
        const CatData = await Category.find({});
        const adminData= await usermodal.findById({_id:req.session.auser_id})
        res.render('categoryList',{Category:CatData, admin: adminData,message: message || ''});
    } catch (error) {
        next(error)
    }
}


//  Adding the catagory
// const insertCategory = async (req,res,next)=>{
    
//     try {
//         const catName = uc.upperCase(req.body.categoryName);
//         const existingCategory = await Category.findOne({ categoryName: catName });
//         const reupdate = await Category.updateOne({ categoryName: catName },{$set:{is_delete:false}});
//         if (existingCategory) {
//           message = 'category is already exists';
//           res.redirect('/admin/categoryList');
//           return;
//         }
    
//         const category = new Category({
//           categoryName: catName,
//         });
    
//         const categoryData = await category.save();
    
//         if (categoryData) {
//           message = 'category is added';
//           res.redirect('/admin/categoryList');
//         } else {
//           message = 'Something went wrong';
//           res.redirect('/admin/categoryList');
//         }
//       } catch (error) {
//         next(error)
//         message = 'something went wrong';
//         res.redirect('/admin/categoryList');
//       }
//  }

const insertCategory = async (req,res,next) =>{
    try {
        if(req.session.auser_id){
            const catName = uc.upperCase(req.body.categoryName);
            const category = new Category({
                categoryName : catName
            });
            if(catName.trim().length === 0){
                res.redirect('/admin/categoryList');
                // mes = "invalid typing"
            }else{
                const categoryDatas = await Category.findOne({categoryName:catName});
                if(categoryDatas){
                    mes ='This category is already exist'
                    res.redirect('/admin/categoryList');
                }else{
                    const categoryData = await category.save()
                    if(categoryData){ 
                        res.redirect('/admin/categoryList')
                    }else{
                        res.redirect('/admin/dashBoard');
                    }
                }
            }
        }else{
            res.redirect('/admin')
        }
    } catch (error) {
        next(error);
    }
}



//  Editing the catagory 
const  editCatogary= async (req,res,next)=>{
    try {
        const id = req.query.id;
       const catDATA = await Category.findById({_id:id});
       const adminData= await usermodal.findById({_id:req.session.auser_id})
       res.render('editCategory',{Category:catDATA,admin:adminData,message: message || ''})
    } catch (error) {
        next(error)
    }
}


//  updating and saving the catagory 
const  saveCatogary= async (req,res,next)=>{
    try {
        const name = uc.upperCase(req.body.categoryName)
       const catDATA = await Category.findOneAndUpdate({_id:req.query.id},{$set:{categoryName:name}});
       if(catDATA){
        res.redirect('categoryList')
        
       }
    } catch (error) {
        next(error)
    }
}

const unlistCategory = async (req, res,next) => {
    try {
        const categoryData = await Category.findByIdAndUpdate({_id:req.query.id},{$set:{is_delete : true}})
        
        res.redirect("/admin/categoryList")
    } catch (error) {
        next(error)
    }
     
  };
const listCategory = async (req, res,next) => {
    try {
        const categoryData = await Category.findByIdAndUpdate({_id:req.query.id},{$set:{is_delete: false}})
        res.redirect("/admin/categoryList")
    } catch (error) {
        next(error  )
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