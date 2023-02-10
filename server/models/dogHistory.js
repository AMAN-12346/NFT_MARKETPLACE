import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import status from '../enums/status';
import mediaType from "../enums/mediaType";

const options = {
    collection: "dog_history",
    timestamps: true,
};

const schemaDetails = new Schema(
    {
        eventId: {
            type: Schema.Types.ObjectId,
            ref: "event"
        },
        eventRacingId: {
            type: Schema.Types.ObjectId,
            ref: "event_racing"
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "user"
        },
        dogId: {
            type: Schema.Types.ObjectId,
            ref: "nft"
        },
        timeConsumed: { type: Number, default: 0 },
        noOfTimeParticipated: { type: Number, default: 0 },
        noOfTimeWin: { type: Number, default: 0 },
        awardAmount: { type: Number, default: 0 },
        status: {
            type: String,
            enum: [status.ACTIVE, status.BLOCK, status.DELETE],
            default: status.ACTIVE
        }

    },
    options
);
schemaDetails.plugin(mongoosePaginate);
schemaDetails.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("dog_history", schemaDetails);