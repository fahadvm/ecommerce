
const User = require("../../models/userSchema")

const loadprofile = async (req, res) => {
    try {
        const adminId = req.session.admin;
        console.log("adminId:",adminId)
        const userData = await User.findById(adminId);
        console.log("userData:",userData)
        res.render("admin/admin-profile", {
            admin: userData,

        })
    } catch (error) {
        console.error('Error:', error)
        res.redirect("/pageNotFound")
    }

}

const loadEditProfile = async (req, res) => {
    try {
        const adminId = req.session.admin;
        const userData = await User.findById(adminId);
        if (!userData) {
            return res.redirect("/pageNotFound");
        }
        res.render("admin/edit-profile", { admin: userData });
    } catch (error) {
        console.error('Error:', error);
        res.redirect("/pageNotFound");
    }
};



const updateProfile = async (req, res) => {
    try {
        console.log("haaai fahad");
        const adminId = req.session.admin;
        const { username, email } = req.body;

        const updatedData = { username, email };

        if (req.file) {
            const dpimage = `/uploads/${req.file.filename}`;
            // Ensure 'image' is an array before pushing
            if (!updatedData.image) {
                updatedData.image = [];
            }
            updatedData.image.push(dpimage);
        }

        const user = await User.findByIdAndUpdate(adminId, updatedData, { new: true });
        if (!user) {
            return res.redirect("/pageNotFound");
        }
        res.redirect("/admin/profile");
    } catch (error) {
        console.error('Error updating profile:', error);
        res.redirect("/pageNotFound");
    }
};





module.exports ={
    loadprofile,
    loadEditProfile,
    updateProfile

}