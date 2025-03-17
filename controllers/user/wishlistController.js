const User = require("../../models/userSchema")
const Wishlist = require("../../models/whishlistSchema")
const Product = require("../../models/productSchema")
const Cart = require("../../models/cartSchema")

const loadWishlist = async (req,res) => {
    try {
        
        const userId = req.session.user;
        const user = await User.findById(userId);
        const products = await Product.find({_id:{$in:user.wishlist}}).populate('category');
        const cart = await Cart.find({userId:user._id})

        res.render("user/wishlist",{
            user,
            wishlist:products,
            cart

        })

        

    } catch (error) {

        console.error('Error:',error)
        res.redirect("/pageNotFound")
        
    }
        
}

const removeProduct = async (req,res) => {
    try {

        const productId = req.query.productId;
        const userId = req.session.user;
        const user = await User.findById(userId);
        const index = user.wishlist.indexOf(productId);
        user.wishlist.splice(index,1);

        await user.save();

        return res.redirect("/wishlist")
        
    } catch (error) {

        console.error(error);
        return res.status(500).json({status:false,message:"Server Error"})
        
    }
}

const addToWishlist = async (req, res) => {

    try {
        const { productId } = req.body;
        const userId = req.session.user 

        console.log("Received productId:", productId);
        console.log("User ID from session:", userId);


        if (!productId || !userId) {
            return res.status(400).json({ status: false, message: "Invalid request data" });
        }

        const user = await User.findById(userId);
        if (!user) {
            // return res.status(401).json({ status: false, message: "User not authenticated" });
            return res.status(200).json({ status: false, message: "User not authenticated" });

        }

        user.wishlist = user.wishlist || [];

        if (user.wishlist.includes(productId)) {
            return res.status(200).json({ status: false, message: "Product already in wishlist" });
        }

        user.wishlist.push(productId);
        await user.save();

        return res.status(200).json({ status: true, message: "Product added to wishlist" });
        
    } catch (error) {
        console.error("Error in addToWishlist:", error.message);
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
};




module.exports = {
    loadWishlist,
    addToWishlist,
    removeProduct,



}