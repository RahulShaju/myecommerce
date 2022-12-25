const mongoose = require('mongoose')
// const User = require('./userModel');


const offerSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    type:{
        type:String,    
        required:true
    },
    discount:{
        type:Number,
        required:true
    },
    usedBy:[{
        type:mongoose.Types.ObjectId,
        ref:'User',
        
    }]
})

module.exports = mongoose.model('Offer',offerSchema)