const { sequelize, users } = require("../../model");
const crypto = require("crypto");
exports.renderAddOrganizationPage = (req, res) => {
    res.render("organization.ejs");
}
const organizationNumber = crypto.randomInt(1000,9000).toString();
exports.createOrganization = async (req, res) => {
    const { organizationName, address, email, phoneNumber, panNo, vatNo } = req.body;
    const userId = req.userId;  // Assuming `userId` is available in req object
    const user = await users.findAll({
        where:{
            id:userId
        }
    })
    try {
        // Using parameterized query to avoid SQL injection
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
        user[0].currentOrgNumber = organizationNumber
        await user[0].save();

        res.status(200).send("Organization details added successfully!");
    } catch (error) {
        console.error("Error creating organization table or inserting data:", error);
        res.status(500).send("Error occurred while creating organization");
    }
}
