
import practiceRacingModel from "../../../models/practiceRacing";
import status from "../../../enums/status";


const practiceRacingServices = {

    createPracticeRacing: async (insertObj) => {
        return await practiceRacingModel.create(insertObj);
    },

    findPracticeRacing: async (query) => {
        return await practiceRacingModel.findOne(query);
    },

    findPracticeRacingWithPopulate: async (query) => {
        return await practiceRacingModel.findOne(query).populate([{ path: 'practiceId', populate: { path: 'circuitId', select: 'name description image' } }, { path: 'dogId', select: 'userId coverImage uri description tokenId tokenName properties' }, { path: 'userId', select: 'walletAddress profilePic' }]);
    },

    updatePracticeRacing: async (query, updateObj) => {
        return await practiceRacingModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    findAllPracticeRacing: async (query) => {
        return await practiceRacingModel.find(query);
    },

    findAllPracticeRacingWithPopulate: async (query) => {
        return await practiceRacingModel.find(query).sort({ createdAt: -1 }).populate([{ path: 'dogId', select: 'userId coverImage uri description tokenId tokenName properties' }, { path: 'userId', select: 'walletAddress profilePic' },{path:'practiceId'}]);
    },

    practiceRacingList: async (validatedBody) => {
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
        return await practiceRacingModel.paginate(query, options);
    },

}

module.exports = { practiceRacingServices };
