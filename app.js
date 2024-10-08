const dotenv = require("dotenv");
dotenv.config();
const express = require('express')
const app = express();
const port = process.env.PORT || 3000;
const database = require("./model/index");
app.set("view engine","ejs");

app.get("/",(req,res)=>{
    res.render("home.ejs");
})

const server = app.listen(port,()=>{
    console.log("server is Starting in port:"+ port);
})