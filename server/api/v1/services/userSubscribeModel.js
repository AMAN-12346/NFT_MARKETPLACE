
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

    paginateSearchSubscribe: async (validatedBody) => {
        let query = { status: { $ne: status.DELETE } };
        const { search, fromDate, toDate, page, limit } = validatedBody;
        if (search) {
          query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { message: { $regex: search, $options: 'i' } },
          ]
        }
        if (fromDate && !toDate) {
          query.createdAt = { $gte: fromDate };
        }
        if (!fromDate && toDate) {
          query.createdAt = { $lte: toDate };
        }
        if (fromDate && toDate) {
          query.$and = [
            { createdAt: { $gte: fromDate } },
            { createdAt: { $lte: toDate } },
          ]
        }
        let options = {
          page: page || 1,
          limit: limit || 15,
          sort: { createdAt: -1 },
          populate: "orderId nftId userId"
        };
        return await userSubscribeModel.paginate(query, options);
      }
    
    
}

module.exports = { userSubscribeService };
