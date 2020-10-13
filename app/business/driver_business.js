const { drivers } = require("../models/driver_model");

const md5 = require("md5");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("bson");

const { randomOtpGenerator } = require("../helpers/common_function");
const config = require("../../config");
const { restrictedtokens } = require("../models/restricted_token_model");
const { msg } = require("../helpers/messages");
const { password } = require("../../config");

let registerAsDriver = async (req) => {
  let data = req.body;
  data.roleId = 3;
  data.mobile = Number(data.mobile);
  // console.log(data.mobile);
  data.isMobileVerified = false;

  let pass = await md5(password);
  //   console.log(pass, "hit");
  data.password = pass;
  if (
    !data.countryCode ||
    data.countryCode == null ||
    data.countryCode == "NA" ||
    data.countryCode == undefined
  )
    throw { message: msg.mobileNumAndCountryCodeRequire };

  //check if given number is already exist
  let isMobileExist = await drivers.findOne({ mobile: data.mobile }).lean();
  if (isMobileExist) throw { message: msg.mobileAlreadyExist };
  //check if given number is already exist
  let isEmailExist = await drivers.findOne({ email: data.email }).lean();
  if (
    isEmailExist &&
    isEmailExist.email != undefined &&
    isEmailExist.email != null
  )
    throw { message: msg.emailAlreadyExist };

  let res = new drivers(data);
  let result = await res.save();
  /**
   * if Rider is registered without errors
   * create a token
   */
  let token = jwt.sign(
    { id: result._id, roleId: result.roleId },
    config.secret
  );
  result["token"] = token;
  
  //   let a = await sendOtpDuringSignup(data.mobile, data.countryCode);
  
  console.log(`${result.firstName} signup details ${result}`);
  return {
    response: result,
    message: msg.registrationSuccessfullAndOtpSentOnMobile,
  };
};

module.exports = { registerAsDriver };
