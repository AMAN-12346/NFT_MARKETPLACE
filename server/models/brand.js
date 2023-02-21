import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import status from '../enums/status';
var mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const options = {
    collection: "brand",
    timestamps: true
};
const schema = Mongoose.Schema;

var brandSchema = new schema({

    userId: {
        type: schema.Types.ObjectId,
        ref: 'user'
    },
    collectionId: {
        type: schema.Types.ObjectId,
        ref: 'collection'
    },
    brandName: {
        type: String
    },
    bio: {
        type: String,
        default: ""
    },
    pros: {
        type: String,
        default: ""
    },
    cons: {
        type: String,
        default: ""
    },
    benefits: {
        type: String,
        default: ""
    },
    storeAddress: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        default: ""
    },
    mobileNumber: {
        type: String,
        default: ""
    },
    brandLogo: {
        type: String,
        default: ""
    },
    coverImage: {
        type: String,
        default: ""
    },
 
    facebookLink: {
        type: String
    },
    twitterLink: {
        type: String
    },
    instagramLink: {
        type: String
    },
    telegramLink: {
        type: String
    },
    brandApproval: {
        type: String, enum: ["APPROVED", "REJECT", "PENDING"]
    },
    reason: { type: String },

    status: { type: String, default: status.ACTIVE }
}, options
);

brandSchema.plugin(mongoosePaginate);
brandSchema.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("brand", brandSchema);






// 0x905b0aED34d4A31044b7af53253ACE1BA1Fc106A
// 0x905b0aED34d4A31044b7af53253ACE1BA1Fc106A


// 0x9360c80CA79409b5e315A9791bB0208C02D6ae32
// 0x9360c80CA79409b5e315A9791bB0208C02D6ae32

