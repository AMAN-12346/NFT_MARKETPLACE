import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import { FieldValueList } from "twilio/lib/rest/autopilot/v1/assistant/fieldType/fieldValue";
const options = {
    collection: "order",
    timestamps: true
};
const schema = Mongoose.Schema;
var orderSchema = new schema(
    {
        userId: {
            type: schema.Types.ObjectId,
            ref: 'user'
        },
        currentOwner: {
            type: schema.Types.ObjectId,
            ref: 'user'
        },
        creatorId: {
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
        currentOwner: {
            type: schema.Types.ObjectId,
            ref: 'user'
        },
        bidId: [{
            type: schema.Types.ObjectId,
            ref: 'bid'
        }],
        likesUsers: [{
            type: schema.Types.ObjectId,
            ref: 'user'
        }],
        favouriteUsers: [{
            type: schema.Types.ObjectId,
            ref: 'user'
        }],
        favouriteCount: {
            type: Number, default: 0
        },
        buyerId: {
            type: schema.Types.ObjectId,
            ref: 'user'
        },
        sellerId: {
            type: schema.Types.ObjectId,
            ref: 'user'
        },
        brandId: {
            type: schema.Types.ObjectId,
            ref: 'brand'
        },
        network: {
            type: String
        },
        likesCount: {
            type: Number
        },
        description: {
            type: String
        },
        tokenId: {
            type: String
        },
        itemCategory: {
            type: String
        },
        mediaUrl: {
            type: String
        },
        mediaType: {
            type: String
        },
        nftType: {
            type: String
        },
        details: {
            type: String
        },
        rating: [{
            userId: {
                type: schema.Types.ObjectId,
                ref: 'user'
            },
            rating: {
                type: Number,
                default: 0,
                max: 5,
            },
            comment: {
                type: String
            }
        }],
        time: {
            type: String
        },
        startingBid: {
            type: String
        },
        tokenName: {
            type: String
        },
        description: {
            type: String
        },
        royalties: {
            type: String
        },
        startPrice: {
            type: String
        },
        price: {
            type: Number
        },
        coupounAddress: {
            type: String
        },
        startTime: {
            type: String
        },
        endTime: {
            type: String
        },
        expiryTime: {
            type: String
        },
        isDeleted: { type: Boolean },
        bidCount: {
            type: Number, default: 0
        },
        visitCount: {
            type: Number, default: 0
        },
        sellCount: {
            type: Number, default: 0
        },
        isCancel: {
            type: Boolean,
            default: false
        },
        isCreated: {
            type: Boolean
        },
        isReported: {
            type: Boolean
        },
        quantity: {
            type: Number,
            default: 0,
        },
        buyerDetails: [{
            buyerId: {
                type: schema.Types.ObjectId,
                ref: 'user'
            },
            quantity: {
                type: Number,
                default: 0,
            },
            price: {
                type: Number,
                default: 0,
            },
        }],

        trackingDetails: [{
            userId: {
                type: schema.Types.ObjectId,
                ref: 'user'
            },
            comment: {
                type: Number,
                default: 0,
            },
        }],

        saleType: {
            type: String,
            enum: ["ONSALE", "OFFSALE"],
            default: "ONSALE"
        },
        sellStatus: { type: String },
        orderType: {
            type: String,
            enum: ["FIXED_PRICE", "TIMED_AUCTION", "BID", "NONE"],
            default: "NONE"
        },
        isImport:{type:Boolean,default:false},    
        status: {
            type: String,
            enum: ["ACTIVE", "BLOCK", "DELETE", "CANCEL"],
            default: "ACTIVE"
        }
    },
    options
);

orderSchema.plugin(mongoosePaginate);
orderSchema.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("order", orderSchema);
