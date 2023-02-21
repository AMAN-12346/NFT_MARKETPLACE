import collectionModel from "../../../models/collection";
import status from '../../../enums/status';
import mongoose from "mongoose";

const collectionServices = {

    createCollection: async (insertObj) => {
        return await collectionModel.create(insertObj);
    },

    findCollection: async (query) => {
        return await collectionModel.findOne(query).populate("brandId");
    },

    findCollectionForNft: async (query) => {
        return await collectionModel.findOne(query);
    },

    findCollectionForBrand: async (brandId) => {
        let query = { status: { $ne: status.DELETE }, brandCollectionType: "SINGLE_BRAND" };

        if (brandId) {
            query["brandId"] = brandId;
        }

        let [defaultData, brandData] = await Promise.all([
            collectionModel.findOne({ brandCollectionType: "SINGLE_BRAND", collectionType: "DEFAULT" }).sort({ createdAt: -1 }),
            collectionModel.find(query)
        ]);
        console.log("brandData===>", brandData);
        console.log("defaultData===>", defaultData);

        brandData = JSON.parse(JSON.stringify(brandData));
        defaultData = JSON.parse(JSON.stringify(defaultData));
        let data = [defaultData, brandData];
        return data.flat();
    },

    findCollectionForBrandformultiple: async (brandId) => {
        let query = { status: { $ne: status.DELETE }, brandCollectionType: "MULTI_BRAND" };
        if (brandId) {
            query["brandId"] = brandId;
        }

        let [defaultData, brandData] = await Promise.all([
            collectionModel.findOne({ brandCollectionType: "MULTI_BRAND", collectionType: "DEFAULT" }).sort({ createdAt: -1 }),
            collectionModel.find(query)
        ]);
        brandData = JSON.parse(JSON.stringify(brandData));
        defaultData = JSON.parse(JSON.stringify(defaultData));
        let data = [defaultData, brandData];
        return data.flat();
    },

    findOneCollection: async (query) => {
        return await collectionModel.findOne(query);
    },


    updateCollection: async (query, updateObj) => {
        return await collectionModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    updateManyCollection: async (query, updateObj) => {
        return await collectionModel.updateMany(query, updateObj, { new: true });
    },

    collectionList: async (query) => {
        return await collectionModel.find(query);
    },

    collectionListWithPopulateService: async (validatedBody) => {
        let query = { status: { $ne: status.DELETE }, brandCollectionType: { $in: ["MULTI_BRAND", "SINGLE_BRAND"] } };
        if (validatedBody.brandId) {
            query.brandId = validatedBody.brandId;
        }
        let options = {
            page: validatedBody.page || 1,
            limit: validatedBody.limit || 10,
            sort: { createdAt: -1 },
            populate: { path: 'userId' }
        };
        return await collectionModel.paginate(query, options);
    },

    collectionPaginateSearch: async (validatedBody) => {
        let query = { status: { $ne: status.DELETE }, brandCollectionType: { $nin: ["MULTI_BRAND", "SINGLE_BRAND"] } };
        const { search, fromDate, toDate, page, limit, isPromoted } = validatedBody;
        if (search) {
            query.$or = [
                { contractAddress: { $regex: search, $options: 'i' } },
                { displayName: { $regex: search, $options: 'i' } },
                { symbol: { $regex: search, $options: 'i' } },
                { categoryType: { $regex: search, $options: 'i' } }
            ]
        }
        if (isPromoted) {
            isPromoted === false ? query.isPromoted = false : false;
        }
        if (isPromoted) {
            isPromoted === true ? query.isPromoted = true : true;
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
        let options = {
            page: page || 1,
            limit: limit || 24,
            sort: { isPromoted: -1, createdAt: -1 }
        };
        return await collectionModel.paginate(query, options);
    },



    collectionListWithPopulate: async (query) => {
        return await collectionModel.find(query).populate('userId');
    },


    myCollectionPaginateSearch: async (validatedBody, userId) => {
        let query = { $and: [{ status: { $ne: status.DELETE } }, { brandCollectionType: { $nin: ["SINGLE_BRAND", "MULTI_BRAND"] } }, { $or: [{ userId: userId }, { collectionType: "DEFAULT" }] }] }
        const { search, fromDate, toDate, page, limit, isPromoted, recentalyTraded } = validatedBody;
        if (search) {
            query.$or = [
                { contractAddress: { $regex: search, $options: 'i' } },
                { displayName: { $regex: search, $options: 'i' } },
                { symbol: { $regex: search, $options: 'i' } },
                { categoryType: { $regex: search, $options: 'i' } },
            ]
        }
        if (isPromoted) {
            isPromoted === true ? query.isPromoted = true : true;
        }

        if (recentalyTraded) {
            recentalyTraded === true ? options.sort = { updatedAt: -1 } : options;
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
        let options = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 24,
            sort: { createdAt: -1, }

        };
        return await collectionModel.paginate(query, options);
    },

    hotCollectionPaginateSearch: async (validatedBody) => {
        let query = { status: { $ne: status.DELETE }, isPromoted: true, tillDate: { $gte: new Date().toISOString() } }
        const { search, fromDate, toDate, page, limit } = validatedBody;
        if (search) {
            query.$or = [
                { contractAddress: { $regex: search, $options: 'i' } },
                { displayName: { $regex: search, $options: 'i' } },
                { symbol: { $regex: search, $options: 'i' } },
                { categoryType: { $regex: search, $options: 'i' } }
            ]
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
        let options = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
        };
        return await collectionModel.paginate(query, options);
    },


}

module.exports = { collectionServices };
