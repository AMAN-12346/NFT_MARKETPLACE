
import groupModel from "../../../models/group";
import status from '../../../enums/status';
import mongoose from "mongoose";


const groupServices = {


    createGroup: async (insertObj) => {
        return await groupModel.create(insertObj);
    },

    createManyGroup: async (insertObj) => {
        return await groupModel.insertMany(insertObj);
    },

    findGroup: async (query) => {
        return await groupModel.findOne(query);
    },

    findGroupAndPopulate: async (eventId) => {
        // return await groupModel.findOne(query).populate('members', 'name walletAddress email');
        const query = { eventId: mongoose.Types.ObjectId(eventId) }
        return groupModel.aggregate([
            {
                $match: query
            },
            {
                $lookup: {
                    from: "user",
                    localField: "members",
                    foreignField: "_id",
                    as: "members"
                }
            },
            {
                $lookup: {
                    from: "chat",
                    localField: "_id",
                    foreignField: "groupId",
                    as: "chatDetails"
                }
            },
            {
                $unwind: {
                    path: "$chatDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    "chatDetails.messages": 0
                }
            }
        ]);
    },


    findMembers: async (query) => {
        return await groupModel.findOne(query)
    },

    goupLeftMember: async (groupId, userId) => {
        return await groupModel.findOne({ _id: groupId, membersLeft: { $elemMatch: { userId: userId } } }).select({ membersLeft: { $elemMatch: { userId: userId } } });
    },

    updateGroup: async (query, updateObj) => {
        return await groupModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    updateManyGroup: async (query, updateObj) => {
        return await groupModel.updateMany(query, updateObj, { new: true, multi: true });
    },

    groupList: async (query) => {
        return await groupModel.find(query);
    },

}

module.exports = { groupServices };

