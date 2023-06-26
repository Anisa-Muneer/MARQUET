const mongoose = require ('mongoose');


 const productScheme = new mongoose.Schema({

    product : {
        type :String,
        required :true,
    },
    stock:{
        type:String,
        required:true
    },
    Price : {
       type : Number,
       required:true
    },
    image:{
        type : Array,
        required: true
    },
    Category : {
        type : String,
        required:true,
    },
    Status:{
        type :Boolean,
        default:true
    },
    description : {
        type :String,
        required:true,
    },
    is_delete:{
        type:Boolean,
        default:false
    }
 })

 module.exports = mongoose.model ('Product',productScheme);





 