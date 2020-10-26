const { registerAsDriver,loginDriver ,resetPasswordDriver,verifyOtp,sendResendOtp,driverProfile,driverAddress,vehicleDetails} = require('../controllers/driver_contoller');


const express = require('express');
const route = express.Router();

const { verifyToken } = require('../middleware/jwt');
const { joiForRegistration,joiForlogin,joiForresetPasswordDriver} = require('../middleware/joi');
const { verify } = require('jsonwebtoken');
// const s3bucket = require('../helpers/aws-s3');
const multer = require("multer");
var path = require ("path");
var md5 = require("md5");

var storage = multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,"./upload/userImage");
    },
    filename : function (req,file,cb){
        let fileUniqueName = md5(new Date().getTime());
        cb(null,fileUniqueName + path.extname(file.originalname));
    }
});


var upload = multer({storage : storage});


route.post('/registerAsDriver',joiForRegistration , registerAsDriver);
route.post("/loginDriver",joiForlogin,loginDriver);
route.put("/resetPassword",joiForresetPasswordDriver,resetPasswordDriver);
route.post("/verifyOtp",verifyToken,verifyOtp);
route.post("/sendResendOtp",sendResendOtp);
route.post("/driverProfile",upload.any(),verifyToken,driverProfile);
route.post("/driverAddress",verifyToken,driverAddress);
route.post("/vehicleDetails",verifyToken,vehicleDetails);
// route.post('/loginUser', joiForRegistration, loginUser);
// route.post('/logoutUser', joiForRegistration, logoutUser);


// route.put('/sendResendOtp', joiForRegistration, sendResendOtp);

module.exports = route;
