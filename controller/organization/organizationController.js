const { QueryTypes, where } = require("sequelize");
const { sequelize, users } = require("../../model");
const crypto = require("crypto");
const sendEmail = require("../../sevices/sendMail");

exports.renderAddOrganizationPage = async(req, res) => {
    // check id the user have already one organization
   const haveOrg = req.user.currentOrgNumber
    if(haveOrg){
        res.redirect("/dashboard")
        return
    }
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

        //create invitation table
        await sequelize.query(`
            create table  invitation_${organizationNumber}(
            id int not null primary key auto_increment,
            userId int references users(id) on delete cascade on update cascade,
            token varchar(255) not null,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,{
                type: QueryTypes.CREATE
            })

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
        questionImage varchar(255),
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

exports.renderDashboard = async(req,res)=>{
    // let currentUserRole = 'admin';
    // const userId = req.userId
    // const users = await users.findAll({
    //     where:{
    //         id:userId
    //     }
    // })

    res.render('dashboard/index.ejs',{currentUserRole});
}

exports.renderForumPage = async(req,res)=>{
    const userId = req.userId
    const organizationNumber = req.user.currentOrgNumber
   const questions = await sequelize.query(`SELECT question_${organizationNumber}.*,users.username 
    FROM question_${organizationNumber} 
    JOIN users ON 
    question_${organizationNumber}.userId = users.id`,{
        type : QueryTypes.SELECT
    })
     
    res.render('dashboard/forum', { questions, userId });
    
    // const user = await sequelize.query(
    //     `SELECT username,email FROM users WHERE id =?`,{
    //         type: sequelize.QueryTypes.SELECT,
    //         replacements:[questions[0].userId]
    //     }
    // )
}
exports.renderAskQuestion = async(req,res)=>{
    res.render('dashboard/askQuestion')
}

exports.createQuestion = async(req,res)=>{
    const {title,description} = req.body
    let file = req.file?.filename
    if(!file){
        file = null
    }
    const userId = req.userId
    const organizationNumber = req.user.currentOrgNumber
    if(!title || !description){
        res.status(400).send({message:'Please fill in all fields.'})
    }

    await sequelize.query(
        `
        INSERT INTO question_${organizationNumber} (title,description,questionImage,userId) 
        VALUES (?,?,?,?)
        `,{
            replacements: [title,description,file,userId],
            type: sequelize.QueryTypes.INSERT
        }
    )
    res.redirect("/forum")
}
exports.deleteQuestion = async(req,res)=>{
    const questionId = req.params.id
    const organizationNumber = req.user.currentOrgNumber
    await sequelize.query(
        `
        DELETE FROM question_${organizationNumber} 
        WHERE id=?
        `,{
            type: sequelize.QueryTypes.DELETE,
            replacements:[questionId]
        }
    )
    res.redirect('/forum');

}
exports.renderSingleQuestion = async (req, res) => {
    const userId = req.userId;
    const organizationNumber = req.user.currentOrgNumber;
    const questionId = req.params.id;
  
    try {
      const questionResult = await sequelize.query(
        `
        SELECT * FROM question_${organizationNumber}
        WHERE id = ?
        `,
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: [questionId],
        }
      );
  
      const question = questionResult[0]; 

      const userResult = await sequelize.query(
        `
        SELECT * FROM users
        WHERE id = ?
        `,
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: [userId],
        }
      );
  
      const user = userResult[0]; 

      const answers = await sequelize.query(
        `SELECT * FROM answer_${organizationNumber} where questionId=?`,
        {type: QueryTypes.SELECT,
            replacements:[questionId]
        }
      )
      res.render("dashboard/singleQuestion", { question, user,answers});
    } catch (error) {
      console.error("Error fetching question or user:", error);
      res.status(500).send("Internal Server Error");
    }
  };
  
  // handle answer
  exports.handleAnswer = async(req,res)=>{
    const {questionId,answerText} = req.body
    const userId = req.userId
    const organizationNumber = req.user.currentOrgNumber
    // accessing questioned person email using question Id
    const [data] = await sequelize.query(`
        select * from question_${organizationNumber} where id=?`,{
            type: QueryTypes.SELECT,
            replacements:[questionId]
        })
        const answeredUser = await users.findByPk(userId);
        const questionedUser = await users.findByPk(data.userId)
        const userEmail = questionedUser.email
        
        await sendEmail({
            email:userEmail,
            subject:`${answeredUser.username} Answer to your question`,
            text:answerText
        })

     await sequelize.query(
        `INSERT INTO answer_${organizationNumber} (answerText,userId,questionId)
        VALUES(?,?,?)`,{
            type: QueryTypes.INSERT,
            replacements:[answerText,userId,questionId]
        }
    )
    

    res.redirect(`/question/${questionId}`)
  }

  exports.deleteAnswer = async(req,res)=>{
    const answerId = req.params.id
    const userId = req.userId
    const organizationNumber = req.user.currentOrgNumber
    const answer = await sequelize.query(
        `select * from answer_${organizationNumber}
        where id=?`,{
            type:QueryTypes.SELECT,
            replacements:[answerId]
        }
    )

    await sequelize.query(
        `DELETE FROM answer_${organizationNumber}
        WHERE id = ? AND userId=?`,{
            type: QueryTypes.DELETE,
            replacements:[answerId,userId]
        }
    )
    console.log(answer)
    res.redirect(`/question/${answer[0].questionId}`)
  }

  exports.renderMyOrgs = async(req,res)=>{
    const currentOrgNumber = req.user.currentOrgNumber
    const userId = req.userId
    const userOrgNumber = await sequelize.query(
        `SELECT organizationNumber FROM  users_org where userId=?` ,
        {
            type: QueryTypes.SELECT,
            replacements: [userId]
        }
    )

    let orgDatas = [];
    for(var i=0;i<userOrgNumber.length;i++){
      const [orgData] =   await sequelize.query(
            `SELECT * FROM organization_${userOrgNumber[i].organizationNumber} `
        )
        orgDatas.push({...orgData[0],organizationNumber: userOrgNumber[i].organizationNumber});
        
    }
    res.render('dashboard/myOrgs.ejs',{orgDatas,currentOrgNumber})

  }

  exports.deleteOrganization = async(req,res)=>{
    const currentOrgNumber = req.user.currentOrgNumber
    const selectOrganization = req.params.id
    const userId = req.userId


    await sequelize.query(`DROP TABLE organization_${selectOrganization}`,{
        type: QueryTypes.DROP
    })
   
    await sequelize.query(`DROP TABLE question_${selectOrganization}`,{
        type: QueryTypes.DROP
    })
    await sequelize.query(`DROP TABLE answer_${selectOrganization}`,{
        type: QueryTypes.DROP
    })
    await sequelize.query(`DELETE FROM  users_org where organizationNumber=?`,{
        type: QueryTypes.DELETE,
        replacements:[selectOrganization]
    })

    //select all orgs number
    const userOrgNumber = await sequelize.query(
        `SELECT organizationNumber FROM  users_org where userId=?` ,
        {
            type: QueryTypes.SELECT,
            replacements: [userId]
        }
    )
    //access last organization number
    const n = userOrgNumber.length
    const currentorg = userOrgNumber[n-1].organizationNumber;
    console.log("last",userOrgNumber[n-1].organizationNumber)
    //update currentorg number
    await sequelize.query(
        `update users set currentOrgNumber=?
        where id=?`,{
            type:QueryTypes.UPDATE,
            replacements:[currentorg,userId]
        }
            
    )

    // validating current org
    if(currentOrgNumber == selectOrganization){
        //switch cuurrent oragnization to previous orgs

    }
    res.redirect("/myorgs")
  }


  exports.renderInvite = async(req,res)=>{
    res.render("dashboard/invite");
  }

  //generate token using crypto
  function generateToken(length){
    return crypto.randomBytes(length).toString('hex')
  }

  exports.handleInvite = async(req,res)=>{
    const {email:receiverEmail}= req.body
    const userId = req.userId
    const currentOrg = req.user.currentOrgNumber
    const userEmail = req.user.email

    const token = generateToken(10);
    // table insert
    await sequelize.query(`
        INSERT INTO invitation_${currentOrg} (userId,token) VALUES(?,?)`,{
            type:QueryTypes.INSERT,
            replacements:[userId,token]
        })

    await sendEmail({
        email: receiverEmail,
        subject: `INVITATION TO JOIN SAAS ORGANIZATION_${currentOrg}`,
        text: `http://localhost:3000/accept-invite?org=${currentOrg}&token=${token}`
    })
    res.send("invited success")
  }

  exports.handleInviteAcceptance = async(req,res)=>{
    const userId = req.userId
    const currentOrg = req.user.currentOrgNumber
    const {org,token}= req.query

   const [exists] =  await sequelize.query(`
        select * from invitation_${org} where token=? `,{
            type: QueryTypes.SELECT,
            replacements:[token]
        })
        if(exists){
            //change the current org value of the requesting user
            const userData = await users.findByPk(userId)
                userData.currentOrgNumber = org;
                await userData.save();
                res.redirect("/forum")
            }else{
                res.send("Invalid invitation link");
            }
  }

