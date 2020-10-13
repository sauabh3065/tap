const randomstring = require("randomstring");

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
