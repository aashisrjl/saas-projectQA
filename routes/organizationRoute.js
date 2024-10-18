const express = require('express');
const { renderAddOrganizationPage, createOrganization, CreateQuestionTable, createAnswerTable, renderDashboard, renderForumPage, renderAskQuestion, createQuestion, deleteQuestion, renderSingleQuestion } = require('../controller/organization/organizationController');
const { isAuthenticated } = require('../middleware/isAuthenticated');
const {multer,storage} = require('../middleware/multerConfig')
const upload = multer({storage: storage})
const router = express.Router();
router.route("/organization")
.get(isAuthenticated,renderAddOrganizationPage)
.post(isAuthenticated,createOrganization,CreateQuestionTable,createAnswerTable)

router.route('/dashboard').get(isAuthenticated,renderDashboard)
router.route('/forum').get(isAuthenticated,renderForumPage)
router.route('/askQuestion').get(isAuthenticated,renderAskQuestion)
router.route('/question').post(isAuthenticated,upload.single('questionImage'),createQuestion)
router.route('/questiondelete/:id').get(isAuthenticated,deleteQuestion)
router.route('/question/:id').get(isAuthenticated,renderSingleQuestion)

module.exports = router