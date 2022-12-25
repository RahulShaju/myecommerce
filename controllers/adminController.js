const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Banner = require("../models/bannermodel");
const Category = require("../models/categoryModel");
const Order = require("../models/orderModel");
const Offer = require("../models/offerModel");
const { find } = require("../models/productModel");

let limit = 8;
let page;

const adminLogin = async (req, res) => {
  try {
    const adminSession = req.session;
    if (adminSession.adminId) {
      console.log("admin home");
      const categoryData = await Category.find();
      const categoryArray = [];
      const orderCount = [];

      for (let key of categoryData) {
        categoryArray.push(key.gendercategory);
        orderCount.push(0);
      }
      const completeorder = [];
      const orderData = await Order.find();
      console.log(orderData)

      for (let key of orderData) {
        const uppend = await key.populate("products.items.productId");
        completeorder.push(uppend);
      }
      console.log(completeorder.length);
      for (let i = 0; i < completeorder.length; i++) {
        for (let j = 0; j < completeorder[i].products.items.length; j++) {
          
          const catadata = 
            completeorder[i].products.items[j].productId.category;
            console.log("hihhi")
          const issExisting = categoryArray.findIndex((category) => category === catadata);
          orderCount[issExisting]++;
        } 
      }
      // console.log(catadata);
      console.log(orderCount);
      console.log(categoryArray);
      res.render("admin/admindashboard", {
        category: categoryArray,
        count: orderCount,
      });
    } else {
      res.render("admin/adminlogin");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const adminHome = async (req, res) => {
  try {
    const email = req.body.username;
    const password = req.body.logpwd;

    const userData = await User.findOne({ email: email });
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.is_admin === 0) {
          console.log("not amin");

          res.render("admin/adminlogin", {
            message: "incorrect username and password",
          });
        } else {
          console.log("its the real admin");
          const adminSession = req.session;
          adminSession.adminId = userData._id;

          res.redirect("/admin");
        }
      } else {
        res.render("admin/adminlogin", {
          message: "incorrect username and password",
        });
      }
    } else {
      res.render("admin/adminlogin", {
        message: "incorrect username and password",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const addProductLoad = async (req, res) => {
  try {
    const adminSession = req.session;
    adminSession.adminId;
    console.log(adminSession.adminId);
    const productData = await Product.find();
    const userData = await User.find({ is_admin: 0 });
    const categoryData = await Category.find();

    console.log("now you can add product");
    res.render("admin/addproduct", {
      product: productData,
      users: userData,
      category: categoryData,
    });
  } catch (error) {
    console.log(error.message);
  }
};
const insertProduct = async (req, res) => {
  try {
    const adminSession = req.session;
    adminSession.adminId;
    const pimage = req.file.filename;
    const prod = req.body.prodname;
    const cat = req.body.category;
    const pbrand = req.body.brand;
    const psize = req.body.size;
    const pprice = req.body.price;
    console.log("inserting product");
    const product = new Product({
      image: req.file.filename,
      product: req.body.prodname,
      category: req.body.category,
      brand: req.body.brand,
      size: req.body.size,
      price: req.body.price,
      qty:req.body.qty
      
    });
    const productData = await product.save();
    if (productData) {
      console.log(productData);
      res.redirect("/admin/viewproduct");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const viewProduct = async (req, res) => {
  try {
    const adminSession = req.session;
    adminSession.adminId;
    var search = "";
    if (req.query.search) {
      search = req.query.search;
    }

    const productData = await Product.find({
      is_deleted: 0,
      $or: [
        { product: { $regex: ".*" + search + ".*", $options: "i" } },
        { category: { $regex: ".*" + search + ".*", $options: "i" } },
        { brand: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
    }).limit(limit * 1)
    .skip((page - 1) * limit);
  const count = await Product.find({is_deleted:0}).countDocuments();
    if (productData) {
      res.render("admin/addedproductlist", { products: productData, totalpages: Math.ceil(count / limit),
      currentpage: page });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const adminLogout = async (req, res) => {
  const adminSession = req.session;
  adminSession.adminId = false;
  res.redirect("/admin");
};
const viewUserList = async (req, res) => {
  const adminSession = req.session;
  adminSession.adminId;
  page = 1;
  if (req.query.page) {
    page = req.query.page;
  }
  var search = "";
  if (req.query.search) {
    search = req.query.search;
  }
 
  const userData = await User.find({
    is_admin: 0,
    $or: [
      { name: { $regex: ".*" + search + ".*", $options: "i" } },
      { email: { $regex: ".*" + search + ".*", $options: "i" } },
    ],
  })
    .limit(limit * 1)
    .skip((page - 1) * limit);
  const count = await User.find({ is_admin: 0 }).countDocuments();
  if (userData) {
    res.render("admin/userlist", {
      users: userData,
      totalpages: Math.ceil(count / limit),
      currentpage: page,
    });
  }
};
const blockUser = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findByIdAndUpdate(
      { _id: id },
      { $set: { is_verified: 0 } }
    );
    console.log(userData);
    res.redirect("/admin/userlist");
  } catch (error) {
    console.log(error.message);
  }
};
const unblockUser = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findByIdAndUpdate(
      { _id: id },
      { $set: { is_verified: 1 } }
    );
    console.log(userData);
    res.redirect("/admin/userlist");
  } catch (error) {
    console.log(error.message);
  }
};
const editProduct = async (req, res) => {
  try {
    const adminSession = req.session;
    adminSession.adminId;
    const id = req.query.id;
    const productData = await Product.findById({ _id: id }, { is_deleted: 0 });
    res.render("admin/editproduct", { product: productData });
  } catch (error) {
    console.log(error.message);
  }
};
const updateProduct = async (req, res) => {
  try {
    await Product.findByIdAndUpdate(
      { _id: req.body.id },
      {
        $set: {
          image: req.file.filename,
          product: req.body.prodname,
          price: req.body.price,
          size: req.body.size,
          category: req.body.category,
        },
      }
    );
    res.redirect("/admin/viewproduct");
  } catch (error) {
    console.log(error.message);
  }
};
const deleteProduct = async (req, res) => {
  try {
    const id = req.query.id;
    await Product.updateOne({ _id: id }, { $set: { is_deleted: 1 } });
    res.redirect("/admin/viewproduct");
  } catch (error) {
    console.log(error.message);
  }
};

const addBanner = async (req, res) => {
  try {
    const userData = await User.find({ is_admin: 0 });
    const productData = await Product.find();
    const bannerList = await Banner.find();
    res.render("admin/addbanner", {
      banner: bannerList,
      users: userData,
      product: productData,
    });
  } catch (error) {
    console.log(error.message);
  }
};
const postBanner = async (req, res) => {
  try {
    let bannerlist = await Banner.find();
    if (bannerlist != null) {
      await Banner.updateOne({
        btitle: req.body.title,
        bimage: req.file.filename,
      });
      res.redirect("/admin/add-banner");
    } else {
      const banner = Banner({
        btitle: req.body.title,
        bimage: req.file.filename,
      });
      console.log(banner);
      const bannerData = await banner.save();
      res.redirect("/admin/add-banner");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const addCategory = async (req, res) => {
  try {
    const adminSession = req.session;

    const userData = await User.find({ isAdmin: 0 });
    const productData = await Product.find({ is_deleted: 0 });
    const categoryData = await Category.find();

    res.render("admin/addcategory", {
      product: productData,
      users: userData,
      category: categoryData,
      message: "category already exists",
    });
  } catch (error) {
    console.log(error.message);
  }
};
const loadCategory = async (req, res) => {
  try {
    req.session;

    const categoryData = await Category.find({
      gendercategory: req.body.gender,
    });
    console.log(categoryData);
    if (categoryData.length <= 0) {
      const category = Category({
        gendercategory: req.body.gender,
      });
      await category.save();

      res.redirect("/admin/add-category");
    } else {
      res.redirect("/admin/add-category");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const deleteCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const categoryData = await Category.findById({ _id: id });
    console.log(categoryData.gendercategory);
    const productData = await Product.find({
      category: categoryData.gendercategory,
    });
    console.log(productData);
    if (productData.length <= 0) {
      await Category.deleteOne({ _id: id });
      res.redirect("/admin/add-category");
    } else {
      res.redirect("/admin/add-category");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const orderManagement = async (req, res) => {
  try {
    const id = req.query.id;
    const orderData = await Order.find();
    res.render("admin/ordermanage", { order: orderData, id: id });
  } catch (error) {
    console.log(error.message);
  }
};
const confirmOrder = async (req, res) => {
  try {
    const id = req.query.id;
    const orderData = await Order.findByIdAndUpdate(
      { _id: id },
      { $set: { status: "confirmed" } }
    );
    console.log(orderData);
    res.redirect("/admin/order-manage");
  } catch (error) {
    console.log(error.message);
  }
};

const deliverOrder = async (req, res) => {
  try {
    const id = req.query.id;
    await Order.findByIdAndUpdate(
      { _id: id },
      { $set: { status: "delivered" } }
    );
    res.redirect("/admin/order-manage");
  } catch (error) {
    console.log(error.message);
  }
};

const cancelOrder = async (req, res) => {
  try {
    const id = req.query.id;
    await Order.deleteOne({ _id: id });
    res.redirect("/admin/order-manage");
  } catch (error) {
    console.log(error.message);
  }
};

const addOffer = async (req, res) => {
  try {
    const offerData = await Offer.find();
    res.render("admin/offer", { offer: offerData });
  } catch (error) {
    console.log(error.message);
  }
};

const storeOffer = async (req, res) => {
  try {
    const offer = new Offer({
      name: req.body.name,
      type: req.body.type,
      discount: req.body.discount,
      image: req.file.filename,
    });
    const offerData = await offer.save();
    console.log(offerData);
    res.redirect("/admin/add-offer");
  } catch (error) {
    console.log(error.message);
  }
};

const deleteOffer = async (req, res) => {
  id = req.query.id;
  await Offer.deleteOne({ _id: id });
  res.redirect("/admin/add-offer");
};

module.exports = {
  adminLogin,
  adminHome,
  addProductLoad,
  insertProduct,
  viewProduct,
  adminLogout,
  viewUserList,
  blockUser,
  unblockUser,
  editProduct,
  updateProduct,
  deleteProduct,
  addBanner,
  postBanner,
  addCategory,
  loadCategory,
  orderManagement,
  confirmOrder,
  cancelOrder,
  deliverOrder,
  addOffer,
  storeOffer,
  deleteOffer,
  deleteCategory,
};
