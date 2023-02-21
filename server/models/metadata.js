import Mongoose, { Schema } from "mongoose";

const options = {
    collection: "metadata",
    timestamps: true
};

const schemaDefination = new Schema(
    {
        number: { type: String },
        id: { type: Number },
        name: { type: String },
        edition: { type: String },
        image: { type: String },
        cloud_image: { type: String },
        attributes: [{
            trait_type: { type: String },
            value: { type: String }
        }]
    },
    options
);

module.exports = Mongoose.model("metadata", schemaDefination);


