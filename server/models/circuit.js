import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import status from '../enums/status';

const options = {
    collection: "circuit",
    timestamps: true,
};

const circuitModel = new Schema(
    {
        name: { type: String },
        description: { type: String },
        image: { type: String },
        status: {
            type: String,
            enum: [status.ACTIVE, status.BLOCK, status.DELETE],
            default: status.ACTIVE
        }

    },
    options
);
circuitModel.plugin(mongoosePaginate);
circuitModel.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("circuit", circuitModel);