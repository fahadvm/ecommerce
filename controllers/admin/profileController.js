
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
        const { id } = req.params;
        const { username, email } = req.body;
        const profilePicture = req.file ? req.file.path : undefined;
    
        const updatedData = {
          username,
          email,
          ...(profilePicture && { profilePicture }),
        };
    
        const updatedAdmin = await Admin.findByIdAndUpdate(id, updatedData, { new: true });
    
        if (!updatedAdmin) {
          return res.status(404).json({ message: 'Admin not found' });
        }
    
        res.status(200).json(updatedAdmin);
      } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error' });
      }
};





module.exports ={
    loadprofile,
    loadEditProfile,
    updateProfile

}