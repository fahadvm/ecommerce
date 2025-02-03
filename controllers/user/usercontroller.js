




const loadHomepage = async (req,res)=>{
    try {
         res.render("user/home")
    } catch (error) {
        console.log("not found")
        res.status(404).send("not found")

    }
}

const pageNotFound = async (req,res)=>{
    try {
       res.render("user/page-404")
    } catch (error) {
        res.redirect("/pageNotFound")
    }
}

module.exports = {
    loadHomepage,
    pageNotFound
}