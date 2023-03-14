import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import userType from "../enums/userType";
import status from '../enums/status';
const options = {
    collection: "nft",
    timestamps: true
};
const schema = Mongoose.Schema;
var nftSchema = new schema(
    {
        userId: {
            type: schema.Types.ObjectId,
            ref: 'user'
        },
        nftId: {
            type: schema.Types.ObjectId,
            ref: 'nft'
        },
        collectionId: {
            type: schema.Types.ObjectId,
            ref: 'collection'
        },
        receiverId: {
            type: schema.Types.ObjectId,
            ref: 'user'
        },
        likesUsers: [{
            type: schema.Types.ObjectId,
            ref: 'user'
        }],
        currentOwnerId: {
            type: schema.Types.ObjectId,
            ref: 'user'
        },
        creatorId: {
            type: schema.Types.ObjectId,
            ref: 'user'
        },
        favouriteUsers: [{
            type: schema.Types.ObjectId,
            ref: 'user'
        }],
        favouriteCount: {
            type: Number, default: 0
        },
        likesCount: {
            type: Number, default: 0
        },
        contractAddress: {
            type: String
        },
        mediaFile: {
            type: String
        },
        physicalType: { type: String, enum: ["NORMAL", "SINGLE", "MULTIPLE"] },
        physicalNftImage: [String],
        recipientWalletAddress: { type: String },
        WalletAddress: { type: String },
        recipientBackupWalletAddress: { type: String },

        coverImage: {
            type: String
        },
        itemCategory: {
            type: String
        },
        itemCategory: { type: String },
        title: {
            type: String
        },
        uri: {
            type: String
        },
        mediaType: {
            type: String
        },

        treandingNftCount: {
            type: Number,
            default: 0
        },

        bidAmount: {
            type: Number,
            default: 0
        },
        description: {
            type: String
        },
        properties: {
            type: String
        },
        alternativeTextForNFT: {
            type: String
        },
        tokenId: {
            type: String
        },
        tokenName: {
            type: String
        },
        network: {
            type: String
        },
        royalties: {
            type: String
        },
        likesCount: {
            type: Number
        },
        isPlace: {
            type: Boolean,
            default: false
        },
        isCancel: {
            type: Boolean,
            default: false
        },
        isResale: {
            type: Boolean,
            default: false
        },
        isCreated: {
            type: Boolean,
            default: false
        },
        isReported: {
            type: Boolean
        },
        unlockableContent: {
            type: String
        },
        privateImageUrl: {
            type: String
        },
        privateImageUrlType: {
            type: String
        },
        quantity: {
            type: Number,
            default: 0,
        },
        genQuantity: {
            type: Number,
            default: 0,
        },
        holdQuantity: {
            type: Number,
            default: 0,
        },
        placedQuantity: {
            type: Number,
            default: 0,
        },
        soldQuantity: {
            type: Number,
            default: 0
        },
        codeType: {
            type: String, enum: ["BARCODE", "QRCODE"],
            default: "QRCODE"
        },
        barQRcodeLink: {
            type: String
        },
        ownerHistory: [{
            userId: {
                type: schema.Types.ObjectId,
                ref: 'user'
            },
            soldTime: {
                type: Date,
                default: new Date().toISOString()
            }
        }],
        sellStatus: {
            type: String, enum: ["PENDING", "SOLD"],
            default: "PENDING"
        },
        nftType: {
            type: String, enum: ["NORMAL", "PHYSICAL"],
            default: "NORMAL"
        },
        status: {
            type: String,
            enum: ["ACTIVE", "BLOCK", "DELETE"],
            default: "ACTIVE"
        },
        

    },
    options
);

nftSchema.plugin(mongoosePaginate);
nftSchema.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("nft", nftSchema);
