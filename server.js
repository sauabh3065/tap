const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { user, password, port } = require('./config');

//..........................................................................................
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.use(express.static(path.join(__dirname, '../uploads')));
//..........................................................................................

// let url = "mongodb://localhost:27017/tapAndGo-node";
// let url = `mongodb://${user}:${password}@3.7.167.100:27017/horseRiding-node`;
// let url = `mongodb://${user}:${password}@localhost:27017/horseRiding-node`;

let url = "mongodb://127.0.0.1:27017/tapAndgo-dev";
//..........................................................................................


const driverRoute = require("./app/routes/driver_routes");
const userRoute = require('./app/routes/user_route');
// const driverRoute = require("./app/routes/driver_route");
// const vendorRoute = require('./app/routes/vendor_route');


app.use('/user', userRoute);
app.use('/driver',driverRoute);

// app.use("/driver",driverRoute);


// app.use('/ping', function (req, res) { //For testing of code update
// 	res.json("abcd")
// });

let mongoClientConstructor = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

mongoose.connect(url, mongoClientConstructor, (err) => {
    if (err) {
        console.log("Error is : " + err);
    } else {
        console.log("MongoDb is successfully connected at....", url);
    }
});


app.listen(port, () => {
    console.log(`Server is connected at port ${port}....`);
});
