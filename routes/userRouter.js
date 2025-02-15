const express = require('express')
const router = express.Router()
const usercontroller = require("../controllers/user/usercontroller")
const productController = require("../controllers/user/productController")
const {resetPasswordMiddleware,blockLoggedInUsers, checkBlockedUser} = require("../middlewares/profileAuth")
const profileController =  require('../controllers/user/profileController')
const passport = require('passport')

router.get('/',checkBlockedUser,usercontroller.loadHomepage)
router.get('/pageNotFound',usercontroller.pageNotFound)
router.get('/signup',usercontroller.loadsignup)
router.post('/signup',usercontroller.signup)
router.get('/login',usercontroller.loadlogin)
router.post('/login',usercontroller.login)
router.post('/verify-otp',usercontroller.verifyOtp)
router.get('/logout',usercontroller.logout)


router.get('/profile',)

router.get("/forgot-password",blockLoggedInUsers,profileController.getForgotPassPage)
router.post("/forgot-email-valid",blockLoggedInUsers,profileController.forgotEmailValid)
router.post("/verify-passForgot-otp",blockLoggedInUsers,profileController.verifyForgotPassOtp)
router.get("/reset-password",resetPasswordMiddleware,profileController.getResetPassPage)
router.post("/resend-forgot-otp",blockLoggedInUsers,profileController.resendOtp);
router.post("/reset-password",resetPasswordMiddleware,profileController.postNewPassword);



router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/signup' }), async (req, res) => {
    try {
        req.session.user = req.user._id;
        res.redirect('/');
    } catch (error) {
        console.log("Google login error:", error);
        res.redirect('/signup');
    }
});

router.get("/shop",usercontroller.loadShoppingPage);
router.get("/productDetails",productController.productDetails);























module.exports = router
