const express = require('express');
const { renderAddOrganizationPage, createOrganization } = require('../controller/organization/organizationController');
const { isAuthenticated } = require('../middleware/isAuthenticated');
const router = express.Router();
router.route("/addOrganization").get(isAuthenticated,renderAddOrganizationPage).post(isAuthenticated,createOrganization)

module.exports = router