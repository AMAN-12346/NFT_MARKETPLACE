import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import status from '../enums/status';
import boolean from "joi/lib/types/boolean";
const options = {
    collection: "userSubscribe",
    timestamps: true
};
const schema = Mongoose.Schema;
var userSubscribeModel = new Schema({
    userId: {
        type: schema.Types.ObjectId,
        ref: "user"
    },
    email: { 
        type: String 
    },
    isSubscribe:{
        type:Boolean,
        default:false
    },
    
    
    status: { type: String, default: status.ACTIVE },
},
    options
);

userSubscribeModel.plugin(mongoosePaginate);
userSubscribeModel.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("userSubscribe", userSubscribeModel);