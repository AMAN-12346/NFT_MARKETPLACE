import dogHistoryModel from "../../../models/dogHistory";
import status from '../../../enums/status';


const dogHistoryServices = {
    createDogHistory: async (insertObj) => {
        return await dogHistoryModel.create(insertObj);
    },

    findDogHistory: async (query) => {
        return await dogHistoryModel.findOne(query);
    },

    findDogDetails: async (query) => {
        return await dogHistoryModel.findOne(query).populate('userId dogId');
    },

    updateDogHistory: async (query, updateObj) => {
        return await dogHistoryModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    listDogHistory: async (query) => {
        return await dogHistoryModel.find(query).populate("userId eventId dogId");
    },

    listDogHistorySearch: async (filterBy) => {
        let query = { awardAmount: { $gt: 0 }, status: { $ne: status.DELETE } };
        let sortObj = {};
        if (filterBy === "topParticipated") {
            sortObj["noOfTimeParticipated"] = -1;
        } else if (filterBy === "topWinner") {
            sortObj["awardAmount"] = -1;
        } else if (filterBy === "topPerformer") {
            sortObj["timeConsumed"] = 1;
            query["timeConsumed"] = { $gt: 0 }
        } else {
            sortObj["createdAt"] = -1;
        }
        return await dogHistoryModel.find(query).sort(sortObj).populate("userId eventId dogId").limit(50);
    }

}

module.exports = { dogHistoryServices };
