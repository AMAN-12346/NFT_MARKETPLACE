
import collectionFeeModel from "../../../models/collectionFee";


const collectionFeeService = {

    createcollectionFee: async (insertObj) => {
        return await collectionFeeModel.create(insertObj);
    },

    findcollectionFee: async (query) => {
        return await collectionFeeModel.findOne(query);
    },

    updatecollectionFee: async (query, updateObj) => {
        return await collectionFeeModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    updateAllcollectionFee: async (query, updateObj) => {
        return await collectionFeeModel.updateMany(query, updateObj, { multi:true });
    },
    collectionFeeList: async () => {
        return await collectionFeeModel.find({});
    },

}

module.exports = { collectionFeeService };
