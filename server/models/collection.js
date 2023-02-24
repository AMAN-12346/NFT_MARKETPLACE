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
      // contractAddress:"0x905b0aED34d4A31044b7af53253ACE1BA1Fc106A", //NFT will be final(client)
      contractAddress: "0xB2753a96d0D3E0a300664453fB676a776aD2e5E1", //NFT
      displayName: "INDIC-CHAIN",
      network: "1001",
      baseURI: "https://res.cloudinary.com/dpiw7uxv9/image/upload/v1677148501/swc4np9tc0tlti2kw1ms.png",
      symbol: "IC",
      description: "INDIC-CHAIN collection is for creating NFTs on particular Collection for place all Nfts on marketplace",
      collectionImage: "https://res.cloudinary.com/dpiw7uxv9/image/upload/v1677148501/swc4np9tc0tlti2kw1ms.png",
      bannerImage: "https://newchatmodule.s3.amazonaws.com/uploads/16543479991841654347999018_banner-img5.png",
    };
    // let obj2 = {
    //   contractAddress: "0x8E2Fe35fad9649AF45E1b4D6D9f0C0ecc1Cf7D8e", // wiil be final
    //   // contractAddress:"0x19E52c4E33dEDf1121165528712D9916f646b1eB", //for testng
    //   displayName: "HovR Hooligans",
    //   network: "9732",
    //   baseURI: " https://ipfs.io/ipfs/QmT9KN1aJGh1YorE2bs7g1Ea37HivFktfEH1BhujZ9fw2z",
    //   symbol: "H1",
    //   description: "10,000 of the largest cities in the world that will be used in a P2E Metaverse game soon...",
    //   collectionImage: "https://newchatmodule.s3.us-east-2.amazonaws.com/uploads/16506373163771650637316318_HovR.png",
    //   bannerImage: "https://newchatmodule.s3.amazonaws.com/uploads/16543479991841654347999018_banner-img5.png"
    // };

    // let obj3 = {
    //   contractAddress: "0x8F5D43CfDEE33336b0B4a4136CfB074B85bebafa", // for multiple Physical NFT
    //   // contractAddress:"0x19E52c4E33dEDf1121165528712D9916f646b1eB", //for testng
    //   displayName: "Brand_Multiple",
    //   brandCollectionType: "MULTI_BRAND",
    //   collectionType: "DEFAULT",
    //   network: "9732",
    //   baseURI: " https://ipfs.io/ipfs/QmT9KN1aJGh1YorE2bs7g1Ea37HivFktfEH1BhujZ9fw2z",
    //   symbol: "H1",
    //   description: "10,000 of the largest cities in the world that will be used in a P2E Metaverse game soon...",
    //   collectionImage: "https://newchatmodule.s3.us-east-2.amazonaws.com/uploads/16506373163771650637316318_HovR.png",
    //   bannerImage: "https://newchatmodule.s3.amazonaws.com/uploads/16543479991841654347999018_banner-img5.png"
    // };

    // let obj4 = {
    //   // contractAddress:"0x8E2Fe35fad9649AF45E1b4D6D9f0C0ecc1Cf7D8e", // wiil be final
    //   contractAddress: "0x20B7cbf582e793E23Ff41A385A331ae2FF2b5809", //for single physical NFT
    //   displayName: "Brand_collection",
    //   brandCollectionType: "SINGLE_BRAND",
    //   collectionType: "DEFAULT",
    //   network: "9732",
    //   baseURI: " https://ipfs.io/ipfs/QmT9KN1aJGh1YorE2bs7g1Ea37HivFktfEH1BhujZ9fw2z",
    //   symbol: "H2",
    //   description: "10,000 of the largest cities in the world that will be used in a P2E Metaverse game soon...",
    //   collectionImage: "https://newchatmodule.s3.us-east-2.amazonaws.com/uploads/16506373163771650637316318_HovR.png",
    //   bannerImage: "https://newchatmodule.s3.amazonaws.com/uploads/16543479991841654347999018_banner-img5.png"
    // };

    Mongoose.model("collection", collectionModel).create(obj1, async (err1, result1) => {
      if (err1) {
        console.log("DEFAULT Collection  creation ERROR", err1);
      } else {
        console.log("DEFAULT Collection Created", result1);
      }
    });
  }
});









