const seedAdmin  = async(users)=>{
    const isAdminExists = await users.findAll({
        where : {
          email : "aashisrijal252@gmail.com"
        }
    
       })
       if(isAdminExists.length == 0 ){
        await users.create({
          email : "aashisrijal252@gmail.com",
          username : "admin",
          googleId : "106662773157614313588",
          role : "admin"
        })
        console.log("Admin seeded successfully")
       } else{
    
         console.log("admin already seeded")
       }
    
}

module.exports = seedAdmin