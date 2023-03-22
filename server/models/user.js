import Mongoose, { Schema } from "mongoose";
const schema = Mongoose.Schema;
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import userType from "../enums/userType";
import status from '../enums/status';
import bcrypt from 'bcryptjs';
const options = {
  collection: "user",
  timestamps: true,
};

const userModel = new Schema(
  {
    kycId: {
      type: schema.Types.ObjectId,
      ref: 'kyc'
    },
    walletAddress: { type: String },
    ethAccount: {
      address: { type: String },
      privateKey: { type: String }
    },
    btcAccount: {
      address: { type: String },
      privateKey: { type: String }
    },
    tronAccount: {
      address: { type: String },
      privateKey: { type: String }
    },
    ip: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    name: { type: String },
    userName: { type: String },
    email: { type: String },
    profilePic: { type: String , default:""},
    coverPic: { type: String, default:""},    
    bio: { type: String },      
    facebook: { type: String },
    twitter: { type: String },
    youtube: { type: String },
    telegram: { type: String },
    instagram: { type: String },
    countryCode: { type: String },
    mobileNumber: { type: String ,default:"" },
    userType: { type: String, default: userType.USER },
    socialId: { type: String },
    socialType: { type: String },
    password: { type: String },
    twitterUsername: { type: String },
    personalSite: { type: String },
    planType: { type: String, default: "Basic" },
    address:{type:String},
    pass: { type: String },
    twoFAUrl: { type: String },
    base32: { type: String },
    otp: { type: Number },
    otpTime: { type: Number },
    otpVerification: { type: Boolean, default: false },
    deviceToken: { type: String },
    deviceType: { type: String },
    referralCode: { type: String },
    isReset: { type: Boolean },
    message: { type: String },
    blockStatus: { type: Boolean, default: false },
    isUpdated: { type: Boolean, default: false },
    orderCount: { type: Number, default: 0 },
    topSaler: { type: Number, default: 0 },
    topBuyer: { type: Number, default: 0 },
    userType: { type: String, default: userType.USER },
    status: { type: String, default: status.ACTIVE },
    totalEarning: {
      type: Number,
      default: 0
    },
    subscriberCount: {
      type: Number,
      default: 0
    },
    profileSubscriberCount: {
      type: Number,
      default: 0
    },
    profileSubscribe: [{
      type: Schema.Types.ObjectId,
      ref: 'user'
    }],
    subscriberList: [{
      type: Schema.Types.ObjectId,
      ref: 'user'
    }],
    subscribeNft: [{
      type: Schema.Types.ObjectId,
      ref: 'nft'
    }],
    likesNft: [{
      type: Schema.Types.ObjectId,
      ref: 'nft'
    }],
    favouriteOrder: [{
      type: Schema.Types.ObjectId,
      ref: 'order'
    }],
    likesOrder: [{
      type: Schema.Types.ObjectId,
      ref: 'order'
    }],
    likesAuctionNft: [{
      type: Schema.Types.ObjectId,
      ref: 'auctionNft'
    }],
    likesFeed: [{
      type: Schema.Types.ObjectId,
      ref: 'audience'
    }],
    followers: [{
      type: Schema.Types.ObjectId,
      ref: 'user'
    }],
    followersCount: {
      type: Number, default: 0
    },
    following: [{
      type: Schema.Types.ObjectId,
      ref: 'user'
    }],
    followingCount: {
      type: Number, default: 0
    },
    tokenId: {
      type: String

    },
    walletType: {
      type: String,
      enum: ["PRIMARY", "SECONDARY"]
    },

    customUrl: {
      type: String
    },
    isUnblockRequest: { type: Boolean, default: false },
    isReported: {
      type: Boolean
    },


    permissions: {
      reportManagement: { type: Boolean, default: false },
      userManagement: { type: Boolean, default: false },
      subadminManagement: { type: Boolean, default: false },
      staticContentManagement: { type: Boolean, default: false },
      contactUsManagement: { type: Boolean, default: false },
      notificationManagement: { type: Boolean, default: false },
    },
    status: { type: String, default: status.ACTIVE },
  },

  options
);
userModel.plugin(mongoosePaginate);
userModel.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("user", userModel);

Mongoose.model("user", userModel).find({ userType: userType.ADMIN }, async (err, result) => {
  if (err) {
    console.log("DEFAULT ADMIN ERROR", err);
  }
  else if (result.length != 0) {
    console.log("Default Admin.");
  }
  else {
    let obj = {
      userType: userType.ADMIN,
      name: "Avi",
      countryCode: "+91",
      mobileNumber: "8630310433",
      email: "avi.saini@indicchain.com",
      // walletAddress: "0x8B8311F04DEA09BbD06781c4DCEaEC3000d8E7aa", //
      walletAddress: "0xE8C852FB61a6350caa4a5301ECaEa4F5DF2eAdE9",
      dateOfBirth: "15022000",
      gender: "Male",
      otpVerification: "true",
      password: bcrypt.hashSync("Mobiloitte@1"),
      address: "Saharanpur, UP, India",
      permissions: {
        reportManagement: true,
        userManagement: true,   
        subadminManagement: true,
        staticContentManagement: true,
        contactUsManagement: true,
        notificationManagement: true,
      }
    };
    Mongoose.model("user", userModel).create(obj, async (err1, result1) => {
      if (err1) {
        console.log("DEFAULT ADMIN  creation ERROR", err1);
      } else {
        console.log("DEFAULT ADMIN Created", result1);
      }
    });
  }
});




