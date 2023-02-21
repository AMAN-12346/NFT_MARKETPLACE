import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import status from '../enums/status';
const options = {
    collection: "wallet",
    timestamps: true
};
const schema = Mongoose.Schema;
var walletModel = new Schema({
    userId: {
        type: schema.Types.ObjectId,
        ref: "user"
    },

    collectionId: {
        type: schema.Types.ObjectId,
        ref: "collection"
    },
    followerId: {
        type: schema.Types.ObjectId,
        ref: "user"
    },
    walletAddress: {
        type: String,
    },
    walletType: {
        type: String,
        enum: ["PRIMARY", "SECONDARY"]
    },


    status: { type: String, default: status.ACTIVE },

},
    options
);

walletModel.plugin(mongoosePaginate);
walletModel.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("wallet", walletModel);