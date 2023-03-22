import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import status from '../enums/status';

const options = {
    collection: "bid",
    timestamps: true
};
const schema = Mongoose.Schema;
var bidModel = new Schema({
    userId: {
        type: schema.Types.ObjectId,
        ref: 'user'
    },
    collectionId: {
        type: schema.Types.ObjectId,
        ref: 'collection'
    },
    orderId: {
        type: schema.Types.ObjectId,
        ref: 'order'
    },
    nftId: {   
        type: schema.Types.ObjectId,
        ref: 'nft'
    },
    bidderId: {
        type: schema.Types.ObjectId,
        ref: 'user'
    },
    ownerId: {
        type: schema.Types.ObjectId,
        ref: 'user'
    },
    tokenId: {
        type: String,  
    },
    contractAddress: {
        type: String
    },
    walletAddress: {
        type: String
    },
    price: {
        type: Number,
    },
    expireTime: {
        type: String,
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: ["ACTIVE", "BLOCK", "DELETE"],
        default: "ACTIVE"
    },
    bidStatus: {
        type: String,
        enum: ["PENDING", "ACCEPTED", "CANCELLED"],
        default: "PENDING"
    }   
},
    options
);
bidModel.plugin(mongoosePaginate);
bidModel.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("bid", bidModel);
