const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Banner = require("../models/bannermodel");
const Orders = require("../models/orderModel");
const Offer = require("../models/offerModel");
const fast2sms = require("fast-two-sms");

const Category = require('../models/categoryModel')
const Address = require('../models/addressModel')

let isLoggedIn;
let newOtp;
let newUser;
let page;

let currentOrder

let limit =8;

let couponWarning;
let offer = {
  name: "None",
  type: "None",
  discount: 0,
  usedBy: false,
};
let couponTotal = 0;
let noCoupon = true;
let appliedCoupon = 0;

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const loadLanding = async (req, res) => {
  try {
    const userSession = req.session;
    const bannerDetails = await Banner.find();
    page = 1;
    if (req.query.page) {
      page = req.query.page;
    }
    var search = "";
  if (req.query.search) { 
    search = req.query.search;
  }
    limit = 8;
    const productData = await Product.find({
      is_deleted: 0,
      $and: [
        { category: { $regex: ".*" + search + ".*", $options: "i" } },
        { brand: { $regex: ".*" + search + ".*", $options: "i" } },
      ]
    })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const count = await Product.find({is_deleted:0}).countDocuments();
    console.log(count);
    if (userSession.userId) {
      appliedCoupon = 0;
      res.render("user/userhome", {
        isLoggedIn: true,
        product: productData,
        totalpages: Math.ceil(count / limit),
        currentpage: page,
        banner: bannerDetails,
      });
    } else {
      res.render("user/userhome", {
        isLoggedIn: false,
        product: productData,
        totalpages: Math.ceil(count / limit),
        currentpage: page,
        banner: bannerDetails,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadRegister = async (req, res) => {
  try {
    console.log("get registration page");
    
    res.render("user/userregistration", { is_Reg: false });
    
  } catch (error) {
    console.log(error.message);
  }
};
const sendMessage = function (number, message, res) {
  let randomOTP = Math.floor(Math.random() * 10000);
  var options = {
    authorization:
      "MSOj0bTnaP8phCARmWqtzkgEV4ZN2Ff9eUxXI7iJQ5HcDBKsL1vYiamnRcMxrsjDJboyFEXl0Sk37pZq",
    message: `your verification code is ${randomOTP}`,
    numbers: [number],
  };
  //send this message

  fast2sms
    .sendMessage(options)
    .then((response) => {
      console.log("otp sent succcessfully");
    })
    .catch((error) => {
      console.log(error);
    });
  return randomOTP;
};
const insertUser = async (req, res) => {
  try {
    const usernameAlreadyExists = await User.findOne({ email: req.body.email });
    const mobileNumberAlreadyExists = await User.findOne({
      mobile: req.body.mobile,
    });
    if (!usernameAlreadyExists) {
      console.log("registering user");
      const spassword = await securePassword(req.body.password);
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,
        password: spassword,
        is_admin: 0,
      });
      const userData = await user.save();
      if (userData) {
        console.log(userData);
        newUser = userData._id;
        console.log("data collected  and waiting for otp");
        const otp = sendMessage(userData.mobile);
        newOtp = otp;
        console.log(newOtp);
        res.render("user/otpregistration");
      } else {
        res.render("user/userregistration", { message: "registration failed" });
      }
    } else {
      res.render("user/userregistration", { message: "user already exists" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const ConfirmOtp = async (req, res) => {
  try {
    const userData = await User.findById({ _id: newUser });
    console.log(userData);
    console.log(newOtp);
    if (req.body.otp == newOtp) {
      console.log(" otp confirmed ");
      const userData = await User.findByIdAndUpdate(
        { _id: newUser },
        { $set: { is_verified: 1 } }
      );
      console.log(userData);
      // res.redirect('/register')
      res.redirect("/login");
    } else {
      res.render("user/otpregistration", { message: "invalid OTP" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loginLoad = async (req, res) => {
  try {
    console.log("login page");
    res.render("user/userlogin");
  } catch (error) {
    console.log(error.message);
  }
};
const userHome = async (req, res) => {
  try {
    const username = req.body.username;
    const logpassword = req.body.logpwd;

    const userData = await User.findOne({ email: username });
    if (userData) {
      console.log(userData);
      const PassWordMatch = await bcrypt.compare(
        logpassword,
        userData.password
      );
      if (PassWordMatch) {
        if (userData.is_verified === 1) {
          const userSession = req.session;
          userSession.userId = userData._id;
          appliedCoupon = 0;
          console.log(userSession.userId);
          res.redirect("/");
        } else {
          res.render("user/userlogin", { message: "You are blocked" });
        }
      } else {
        const userSession = req.session;
        userSession.userId = false;
        isLoggedIn = false;
        res.render("user/userlogin", {
          message: "incorrect username and password ",
        });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};
const userProfile = async (req, res) => {
  try {
    const userSession = req.session;
    userSession.userId;
    console.log(userSession.userId);
    const userData = await User.findOne({ _id: userSession.userId });
    const orderData = await Orders.find({ userId: userSession.userId });
    const addressData = await Address.find()
    console.log(userSession.userId);
    console.log("userprofile");

    res.render("user/userprofile", { user: userData, userOrders: orderData,address:addressData });
  } catch (error) {
    console.log(error);
  }
};
const userLogout = async (req, res) => {
  try {
    const userSession = req.session;
    userSession.userId = false;
    var page = 1;
    if (req.query.page) {
      page = req.query.page;
    }
    console.log("logout");
    limit = 8;
    const productData = await Product.find({is_deleted:0});
    const count = await Product.find({is_deleted:0}).countDocuments();
    isLoggedIn = false;

    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
};
const viewProductDetails = async (req, res) => {
  try {
    
    const id = req.query.id;
    const productData = await Product.findById({ _id: id },{is_deleted:0});
    const relatedProduct = await Product.find({is_deleted:0});
    if(userSession.userId){
    res.render("user/viewproductdetails", {
      product: productData,
      relproduct: relatedProduct,
      isLoggedIn: true,
    });
  } else{
    res.render("user/viewproductdetails", {
      product: productData,
      relproduct: relatedProduct,
      isLoggedIn: false,
    })
  }
 } catch (error) {
    console.log(error.message);
  }
}


const productStore = async (req, res) => {
  try {
    const userSession = req.session;
     page =1
     var search = "";
     if (req.query.search) {
       search = req.query.search;
     }
    if (req.query.page) {
      page = req.query.page;
    }
    
     const categoryData = await Category.find()
     const categoryName = req.query.id
    console.log(categoryName)
    const count = await Product.find({is_deleted:0}).countDocuments();
    const productData = await Product.find({is_deleted:0,
      $or: [
        { product: { $regex: ".*" + search + ".*", $options: "i" } },
        { category: { $regex: ".*" + search + ".*", $options: "i" } },
        { brand: { $regex: ".*" + search + ".*", $options: "i" } },
      ]})
      .limit(limit * 1)
      .skip((page - 1) * limit);
      console.log(productData)

    if (userSession.userId) {
      res.render("user/productstore", {
        product: productData,
        isLoggedIn: true, 
        totalpages: Math.ceil(count / limit),
        currentpage: page,
        category:categoryData
        
      });
    } else {
      console.log("landing product store")
      res.render("user/productstore", {
        product: productData,
        isLoggedIn: false,
        totalpages: Math.ceil(count / limit),
        currentpage: page,
        category:categoryData
        
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const shopCategory = async (req, res) => {
  try {
    const userSession = req.session;
    console.log("showing different categoriies")

    if (req.query.page) {
      page = req.query.page;
    }
    const categoryName = req.query.id
     const categoryData = await Category.find()
    console.log(categoryName)
    const productData = await Product.find({is_deleted:0}&&{category:categoryName})
      .limit(limit * 1)
      .skip((page - 1) * limit);
      console.log(productData)
      const count = productData.length

    if (userSession.userId) {
      res.render("user/shopcategory", {
        product: productData,
        isLoggedIn: true,
        totalpages: Math.ceil(count / limit),  
        currentpage: page,
        category:categoryData
        
      });
    } else {
      console.log("landing shop category page")
      res.render("user/shopcategory", {
        product: productData,
        isLoggedIn: false,
        totalpages: Math.ceil(count / limit),
        currentpage: page,
        category:categoryData
        
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const addAddress = async(req,res)=>{
  try {
    const userSession = req.session
    res.render("user/addressform")
  } catch (error) {
    console.log(error.message)
  }
}

const storeAddress = async(req,res)=>{

  try {
    const userSession= req.session
    const addressData = Address({
      userId: userSession.userId,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      country: req.body.country,
      address: req.body.address,
      address2: req.body.address2,
      city: req.body.city,
      state: req.body.state,
      pin: req.body.pin,
      email: req.body.email,
      mobileno: req.body.mobileno,
      
    })

    const address = await addressData.save()
    console.log(address)
    res.redirect('/profile')
  } catch (error) {
    console.log(error.message)
  }
}
const deleteAddress = async (req,res)=>{
  try {
    const id = req.query.id
  const addressData = await Address.findByIdAndDelete({_id:id})
  res.redirect("/profile")
  } catch (error) {
    console.log(error.message)
  }
}

const addToCart = async (req, res) => {
  try {
    const userSession = req.session;
    const productId = req.query.id;

    noCoupon = true;
    const userData = await User.findById({ _id: userSession.userId });
    const productData = await Product.findById({ _id: productId },{is_deleted:0});

    console.log(productData);
    userData.addToCart(productData);
   
    res.json({status:true})
    
  } catch (error) {
    console.log(error.message);
  }
};

const viewCart = async (req, res) => {
  try {
      const userSession = req.session;
      var id = req.query.id
      const userData = await User.findById({ _id: userSession.userId });
      const completeUser = await userData.populate("cart.items.productId");
      console.log(completeUser);
      if (userData.cart.items.length == 0) {
        console.log("your cart");
        res.render("user/cart", {
          id: userSession.userId,
          cartProducts: completeUser.cart,
          isCouponVerified: noCoupon,
          appliedCoupon,
          empty: true,
        });
      } else {
        console.log("your cart2");
        res.render("user/cart", {
          id: userSession.userId,
          cartProducts: completeUser.cart,
          empty: false,
          appliedCoupon,
          isCouponVerified: noCoupon,
          warning: couponWarning,
          code:id
        });
      }
   
  } catch (error) {
    console.log(error);
  }
};
const deleteCart = async (req, res, next) => {
  try {
    const productId = req.query.id;
  const userSession = req.session;
  const userData = await User.findById({ _id: userSession.userId });
  userData.removefromCart(productId);
  res.redirect("/view-cart");
  } catch (error) {
    console.log(error.message)
  }
};
const editQty = async function (req, res) {
  console.log("gfgehwjk");
  try {
    console.log("edit quantity function working");
    const id = req.query.id;
    console.log(id, " : ", req.body.qty);
    const userSession = req.session;

    const userData = await User.findById({ _id: userSession.userId });
    const foundProduct = userData.cart.items.findIndex(
      (objInItems) => new String(objInItems._id).trim() == new String(id).trim()
    );
    console.log("product found at: ", foundProduct);

    userData.cart.items[foundProduct].qty = req.body.qty;
    console.log(userData.cart.items[foundProduct]);
    userData.cart.totalprice = 0;

    const totalprice = userData.cart.items.reduce((acc, curr) => {
      return acc + curr.price * curr.qty;
    }, 0);
    const totalqty = userData.cart.items.reduce((acc, curr) => {
      acc = acc + curr.qty;
      return acc;
    }, 0);
    userData.cart.totalprice = totalprice;
    userData.cart.totalqty = totalqty;
    await userData.save();

    res.redirect("/view-cart");
  } catch (error) {
    console.log(error.message);
  }
};
const addToWishlist = async (req, res) => {
  try {
    const userSession = req.session;
    const productId = req.query.id;
    const userData = await User.findById({ _id: userSession.userId });
    const productData = await Product.findById({ _id: productId },{is_deleted:0});
    console.log(productData);
    await userData.addToWishlist(productData);
    res.json({status:true})
   
  } catch (error) {
    console.log(error.message);
  }
};

const viewWishlist = async (req, res) => {
  try {
    const userSession = req.session;
    if (userSession.userId) {
      const userData = await User.findById({ _id: userSession.userId });
      const completeUser = await userData.populate("wishlist.items.productId");
      console.log(completeUser);

      if (userData.wishlist.items.length == 0) {
        res.render("user/wishlist", {
          id: userSession.userId,
          wishProducts: completeUser.wishlist,
          empty: true,
        });
      } else {
        res.render("user/wishlist", {
          id: userSession.userId,
          wishProducts: completeUser.wishlist,
          empty: false,
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const wishlistToCart = async(req,res)=>{
  try {
  const userSession = req.session
  const productId = req.query.id
  const userData = await User.findById({ _id:userSession.userId})
  const productData = await Product.findById({_id:productId})
  const add = await userData.addToCart(productData)
  if(add){
  await userData.removeFromWishlist(productId)
  }
  res.redirect('/view-wishlist')
  } catch (error) {
    console.log(error.message)
  }
}

const deleteWish = async (req, res, next) => {
  try {
    const productId = req.query.id;
    const userSession = req.session;
    const userData = await User.findById({ _id: userSession.userId });
    userData.removeFromWishlist(productId);
    res.redirect("/view-wishlist");
  } catch (error) {
    console.log(error.message);
  }
};

const loadCheckout = async (req, res) => {
  try {
    const id = req.query.id
    console.log("load checkout");
    const userSession = req.session;
      const userData = await User.findById({ _id: userSession.userId });
      const completeUser = await userData.populate("cart.items.productId");
      console.log(id)
      if(!id){
      var addressData = await Address.find()
      console.log(completeUser);
      }else{
        var addressData = await Address.findById({_id:id})
      }

    if (noCoupon == false) {
      
      console.log(completeUser);
      console.log("have coupon");
      res.render("user/checkout", {
        cartProducts: completeUser.cart,
        offer: offer,
        couponTotal: couponTotal,
        address:addressData,
        noCoupon: noCoupon,
        id
        
      });
    } else {
      
      console.log("no coupon");
      res.render("user/checkout", {
        cartProducts: completeUser.cart,
        noCoupon: noCoupon,
        couponTotal: couponTotal,
        offer: offer,
        address:addressData,
        id
        
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const storeOrder = async (req, res) => {
  try {
    const userSession = req.session;

    const userData = await User.findById({ _id: userSession.userId });
    const completeUser = await userData.populate("cart.items.productId");
    
    noCoupon = true;
    updatedTotal = await userData.save();
    console.log("CompleteUser: ", completeUser);
    if (completeUser.cart.totalprice > 0) {
      const orderData = Orders({
        userId: userSession.userId,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        country: req.body.country,
        address: req.body.address,
        address2: req.body.address2,
        city: req.body.city,
        state: req.body.state,
        pin: req.body.pin,
        email: req.body.email,
        mobileno: req.body.mobileno,
        payment: req.body.payment,
        products: completeUser.cart,
        offer: offer.name,
        discount:offer.discount
      });
      let orderProductStatus = [];
      for (let key of orderData.products.items) {
        orderProductStatus.push(0);
      }
      // console.log('orderProductStatus',orderProductStatus);
      orderData.productReturned = orderProductStatus;

      console.log(req.body.payment);
      await orderData.save();
      console.log(orderData);
       currentOrder = orderData._id

      const offerUpdate = await Offer.updateOne(
        { name: offer.name },
        { $push: { usedBy: userSession.userId } }
      );

      if (req.body.payment == "COD") {
        noCoupon = true;
        res.redirect("/order-success");
      } else if (req.body.payment == "PayPal") {
        res.render("user/paypal", {
          userId: userSession.userId,
          total: completeUser.cart.totalprice,
        });
      } else {
        res.redirect("/");
      }
    } else {
      res.redirect("/checkout");
      console.log(" why redirecting?");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//payment success
const orderSuccess = async (req, res) => {
  try {
    console.log("order success");
    const userSession = req.session;

    console.log(userSession.userId);

    const orderData = await Orders.find({ userId: userSession.userId });
    console.log(orderData);

    await User.updateOne(
      { _id: userSession.userId },
      {
        $set: {
          "cart.items": [],
          "cart.totalprice": "0",
          "cart.totalqty": "0",
        },
      },
      { multi: true }
    );
    await Orders.findOneAndUpdate(
      { userId: userSession.userId,_id:currentOrder},
      { $set: { status: "waiting for confirmation" } }
    ).sort({ createdAt: -1 });
    console.log("Order Built and Cart is Empty.");
    const offerData = await Offer.find();
    console.log(offerData);

    res.render("user/ordersuccesspage");
  } catch (error) {
    console.log(error.message);
  }
};

//view orders
const viewOrder = async (req, res) => {
  try {
    const userSession = req.session;

    const id = req.query.id;
    currentOrder = id
    const orderData = await Orders.findById({ _id: id });
    const userData = await User.findById({ _id: userSession.userId });
    const order = await orderData.populate("products.items.productId");
    console.log(order);
    res.render("user/vieworder", { order: order, user: userData });
  } catch (error) {
    console.log(error.message);
  }
};
// cancel order
const cancelOrder = async (req, res) => {
  try {
    const userSession = req.session;

    const id = req.query.id;
    console.log(id);
    await Orders.deleteOne({ _id: id });
    res.redirect("/profile");
  } catch (error) {
    console.log(error.message);
  }
};

const returnProduct = async (req, res) => {
  try {
    userSession = req.session;
   
      const id = req.query.id;
      
      const productOrderData = await Orders.findById({
        _id: currentOrder,
      });
     
      const productData = await Product.findById({ _id: id });
      if (productOrderData) {
        for (let i = 0; i < productOrderData.products.items.length; i++) {
          if (
            new String(productOrderData.products.items[i].productId).trim() ===
            new String(id).trim()
          ) {
           
            productOrderData.productReturned[i] = 1;
            console.log('found!!!');
           
            await productData.save().then(() => {
              console.log('productData saved');
            });
            console.log(
              'productOrderData.productReturned[i]',
              productOrderData.productReturned[i]
            );
            await productOrderData.save().then(() => {
              console.log('productOrderData saved');
            });
          } else {
            // console.log('Not at position: ',i);
          }
        }
        res.redirect('/profile');
      }
    
     
  } catch (error) {
    console.log(error);
  }
};

const showCoupons = async(req,res)=>{
  try {
    
    const offerData = await Offer.find()
    
    res.render('user/coupons',{offer:offerData})
    
  } catch (error) {
    console.log(error.message)
  }
}

const applyCoupon = async (req, res) => {
  try {
    const userSession = req.session;
    const userData = await User.findById({ _id: userSession.userId });
    const offerData = await Offer.findOne({ name: req.body.coupon });

    console.log(offerData);

    if (offerData) {
      console.log(offerData.usedBy);
      console.log(userSession.userId);
      noCoupon = offerData.usedBy.includes(userSession.userId);
      if (noCoupon) {
        console.log("not freshcoupon");
        appliedCoupon = 1;

       offer.usedBy = true;
        res.redirect("/view-cart");
      } else {
        appliedCoupon = 0;
       Offer.usedBy = false;
        offer.name = offerData.name;
        offer.type = offerData.type;
        offer.discount = offerData.discount;
        let updatedTotal = 
          userData.cart.totalprice -
          (userData.cart.totalprice * offer.discount) / 100;
        couponTotal = updatedTotal;
        res.redirect("/view-cart");
      }
    } else {
      res.redirect("/view-cart");
    }
    // } else {
    //   couponWarning = "invalid Coupon";
    //   couponVerified=0;
    //   res.redirect("/view-cart");
    // }
  } catch (error) {
    console.log(error.message);
  }
};
const currentOrderSummary = async(req,res)=>{
  try {
    const userSession = req.session;
    const orderData = await Orders.findById({ _id: currentOrder});
    const userData = await User.findById({ _id: userSession.userId });
    const order = await orderData.populate("products.items.productId");
    
    res.render("user/currentordersummary", { order: order, user: userData });
  } catch (error) {
    console.log(error.message);
  }

}


module.exports = {
  loadLanding,
  securePassword,
  loadRegister,
  insertUser,
  userHome,
  loginLoad,
  userProfile,
  userLogout,
  viewProductDetails,
  addToCart,
  viewCart,
  deleteCart,
  editQty,
  loadCheckout,
  ConfirmOtp,
  storeOrder,
  orderSuccess,
  cancelOrder,
  viewOrder,
  productStore,
  shopCategory,
  addToWishlist,
  viewWishlist,
  deleteWish,
  applyCoupon,
  showCoupons,
  wishlistToCart,
  returnProduct,
  currentOrderSummary,
  addAddress,
  storeAddress,
  deleteAddress,
  
};
