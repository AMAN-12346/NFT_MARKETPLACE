
import metadataModel from "../../../models/metadata";
import status from '../../../enums/status';

const metadataServices = {

    createMetadata: async (insertObj) => {
        return await metadataModel.create(insertObj);
    },

    findMetadata: async (query) => {
        return await metadataModel.findOne(query);
    },



}

module.exports = { metadataServices };
