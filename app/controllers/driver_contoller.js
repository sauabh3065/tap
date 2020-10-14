const {registerAsDriver,loginDriver,resetPasswordDriver}  = require("../business/driver_business");



exports.registerAsDriver = async (req, res) => {
  try {
    
    let r = await registerAsDriver(req);
    console.log(r)
    res.status(200).send(r);
  } catch (err) {
    console.log("inside catch");
    console.log("Error is : " + err);
    res.status(400).send(err);
  }
};

exports.loginDriver = async (req, res) => {
  try {
    
    let r = await loginDriver(req);
    console.log(r,"yo")
    res.status(200).send(r);
  } catch (err) {
    console.log("inside catch");
    console.log("Error is : " + err);
    res.status(400).send(err);
  }
};

exports.resetPasswordDriver = async (req,res) => {
  try{
    let r = await resetPasswordDriver(req);
    console.log(r,"here");
    res.status(200).send(r);
  }catch (err) {
    console.log("inside catch");
    console.log("Error is : " + err);
    res.status(400).send(err);
  }
}

