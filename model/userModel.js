module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("user", {
      email: {
        type: DataTypes.STRING,
        
      },
      googleId: {
        type: DataTypes.STRING
       
      },
      username: {
        type: DataTypes.STRING
       
      },
      currentOrgNumber:{
        type: DataTypes.INTEGER
        
      }

    
    });
    return User;
  };