const express = require('express');
const { renderAddOrganizationPage, createOrganization, CreateQuestionTable, createAnswerTable, renderDashboard } = require('../controller/organization/organizationController');
const { isAuthenticated } = require('../middleware/isAuthenticated');
const router = express.Router();
router.route("/organization")
.get(isAuthenticated,renderAddOrganizationPage)
.post(isAuthenticated,createOrganization,CreateQuestionTable,createAnswerTable)

router.route('/dashboard').get(isAuthenticated,renderDashboard)

module.exports = router