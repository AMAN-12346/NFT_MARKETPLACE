
import mediaModel from "../../../models/media";
import status from "../../../enums/status";


const mediaServices = {

    createMedia: async (insertObj) => {
        return await mediaModel.create(insertObj);
    },

    findMedia: async (query) => {
        return await mediaModel.findOne(query);
    },

    updateMedia: async (query, updateObj) => {
        return await mediaModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    findAllMedia: async (query) => {
        return await mediaModel.find(query);
    },

    mediaList: async (validatedBody) => {
        let query = { status: { $ne: status.DELETE } };
        const { search, type, page, limit, fromDate, toDate } = validatedBody;
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
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ]
        }

        if (type) {
            query.type = type;
        }

        let options = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            sort: { createdAt: -1 },
        };
        return await mediaModel.paginate(query, options);
    },

}

module.exports = { mediaServices };
