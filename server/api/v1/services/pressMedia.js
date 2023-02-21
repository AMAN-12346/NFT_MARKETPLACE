
import pressaMediaModel from "../../../models/pressMedia";


const pressaMediaServices = {

    createpressaMedia: async (insertObj) => {
        return await pressaMediaModel.create(insertObj);
    },

    findpressaMedia: async (query) => {
        return await pressaMediaModel.findOne(query);
    },

    updatepressaMedia: async (query, updateObj) => {
        return await pressaMediaModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    pressaMediaList: async (query) => {
         query = { status: { $ne: "DELETE" } };                                                                     
        return await pressaMediaModel.find(query);
    }

}

module.exports = { pressaMediaServices };
