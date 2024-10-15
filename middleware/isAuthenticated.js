const jwt = require('jsonwebtoken')
const {promisify} = require('util');
const { users } = require('../model');


exports.isAuthenticated = async(req,res,next)=>{
    try {
        const token = req.cookies.token;
    if(!token ){
        return res.redirect('/login');
    }
   const decryptedResult = await promisify(jwt.verify)(token,process.env.JWT_SECRET)
    const data = await users.findByPk(decryptedResult.id)
    if(!data){
        res.redirect("/login")
    }
    req.userId = data.id
    req.user = data
    next()
    } catch (error) {
        console.log(error)
    }
}