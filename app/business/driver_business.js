const { drivers } = require("../models/driver_model");
const {
  generateToken,
  randomOtpGenerator,
} = require("../helpers/common_function");
const bcrypt = require("bcrypt");
const md5 = require("md5");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("bson");

const config = require("../../config");
const { restrictedtokens } = require("../models/restricted_token_model");
const { msg } = require("../helpers/messages");

//-------------------------------------------------------------------Register As Driver -------------------------------------------------------------------------------------------------------------------------------------------------------------
let registerAsDriver = async (req) => {
  //console.log(req.body,"here");
  let data = req.body;
  data.roleId = 3;
  data.mobile = Number(data.mobile);
  // console.log(data.mobile);
  data.isMobileVerified = false;

  let pass = await bcrypt.hash(req.body.password, 10);
  // console.log(pass,"hit");
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
  //check if given number is alrMeady exist
  let isEmailExist = await drivers.findOne({ email: data.email }).lean();
  if (
    isEmailExist &&
    isEmailExist.email != undefined &&
    isEmailExist.email != null
  )
    throw { message: msg.emailAlreadyExist };

  let checkDriver = new drivers(data);
  let result = await checkDriver.save();
  /**
   * if Rider is registered without errors
   * create a token
   */
  // let token = jwt.sign({ id: result._id, roleId: result.roleId }, config.secret);
  // result['token'] = token;

  // let aa = await sendOtpDuringSignup(data.mobile, data.countryCode);
  // console.log(result,"signup detailss")
  return {
    response: result,
    message: msg.registrationSuccessfullAndOtpSentOnMobile,
  };
};
//-------------------------------------------------------------------login drivers---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

let loginDriver = async (req) => {
  let data = req.body;
  let checkDriver = await drivers
    .findOne({ mobile: data.mobile, countryCode: data.countryCode })  //looking for a registered driver by its mobile 
    .lean();
  if (!checkDriver || checkDriver === null) throw { message: msg.mobileNotExist };

  //Check, if Account is deactivated then user can't login
  if (checkDriver.isAccountDeactivated && checkDriver.isAccountDeactivated == true)
    throw { message: msg.thisAccountIsDeactivated };

  //Check if user is blocked or not
  if (checkDriver.isBlockedByAdmin == true) throw { message: msg.blockedByAdmin };

  let check = await bcrypt.compare(data.password, checkDriver.password);
  // console.log(check, "check");
  if (!check) {
    throw { message: msg.invalidPass };
  } 

  let deviceToken = generateToken(check);
  checkDriver["deviceToken"] = deviceToken;
  // console.log(deviceToken);

  //Note: Also update "deviceType" and "deviceToken" during login
  if (data.deviceToken && data.deviceType) {
    // console.log("im hiting ");
    let rr = await drivers.findByIdAndUpdate(
      checkDriver._id,
      {
        $set: {
          deviceType: data.deviceType,
          deviceToken: data.deviceToken,
        },
      },
      { new: true }
    );
  }
  return {
    response: checkDriver,
    message: msg.loginSuccess,
  };
};

//----------------------------------------------------Reset password --------------------------------------------------------------------------------------//

let resetPasswordDriver = async (req) => {
  let { password, confirmPassword, mobile } = req.body;
  console.log(password, mobile); //remove
  let driverData = await drivers.findOne({ mobile: mobile });
  // confirmPassword = req.body.confirmPassword
  console.log("driverdata", driverData.id, driverData);
  // console.log(driverData,driverData[0].id,"drivers data");
  if (!driverData) {
    return msg.mobileNotExist;
  }
  let check = await bcrypt.compare(password, driverData.password);
  if (check) {
    return msg.passwordSame;
  }

  if (driverData) {
    if (password === confirmPassword) {
      let pass = await bcrypt.hash(password, 10);
      updateData = await drivers.findOneAndUpdate(
        { mobile: mobile },
        { $set: { password: pass } },
        { new: true }
      );
      if (updateData) {
        return msg.passwordUpdated;
      } else {
        throw new Error("user not found");
      }
    } else {
      return msg.confirmpass;
    }
  }
};

//-------------------------------------SEnd otp---------------------------------------------------------------------------------------------------------------

let sendOtp = async (req) => {
  let updateOtp;
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
    updateOtp = await drivers.findOneAndUpdate(
      { mobile: data.mobile, countryCode: data.countryCode },
      { $set: { otpInfo: { otp: otp, expTime: otpExpTime } } }
    );
  }
  if (updateOtp) {
    return msg.otpSend;
  } else {
    throw new Error("otp not saved");
  }
};
//-------------------------------------verify otp---------------------------------------------------------------------------------------------------------------
let verifyOtp = async (req) => {
  let data = req.body;
  let checkDriver = await drivers.findOne({ mobile: data.mobile });
  if (checkDriver) {
    if (checkDriver.otpInfo.otp === req.body.otp) {
      return msg.otpVerified;
    } else {
      return msg.otpNotMatched;
    }
  } else {
    return msg.mobileNotExist;
  }
};

module.exports = {
  registerAsDriver,
  loginDriver,
  resetPasswordDriver,
  sendOtp,
  verifyOtp,
};
