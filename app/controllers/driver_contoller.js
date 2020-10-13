const {registerAsDriver}= require("../business/driver_business");

exports.registerAsDriver = async (req, res) => {
  try {
    console.log("above r");
    let r = await registerAsDriver(req);
    console.log("beloowwwww",r);
    res.status(200).send(r);
  } catch (err) {
    console.log("inside catch");
    console.log("Error is : " + err);
    res.status(400).send(err);
  }
};
