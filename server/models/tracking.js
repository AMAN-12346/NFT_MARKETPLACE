import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
const options = {
    collection: "tracking",
    timestamps: true
};
const schema = Mongoose.Schema;
var trackingSchema = new schema(
    {
        userId: {
            type: schema.Types.ObjectId,
            ref: 'user'
        },
        currentOwner: {
            type: schema.Types.ObjectId,
            ref: 'users'
        },  
        previousOwner: {
            type: schema.Types.ObjectId,
            ref: 'users'
        },  
        nftId:{
            type: schema.Types.ObjectId,
            ref: 'nft'
        },
        orderId:{
            type: schema.Types.ObjectId,
            ref: 'order'
        },
        trackingStatus:{
            type:String,
            enum:["COMPLETE","DISPATCH","NOT_RECEIVED","IN_TRANSIT","OUT_FOR_DELIVERY","NONE"],
            default:"NONE"
        },
        currentLocation:{
            type:String
        },
        time:{
            type:String,
        },
        date:{
            type:String
        },
        email:{
            type:String
        },
        comment:{
            type:String
        },
        duration:{
            type:String
        },
        status: {
            type: String,
            enum: ["ACTIVE", "BLOCK", "DELETE"],
            default: "ACTIVE"
        },
    },
    options
);

trackingSchema.plugin(mongoosePaginate);
trackingSchema.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("tracking", trackingSchema);