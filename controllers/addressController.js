const User = require("../models/userModel");
const Address = require("../models/addressModel");
const Category = require("../models/categoryModel");
const Product = require('../models/productModel')
const Order = require('../models/orderModel')
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path')
const ejs = require('ejs')




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
      console.log(address);
      const addressData = await address.save();

      if (addressData) {
        const addresses = await Address.find(); // Renamed 'address' to 'addresses'
        console.log(addresses);
        return res.redirect("/checkout");
      } else {
        console.log("here222");

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


const editAddress = async (req, res) => {
  console.log('yes edit address');

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
    console.log('yes iam inn');
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
    console.log('i am else');
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
      console.log(error.message);
    }
  }
};


const loadEditAddress = async (req, res) => {
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
    console.log(error.message);
  }
};

//---------------- USER ORDER INVOICE DOWNLODE SECTION SECTION START
const loadinvoice = async (req, res) => {
  try {
    const id = req.params.id;
    const session = req.session.user_id;
    const userData = await User.findById({_id:session})
    const orderData = await Order.findOne({_id:id}).populate('products.productId');
    const date = new Date()
   
     data = {
      order:orderData,
      user:userData,
      date,
    }

    const filepathName = path.resolve(__dirname, '../views/users/invoice.ejs');
    const html = fs.readFileSync(filepathName).toString();
    const ejsData = ejs.render(html, data);
    
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setContent(ejsData, { waitUntil: 'networkidle0' });
    const pdfBytes = await page.pdf({ format: 'Letter' });
    await browser.close();

   
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename= order invoice.pdf');
    res.send(pdfBytes);

  } catch (err) {
    console.log(err);
    res.status(500).send('An error occurred');
  }
};



module.exports = {
  insertAddress,
  deleteAddress,
  editAddress,
  loadEditAddress,
  loadinvoice
};