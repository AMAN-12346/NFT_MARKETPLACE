import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import status from '../enums/status';

const options = {
    collection: "practice",
    timestamps: true,
};

const practiceModel = new Schema(
    {
        name: { type: String },
        description: { type: String },
        fee: { type: Number },
        laps: {
            type: Number,
            default: 1
        },
        circuitId: {
            type: Schema.Types.ObjectId,
            ref: "circuit"
        },
        status: {
            type: String,
            enum: [status.ACTIVE, status.BLOCK, status.DELETE],
            default: status.ACTIVE
        }

    },
    options
);
practiceModel.plugin(mongoosePaginate);
practiceModel.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("practice", practiceModel);