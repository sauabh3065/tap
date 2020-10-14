const { registerAsDriver,loginDriver ,resetPasswordDriver} = require('../controllers/driver_contoller');

const express = require('express');
const route = express.Router();

const { verifyToken } = require('../middleware/jwt');

const { joiForRegistration } = require('../middleware/joi');
// const s3bucket = require('../helpers/aws-s3');


route.post('/registerAsDriver',joiForRegistration , registerAsDriver);
route.post("/loginDriver",loginDriver);
route.post("/resetPassword",resetPasswordDriver);
// route.post('/loginUser', joiForRegistration, loginUser);
// route.post('/logoutUser', joiForRegistration, logoutUser);


// route.put('/sendResendOtp', joiForRegistration, sendResendOtp);

module.exports = route;
