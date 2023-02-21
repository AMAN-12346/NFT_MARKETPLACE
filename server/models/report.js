import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
const options = {
    collection: "report",
    timestamps: true
};
const schema = Mongoose.Schema;
var orderSchema = new schema(
    {
        userId: {
            type: schema.Types.ObjectId,
            ref: 'user'
        },
        reporterUserId: {
            type: schema.Types.ObjectId,
            ref: 'user'
        },
        nftId: {
            type: schema.Types.ObjectId,
            ref: 'nft'
        },
        orderId: {
            type: schema.Types.ObjectId,
            ref: 'order'
        },
        name: {
            type: String
        },
        artist: {
            type: String
        },
        tokenId: {
            type: Number
        },
        message: {
            type: String
        },
        actionApply: {
            type: Boolean, default: false
        },
        status: {
            type: String,
            enum: ["ACTIVE", "BLOCK", "DELETE"],
            default: "ACTIVE"
        },
        reportType: {
            type: String,
            enum: ["USER_REPORT", "NFT_REPORT"]
        },
    },
    options
);

orderSchema.plugin(mongoosePaginate);
orderSchema.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("report", orderSchema);