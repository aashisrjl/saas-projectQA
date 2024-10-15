exports.userRegister = async(req,res)=>{
    try {
        const {username,email,password} = req.body
    if(!username || !email || !password){
        res.status(400).json({
            messsage: "please enter all fields!"
    });
    }
    const user = await User.create({
        username,
        email,
        password
    })
    res.status(200).json({
        message: "user register success!",
        user
    })
        
    } catch (error) {
        res.status(500).json({
            message: "server/internal error"
        })
        
    }
}
    