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
        collectionId: {
            type: String,
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
        mediaFile: { type: String },
        coverImage: { type: String },
        title: { type: String },
        uri: { type: String },
        mediaType: { type: String },
        trendingNftCount: {
            type: Number,
            default: 0
        },
        description: { type: String },
        properties: {
            type: String
        },
        petName: { type: String },
        tokenId: { type: String },
        tokenName: { type: String },
        network: { type: String },
        royalties: { type: String },
        likesCount: { type: Number },
        isPlace: {
            type: Boolean,
            default: false
        },
        isResale: {
            type: Boolean,
            default: false
        },
        isReported: { type: Boolean },
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
        raceCount: { type: Number, default: 0 },

        attributes: {
            Aerodynamics: { type: Number },
            weight: { type: String },
            BMI: { type: String},
            Age: { type: Date},
            ShoeType: {type: String },
            Coat: {type: String},
            Tail: { type: String},
            Nurturing: {type: Number },
            gender:{type:String}
        },

        sellStatus: {
            type: String,
            enum: ["PENDING", "SOLD"],
            default: "PENDING"
        },
        status: {
            type: String,
            enum: [status.ACTIVE, status.BLOCK, status.DELETE],
            default: status.ACTIVE
        },
        usedPowerUps:[{
            type: schema.Types.ObjectId,
            ref: 'petstore'
                }]
    },
    options
);

nftSchema.plugin(mongoosePaginate);
nftSchema.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("nft", nftSchema);
