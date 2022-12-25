const express= require('express')
const adminRouter = express();
const adminAuth = require('../middlewares/adminAuth')
const  path = require('path')
const adminController =require('../controllers/adminController')


const multer= require('multer')
const storage =multer.diskStorage({
  destination: function (req, file, cb) {
  
    cb(null, path.join(__dirname, "../public/productImages"));
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

adminRouter.get("/", adminController.adminLogin);
adminRouter.post("/login", adminController.adminHome);
adminRouter.get(
  "/insertproduct",
  adminAuth.isLogin,
  adminController.addProductLoad
); 
adminRouter.post( 
  "/insertproduct",
  upload.single("gimage"),
  adminController.insertProduct
);
adminRouter.get("/viewproduct", adminAuth.isLogin, adminController.viewProduct);
adminRouter.get("/userlist", adminAuth.isLogin, adminController.viewUserList);
adminRouter.get("/logout", adminAuth.isLogin, adminController.adminLogout);
adminRouter.get("/blockuser", adminController.blockUser);
adminRouter.get("/unblockuser", adminController.unblockUser);
adminRouter.get("/delete-product",adminController.deleteProduct)
adminRouter.get("/editproduct", adminAuth.isLogin, adminController.editProduct);
adminRouter.post(
  "/editproduct",
  upload.single("gimage"),
  adminController.updateProduct
);
adminRouter.get("/add-banner",adminAuth.isLogin, adminController.addBanner);
adminRouter.post(
  "/add-banner",
  upload.single("gimage"),
  adminController.postBanner
);
adminRouter.get("/deleteproduct", adminController.deleteProduct);

adminRouter.get(
  "/add-category",
  adminAuth.isLogin,
  adminController.addCategory
);
adminRouter.post(
  "/add-category",
  adminAuth.isLogin,
  adminController.loadCategory
);
adminRouter.get('/delete-category',adminController.deleteCategory)
adminRouter.get('/order-manage',adminAuth.isLogin,adminController.orderManagement)
adminRouter.get('/confirm-order',adminController.confirmOrder)
adminRouter.get('/delivered-order',adminController.deliverOrder)
adminRouter.get('/cancel-order',adminController.cancelOrder)

adminRouter.get('/add-offer',adminAuth.isLogin,adminController.addOffer)
adminRouter.post('/add-offer',upload.single("gimage"),adminController.storeOffer)
adminRouter.get('/delete-offer',adminController.deleteOffer) 



module.exports = adminRouter
