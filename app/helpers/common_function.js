const randomstring = require("randomstring");
const jwt = require("jsonwebtoken");
const config = require("../../config");
const { compareSync } = require("bcrypt");
const { drivers } = require("../models/driver_model");
const { set } = require("mongoose");
const { msg } = require("./messages");

exports.randomOtpGenerator = () => {
  let text = "";
  let possible = "123456789";

  for (let i = 0; i < 4; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return "1234";
};

exports.randomIdGenerator = () => {
  let text = "";
  let possible = "123456789";
  let str = randomstring.generate(4);

  for (let i = 0; i < 4; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  // let res = `ORD${text}${str}`;
  return `${text}${str}`;
};

//---------------------------------GENERATE TOKEN-----------------------------------------------------------------------------------------------------------------y

exports.generateToken = (user) => {
  return jwt.sign({ user }, config.secret, { expiresIn: "18000s" });
};

//-------------------------------------SEnd otp---------------------------------------------------------------------------------------------------------------

exports.sendOtp = async (req, res) => {
  console.log(req.body);
  let data = req.body;
  let otp = await randomOtpGenerator();
  console.log(otp, "otp here");
  let otpExpTime = new Date(Date.now() + config.defaultOTPExpireTime);
  if (
    data.mobile != null &&
    data.mobile !== "" &&
    data.countryCode !== null &&
    data.countryCode != "NA"
  ) {
    let updateOtp = await drivers.findOneAndUpdate(
      { mobile: data.mobile, countryCode: data.countryCode },
      { $set: { otpinfo: { otp: otp, expTime: otpExpTime } } }
    );
  }
  if (updateOtp) {
    return msg.otpSend;
  } else {
    throw new Error("otp not saved");
  }
};
