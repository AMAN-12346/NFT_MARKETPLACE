
import trackingModel from "../../../models/tracking";
import mongoose from "mongoose";


const trackingServices = {

    createTracking: async (insertObj) => {
        return await trackingModel.create(insertObj);
    },

    findTracking: async (query) => {
        return await trackingModel.findOne(query);
    },

    updateTracking: async (query, updateObj) => {
        return await trackingModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    trackingList: async (query) => {
        return await trackingModel.find(query).populate('nftId receiverId');
    },
    trackingListParticular: async (userId) => {
        let query = { userId: mongoose.Types.ObjectId(userId) }
        return await trackingModel.find(query)
    },
    trackingListWithPopulate: async (query) => {
        return await trackingModel.find(query).populate('nftId receiverId userId');
    },

}

module.exports = { trackingServices };

