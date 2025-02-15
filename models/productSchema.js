// const mongoose = require('mongoose')
// const {Schema} = mongoose 

// const productSchema = new Schema({
//     productName:{
//         type:String,
//         requried:true
//     },
//     description:{
//         type:String,
//         required:true
//     },
//     category:{
//         type:Schema.Types.ObjectId,
//         ref:"Category",
//         required:true
//       },
//       regularPrice:{
//         type:Number,
//         required:true
//       },
//       salePrice:{
//         type:Number,
//         required:false
//       },
//       productOffer : {
//         type:Number,
//         default:0
//       },
//       stock:{
//         type:Number,
//         required:true,
//         default:0
//       },
//       ProductImages:{
//         type:[String],
//         required:true,
//       },
//       isBlocked:{
//         type:Boolean,
//         default:false,
//       },
//       status:{
//         type:String,
//         enum:["Available","out of stock","Discontinued"],
//         required:true,
//         default:"Available"
//       }
//     },{timestamps:true})

//     const Product = mongoose.model("Product",productSchema)

//     module.exports = Product;

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  productName: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    required: true
  },
  nutritionalInfo: {
    type: String,
    required: true
  },
  weightSize: {
    type: Number,
    required: true
  },
  regularPrice: {
    type: Number,
    required: true
  },
  salePrice: {
    type: Number,
    default: null
  },
  stock: {
    type: Number,
    required: true
  },
  organic: {
    type: String,
    required: true
  },
  expirationDate: {
    type: Date,
    default: null
  },
  productOffer: {
    type: Number,
    default: 0
  },
  importedLocal: {
    type: String,
    required: true
  },
  freshFrozen: {
    type: String,
    required: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  productImages: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ["Available", "out of stock", "Discontinued"],
    required: true,
    default: "Available"
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
}, { timestamps: true });


const Product = mongoose.model("Product", productSchema)

module.exports = Product;
