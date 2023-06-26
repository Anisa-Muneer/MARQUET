const User = require('../models/userModel');
const Product = require('../models/productModel')
const Category = require('../models/categoryModel');
const Cart = require('../models/cartModel')
const Address = require('../models/addressModel')


// ---------- Cart loading section start
const loadCart = async(req,res)=>{
    try {
      let id = req.session.user_id;
      const userData = await User.findById({_id:req.session.user_id});
      const session = req.session.user_id
      let userName = await User.findOne({ _id: req.session.user_id });
      let cartData = await Cart.findOne({ userId: req.session.user_id }).populate(
        "products.productId"
      );
      if (req.session.user_id) {
        if (cartData) {
          if (cartData.products.length > 0) {
            const products = cartData.products;
            const total = await Cart.aggregate([
              { $match: { userId: req.session.user_id } },
              { $unwind: "$products" },
              {
                $group: {
                  _id: null,
                  total: { $sum: { $multiply: ["$products.productPrice", "$products.count"] } },
                },
              },
            ]);
            const Total = total.length > 0 ? total[0].total : 0; 
            const totalAmount = Total+80;   
           const userId = userName._id;
           const userData = await User.find({})
           res.render("cart", { products:products,Total:Total,userId,session,totalAmount,user:userName,userData});
         }else {
           res.render("emptyCart", {user:userName,userData,session,message: "No Products Added to cart"});}
       }else {
         res.render("emptyCart", {user:userName,userData,session,message: "No Products Added to cart",});
       }
     } else {
       res.redirect("/login");
     }
   } catch (error) {
     console.log(error.message);
   }
 }
   


// ---------- Add to cart section start
const addToCart = async (req,res)=>{
    try{
      const userId = req.session.user_id;
     
      const userData = await User.findOne({_id:userId});
      const productId = req.body.id;
      const productData = await Product.findOne({_id:productId});
      const productQuantity = productData.stock;
      const cartData = await Cart.findOneAndUpdate({userId:userData._id},
        {
          $setOnInsert: {
            userId: userId,
            userName: userData.name,
            products: [],
          },
        },
        { upsert: true, new: true }
        );
        const updatedProduct = cartData.products.find((product) => product.productId.toString() === productId.toString());
    const updatedQuantity = updatedProduct ? updatedProduct.count : 0;

    if (updatedQuantity + 1 > productQuantity) {
      return res.json({
        success: false,
        message: "Quantity limit reached!",
      });
    }
  
      if(cartData){
        const productExists = cartData.products.some(
          (product)=>product.productId == productId
        )
        if(productExists){
          await Cart.findOneAndUpdate({
            userId:userId,
            'products.productId':productId
          },
          {
            $inc: {'products.$.count':1,'products.$.totalPrice':productData.Price}
          })
        }else{
          await Cart.findOneAndUpdate(
            { userId: userId },
            {
                $push: {
                  products: {
                    productId: productId,
                    productPrice: productData.Price,
                    totalPrice: productData.Price
                  },
                },
              }
            );        
          }
        }else{
          const newCart = new Cart({
            userId:userData._id,
            userName:userData.name,
            products:[{
              productId:productData._id,
              productPrice:productData.Price
            }]
          })
          await newCart.save();
        }
        res.json({success:true})
      }catch(error){
        console.log(error.message);
        res.status(500).json({ success: false, message: "Server Error" });
      }
    }

    

    const changeProductCount = async (req, res) => {
      try {
        const userData = req.session.user_id;
        const proId = req.body.product;
        let count = req.body.count;
        count = parseInt(count);
        const cartData = await Cart.findOne({ userId: userData });
        const product = cartData.products.find(
          (product) => product.productId.toString() === proId
        );
        const quantity = product.count;
        const productData = await Product.findOne({ _id: proId });
        
        const productQuantity = productData.stock

        const updatedCartData = await Cart.findOne({ userId: userData });
        const updatedProduct = updatedCartData.products.find(
          (product) => product.productId.toString() === proId
        );
        const updatedQuantity = updatedProduct.count;
        const price = updatedQuantity * productData.Price;
        
        if (count > 0) {
          // Quantity is being increased
          if (updatedQuantity + count > productQuantity) {
            res.json({ success: false, message: 'Quantity limit reached!' });
            return;
          }
        } else if (count < 0) {
          // Quantity is being decreased
          if (updatedQuantity <= 1 || Math.abs(count) > updatedQuantity) {
            // await Cart.updateOne(
            //   { userId: userData },
            //   { $pull: { products: { productid: proId } } }
            // );
            res.json({ success: true });
            return;
          }
        }


        const cartdata = await Cart.updateOne(
          { userId: userData, "products.productId": proId },
          { $inc: { "products.$.count": count } }
        );
    
    
        const updateCartData = await Cart.findOne({ userId: userData });
        const updateProduct = updateCartData.products.find((product) => product.productId === proId);
        const updateQuantity = updateProduct.count;

        const changePrice = updateQuantity * productData.Price;
        
        
        await Cart.updateOne(
          { userId: userData, "products.productId": proId },
          { $set: { "products.$.totalPrice": changePrice } }
          
        );
    
        res.json({ success: true });
      } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, error: error.message });
      }
    };

    
    const loadCheckout = async (req, res, next) => {
      try {
       
        const session = req.session.user_id;
        const categoryData = await Category.find();
        const userData = await User.findOne({ _id: req.session.user_id });
        const addressData = await Address.findOne({ userId: req.session.user_id });
        
        let cartData = await Cart.findOne({ userId: req.session.user_id }).populate(
          "products.productId"
        );
        const total = await Cart.aggregate([
          { $match: { userId: req.session.user_id } },
          { $unwind: "$products" },
          {
            $group: {
              _id: null,
              total: {
                $sum: { $multiply: ["$products.productPrice", "$products.count"] },
              },
            },
          },
        ]);
        const Total = total.length > 0 ? total[0].total : 0;
        const totalAmount = Total ;
        const products = cartData.products;
       
        if (req.session.user_id) {
          if (addressData) {
       
            if (addressData.addresses.length > 0) {
              const address = addressData.addresses;
              
              res.render("checkout", {
                session,
                Total,
                address,
                totalAmount,
                categoryData,
                userData,
                products
              });
            } else {
              res.render("emptyCheckout", {
                session,
                userData,
                products,
                totalAmount,
                Total,
                categoryData,
                message: "Add your delivery address",
              });
            }
          } else {
            res.render("emptyCheckout", {
              session,
              userData,
              products,
              totalAmount,
              Total,
              categoryData,
              message: "Add your delivery address",
            });
          }
        } else {
          res.redirect("/");
        }
      } catch (error) {
        next(error);
      }
    };

    const loadAddAddress = async (req, res, next) => {
      try {
        const session = req.session.user_id;
        const userId = req.session.user_id;
        const userData = await User.findOne({ _id: userId });
        const categoryData = await Category.find();
        res.render("addAddress", { categoryData, userData, session });
      } catch (error) {
        next(error);
      }
    };


    const deletecart = async (req, res,next) => {
     
      try {
        const userData = req.session.user_id;
       
        const proId = req.body.products;
        const cartData = await Cart.findOne({ userId: userData });
        if (cartData.products.length === 1) {
          const c = await Cart.deleteOne({ userId: userData });
         
        } else {
          const v = await Cart.updateOne(
            { userId: userData },
            { $pull: { products: { productId: proId } } }
          );
        }
        res.json({ success: true });
      } catch (error) {
        next(error)
        res.status(500).json({ success: false, error: error.message });
      }
    };
    


    
    
module.exports={
    addToCart,
    loadCart,
  deletecart,
    changeProductCount,
    loadCheckout,
    loadAddAddress
}    