import Mongoose, { Schema } from "mongoose";
import status from '../enums/status';

const options = {
    collection: "newsletter",
    timestamps: true
};

const schema = new Schema(
    {
        email: { type: String },
        status: { type: String, default: status.ACTIVE }
    },
    options
);

module.exports = Mongoose.model("newsletter", schema);