
import faqModel from "../../../models/faq";


const faqServices = {

    createFAQ: async (insertObj) => {
        return await faqModel.create(insertObj);
    },

    findFAQ: async (query) => {
        return await faqModel.findOne(query);
    },

    updateFAQ: async (query, updateObj) => {
        return await faqModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    FAQList: async (query) => {
         query = { status: { $ne: "DELETE" } };                                                                     
        return await faqModel.find(query);
    }

}

module.exports = { faqServices };
