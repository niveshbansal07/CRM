const express = require('express');
const router = express.Router();
const authController = require('./../Controllers/auth.Controller.js');

router.post('/login', authController.loginController);
router.post('/register', authController.registerController);
router.post('/createSuperAdmin', authController.createSuperAdmin);


module.exports = router;
