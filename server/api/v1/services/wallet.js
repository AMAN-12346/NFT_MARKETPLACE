
import walletModel from "../../../models/wallet";
import status from '../../../enums/status';
import mongoose from "mongoose";



const walletServices = {

  createWallet: async (insertObj) => {
    return await walletModel.create(insertObj);
  },

  findWallet: async (query) => {
    return await walletModel.findOne(query);
  },
  updateWallet: async (query, updateObj) => {
    return await walletModel.findByIdAndUpdate(query, updateObj, { new: true });
  },

  multiUpdateWallet: async (query, updateObj) => {
    return await walletModel.updateMany(query, updateObj, { multi: true });
  },

  listWallet: async (query) => {
    return await walletModel.find(query);
  },

}

module.exports = { walletServices };

