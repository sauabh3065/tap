const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    token: String
},
    {
        versionKey: false
    }
);

const restrictedtokens = mongoose.model('restrictedtokens', tokenSchema);
module.exports = { restrictedtokens };
