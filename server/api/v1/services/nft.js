
import nftModel from "../../../models/nft";
import status from "../../../enums/status";


const nftServices = {

    createNft: async (insertObj) => {
        return await nftModel.create(insertObj);
    },

    findNft: async (query) => {
        return await nftModel.findOne(query);
    },

    updateNft: async (query, updateObj) => {
        return await nftModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    findAllNft: async (query) => {
        return await nftModel.find(query)
    },

    findAllNft: async (query) => {
        // return await nftModel.find(query);
        return nftModel.aggregate([
            {
                $match: query
            },
            {
                $lookup: {
                    from: "dog_history",
                    localField: "_id",
                    foreignField: "dogId",
                    as: "dog_history"
                }
            },
            {
                $unwind: {
                    path: "$dog_history",
                    preserveNullAndEmptyArrays: true
                }
            }
        ]);
    },

    findAllNft1: async (query) => {
        return await nftModel.find(query).populate({path:"usedPowerUps",populate:'categoryId'});
    },
    nftList: async (validatedBody) => {
        let query = { status: status.ACTIVE };
        const { search, page, limit } = validatedBody;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ]
        }

        let options = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            sort: { createdAt: -1 },
        };
        return await nftModel.paginate(query, options);
    },

}

module.exports = { nftServices };
