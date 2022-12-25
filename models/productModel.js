const mongoose = require('mongoose')

const productSchema =mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  product: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  qty:{
    type: Number,
    default: 1,
    required: true,
  },
  is_verified: {
    type: Number,
    default: 1,
    required: true,
  },
  is_deleted:{
    type:Number,
    default:0,
    required:true
  },
  soldqty:{
    type:Number,
    default:0
  }
})

module.exports = mongoose.model("Product", productSchema);
