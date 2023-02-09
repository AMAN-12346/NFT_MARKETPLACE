
import eventModel from "../../../models/event";
import status from "../../../enums/status";


const eventServices = {

    createEvent: async (insertObj) => {
        return await eventModel.create(insertObj);
    },

    createScheduleEvent: async (insertObj) => {
        return await eventModel.insertMany(insertObj);
    },

    findEvent: async (query) => {
        return await eventModel.findOne(query);
    },

    findEventWithPopulate: async (query) => {
        return await eventModel.findOne(query).populate([{ path: 'circuitId' }, { path: 'usersJoined', select: 'walletAddress profilePic' }]);
    },

    updateEvent: async (query, updateObj) => {
        return await eventModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    findAllEvent: async (query) => {
        return await eventModel.find(query).populate([{ path: 'circuitId' }, { path: 'userId' }]);
    },

    findEventWithSort: async (query) => {
        return await eventModel.find(query);
        // return await eventModel.findOne(query).sort({ "scheduleRange.endDate": -1 });
    },

    findEventWithTimeSort: async (query) => {
        return await eventModel.findOne(query).sort({ "scheduleRange.endDate": -1 });
    },

    eventList: async (validatedBody) => {
        let query = { status: status.ACTIVE };
        const { search, page, limit, fromDate, toDate, userId } = validatedBody;
        if (userId) {
            query.userId = userId;
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
            populate: 'circuitId'
        };
        return await eventModel.paginate(query, options);
    },

}

module.exports = { eventServices };
