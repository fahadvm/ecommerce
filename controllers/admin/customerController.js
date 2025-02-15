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
      const id = req.query.id
      await User.updateOne({ _id: id }, { $set: { isBlocked: true } })
  
      // Emit an event when a user is blocked
      userBlockedEmitter.emit("userBlocked", id)
  
      res.redirect("/admin/users")
    } catch (error) {
      res.redirect("/pageerror")
    }
  }

const customerUnblocked = async (req,res) => {
    try {

        let id = req.query.id;
        await User.updateOne({_id:id},{$set:{isBlocked:false}})
        res.redirect("/admin/users")

        
    } catch (error) {
        res.redirect('/pageerror')
    }
}



module.exports = {
    customerInfo,
    customerBlocked,
    customerUnblocked,
    userBlockedEmitter,
    

}