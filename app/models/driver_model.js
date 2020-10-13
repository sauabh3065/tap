const mongoose = require("mongoose");

const driverModel = new mongoose.Schema({
    firstName: String,
    lastName: String,
    profileImage: [String],
    isUserActive: {
        type: Boolean,
        default: true
    },
    roleId: {
        type: Number,  //Note: RoleId 1 for admin, 2 for user, 3 for driver
        default: 2
    },
    //.....................................
    email: {
        type: String,
        require: true
    },
    mobile: {
        type: Number,
        require: true
    },
    countryCode: {
        type: String,
        require: true
    },
    isMobileVerified: {
        type: Boolean,
        default: false
    },
    password: String,
    deviceType: Number, // 0 for Android, 1 for IOS
    deviceToken: String,
    //......................................

    otpInfo: {
        otp: String,
        expTime: Date  //otp expiry time
    },

    // country: {
    //     type: String,
    //     default: null
    // },
    // city: {
    //     type: String,
    //     default: null
    // },
    //..................................
    location: {
        type: {
            type: String,
            default: "Point"
        },
        coordinates: {
            type: Array,
            default: [0.01, 0.01]
        }
    },
    latitude: String,
    longitude: String,
    //...................................
    isPushNotificationEnable: {
        type: Boolean,
        default: true
    },

},
    {
        versionKey: false,
        timestamps: true
    }
);


driverModel.index({ 'location': '2dsphere' });

const drivers = mongoose.model('drivers', driverModel);


module.exports = { drivers };
