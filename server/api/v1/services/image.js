
import imageModel from "../../../models/images";
import status from '../../../enums/status';

const imageServices = {

    createImage: async (insertObj) => {
        return await imageModel.create(insertObj);
    },

    findImage: async (query) => {
        return await imageModel.findOne(query).select("image");
    },

  

}

module.exports = { imageServices };
