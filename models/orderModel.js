const mongoose= require('mongoose')


const orderSchema = mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  payment: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  address2: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  pin: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobileno: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    immutable: true,
    default: () => Date.now(),
  },
  discount:{
    default:0,
   type:Number,
  },
  products: {
    items: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
          
        },
        qty: {
          type: Number,
          // required:true
        },
        price: {
          type: Number,
        },
      },
    ],
    totalprice: {
      type: Number,
      default: 0,
    },
    totalqty: {
      type: Number,
      default: 0,
    },
  },
  status: {
    type: String,
    default: "Attempted",
  },
  offer:{
    type:String,
    default:"None"
  },
  productReturned :[{
    type:Number
  }]
});

// orderSchema.methods.addToOrders = function (product) {
//   const products = this.products;
//   const isExisting = products.item.findIndex((objInItems) => {
//     return (
//       new String(objInItems.productId).trim() == new String(product._id).trim()
//     );
//   });
//   if (isExisting >= 0) {
    
//     cart.products[isExisting].qty += 1;
//   } else {
    
//     cart.products.push({ productId: product._id, qty: 1 });
//   }
 
//   cart.totalprice += product.price;
//   console.log("User in schema:", this);
//   return this.save();
// };


module.exports= mongoose.model("Orders", orderSchema);
