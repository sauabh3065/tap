const {
    registerAsDriver} = require("../business/driver_business");
  
  exports.registerAsDriver = async (req, res) => {
    try {
      let r = await registerAsDriver(req);
      res.status(200).send(r);
    } catch (err) {
      console.log("Error is : " + err);
      res.status(400).send(err);
    }
  };
  
  module.exports = { registerAsDriver };
  