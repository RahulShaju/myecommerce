const express = require('express')
const userRouter = express();

const auth = require('../middlewares/auth')
const userController = require('../controllers/userController')

userRouter.get("/", userController.loadLanding);

userRouter.get("/register", auth.isLogout, userController.loadRegister);
userRouter.post("/register", userController.insertUser);
userRouter.post("/otp-register", userController.ConfirmOtp);

userRouter.get("/login",auth.isLogout, userController.loginLoad);
userRouter.post("/login", userController.userHome);
userRouter.get("/profile", auth.isLogin, userController.userProfile);
userRouter.get("/view-product-details", userController.viewProductDetails);


userRouter.get('/product-store',userController.productStore)
userRouter.get('/shop-category',userController.shopCategory)

userRouter.get('/add-address',auth.isLogin,userController.addAddress)
userRouter.post('/add-address',userController.storeAddress)
userRouter.get('/delete-address',userController.deleteAddress)


userRouter.get("/add-to-cart", userController.addToCart)
userRouter.get("/view-cart", auth.isLogin, userController.viewCart)
userRouter.get("/delete-cart", userController.deleteCart)

userRouter.get('/add-to-wishlist',userController.addToWishlist)
userRouter.get('/view-wishlist',userController.viewWishlist)
userRouter.get('/wishlist-to-cart',userController.wishlistToCart)
userRouter.get('/delete-wish',userController.deleteWish) 

// userRouter.get('/add-address',userController.addAddress)

userRouter.post("/edit-quantity", userController.editQty);

userRouter.get("/checkout", auth.isLogin, userController.loadCheckout);
userRouter.post("/checkout", userController.storeOrder);
userRouter.get("/order-success", auth.isLogin, userController.orderSuccess);

userRouter.get("/view-order", userController.viewOrder);
userRouter.get("/cancel-order", userController.cancelOrder);
userRouter.get("/logout", auth.isLogin, userController.userLogout);
userRouter.get('/return-product',auth.isLogin,userController.returnProduct)
 
userRouter.post('/apply-coupon',auth.isLogin,userController.applyCoupon)
userRouter.get('/show-coupons',auth.isLogin,userController.showCoupons)
userRouter.get('/current-order-summary',auth.isLogin,userController.currentOrderSummary)
module.exports= userRouter;
 