import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import status from '../enums/status';

const options = {
    collection: "group",
    timestamps: true,
};

const groupModel = new Schema(
    {
        groupName: { type: String },
        createdBy: { type: Mongoose.Types.ObjectId, ref: "user" },
        status: { type: String, default: status.ACTIVE },
        groupImage: { type: String, default: "" },
        eventId: {
            type: Mongoose.Types.ObjectId,
            ref: "event"
        },
        members: [{
            type: Mongoose.Types.ObjectId,
            ref: "user"
        }],
        membersLeft: [{
            userId: {
                type: Mongoose.Types.ObjectId,
                ref: "user"
            },
            time: {
                type: Date
            }
        }],
        usersMuted: [{
            type: Mongoose.Types.ObjectId,
            ref: "user"
        }],

        userFollower: [{
            type: Mongoose.Types.ObjectId,
            ref: "user"
        }]
    },
    options
);
groupModel.plugin(mongoosePaginate);
groupModel.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("group", groupModel);
