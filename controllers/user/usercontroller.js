const User = require("../../models/userSchema")
const Product = require("../../models/productSchema")
const Category = require("../../models/categorySchema");

const nodemailer = require("nodemailer")
const env = require('dotenv').config()
const bcrypt = require('bcrypt')




const signup = async (req, res) => {
    try {
        const { username, phone, email, password, cPassword } = req.body;
        console.log(username)

        // if (password !== cPassword) {
        //     return res.render("user/signup", { message: "Passwords don not match" });
        // }

        const findUser = await User.findOne({ email });
        if (findUser) {
            return res.render("user/signup", { message: "User with this email already exists" });
        }
        const otp = generateOtp();
        const emailSent = await sendVerificationEmail(email, otp)

        if (!emailSent) {
            return res.json('email-error')
        }
        req.session.userOtp = otp;
        req.session.userData = { username, phone, email, password };

        res.render("user/verify-otp")
        console.log("otp send", otp)
    }
    catch (error) {
        console.log("signup error", error)
        res.redirect('/pageNotFound')
    }

}

const loadsignup = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.render("user/signup", { message: "" });
        } else {
            res.redirect('/')

        }
    } catch (error) {
        return res.redirect("/pageNotFound")
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const findUser = await User.findOne({ isAdmin: 0, email: email });

        if (!findUser) {
            return res.render('user/login', { message: 'User not found' });
        }

        if (findUser.isBlocked == true) {
            return res.render('user/login', { message: 'User is blocked by admin' });
        }

        const passwordMatch = await bcrypt.compare(password, findUser.password);

        if (!passwordMatch) {
            return res.render('user/login', { message: 'Incorrect password' });
        }

        req.session.user = findUser._id;
        console.log('in login session.user:', req.session.user)
        return res.redirect('/');           
    } catch (error) {
        console.log('login error:', error);
        return res.render("user/login", { message: "Login failed. Please try again later" });
    }
};

const loadlogin = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.render("user/login", { message: "" });
        } else {
            res.redirect('/')

        }
    } catch (error) {
        return res.redirect("/pageNotFound")
    }
}

const loadHomepage = async (req, res) => {
    try {
        const user = req.session.user;
        console.log("User from session:", req.session.user);
        const categories = await Category.find({isListed:true})
        let productData = await Product.find({
            isBlocked:false,
            category:{$in:categories.map(category=>category._id)},
            stock:{$gt:0},
        })

        productData.sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt))
        productData = productData.slice(0,3);


        if (user) {
            const userData = await User.findOne({ _id: user })

            return res.render("user/home", { user: userData, products:productData})


        } else {
            return res.render("user/home", { user: null,products:productData,req:req})
        }
    } catch (error) {
        console.log("not found")
        res.status(404).send("not found")
    }
}

const pageNotFound = async (req, res) => {
    try {
        res.render("user/page-404")
    } catch (error) {
        res.redirect("/pageNotFound")
    }
}

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
    } catch (error) {
        console.log('in hashing password', error)
    }
}

const verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        console.log(`coming otp:`, otp);

        if (otp === req.session.userOtp) {
            const user = req.session.userData
            const passwordHash = await securePassword(user.password);

            const saveUserData = new User({
                username: user.username,
                email: user.email,
                phone: user.phone,
                password: passwordHash,
            })
            await saveUserData.save()
            req.session.user = saveUserData._id;
            res.json({ success: true, redirectUrl: "/" })
        }
        else {
            return res.status(400).json({ success: false, message: "Invalid Otp,please try again" })
        }
    } catch (error) {
        console.log("error varifying otp", error)
        res.status(500).json({ success: false, message: "an error occured" })
    }
}

const resendOtp = async (req, res) => {
    try {
        const { email } = req.session.userData
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is not found in session" })
        }

        const otp = generateOtp()
        req.session.userData = otp

        const emailSent = await sendVerificationEmail(email, otp)
        if (emailSent) {
            console.log('resend otp:', otp)
            res.status(200).json({ success: true, message: 'OTP resend successfully' })
        }
        else {
            res.status(500).json({ success: false, message: "Failed to resend OTP. please try again" })
        }


    } catch (error) {
        console.log('error resending otp:', error)
        res.status(500).json({ success: false, message: "internal error server. please try again" })

    }
}

const logout = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.log('session destructuring error:', err.message)
                return res.redirect('/pageNotFound')
            }
            return res.redirect('/login')
        })

    } catch (error) {
        console.log('logout error', error)
        return res.redirect('/pageNotFound')
    }
}

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendVerificationEmail(email, otp) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PASSWORD
            }
        })
        const info = await transporter.sendMail({
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: "Verify your account",
            text: `Your OTP is ${otp}`,
            html: `<b>Your OTP: ${otp}</b>`,
        })
        return info.accepted.length > 0
    }
    catch (error) {
        console.log(`error sending email`, error)
        return false;
    }
}


const loadShoppingPage = async (req, res) => {
    try {
        const user = req.session.user;
        const userData = await User.findOne({ _id: user });

        const { search, category, sort, minPrice, maxPrice, page = 1 } = req.query;
        const perPage = 9;
        
        console.log(req.query); // Debugging query parameters
        const categories = await Category.find({isListed:true})

        let filter = { isBlocked: false, stock: { $gt: 0 } ,category:{$in:categories.map(category=>category._id)},};

        // Search query
        if (search) {
            filter.productName = { $regex: search, $options: "i" };
        }

        // Category filter
        if (category) {
            filter.category = category;
        }

        // Price filter
        if (minPrice && maxPrice) {
            filter.salePrice = { $gte: Number(minPrice), $lte: Number(maxPrice) };
        }

        // Sorting Logic
        let sortOption = {};
        if (sort === "lowToHigh") sortOption.salePrice = 1;
        else if (sort === "highToLow") sortOption.salePrice = -1;
        else if (sort === "aToZ") sortOption.productName = 1;
        else if (sort === "zToA") sortOption.productName = -1;
        else if (sort === "newArrivals") sortOption.createdAt = -1;

        console.log(filter); // Debugging applied filters

        const totalProducts = await Product.countDocuments(filter);

        const totalPages = Math.ceil(totalProducts / perPage);

        const products = await Product.find(filter)
            .sort(sortOption)
            .skip((parseInt(page) - 1) * perPage)
            .limit(perPage);


        res.render("user/shop", { 
            products, 
            categories, 
            totalPages, 
            currentPage: parseInt(page), 
            search, 
            sort, 
            category ,
            user :userData
        });
    } catch (error) {
        console.error("Error loading shop page:", error);
        res.status(500).send("Error loading shop page");
    }
};




module.exports = {
    loadHomepage,
    pageNotFound,
    loadsignup,
    loadlogin,
    signup,
    verifyOtp,
    resendOtp,
    login,
    logout,
    loadShoppingPage
}





