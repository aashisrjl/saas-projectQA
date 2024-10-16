const express = require('express');
const { renderAddOrganizationPage, createOrganization, createForumTable } = require('../controller/organization/organizationController');
const { isAuthenticated } = require('../middleware/isAuthenticated');
const router = express.Router();
router.route("/addOrganization").get(isAuthenticated,renderAddOrganizationPage).post(isAuthenticated,createOrganization,createForumTable)

module.exports = router