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
const { verifyToken } = require("../middleware/jwt");
const { date } = require("joi");
const { json } = require("body-parser");

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
  let token = generateToken(checkDriver);
  result["deviceToken"] = token;

  let aa = await sendOtpDuringSignup(data.mobile, data.countryCode);
  console.log(result, "signup detailss");
  return {
    response: result,
    message: msg.registrationSuccessfullAndOtpSentOnMobile,
  };
};
//-------------------------------------------------------------------login drivers---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

let loginDriver = async (req) => {
  let data = req.body;
  let checkDriver = await drivers
    .findOne({ mobile: data.mobile, countryCode: data.countryCode }) //looking for a registered driver by its mobile
    .lean();
  if (!checkDriver || checkDriver === null)
    throw { message: msg.mobileNotExist };

  //Check, if Account is deactivated then user can't login
  if (
    checkDriver.isAccountDeactivated &&
    checkDriver.isAccountDeactivated == true
  )
    throw { message: msg.thisAccountIsDeactivated };

  //Check if user is blocked or not
  if (checkDriver.isBlockedByAdmin == true)
    throw { message: msg.blockedByAdmin };

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

let sendOtpDuringSignup = async (mobileNum, countryCode) => {
  let updateOtp;
  let otp = await randomOtpGenerator();
  console.log(otp, "otp here");
  let otpExpTime = new Date(Date.now() + config.defaultOTPExpireTime);
  if (
    mobileNum != null &&
    mobileNum !== "" &&
    countryCode !== null &&
    countryCode != "NA"
  ) {
    updateOtp = await drivers.findOneAndUpdate(
      { mobile: mobileNum, countryCode: countryCode },
      { $set: { otpInfo: { otp: otp, expTime: otpExpTime } } }
    );
  }
  if (updateOtp) {
    return msg.otpSend;
  } else {
    throw new Error("otp not saved");
  }
};
//-------------------------------------verify otp ---------------------------------------------------------------------------------------------------------------

//verify the otp during rider reg. and ch

let verifyOtp = async (req) => {
  console.log(req.user.user._id, "inside verifyotp");
  let userId = req.user.user._id;
  let checkDriver = await drivers.findById({ _id: userId });
  if (!checkDriver || checkDriver === null) {
    throw new Error({ message: msg.notExist });
  }
  let otp = checkDriver.otpInfo.otp;
  let otpExpTime = checkDriver.otpInfo.expTime;
  let currentTime = new Date(Date.now());
  if (currentTime > otpExpTime) throw { message: msg.otpExpired };
  if (otp != req.body.otp) {
    throw { message: msg.otpNotMatched };
  } else {
    let r = await drivers.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          isMobileVerified: true,
          otpInfo: { otp: null, expTime: Date.now() },
        },
      },
      { new: true }
    );
    r = JSON.parse(JSON.stringify(r));
    return {
      message: msg.otpVerified,
      response: {
        isMobileVerified: r.isMobileVerified,
      },
    };
  }
};

//-----------------------------------------------------------SEND RESEND OTP-----------------------------------------------------------------------------------------------------------------------------------------------------
let sendResendOtp = async (req) => {
  let mobile = req.body.mobile;
  let countryCode = req.body.countryCode;
  // let sendOtp;
  let otp = await randomOtpGenerator();
  let otpExpTime = new Date(Date.now() + config.defaultOTPExpireTime);

  if (
    mobile == null &&
    mobile == "" &&
    countryCode == null &&
    countryCode == ""
  )
    throw { message: msg.mobileNumAndCountryCodeRequire };
  // let a = await sendMessageByTwillio(otp, req.body.mobile, countryCode);

  let sendOtp = await drivers
    .findOneAndUpdate(
      { mobile: mobile, countryCode: countryCode },
      { $set: { otpInfo: { otp: otp, expTime: otpExpTime } } },
      { new: true }
    )
    .lean();
  if (!sendOtp || sendOtp == null) throw { message: msg.mobileNotExist };

  // let token = jwt.sign({ id: sendOtp._id, roleId: sendOtp.roleId }, config.secret);

  let message = msg.otpSend;
  // if (data.key == "resend") message = msg.otpResend;

  return {
    message: message,
  };
};
//------------------------------------------DRIVER PROFILE-----------------------------------------------------------------------------------------
let driverProfile = async(data,driverId,file)=>{

  let checkExist = await drivers.findById(driverId);
    checkExist = JSON.parse(JSON.stringify(checkExist));

  if(!checkExist) throw { message: "Driver not found." };

  if(file){
    file.forEach(fl => {
        if (fl.fieldname == 'driverImage'){ 
          data.driverImage = `/userImage/${fl.filename}`
        }else{
          data.driverIdProof = `/userImage/${fl.filename}`
        }
        console.log(data.driverImage,data.driverIdProof,"hit")
    })
  }
  data.isProfileCreated = 1
  let updateProfile =await drivers.findByIdAndUpdate(driverId,data,{new: true}).lean()
    updateProfile = JSON.parse(JSON.stringify(updateProfile));

  if(!updateProfile) throw{message :'Failed to profile creation.'};

  return{
    response :updateProfile,
    message :'Driver Profile created.'
  }

}








// let driverProfile = async(data,driverId,file)=>{
//   console.log(driverId,"id"); 
//   let checkDriverExist = await drivers.findById(driverId);
//   console.log(checkDriverExist,"dirver") //remove
//   checkDriverExist = JSON.parse(JSON.stringify(checkDriverExist));
//   if(!checkDriverExist) {
//     throw {message : "DRIVER not found."};
//   }
//   if(file){
//     file.forEach(f1 => {
//       if(f1.filename === "driverImage"){
//         data.driverImage = `/driverImage/${f1.filename}`
//       }else {
//         data.driverIdProof = `/driverImage/${f1.filename}`
//       }
//       console.log(data.driverImage,data.driverIdProof,"hit ");
//     });
//   }
//   data.isProfileCreated = 1;
//   let updateProfile = await drivers.findByIdAndUpdate(driverId,data,{new : true}).lean();
//   updateProfile = JSON.parse(JSON.stringify(updateProfile));
//   if(!updateProfile) {
//     throw{message :'Failed to profile creation.'};
//   }
//   return{
//     response : updateProfile,
//     message : "Driver profile created"
//   }
// };



module.exports = {
  registerAsDriver,
  loginDriver,
  resetPasswordDriver,
  sendOtpDuringSignup,
  verifyOtp,
  sendResendOtp,driverProfile
};
