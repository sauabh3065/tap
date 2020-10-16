const { registerAsDriver,loginDriver ,resetPasswordDriver,verifyOtp,sendResendOtp} = require('../controllers/driver_contoller');


const express = require('express');
const route = express.Router();

const { verifyToken } = require('../middleware/jwt');

const { joiForRegistration,joiForlogin,joiForresetPasswordDriver} = require('../middleware/joi');
const { verify } = require('jsonwebtoken');
// const s3bucket = require('../helpers/aws-s3');


route.post('/registerAsDriver',joiForRegistration , registerAsDriver);
route.post("/loginDriver",joiForlogin,loginDriver);
route.put("/resetPassword",joiForresetPasswordDriver,resetPasswordDriver);
route.post("/verifyOtp",verifyToken,verifyOtp);
route.post("/sendResendOtp",sendResendOtp);
// route.post('/loginUser', joiForRegistration, loginUser);
// route.post('/logoutUser', joiForRegistration, logoutUser);


// route.put('/sendResendOtp', joiForRegistration, sendResendOtp);

module.exports = route;
