const EventEmitter = require("events")
const userBlockedEmitter = new EventEmitter()
const User = require("../../models/userSchema");


const customerInfo = async (req, res) => {
    try {
        let search=''
        if(req.query.search){
            search = req.query.search
        }
        let page=1
        if(req.query.page){
            page = req.query.page
        }
        const limit = 3;
        const userData = await User.find({
            isAdmin:false,
             $or:[
                {name:{$regex:".*"+search+".*"}},
                {email:{$regex:".*"+search+".*"}},
             ]})
             .sort({ createdOn: -1 })
             .limit(limit * 1)
             .skip((page-1) * limit)
             .exec();

             const count = await User.find({
                isAdmin:false,
             $or:[
                {name:{$regex:".*"+search+".*"}},
                {email:{$regex:".*"+search+".*"}},
             ]
             }).countDocuments();

             res.render('admin/customers',{
                data:userData,
                totalPages:Math.ceil(count/limit),
                currentPage:page
             })
        
    } catch (error) {
        res.redirect('/pageerror')
    }
}

const customerBlocked = async (req, res) => {
    try {
        const userId = req.params.id;
        await User.findByIdAndUpdate(userId, { isBlocked: true });
        res.status(200).json({ message: 'User blocked successfully' });
      } catch (error) {
        res.status(500).json({ message: 'Failed to block user' });
      }
  }

const customerUnblocked = async (req,res) => {
    try {
        const userId = req.params.id;
        await User.findByIdAndUpdate(userId, { isBlocked: false });
        res.status(200).json({ message: 'User unblocked successfully' });
      } catch (error) {
        res.status(500).json({ message: 'Failed to unblock user' });
      }
}



module.exports = {
    customerInfo,
    customerBlocked,
    customerUnblocked,
    userBlockedEmitter,
    

}