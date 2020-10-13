const { users } = require('../models/user_model');

const md5 = require('md5');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('bson');

const { randomOtpGenerator } = require('../helpers/common_function');
const config = require("../../config");
const { restrictedtokens } = require('../models/restricted_token_model');
const { msg } = require('../helpers/messages');
const { password } = require('../../config');




let sendOtpDuringSignup = async (mobileNum, countryCode) => {
    let res;
    let otp = await randomOtpGenerator();
    let otpExpTime = new Date(Date.now() + config.defaultOTPExpireTime);

    if (mobileNum != null && mobileNum != "" && countryCode != null && countryCode != "NA") {
        //Send message via Twillio
        // let a = await sendMessageByTwillio(otp, mobileNum, countryCode);

        res = await users.findOneAndUpdate({ mobile: mobileNum, countryCode: countryCode },
            { $set: { otpInfo: { otp: otp, expTime: otpExpTime } } }, { new: true });
        if (!res || res == null) throw { message: msg.mobileNotExist };
    };
    return { message: msg.otpSend };
};


//-----------------------------------------------------------------------RegisterAsUser----------------------------------------------------------------------------------

let registerAsUser = async (req) => {
    console.log(req.body,"here");
    let data = req.body;
    data.roleId = 2;
    data.mobile = Number(data.mobile);
    // console.log(data.mobile); 
    data.isMobileVerified = false;

    let pass = await md5(password)
    console.log(pass,"hit");
    data.password = pass;
    if (!data.countryCode || data.countryCode == null || data.countryCode == "NA" || data.countryCode == undefined) throw { message: msg.mobileNumAndCountryCodeRequire };

    //check if given number is already exist
    let isMobileExist = await users.findOne({ mobile: data.mobile }).lean();
    if (isMobileExist) throw { message: msg.mobileAlreadyExist };
    //check if given number is already exist
    let isEmailExist = await users.findOne({ email: data.email }).lean();
    if (isEmailExist && isEmailExist.email != undefined && isEmailExist.email != null) throw { message: msg.emailAlreadyExist };

    let res = new users(data);
    let result = await res.save();
    /**
     * if Rider is registered without errors
     * create a token
     */
    let token = jwt.sign({ id: result._id, roleId: result.roleId }, config.secret);
    result['token'] = token;

    // let aa = await sendOtpDuringSignup(data.mobile, data.countryCode);

    return {
        response: result,
        message: msg.registrationSuccessfullAndOtpSentOnMobile
    };
};


let loginUser = async (req) => {
    let data = req.body;

    let res = await users.findOne({ mobile: data.mobile, countryCode: data.countryCode }).lean();
    if (!res || res == null) throw { message: msg.mobileNotExist };

    //Check, if Account is deactivated then user can't login
    if (res.isAccountDeactivated && res.isAccountDeactivated == true) throw { message: msg.thisAccountIsDeactivated }

    //Check if user is blocked or not
    if (res.isBlockedByAdmin == true) throw { message: msg.blockedByAdmin };

    let check = await bcrypt.compare(data.password, res.password);
    if (!check) throw { message: msg.invalidPass };

    let token = jwt.sign({ id: res._id, roleId: res.roleId }, config.secret);
    res['token'] = token;

    //Note: Also update "deviceType" and "deviceToken" during login
    if (data.deviceType && data.deviceToken) {
        let rr = await users.findByIdAndUpdate(res._id, {
            $set: {
                deviceType: data.deviceType,
                deviceToken: data.deviceToken
            }
        }, { new: true });
    };

    return {
        response: res,
        message: msg.loginSuccess
    }
};


let sendResendOtp = async (data) => {
    let mobileNum = data.mobile;
    let countryCode = data.countryCode;
    // let res;
    let otp = await randomOtpGenerator();
    let otpExpTime = new Date(Date.now() + config.defaultOTPExpireTime);

    if (mobileNum == null && mobileNum == "" && countryCode == null && countryCode == "") throw { message: msg.mobileNumAndCountryCodeRequire }
    // let a = await sendMessageByTwillio(otp, mobileNum, countryCode);

    let res = await users.findOneAndUpdate({ mobile: mobileNum, countryCode: countryCode },
        { $set: { otpInfo: { otp: otp, expTime: otpExpTime } } }, { new: true }).lean();
    // if (!res || res == null) throw { message: msg.mobileNotExist };
    // };
    if (!res || res == null) throw { message: msg.mobileNotExist };

    let token = jwt.sign({ id: res._id, roleId: res.roleId }, config.secret);

    let message = msg.otpSend;
    if (data.key == "resend") message = msg.otpResend;

    return {
        message: message,
        response: {
            token: token
        }
    };
};


//API for logout admin/subadmin
let logoutUser = async (userId, token) => {
    let result;
    let res = await restrictedtokens.findOne({ userId: userId }).lean();
    let obj = {
        userId: userId,
        token: token
    };
    if (!res || res == null) {
        let tok = new restrictedtokens(obj);
        result = await tok.save();
    } else {
        result = await restrictedtokens.findOneAndUpdate({ userId: userId }, { $set: { token: token } }, { new: true }).lean();
    }
    if (!result) throw { message: msg.tokenNotSaved };

    return { message: msg.logoutSuccessfully };
};



module.exports = { registerAsUser, loginUser, loginUser, sendResendOtp, logoutUser };
