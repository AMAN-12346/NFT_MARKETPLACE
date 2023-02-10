
import circuitModel from "../../../models/circuit";
import status from "../../../enums/status";


const circuitServices = {

    createCircuit: async (insertObj) => {
        return await circuitModel.create(insertObj);
    },

    findCircuit: async (query) => {
        return await circuitModel.findOne(query);
    },

    updateCircuit: async (query, updateObj) => {
        return await circuitModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    findAllCircuit: async (query) => {
        return await circuitModel.find(query);
    },

    circuitList: async (validatedBody) => {
        let query = { status: status.ACTIVE };
        const { search, page, limit,fromDate,toDate } = validatedBody;
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
        };
        return await circuitModel.paginate(query, options);
    },

}

module.exports = { circuitServices };
