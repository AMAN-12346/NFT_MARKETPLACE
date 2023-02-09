import socialLinkModel from "../../../models/socialLink";
import status from '../../../enums/status';


const socialLinkServices = {
    createSocialLink: async (insertObj) => {
        return await socialLinkModel.create(insertObj);
    },

    findSocialLink: async (query) => {
        return await socialLinkModel.findOne(query);
    },

    findAllSocialLink: async (query) => {
        return await socialLinkModel.find(query);
    },

    updateSocialLink: async (query, updateObj) => {
        return await socialLinkModel.findOneAndUpdate(query, updateObj, { new: true });
    },
}

module.exports = { socialLinkServices };
