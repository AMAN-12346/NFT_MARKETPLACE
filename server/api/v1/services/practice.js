
import practiceModel from "../../../models/practice";
import status from "../../../enums/status";


const practiceServices = {

    createPractice: async (insertObj) => {
        return await practiceModel.create(insertObj);
    },

    findPractice: async (query) => {
        return await practiceModel.findOne(query);
    },

    updatePractice: async (query, updateObj) => {
        return await practiceModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    findAllPractice: async (query) => {
        return await practiceModel.find(query).populate('circuitId');
    },

    practiceList: async (validatedBody) => {
        let query = { status: status.ACTIVE };
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
                { description: { $regex: search, $options: 'i' } }
            ]
        }

        let options = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            sort: { createdAt: -1 },
            populate: 'circuitId'
        };
        return await practiceModel.paginate(query, options);
    },

}

module.exports = { practiceServices };
