import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import status from '../enums/status';

const options = {
    collection: "order",
    timestamps: true,
};

const orderModel = new Schema(
    {
        userId:{
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        productId:{
            type: Schema.Types.ObjectId,
            ref: 'petstore'
        },
        quantity:{
            type:Number
        },
        price:{
            type:Number
        },
        nftId:{
            type: Schema.Types.ObjectId,
            ref: 'nft'
        },
        status: {
            type: String,
            enum: [status.ACTIVE, status.BLOCK, status.DELETE],
            default: status.ACTIVE
        }

    },
    options
);
orderModel.plugin(mongoosePaginate);
orderModel.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("order", orderModel);