const { registerAsUser } = require('../controllers/user_controller');

const express = require('express');
const route = express.Router();

const { verifyToken } = require('../middleware/jwt');

const { joiForRegistration } = require('../middleware/joi');
// const s3bucket = require('../helpers/aws-s3');


route.post('/registerAsUser', registerAsUser);
// route.post('/loginUser', joiForRegistration, loginUser);
// route.post('/logoutUser', joiForRegistration, logoutUser);


// route.put('/sendResendOtp', joiForRegistration, sendResendOtp);

module.exports = route;
