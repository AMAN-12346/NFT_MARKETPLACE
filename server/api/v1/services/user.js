
import userModel from "../../../models/user";
import status from '../../../enums/status';
import mongoose from "mongoose";
import userType from '../../../enums/userType';



const userServices = {

  createUser: async (insertObj) => {
    return await userModel.create(insertObj);
  },

  findUser: async (query) => {
    return await userModel.findOne(query);
  },

  findUserWithPopulate: async (query) => {
    return await userModel.findOne(query).populate('petstores.petstoreId');
  },

  findAllUsers: async (query) => {
    return await userModel.find(query);
  },

  updateUser: async (query, updateObj) => {
    return await userModel.findOneAndUpdate(query, updateObj, { upsert: true, new: true });
  },

  userList: async (validatedBody) => {
    let query = { status: { $ne: status.DELETE }, userType: userType.USER };
    const { search, page, limit, fromDate, toDate } = validatedBody;
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
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { walletAddress: { $regex: search, $options: 'i' } },
      ]
    }

    let options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      sort: { createdAt: -1 },
    };
    return await userModel.paginate(query, options);
  },

}

module.exports = { userServices };

