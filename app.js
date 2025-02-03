const express = require('express')
const app = express()
const env = require('dotenv').config()
const db = require('./config/db')
const ejs = require('ejs')
const path = require('path')
const userRouter = require('./routes/userRouter')


app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.set('view engine',"ejs") 
app.set('views', path.join(__dirname, 'views'));
app.use(express.static("public"))



app.use('/', userRouter);


db() 
app.listen(process.env.PORT,()=>{
    console.log('server running http://localhost:3002')
})


module.exports = app;