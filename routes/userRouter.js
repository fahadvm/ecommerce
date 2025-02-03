const express = require('express')
const router = express.Router()
const usercontroller = require("../controllers/user/usercontroller")

router.get('/',usercontroller.loadHomepage)
router.get('/pageNotFound',usercontroller.pageNotFound)



module.exports = router
