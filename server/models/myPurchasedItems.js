import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import status from '../enums/status';

const options = {
    collection: "mypowerUps",
    timestamps: true,
};

const myPowerUps = new Schema(
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
        usedQuantity:{
            type:Number
        },
        used:{
            type:Boolean,
            default:false
        },
        nftId:{
            type: Schema.Types.ObjectId,
            ref: 'nft'
        },
        availableQuantity:{
            type:Number
        },
        status: {
            type: String,
            enum: [status.ACTIVE, status.BLOCK, status.DELETE],
            default: status.ACTIVE
        }
    },
    options
);
myPowerUps.plugin(mongoosePaginate);
myPowerUps.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("mypowerUps", myPowerUps);