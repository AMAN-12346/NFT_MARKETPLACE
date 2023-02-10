import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import status from '../enums/status';

const options = {
    collection: "event_racing",
    timestamps: true,
};

const eventRacing = new Schema(
    {
        eventId: {
            type: Schema.Types.ObjectId,
            ref: "event"
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "user"
        },
        dogId: {
            type: Schema.Types.ObjectId,
            ref: "nft"
        },
        xMove: { type: Number, default: 0 },
        yMove: { type: Number, default: 0 },
        zMove: { type: Number, default: 0 },
        xRotate: { type: Number, default: 0 },
        yRotate: { type: Number, default: 0 },
        zRotate: { type: Number, default: 0 },
        points: { type: Number, default: 0 },
        position: { type: Number },
        lapsTime: [{
            lap: { type: Number },
            time: { type: Number }
        }],
        totalTime: { type: Number, default: 0 },
        isComplete: { type: Boolean, default: false },
        isRewarded: { type: Boolean, default: false },
        driverAssigned: { type: String },
        status: {
            type: String,
            enum: [status.ACTIVE, status.BLOCK, status.DELETE],
            default: status.ACTIVE
        },
        linkExpired: { type: Boolean },

    },
    options
);
eventRacing.plugin(mongoosePaginate);
eventRacing.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("event_racing", eventRacing);