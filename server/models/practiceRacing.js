import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import status from '../enums/status';

const options = {
    collection: "practice_racing",
    timestamps: true,
};

const practiceRacing = new Schema(
    {
        practiceId: {
            type: Schema.Types.ObjectId,
            ref: "practice"
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "user"
        },
        dogId: {
            type: Schema.Types.ObjectId,
            ref: "nft"
        },
        weather: { type: String },
        xMove: { type: Number, default: 0 },
        yMove: { type: Number, default: 0 },
        zMove: { type: Number, default: 0 },
        xRotate: { type: Number, default: 0 },
        yRotate: { type: Number, default: 0 },
        zRotate: { type: Number, default: 0 },
        isComplete: { type: Boolean, default: false },
        lapsTime: [{
            lap: { type: Number },
            time: { type: Number }
        }],
        totalTime: { type: Number, default: 0 },
        status: {
            type: String,
            enum: [status.ACTIVE, status.BLOCK, status.DELETE],
            default: status.ACTIVE
        }

    },
    options
);
practiceRacing.plugin(mongoosePaginate);
practiceRacing.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("practice_racing", practiceRacing);