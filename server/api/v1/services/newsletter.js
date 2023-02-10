import newsletterModel from "../../../models/newsletter";


const newsletterServices = {

    createNewsletterContent: async (insertObj) => {
        return await newsletterModel.create(insertObj);
    },

    findNewsletterContent: async (query) => {
        return await newsletterModel.findOne(query);
    },

    updateNewsletterContent: async (query, updateObj) => {
        return await newsletterModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    newsletterContentList: async () => {
        return await newsletterModel.find({});
    },

}

module.exports = { newsletterServices };
