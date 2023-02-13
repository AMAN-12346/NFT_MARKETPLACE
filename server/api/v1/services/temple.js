
import templeModel from "../../../models/temple";


const templeServices = {

    temple_templeContent: async (insertObj) => {
        return await templeModel.create(insertObj);
    },

    findtempleContent: async (query) => {
        return await templeModel.findOne(query);
    },

    updatetempleContent: async (query, updateObj) => {
        return await templeModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    templeList: async () => {
        return await templeModel.find({});
    },

}


module.exports = { templeServices};