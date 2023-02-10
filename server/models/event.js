import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import status from '../enums/status';

const options = {
    collection: "event",
    timestamps: true,
};

const eventModel = new Schema(
    {
        name: { type: String },
        description: { type: String },
        image: { type: String },
        logo: { type: String },
        laps: {
            type: Number,
            default: 1
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        price: { type: Number },
        fee: { type: Number },
        startDate: { type: Date },
        endDate: { type: Date },
        registrationTime: { type: Number },
        raceStartTime: { type: Number },
        gameTime: { type: Number },
        noOfPlayers: { type: Number },
        scheduleRange: {
            startDate: { type: Date },
            endDate: { type: Date }
        },
        circuitId: {
            type: Schema.Types.ObjectId,
            ref: "circuit"
        },
        usersJoined: [{
            type: Schema.Types.ObjectId,
            ref: "user"
        }],
        likesUsers: [{
            type: Schema.Types.ObjectId,
            ref: 'user'
        }],
        status: {
            type: String,
            enum: [status.ACTIVE, status.BLOCK, status.DELETE],
            default: status.ACTIVE
        },
        timeDuration: { type: Number },
        scheduleCount: { type: Number },
        userEntered: { type: Number, default: 0 },
        rewardProvided: { type: Boolean, default: false },
        isActive: { type: Boolean },
        isRefunded: { type: Boolean }

    },
    options
);
eventModel.plugin(mongoosePaginate);
eventModel.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("event", eventModel);