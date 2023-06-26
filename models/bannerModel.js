const mongoose = require('mongoose')

const bannerSchema = new mongoose.Schema({
    image:{
        type:Array,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    is_delete:{
        type:Boolean,
        default:false
    }
    

})

module.exports = mongoose.model('Banner',bannerSchema)