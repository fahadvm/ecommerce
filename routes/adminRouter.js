const express = require('express')
const router = express.Router()
const admincontroller = require("../controllers/admin/adminController")
const customerController = require("../controllers/admin/customerController")
const categoryController = require('../controllers/admin/categoryController')
const productController = require('../controllers/admin/productController')
const { adminAuth } = require('../middlewares/auth');
const multer = require("multer");
const upload = multer();





router.get('/login',admincontroller.loadLogin)
router.post('/login',admincontroller.login);
router.get('/', adminAuth, admincontroller.loadDashboard);
router.get('/logout',admincontroller.logout);
router.get('/pageerror', admincontroller.pageError);


router.get('/users', adminAuth, customerController.customerInfo);
router.get('/blockCustomer', adminAuth, customerController.customerBlocked);
router.get('/unBlockCustomer', adminAuth, customerController.customerUnblocked);


router.get('/category',adminAuth,categoryController.categoryInfo)
router.post('/addcategory',adminAuth,categoryController.addCategory)
router.post('/addCategoryOffer', adminAuth,categoryController.addCategoryOffer);
router.post("/editCategoryOffer",adminAuth, categoryController.editCategoryOffer)
router.post("/removeCategoryOffer",adminAuth, categoryController.removeCategoryOffer)
router.post('/editCategory/:id',adminAuth, categoryController.editCategory);
router.get('/listCategory',adminAuth,categoryController.getListCategory);
router.get('/unListCategory', adminAuth, categoryController.getUnlistCategory);
router.delete("/deleteCategory/:id",adminAuth, categoryController.deleteCategory)
router.get('/editCategory', adminAuth,categoryController.getEditCategory);


router.get("/addProducts",adminAuth,  productController.getProductAddPage);
router.post("/saveImage", adminAuth, upload.single('image'), productController.saveImage);
router.post("/addProducts",adminAuth,  upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 }
]), productController.addProducts);


router.get("/products",adminAuth,productController.getAllProducts);
router.post("/addProductOffer",adminAuth,productController.addProductOffer);
router.post("/removeProductOffer",adminAuth,productController.removeProductOffer);

router.get("/blockProduct",adminAuth,productController.blockProduct);
router.get("/unblockProduct",adminAuth,productController.unblockProduct);

router.get('/deleteProduct',adminAuth,productController.deleteProduct);

router.get("/editProduct",adminAuth,productController.getEditProduct)
router.post("/deleteImage",adminAuth,productController.deleteSingleImage)

router.post("/editProduct/:id", adminAuth,upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 }
]), productController.editProduct);

















module.exports = router;