const jwt = require("jsonwebtoken"); // used to create, sign, and verify tokens
const config = require("../../config"); // get our config file

let verifyToken = (req, res, next) => {
  // check header or url parameters or post parameters for token
  const authHeader = req.headers["authorization"];
  let token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(403).send({ auth: false, message: "No token provided" });
  }
  // verifies secret and check expiration
  jwt.verify(token, config.secret, function (err, decoded) {
    if (err){
      return res
        .status(500)
        .send({ auth: false, message: "JWT has been expired" });
    }
    // if everything is good, save to request for use in other routes
    req.user= decoded;
    // console.log(decoded,"here id")
    // req.roleId = decoded.roleId;
    next();
  });
};

module.exports = { verifyToken };
