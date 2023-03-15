
import nftModel from "../../../models/nft";
import collectionModel from "../../../models/collection";
import orderModel from "../../../models/order";
import userModel from "../../../models/user";
import bidModel from "../../../models/bid";

import status from '../../../enums/status';
import { bidServices } from '../services/bid';

const { hotBidList } = bidServices;

const dashboardServices = {

    dashboardList: async (validatedBody) => {
        const { search } = validatedBody;
        let query = { status: { $ne: status.DELETE } };
        const user = async (query) => {
            query.$or = [
                { walletAddress: { $regex: search, $options: 'i' } },
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } },
                { userName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { mobileNumber: { $regex: search, $options: 'i' } },
                { userType: { $regex: search, $options: 'i' } },
            ]
            return await userModel.find(query);
        }
        const collection = async (query) => {
            query.$or = [
                { contractAddress: { $regex: search, $options: 'i' } },
                { displayName: { $regex: search, $options: 'i' } },
                { symbol: { $regex: search, $options: 'i' } },
                { network: { $regex: search, $options: 'i' } },
                { collectionType: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ]
            return await collectionModel.find(query).populate('userId');
        }
        const nft = async (query) => {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { uri: { $regex: search, $options: 'i' } },
                { mediaType: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tokenName: { $regex: search, $options: 'i' } },
                { network: { $regex: search, $options: 'i' } },
                { royalties: { $regex: search, $options: 'i' } },

            ]
            return await nftModel.find(query).populate('userId collectionId');
        }
        const order = async (query) => {
            query["isDeleted"] = { $ne: true };
            query.$or = [
                { network: { $regex: search, $options: 'i' } },
                { tokenId: { $regex: search, $options: 'i' } },
                { mediaType: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tokenName: { $regex: search, $options: 'i' } },
                { details: { $regex: search, $options: 'i' } },
                { royalties: { $regex: search, $options: 'i' } },
                { tokenName: { $regex: search, $options: 'i' } }
            ]
            return await orderModel.find(query).populate('userId collectionId nftId');
        }

        var [userResult, collectionResult, nftResult, orderResult] = await Promise.all([user(query), collection(query), nft(query), order(query)]);
        return { userResult, collectionResult, nftResult, orderResult };
    },

    dashboardCount: async (query) => {

        const user = await userModel.count();
        const collection = await collectionModel.count();
        const order = await orderModel.count();
        const bid = await hotBidList();
        const bidCount = bid.length;

        return { user, collection, order, bidCount };

    }





}

module.exports = { dashboardServices };


