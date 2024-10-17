const { sequelize, users } = require("../../model");
const crypto = require("crypto");
exports.renderAddOrganizationPage = (req, res) => {
    res.render("organization.ejs");
}
const randomNumber = ()=>{
    return Math.floor(Math.random() * 9000) + 1000;
}
const organizationNumber = randomNumber();
exports.createOrganization = async (req, res,next) => {
    const { organizationName, address, email, phoneNumber, panNo, vatNo } = req.body;
    const userId = req.userId;  // Assuming `userId` is available in req object
    const user = await users.findAll({
        where:{
            id:userId
        }
    })
    try {
// create table user_org
        await sequelize.query(
            `CREATE TABLE IF NOT EXISTS users_Org (
            id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
            userId INT REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
            organizationNumber varchar(255)
            )`,{
                TYPE: sequelize.QueryTypes.CREATE
            }
        )
        // create table organizations
        await sequelize.query(
            `CREATE TABLE IF NOT EXISTS organization_${organizationNumber} (
                id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
                organizationName VARCHAR(255),
                address VARCHAR(255),
                email VARCHAR(255),
                phoneNumber VARCHAR(15),
                panNo VARCHAR(50),
                vatNo VARCHAR(20)
            )`, 
            { type: sequelize.QueryTypes.CREATE }
        );

        // You can also insert the provided organization data right after creating the table
        await sequelize.query(
            `INSERT INTO organization_${organizationNumber} (organizationName, address, email, phoneNumber, panNo, vatNo) 
            VALUES (?, ?, ?, ?, ?, ?)`, 
            { 
                replacements: [organizationName, address, email, phoneNumber, panNo, vatNo],
                type: sequelize.QueryTypes.INSERT 
            }
        );

        await sequelize.query(
            `INSERT INTO users_org(userId,organizationNumber) VALUES(?,?)`,{
                replacements:[userId,organizationNumber],
                type: sequelize.QueryTypes.INSERT
            }
        )
        user[0].currentOrgNumber = organizationNumber
        await user[0].save();
        req.organizationNumber = organizationNumber
        next();
    } catch (error) {
        console.error("Error creating organization table or inserting data:", error);
        res.status(500).send("Error occurred while creating organization");
    }
}

exports.CreateQuestionTable = async(req,res,next)=>{
    const organizationNumber = req.organizationNumber
    //create table
    await sequelize.query(
        `create table question_${organizationNumber}(
        id int not null primary key auto_increment,
        title varchar(255),
        description TEXT,
        userId INT NOT NULL references users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    )
    next()
}

exports.createAnswerTable = async(req,res)=>{
    const organizationNumber = req.organizationNumber
    await sequelize.query(
        `CREATE TABLE answer_${organizationNumber}(
        id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
        answerText TEXT,
        userId INT NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        questionId INT NOT NULL REFERENCES question_${organizationNumber}(id) ON DELETE CASCADE ON UPDATE CASCADE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,{
            type: sequelize.QueryTypes.CREATE
        }
    )
    res.redirect("/dashboard")
}

exports.renderDashboard = (req,res)=>{
    res.render('dashboard');
}
