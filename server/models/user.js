import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import userType from "../enums/userType";
import bcrypt from "bcryptjs"
import status from '../enums/status';

const options = {
    collection: "user",
    timestamps: true,
};

const userModel = new Schema(
    {
        name: { type: String },
        walletAddress: { type: String },
        email: { type: String },
        userType: { type: String, default: userType.USER },
        password: { type: String },
        status: {
            type: String,
            enum: [status.ACTIVE, status.BLOCK, status.DELETE],
            default: status.ACTIVE
        },
        isReset: { type: Boolean },
        countryCode: { type: String },
        mobileNumber: { type: String },
        country: { type: String },
        profilePic: { type: String, default: "https://newchatmodule.s3.us-east-2.amazonaws.com/uploads/16484483727471648448372728_33-338711_circle-user-icon-blue-hd-png-download.png" },
        coverImage: { type: String },
        deviceToken: { type: String },
        bio: { type: String },
        isOnline: { type: Boolean, default: false },
        onlineTime: { type: Date },
        offlineTime: { type: Date },
        petstores: [{
            petstoreId: {
                type: Schema.Types.ObjectId,
                ref: "petstore"
            },
            dogId: {
                type: Schema.Types.ObjectId,
                ref: "nft"
            }
        }]
    },
    options
);
userModel.plugin(mongoosePaginate);
userModel.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("user", userModel);

(async () => {
    const adminResult = await Mongoose.model("user", userModel).find({ userType: userType.ADMIN })
    if (adminResult.length != 0) {
        console.log("Default admin already created.");
    }
    else {
        let obj = {
            name: "pawsome",
            email: "nft.admin@mobiloitte.com",
            walletAddress: "0x712a238cc2F9168fbBB5ED8B23c8AD78a8fc6f09",
            userType: userType.ADMIN,
            password: bcrypt.hashSync("Mobiloitte1"),
            countryCode: "+91",
            mobileNumber: "7017446378",
            country: "India"
        }

        let result = await Mongoose.model("user", userModel).create(obj);
        console.log("Default admin created", result)
    }

}).call();
