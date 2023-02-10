
import petstoreModel from "../../../models/petstore";
import status from "../../../enums/status";


const petstoreServices = {

    createPetstore: async (insertObj) => {
        return await petstoreModel.create(insertObj);
    },

    findPetstore: async (query) => {
        return await petstoreModel.findOne(query);
    },

    updatePetstore: async (query, updateObj) => {
        return await petstoreModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    findAllPetstore: async (query) => {
        return await petstoreModel.find(query);
    },

    petstoreList: async (validatedBody) => {
        let query = { status: status.ACTIVE };
        const { search, page, limit, fromDate, toDate,categoryId } = validatedBody;
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
        if(categoryId){
            query.categoryId = categoryId;
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
            populate:[{path:'categoryId'}]
        };
        return await petstoreModel.paginate(query, options);
    }
}

module.exports = { petstoreServices };
