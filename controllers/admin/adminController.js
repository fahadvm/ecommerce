const User = require("../../models/userSchema")
const nodemailer = require("nodemailer")
const env = require('dotenv').config()
const bcrypt = require('bcrypt')



const pageError = async (req, res) => {
    res.render('admin/admin-error')
}
const loadLogin = (req, res) => {
    if(req.session.admin){
        return res.redirect('/admin')
    }
    res.render('admin/login',{message:null})
}



const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const findadmin = await User.findOne({ isAdmin: 1, email: email });

        if (!findadmin) {
            return res.render('admin/login', { message: 'User not found' });
        }

        if (findadmin.isBlocked == true) {
            return res.render('admin/login', { message: 'User is blocked by admin' });
        }

        const passwordMatch = await bcrypt.compare(password, findadmin.password);

        if (!passwordMatch) {
            return res.render('admin/login', { message: 'Incorrect password' });
        }

        req.session.admin = findadmin._id;
        console.log('in login session.admin:', req.session.admin)
        return res.redirect('/admin');           
    } catch (error) {
        console.log('login error:', error);
        return res.render("admin/login", { message: "Login failed. Please try again later" });
    }
};

const loadDashboard = async (req, res) => {
    if(req.session.admin){
        try {
            res.render('admin/dashboard')
        } catch (error) {
            res.redirect('/pageerror')
        }
    } else{
        return res.redirect('/admin/login')
    }
}

const logout = async (req, res) => {
    try {
        if (req.session.admin) {
            delete req.session.admin; // ✅ Remove only admin session
        }
        res.redirect('/admin/login'); // Redirect admin to login page
    } catch (error) {
        console.log('Logout Error', error);
        res.redirect('/pageerror');
    }
};



module.exports = {
    login,
    loadLogin,
    loadDashboard,
    logout,
    pageError
}