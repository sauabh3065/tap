const randomstring = require("randomstring");
const jwt =require("jsonwebtoken");
const config = require("../../config");


exports.randomOtpGenerator = () => {
    let text = "";
    let possible = "123456789";

    for (let i = 0; i < 4; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return "1234"
};


exports.randomIdGenerator = () => {
    let text = "";
    let possible = "123456789";
    let str = randomstring.generate(4);

    for (let i = 0; i < 4; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    };
    // let res = `ORD${text}${str}`;
    return `${text}${str}`;
};

//---------------------------------GENERATE TOKEN-----------------------------------------------------------------------------------------------------------------

exports.generateToken  = (user) => {
    return jwt.sign({user}, config.secret, { expiresIn: "18000s" });
};

//-------------------------------------SEnd otp---------------------------------------------------------------------------------------------------------------