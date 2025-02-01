const express = require('express')
const app = express()
const env = require('dotenv').config()
const db = require('./config/db')


app.get('/',(req,res)=>{
    res.send('haaai')
})

db() 
app.listen(process.env.PORT,()=>{
    console.log('server running http://localhost:3000')
})


module.exports = app;