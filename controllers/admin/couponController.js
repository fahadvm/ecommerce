const Coupon = require('../../models/couponSchema')
const mongoose = require("mongoose")


const loadCoupon = async(req,res)=>{
  try {
    const findCoupons = await Coupon.find({})
    return res.render('admin/coupon',{coupons:findCoupons})
  } catch (error) {
    console.error('eoor occur while loadCoupon')
    return res.redirect('pageerror')
  }
}

const createCoupon = async(req,res)=>{
  try {
    
    const data = {
      couponCode : req.body.couponName,
      createdOn : new Date(req.body.startDate + 'T00:00:00'),
      expireOn: new Date(req.body.endDate + "T00:00:00"),
      offerPrice: parseInt(req.body.offerPrice),
      minPrice: parseInt(req.body.minimumPrice)
    }
    const newCoupon = new Coupon({
      couponCode:data.couponCode,
      createdOn:data.createdOn,
      expireOn:data.expireOn,
      offerPrice:data.offerPrice,
      minPrice:data.minPrice,
      users:[]
    })

    await newCoupon.save()
    return res.redirect('/admin/coupon')
  } catch (error) {
    console.error('eoor occur while createCoupon',error)
    return res.redirect('pageerror')
  }
}




const editCoupon = async (req,res) => {
  try {

      const id = req.query.id;
      const findCoupon = await Coupon.findOne({_id:id});

      res.render("admin/edit-coupon",{
          findCoupon:findCoupon,

      })
      
  } catch (error) {

      res.redirect("/pageerror")
      
  }
}

const updatecoupon = async (req, res) => {
  try {
      const couponId = req.query.couponId;
      if (!mongoose.Types.ObjectId.isValid(couponId)) {
          return res.status(400).json({ message: "Invalid coupon ID" });
      }

      const oid = new mongoose.Types.ObjectId(couponId);
      const selectedCoupon = await Coupon.findOne({ _id: oid });

      if (!selectedCoupon) {
          return res.status(404).json({ message: "Coupon not found" });
      }

      const startDate = new Date(req.body.startDate + "T00:00:00");
      const endDate = new Date(req.body.endDate + "T00:00:00");

      const updatedCoupon = await Coupon.findByIdAndUpdate(
          { _id: oid },
          {
              $set: {
                  name: req.body.couponName,
                  createdOn: startDate,
                  expireOn: endDate,
                  offerPrice: parseInt(req.body.offerPrice),
                  minimumPrice: parseInt(req.body.minimumPrice)
              }
          },
          { new: true }
      );

      if (!updatedCoupon) {
          return res.status(500).json({ message: "Error updating coupon" });
      }

      res.json({ message: "Coupon updated successfully", coupon: updatedCoupon });
  } catch (error) {
      console.error("Error updating coupon:", error);
      res.status(500).json({ message: "Internal server error" });
  }
};

const deletecoupon = async (req,res) => {
  try {
      
      const id = req.query.id;
        await Coupon.deleteOne({_id:id})
      res.status(200).send({success:true,message:"Coupon deleted successfully"})

  } catch (error) {
      console.error("Error Deleting Coupon",error)
      res.status(500).send({success:false,message:"Internal Server Error"})
  }
}

module.exports = {
  loadCoupon,
  createCoupon,
  deletecoupon,
  updatecoupon,
  editCoupon

}