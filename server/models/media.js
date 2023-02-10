import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import status from '../enums/status';
import mediaType from "../enums/mediaType";

const options = {
    collection: "media",
    timestamps: true,
};

const mediaModel = new Schema(
    {
        title: { type: String },
        description: { type: String },
        image: { type: String },
        type: {
            type: String,
            enum: [mediaType.LOGO, mediaType.GALLERY],
        },
        url: { type: String },
        status: {
            type: String,
            enum: [status.ACTIVE, status.BLOCK, status.DELETE],
            default: status.ACTIVE
        }

    },
    options
);
mediaModel.plugin(mongoosePaginate);
mediaModel.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("media", mediaModel);