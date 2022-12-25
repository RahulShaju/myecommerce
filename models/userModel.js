const mongoose = require("mongoose");
const Product = require("../models/productModel");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  is_admin: {
    type: Number,
    required: true,
  },
  is_verified: {
    type: Number,
    default: 0,
  },
  cart: {
    items: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        qty: {
          type: Number,
        },
        price: {
          type: String,
          required: true,
        }
      }
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

  address: {
    details: [
      {
        userId: {
          type: mongoose.Types.ObjectId,
          ref: "Address",
          required: true,
        },
      },
    ],
  },
  wishlist: {
    items: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        qty: {
          type: Number,
        },
        price: {
          type: String,
          required: true,
        },
        
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  const cart = this.cart;

  const isExisting = cart.items.findIndex((objInItems) => {
    return (
      new String(objInItems.productId).trim() == new String(product._id).trim()
    );
  });
  if (isExisting >= 0) {
    cart.items[isExisting].qty += 1;
  } else {
    cart.items.push({ productId: product._id, qty: 1, price: product.price });
  }
  cart.totalprice += product.price;
  cart.totalqty += 1;
  console.log("User in Schema", this);
  return this.save();
};
userSchema.methods.removefromCart = async function (productId) {
  const cart = this.cart;
  const isExisting = cart.items.findIndex(
    (objInItems) =>
      new String(objInItems.productId).trim() === new String(productId).trim()
  );
  if (isExisting >= 0) {
    const prod = await Product.findById(productId);
    cart.totalprice -= prod.price * cart.items[isExisting].qty;
    cart.totalqty -= cart.items[isExisting].qty;
    cart.items.splice(isExisting, 1);

    console.log("User in schema:", this);
    return this.save();
  }
};

userSchema.methods.addToWishlist = function (product) {
  const wishlist = this.wishlist;

  const isExisting = wishlist.items.findIndex((objInItems) => {
    return (
      new String(objInItems.productId).trim() == new String(product._id).trim()
    );
  });
  if (isExisting >= 0) {
    wishlist.items[isExisting].qty = 1;
  } else {
    wishlist.items.push({
      productId: product._id,
      qty: 1,
      price: product.price,
      
    });
  }
  console.log("User in Schema", this);
  return this.save();
};
userSchema.methods.removeFromWishlist = async function (productId) {
  const wishlist = this.wishlist;
  const isExisting = wishlist.items.findIndex(
    (objInItems) =>
      new String(objInItems.productId).trim() === new String(productId).trim()
  );
  if (isExisting >= 0) {
    
    wishlist.items.splice(isExisting, 1);
    

    console.log("User in schema:", this);
    return this.save();
  }
};

module.exports = mongoose.model("User", userSchema);
