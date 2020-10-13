const Joi = require('joi');

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
        mobile: Joi.number().required(),
        countryCode: Joi.string().regex(REGEX.COUNTRY_CODE),
        password: Joi.string().required(),
        deviceType: Joi.number(),
        deviceToken: Joi.string(),
        email: Joi.string().regex(REGEX.EMAIL)
    });

    // validate the request data against the schema
    Joi.validate(data, schema, (error, value) => {
        if (error) {
            if (error.details && error.details[0].message) {
                res.status(422).json({ message: error.details[0].message });
            } else {
                res.status(422).json({ message: error.message });
            }
        } else {
            next();
        }
    });
};
