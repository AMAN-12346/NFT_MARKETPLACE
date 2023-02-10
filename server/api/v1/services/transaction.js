import transactionModel from "../../../models/transaction";
import status from '../../../enums/status';
import mongoose from 'mongoose';
const schema = mongoose.Schema;
const transactionServices = {

    createTransaction: async (insertObj) => {
        return await transactionModel.create(insertObj);
    },

    findTransaction: async (query) => {
        return await transactionModel.findOne(query).sort({ createdAt: -1 });
    },

    updateTransaction: async (query, updateObj) => {
        return await transactionModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    transactionList: async (query) => {
        return await transactionModel.find(query);
    },

    transactionHistory: async (validatedBody) => {
        const { search, userId, transactionType, transactionStatus, fromDate, toDate, page, limit, title } = validatedBody;
        let query = { userId: userId, status: { $ne: status.DELETE } }

        if (search) {
            query.$or = [
                { fromAddress: { $regex: search, $options: 'i' } },
                { toAddress: { $regex: search, $options: 'i' } },
                { transactionHash: { $regex: search, $options: 'i' } },
                // { transactionType: { $regex: search, $options: 'i' } },
                // { transactionStatus: { $regex: search, $options: 'i' } },
            ]
        }
        if (title) { query.title = title };
        if (transactionType) query.transactionType = { $regex: transactionType, $options: 'i' };
        if (transactionStatus) query.transactionStatus = { $regex: transactionStatus, $options: 'i' };

        if (fromDate && !toDate) {
            query.createdAt = { $gte: new Date(fromDate) };
        }
        if (!fromDate && toDate) {
            query.createdAt = { $lte: new Date(toDate) };
        }
        if (fromDate && toDate) {
            query.$and = [
                { createdAt: { $gte: new Date(fromDate) } },
                { createdAt: { $lte: new Date(toDate) } },
            ]
        }
        let aggregate = transactionModel.aggregate([
            {
                $match: query
            },
            {
                $lookup: {
                    from: "user",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userId"
                }
            },
            {
                $unwind: {
                    path: "$userId",
                    preserveNullAndEmptyArrays: true
                },
            },
            {
                $project: {
                    "userId.accountDetails": 0
                }
            }
        ]);
        let options = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            sort: { createdAt: -1 }
        }
        return await transactionModel.aggregatePaginate(aggregate, options);
    },

    transactionCount: async (query) => {
        return await transactionModel.countDocuments(query);
    },

    dropTransactionData: async () => {
        return await transactionModel.deleteMany({});
    },



}

module.exports = { transactionServices };
