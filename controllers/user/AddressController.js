const User = require("../../models/userSchema");
const Address = require("../../models/addressSchema")






const loadAddress = async (req, res) => {

    try {
        const userId = req.session.user;
        const userData = await User.findById(userId);
        const addressData = await Address.findOne({ userId: userId });

        return res.render('user/address', { user: userData, addresses: addressData })

    } catch (error) {

        return res.redirect("/pageNotFound")
    }
}

const postAddress = async (req, res) => {
    try {
        const userId = req.session.user;
        const userData = await User.findById(userId);
        const { name, phone, altPhone, pincode, landMark, city, state, addressType } = req.body;

        const userAddress = await Address.findOne({ userId: userData._id })
        if (!userAddress) {
            const newAddress = new Address({
                userId: userData._id,
                address: [{ name, phone, altPhone, pincode, landMark, city, state, addressType }]
            })
            await newAddress.save()
        } else {
            userAddress.address.push({ name, phone, altPhone, pincode, landMark, city, state, addressType })
            await userAddress.save()
        }
        res.redirect('/address')
    } catch (error) {
        res.redirect("/pageNotFound")

    }
}

const deleteAddress = async (req, res) => {
    try {
        const addressId = req.params.id
        const findAddress = await Address.findOne({"address._id":addressId})
        if (!findAddress) {
            return res.status(404).json({ success: false, message: "Address not found" })
        }
        await Address.updateOne({"address._id":addressId},{$pull:{address:{_id:addressId}}})
        return res.redirect('/address');
    } catch (error) {
        console.error("Error in deleteAddress:", error)
        res.status(500).json({ success: false, message: "Failed to delete Address " })
    }
}

const editAddress = async (req, res) => {
    
    const { addressId, name, landMark, city, state, pincode, phone, addressType, altPhone } = req.body;

    try {
        // Find the parent document containing the address array
        const parentDoc = await Address.findOne({ "address._id": addressId });
        if (!parentDoc) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }

        // Update the specific address in the array using positional operator $
        await Address.updateOne(
            { "address._id": addressId },
            { $set: { 
                "address.$.name": name,
                "address.$.landMark": landMark,
                "address.$.city": city,
                "address.$.state": state,
                "address.$.pincode": pincode,
                "address.$.phone": phone,
                "address.$.addressType": addressType,
                "address.$.altPhone": altPhone
            }}
        );

        return res.redirect('/address');
    } catch (error) {
        console.error("❌ Error updating address:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}


module.exports = {
    loadAddress,
    postAddress,
    deleteAddress,
    editAddress
    
}