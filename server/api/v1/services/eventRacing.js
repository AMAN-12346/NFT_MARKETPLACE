
import eventRacingModel from "../../../models/eventRacing";
import status from "../../../enums/status";


const eventRacingServices = {

    createEventRacing: async (insertObj) => {
        return await eventRacingModel.create(insertObj);
    },

    findEventRacing: async (query) => {
        return await eventRacingModel.findOne(query);
    },

    findEventRacingWithPopulate: async (query) => {
        return await eventRacingModel.findOne(query).populate([{ path: 'eventId', populate: { path: 'circuitId', select: 'name description image' } }, { path: 'dogId', select: 'userId coverImage uri description tokenId tokenName properties' }]);
    },

    updateEventRacing: async (query, updateObj) => {
        return await eventRacingModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    multiUpdateEventRaceing: async (query, updateObj) => {
        return await eventRacingModel.updateMany(query, updateObj, { multi: true });
    },
    

    findAllEventRacing: async (query) => {
        return await eventRacingModel.find(query);
    },

    findAllEventRacingWithSort: async (query) => {
        return await eventRacingModel.find(query).sort({ totalTime: -1 }).populate([{ path: 'dogId', select: 'userId coverImage uri description tokenId tokenName properties' }, { path: 'userId', select: 'walletAddress profilePic' }, { path: 'eventId', populate: [{ path: 'circuitId' }] }]);
    },

    findAllEventRacingWithPopulate: async (query) => {
        return await eventRacingModel.find(query).sort({ totalTime: 1 }).populate([{ path: 'dogId', select: 'userId coverImage uri description tokenId tokenName properties' }, { path: 'userId', select: 'walletAddress profilePic' }, { path: 'eventId', populate: [{ path: 'circuitId' }] }]);
    },

    profileStats: async (query) => {
        return await eventRacingModel.find(query).sort({ createdAt: -1 }).populate([{ path: 'dogId', select: 'userId coverImage uri description tokenId tokenName properties' }, { path: 'userId', select: 'walletAddress profilePic' }, { path: 'eventId', populate: [{ path: 'circuitId' }] }]);
    },

    updateManyEventRacing: async (query, updateObj) => {
        return await eventRacingModel.updateMany(query, updateObj, { new: true, multi: true });
    },

    eventRacingList: async (validatedBody) => {
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
        return await eventRacingModel.paginate(query, options);
    },

}

module.exports = { eventRacingServices };
