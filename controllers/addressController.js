const User = require("../models/userModel");
const Address = require("../models/addressModel");
const Category = require("../models/categoryModel");
const Product = require('../models/productModel')
const Order = require('../models/orderModel')




const insertAddress = async (req, res, next) => {
  try {
    const session = req.session.user_id;
    const userid = req.session.user_id;
     const productId = req.body.id;
    console.log(userid);
    const userData = await User.findOne({ _id: userid });
    const categoryData = await Category.find();
    const productData = await Product.findOne({_id:productId});
    const addressDetails = await Address.findOne({
      userId: req.session.user_id,
    });

    if (addressDetails) {
      const updateOne = await Address.updateOne(
        { userId: req.session.user_id },
        {
          $push: {
            addresses: {
              userName: req.body.userName,
              mobile: req.body.mobile,
              altrenativeMob: req.body.mobile2, 
              houseName: req.body.house,
              landmark: req.body.landmark,
              city: req.body.city,
              state: req.body.state,
              pincode: req.body.pincode,
            },
          },
        }
      );
      if (updateOne.nModified > 0) {
       
        const addresses = await Address.find(); // Renamed 'address' to 'addresses'
        console.log(addresses);
        return res.render("checkout", {
          address:addresses,
          categoryData,
          session,
          userData,
          products:productData
        });
      } else {
        return res.redirect("/checkout");
      }
    } else {
      const address = new Address({
        userId: req.session.user_id,
        addresses: [
          {
            userName: req.body.userName,
            mobile: req.body.mobile,
            altrenativeMob: req.body.mobile2,
            houseName: req.body.house,
            landmark: req.body.landmark,
            city: req.body.city,
            state: req.body.state,
            pincode: req.body.pincode,
          },
        ],
      });
      
      const addressData = await address.save();

      if (addressData) {
        const addresses = await Address.find(); // Renamed 'address' to 'addresses'
        console.log(addresses);
        return res.redirect("/checkout");
      } else {
    

        const addresses = await Address.find(); // Renamed 'address' to 'addresses'
        console.log(addresses);
        return res.render("checkout", {
          address:addresses,
          categoryData,
          session,
          userData,
          products:productData
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

const deleteAddress = async (req,res) => {
  try {
      const id = req.session.user_id
      const addressId = req.body.address
      console.log(addressId);
      const addressData = await Address.findOne({userId:id})
      if(addressData.addresses.length === 1){
          await Address.deleteOne({userId:id})
      }else{
          await Address.updateOne({userId:id},{$pull:{addresses:{_id:addressId}}})
      }
      res.status(200).json({message:"Address Deleted Successfully"})        
  } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "An error occurred while deleting the address" });
  }
}


const editAddress = async (req, res,next) => {

  if (
    req.body.userName.trim() === "" ||
    req.body.mobile.trim() === "" ||
    req.body.mobile2.trim() === "" ||
    req.body.house.trim() === "" ||
    req.body.landmark.trim() === "" ||
    req.body.city.trim() === "" ||
    req.body.state.trim() === "" ||
    req.body.pincode.trim() === ""
  ) {
   
    const id = req.params.id;
    const session = req.session.user_id;
    const userData = await User.findOne({ _id: req.session.user_id });
    const addressDetails = await Address.findOne(
      { userId: session },
      { addresses: { $elemMatch: { _id: id } } }
    );
    const categoryData = await Category.find();
    const address = addressDetails.addresses;
    res.render("editAddress", {
      session,
      userData: userData,
      address: address[0],
      categoryData
    });
  } else {
    
    try {
      const id = req.params.id;
      await Address.updateOne(
        { userId: req.session.user_id, "addresses._id": id },
        {
          $set: {
            "addresses.$": {
              userName: req.body.userName,
              mobile: req.body.mobile,
              altrenativeMob: req.body.mobile2, 
              houseName: req.body.house,
              landmark: req.body.landmark,
              city: req.body.city,
              state: req.body.state,
              pincode: req.body.pincode,
            },
          },
        }
      );
      res.redirect("/checkout");
    } catch (error) {
      next(error)
    }
  }
};


const loadEditAddress = async (req, res,next) => {
  try {
    const id = req.params.id;
    console.log(id);
    const session = req.session.user_id;
    const userData = await User.findOne({ _id: req.session.user_id });
    const categoryData = await Category.find();
    const addressDetails = await Address.findOne(
      { userId: session },
      { addresses: { $elemMatch: { _id: id } } }
    );
    const address = addressDetails.addresses;
    res.render("editAddress", {
      session,
      userData: userData,
      address: address[0],
      categoryData
    });
  } catch (error) {
   next(error)
  }
};




module.exports = {
  insertAddress,
  deleteAddress,
  editAddress,
  loadEditAddress,
 
};