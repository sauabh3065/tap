const {
  registerAsUser,
  loginUser,
  sendResendOtp,
  logoutUser,
} = require("../business/user_business");

exports.registerAsUser = async (req, res) => {
  try {
    let r = await registerAsUser(req);
    res.status(200).send(r);
  } catch (err) {
    console.log("Error is : " + err);
    res.status(400).send(err);
  }
};

module.exports = { registerAsUser };
