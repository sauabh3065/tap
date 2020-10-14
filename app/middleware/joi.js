const Joi = require("joi");

const REGEX = {
  EMAIL: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,63}$/,
  URL: /^(https?|ftp|torrent|image|irc):\/\/(-\.)?([^\s\/?\.#-]+\.?)+(\/[^\s]*)?$/i,
  ZIP_CODE: /^[0-9]{5}(?:-[0-9]{4})?$/,
  // PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]\S{8,15}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,40})/,
  // COUNTRY_CODE: /^\d{1,4}$/,
  COUNTRY_CODE: /^(\+\d{1,3}|\d{1,4})$/,
  MOBILE_NUMBER: /^\d{6,16}$/,
};

exports.joiForRegistration = (req, res, next) => {
  let data = req.body;
  const schema = Joi.object().keys({
    firstName: Joi.string(),
    lastName: Joi.string(),
    mobile: Joi.number(),
    countryCode: Joi.string(),
    password: Joi.string(),
    deviceToken: Joi.string(),
    email: Joi.string(),
    roleId: Joi.number(),
    deviceType: Joi.number(),
  });

  // validate the request data against the schema
  const result = schema.validate(data, { abortEarly: true });
  if (result.error) {
    throw new Error(result.error);
  }
  next();
};

//-------------------------------------------------------------joi for login----------------------------------------------------------------------------------
exports.joiForlogin = (req, res, next) => {
  let data = req.body;
  const schema = Joi.object().keys({
    mobile: Joi.number().required(),
    countryCode: Joi.number().required(),
    password: Joi.string().required(),
  });

  // validate the request data against the schema
  const result = schema.validate(data, { abortEarly: true });
  if (result.error) {
    throw new Error(result.error);
  }
  next();
};

//-----------------------------------------------------joi for resetPasswordDriver-------------------------------------------------------------------------------
exports.joiForresetPasswordDriver = (req, res, next) => {
  let data = req.body;
  const schema = Joi.object().keys({
    mobile: Joi.number().required(),
    password: Joi.string().required(),
    confirmPassword: Joi.string().required(),
  });
  const result = schema.validate(data, { abortEarly: true });
  if (result.error) {
    throw new Error(result.error);
  }
  next();
};
