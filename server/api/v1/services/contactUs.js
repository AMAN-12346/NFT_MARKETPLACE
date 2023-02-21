
import contactUsModel from "../../../models/contactUs";
import status from '../../../enums/status';



const contactUsServices = {

    createContactUs: async (insertObj) => {
        return await contactUsModel.create(insertObj);
    },


}

module.exports = { contactUsServices };
