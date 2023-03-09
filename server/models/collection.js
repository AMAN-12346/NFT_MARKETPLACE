import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import userType from "../enums/userType";
import status from '../enums/status';

import bcrypt from 'bcryptjs';
import number from "joi/lib/types/number";
import array from "joi/lib/types/array";

const options = {
  collection: "collection",
  timestamps: true
};
const schema = Mongoose.Schema;
var collectionModel = new Schema(
  {
    userId: {
      type: schema.Types.ObjectId,
      ref: 'user'
    },
    brandId: {
      type: schema.Types.ObjectId,
      ref: 'brand'
    },
    contractAddress: {
      type: String
    },
    displayName: {
      type: String
    },
    brandCollectionType: {
      type: String,
      enum: ["SINGLE_BRAND", "MULTI_BRAND"]
    },
    symbol: {
      type: String
    },
    topCollection: {
      type: Number,
      default: 0
    },
    shortURL: {
      type: String
    },
    network: {
      type: String
    },
    baseURI: {
      type: String
    },
    description: {
      type: String
    },
    collectionImage: {
      type: String,
      default: ""
    },
    bannerImage: {
      type: String,
      default: ""
    },
    categoryType: {
      type: String
    },
    isPromoted: {
      type: Boolean,
      default: false
    },
    placeNftCount: {
      type: Number,
      default: 0
    },
    tillDate: {
      type: Date
    },


    collectionType: {
      type: String,
      enum: ["DEFAULT", "REGULAR"],
      default: "DEFAULT"
    },
    userType: { type: String, default: userType.USER },
    status: { type: String, default: status.ACTIVE },
  },
  options
);

collectionModel.plugin(mongoosePaginate);
collectionModel.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("collection", collectionModel);


Mongoose.model("collection", collectionModel).findOne({}, (err, result) => {
  if (err) {
    console.log("DEFAULT Collection ERROR", err);
  }
  else if (result) {
    console.log("Default Collection.");
  }
  else {
    let obj1 = {
    
      contractAddress: "0x320eD388E39D69fbaaF24bd1a779050CaCDb7CbB", // NFT Token
      displayName: "INDIC-CHAIN",
      network: "100",
      baseURI: "https://res.cloudinary.com/dpiw7uxv9/image/upload/v1677148501/swc4np9tc0tlti2kw1ms.png",
      symbol: "IC",
      description: "INDIC-CHAIN collection is for creating NFTs on particular Collection for place all NFTs on marketplace",
      collectionImage: "https://res.cloudinary.com/dpiw7uxv9/image/upload/v1677148501/swc4np9tc0tlti2kw1ms.png",
      bannerImage: "https://newchatmodule.s3.amazonaws.com/uploads/16543479991841654347999018_banner-img5.png",
    };
   

    Mongoose.model("collection", collectionModel).create(obj1, async (err1, result1) => {
      if (err1) {
        console.log("DEFAULT Collection  creation ERROR", err1);
      } else {
        console.log("DEFAULT Collection Created", result1);
      }
    });
  }
});









