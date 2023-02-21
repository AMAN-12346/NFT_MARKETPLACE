
import userSubscribeModel from "../../../models/userSubscribe";
import status from '../../../enums/status';
import { EMAIL_EXIST } from "../../../../assets/responseMessage";

const userSubscribeService = {

    createSubscribe: async (insertObj) => {
        return await userSubscribeModel.create(insertObj);
    },

    findSubscribe: async (query) => {
        return await userSubscribeModel.findOne(query);
    },
    emailExist: async (email) => {
        let query = { $and: [{ status: { $ne: status.DELETE } }, { email: email }, { isSubscribe: true }] }
        return await userSubscribeModel.findOne(query);
    },

    updateSubscribe: async (query, updateObj) => {
        return await userSubscribeModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    subscriberList: async () => {
        return await userSubscribeModel.find({});
    },



}

module.exports = { userSubscribeService };
