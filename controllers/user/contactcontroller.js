const User = require("../../models/userSchema")



const loadContactPage = async (req, res) => {
    try {
        const userId = req.session.user;
        const userData = await User.findById(userId)
        if (!req.session.user) {
          
            return res.render("user/contact",{user:userData});
        } else {
            res.redirect('/')

        }
    } catch (error) {
        return res.redirect("/pageNotFound")
    }
}

module.exports = {
    loadContactPage
}