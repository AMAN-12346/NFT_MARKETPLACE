import Mongoose, { Schema } from "mongoose";

const options = {
    collection: "images",
    timestamps: true
};

const schemaDefination = new Schema(
    {
        number: { type: String },
        image: { type: String },
      
    },
    options
);

module.exports = Mongoose.model("images", schemaDefination);

