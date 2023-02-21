
import brandModel from "../../../models/brand";
import status from "../../../enums/status"


const brandServices = {

    createBrand: async (insertObj) => {
        return await brandModel.create(insertObj);
    },

    findBrand: async (query) => {
        return await brandModel.findOne(query);
    },

    updateBrand: async (query, updateObj) => {
        return await brandModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    brandList: async (query) => {
        return await brandModel.find(query).populate('orderId').sort({ createdAt: -1 });
    },

    listBrandWithPagination: async (validatedBody) => {
        // brandApproval: "APPROVE" 
        let query = { status: { $ne: status.DELETE }, collectionId: validatedBody.collectionId };
        const { search, fromDate, toDate, page, limit } = validatedBody;
        if (search) {
            query.$or = [
                { brandName: { $regex: search, $options: 'i' } },
            ]
        }
        if (fromDate && !toDate) {
            query.createdAt = { $gte: new Date(new Date(fromDate).setHours(0, 0)).toISOString() };
        }
        if (!fromDate && toDate) {
            query.createdAt = { $lte: new Date(new Date(toDate).setHours(23, 59)).toISOString() };
        }
        if (fromDate && toDate) {
            query.$and = [
                { createdAt: { $gte: new Date(new Date(fromDate).setHours(0, 0)).toISOString() } },
                { createdAt: { $lte: new Date(new Date(toDate).setHours(23, 59)).toISOString() } },
            ]
        }
        let options = {
            page: page || 1,
            limit: limit || 10,
            sort: { createdAt: -1 },
        };
        return await brandModel.paginate(query, options);
    },

    brandListWithPagination: async (validatedBody, userId) => {
        let query = { status: { $ne: status.DELETE }, userId: userId, brandApproval: "APPROVED" };
        const { search, fromDate, toDate, page, limit } = validatedBody;
        if (search) {
            query.$or = [
                { brandName: { $regex: search, $options: 'i' } },
            ]
        }
        if (fromDate && !toDate) {
            query.createdAt = { $gte: new Date(new Date(fromDate).setHours(0, 0)).toISOString() };
        }
        if (!fromDate && toDate) {
            query.createdAt = { $lte: new Date(new Date(toDate).setHours(23, 59)).toISOString() };
        }
        if (fromDate && toDate) {
            query.$and = [
                { createdAt: { $gte: new Date(new Date(fromDate).setHours(0, 0)).toISOString() } },
                { createdAt: { $lte: new Date(new Date(toDate).setHours(23, 59)).toISOString() } },
            ]
        }
        let options = {
            page: page || 1,
            limit: limit || 10,
            sort: { createdAt: -1 },
        };
        return await brandModel.paginate(query, options);
    },
    allBrandListWithPagination: async (validatedBody) => {
        let query = { status: { $ne: status.DELETE }, userId: validatedBody.userId };
        const { search, fromDate, toDate, page, limit } = validatedBody;
        if (search) {
            query.$or = [
                { brandName: { $regex: search, $options: 'i' } },
            ]
        }
        if (fromDate && !toDate) {
            query.createdAt = { $gte: new Date(new Date(fromDate).setHours(0, 0)).toISOString() };
        }
        if (!fromDate && toDate) {
            query.createdAt = { $lte: new Date(new Date(toDate).setHours(23, 59)).toISOString() };
        }
        if (fromDate && toDate) {
            query.$and = [
                { createdAt: { $gte: new Date(new Date(fromDate).setHours(0, 0)).toISOString() } },
                { createdAt: { $lte: new Date(new Date(toDate).setHours(23, 59)).toISOString() } },
            ]
        }
        let options = {
            page: page || 1,
            limit: limit || 10,
            sort: { createdAt: -1 },
        };
        return await brandModel.paginate(query, options);
    },

    hotBrandList: async (query) => {
        return await brandModel.find(query).populate([{
            path: 'orderId',
            match: { endTime: { $gte: new Date().getTime() }, status: { $ne: status.CANCEL } },
            populate: { path: 'nftId userId collectionId' }
        },
        { path: 'collectionId' }]).sort({ bidCount: -1 });
    },

    brandCount: async () => {
        return await brandModel.countDocuments();
    },
    listAllBrandWithPagination: async (validatedBody) => {
        let query = { status: { $ne: status.DELETE }, brandApproval: "APPROVED" };
        const { search, fromDate, toDate, page, limit } = validatedBody;
        if (search) {
            query.$or = [
                { brandName: { $regex: search, $options: 'i' } },
            ]
        }
        if (fromDate && !toDate) {
            query.createdAt = { $gte: new Date(new Date(fromDate).setHours(0, 0)).toISOString() };
        }
        if (!fromDate && toDate) {
            query.createdAt = { $lte: new Date(new Date(toDate).setHours(23, 59)).toISOString() };
        }
        if (fromDate && toDate) {
            query.$and = [
                { createdAt: { $gte: new Date(new Date(fromDate).setHours(0, 0)).toISOString() } },
                { createdAt: { $lte: new Date(new Date(toDate).setHours(23, 59)).toISOString() } },
            ]
        }
        let options = {
            page: page || 1,
            limit: limit || 10,
            sort: { createdAt: -1 },
        };
        return await brandModel.paginate(query, options);
    },


    listRequestBrandWithPagination: async (validatedBody) => {
        let query = { status: { $ne: status.DELETE } };
        const { search, fromDate, toDate, page, limit } = validatedBody;
        if (search) {
            query.$or = [
                { brandName: { $regex: search, $options: 'i' } },
            ]
        }
        if (fromDate && !toDate) {
            query.createdAt = { $gte: new Date(new Date(fromDate).setHours(0, 0)).toISOString() };
        }
        if (!fromDate && toDate) {
            query.createdAt = { $lte: new Date(new Date(toDate).setHours(23, 59)).toISOString() };
        }
        if (fromDate && toDate) {
            query.$and = [
                { createdAt: { $gte: new Date(new Date(fromDate).setHours(0, 0)).toISOString() } },
                { createdAt: { $lte: new Date(new Date(toDate).setHours(23, 59)).toISOString() } },
            ]
        }
        let options = {
            page: page || 1,
            limit: limit || 10,
            sort: { createdAt: -1 },
        };
        return await brandModel.paginate(query, options);
    },
}


module.exports = { brandServices };
