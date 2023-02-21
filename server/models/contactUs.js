import Mongoose, { Schema } from "mongoose";
import status from '../enums/status';

const options = {
    collection: "contactus",
    timestamps: true
};

const schemaDefination = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "user"
        },
        message: { type: String },
        name: { type: String },
        email: { type: String },
        status: { type: String, default: status.ACTIVE },
        subject: { type: String },
    },
    options
);

module.exports = Mongoose.model("contactus", schemaDefination);

