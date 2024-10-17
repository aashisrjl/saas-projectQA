const { users } = require("../../model");

exports.renderLoginPage = async(req,res)=>{
    res.render('login');
}

exports.handleLogin = async (req,res)=>{
    const {username,email,password,confirmPassword} = req.body
    if(!username || !email || !password){
        return res.status(400).json({message: 'Please fill in all fields.'})
    }
    if(password!= confirmPassword){
        return res.status(400).json({message: 'Passwords do not match.'})
    }
    const user = await users.create({
        username,
        email,
        password
    })
    res.redirect('/organization')
}

exports.handleLogout = (req,res)=>{
    //clear cookies
    res.clearCookie('token');
    res.redirect('/login')
}