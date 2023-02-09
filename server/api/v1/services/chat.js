

import chatModel from "../../../models/chat";
import status from '../../../enums/status';

const chatServices = {

    createChat: async (insertObj) => {
        return await chatModel.create(insertObj);
    },
    createManyChat: async (insertObj) => {
        return await chatModel.insertMany(insertObj);
    },

    findChat: async (query) => {
        return await chatModel.findOne(query);
    },

    updateChat: async (query, updateObj) => {
        return await chatModel.findOneAndUpdate(query, updateObj, { new: true }).populate([{ path: "senderId", select: 'first_name last_name email avatar_hash' }, { path: "receiverId", select: 'first_name last_name email avatar_hash' }, { path: 'groupId', select: 'groupName groupImage' }, { path: "messages.senderId", select: 'first_name last_name email avatar_hash' }, { path: "messages.replySenderId", select: 'first_name last_name email avatar_hash' }]);
    },

    updateManyChat: async (query, updateObj, arrayFilter) => {
        return await chatModel.update(query, updateObj, arrayFilter);
    },

    viewChat: async (query) => {
        return await chatModel.findOne(query).populate([{ path: "senderId", select: 'first_name last_name email avatar_hash' }, { path: "receiverId", select: 'first_name last_name email avatar_hash' }, { path: 'groupId', select: 'groupName groupImage' }, { path: "messages.senderId", select: 'first_name last_name email avatar_hash' }, { path: "messages.replySenderId", select: 'first_name last_name email avatar_hash' }]);
    },

    findChatMessage: async (chatId, messageId) => {
        return await chatModel.findOne({ _id: chatId, "messages._id": messageId }).select({ messages: { $elemMatch: { _id: messageId } } });
    },

    findChatMessages: async (chatId, messageId) => {
        return await chatModel.findOne({ _id: chatId, "messages._id": { $in: messageId } });
    },

    updateMessage: async (query, updateObj) => {
        return await chatModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    chatBlock: async (chatId, userId) => {
        return await chatModel.findOne({ _id: chatId, blockedBy: { $elemMatch: { userId: userId } } }).select({ blockedBy: { $elemMatch: { userId: userId } } });
    },

    findChatWithPopulate: async (validatedBody, query) => {
        const { page, limit, search } = validatedBody;
        if (search) {
            query.messages = { $elemMatch: { message: { $regex: search, $options: 'i' } } }
        }

        let options = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            sort: { "messages.createdAt": -1 },
            populate: ([{ path: "senderId", select: 'name walletAddress email profilePic' }, { path: "receiverId", select: 'name email walletAddress profilePic' }, { path: 'groupId', select: 'groupName groupImage members membersLeft' }, { path: "messages.senderId", select: 'name walletAddress email' }, { path: "messages.replySenderId", select: 'name walletAddress email profilePic' }])
        };
        return await chatModel.paginate(query, options);

    },

    chatList: async (query) => {
        return await chatModel.find(query);
    },


    findChatAndPopulate: async (query) => {
        return await chatModel.findOne(query).select('-senderId -receiverId -chatType -messages -clearStatus')
    },

}

module.exports = { chatServices };

