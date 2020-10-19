const { verify } = require("jsonwebtoken");
const {
  registerAsDriver,
  loginDriver,
  resetPasswordDriver,
  sendOtpDuringSignup,
  verifyOtp,sendResendOtp,driverProfile
} = require("../business/driver_business");
const { drivers } = require("../models/driver_model");

exports.registerAsDriver = async (req, res) => {
  try {
    let r = await registerAsDriver(req);
    console.log(r);
    res.status(200).send(r);
  } catch (err) {
    console.log("inside catch");
    console.log("Error is : " + err);
    res.status(400).send(err);
  }
};

exports.loginDriver = async (req, res) => {
  try {
    let r = await loginDriver(req);
    console.log(r, "yo");
    res.status(200).send(r);
  } catch (err) {
    console.log("inside catch");
    console.log("Error is : " + err);
    res.status(400).send(err);
  }
};

exports.resetPasswordDriver = async (req, res) => {
  try {
    let r = await resetPasswordDriver(req);
    console.log(r, "here");
    res.status(200).send(r);
  } catch (err) {
    console.log("inside catch");
    console.log("Error is : " + err);
    res.status(400).send(err);
  }
};

exports.sendOtpDuringSignup = async (req, res) => {
  try {
    let r = await sendOtp(req);
    console.log(r, "here");
    res.status(200).send(r);
  } catch (err) {
    console.log("inside catch");
    console.log("Error is : " + err);
    res.status(400).send(err);
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    let r = await verifyOtp(req);
    console.log(r, "here");
    res.status(200).send(r);
  } catch (err) {
    console.log("inside catch");
    console.log("Error is : " + err);
    res.status(400).send(err);
  }
};

exports.sendResendOtp = async (req, res) => {
  try {
    let r = await sendResendOtp(req);
    res.status(200).send(r);
  } catch (err) {
    console.log("inside catch");
    console.log("Error is : " + err);
    res.status(400).send(err);
  }
};

exports.driverProfile =  async (req,res) =>{
  try{console.log(req.user.user._id,"driver profile controler")
    let r = await driverProfile(req.body,req.user.user._id,req.files);

    res.status(200).send(r);
  } catch (err) {
    console.log("Error is :" + err);
    res.status(400).send(err);
  }
};