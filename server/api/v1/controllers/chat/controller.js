import Joi from "joi";
import _ from "lodash";
import config from "config";
import mongoose from 'mongoose';
import apiError from '../../../../helper/apiError';
import bcrypt from 'bcryptjs';
import response from '../../../../../assets/response';
import responseMessage from '../../../../../assets/responseMessage';
import { userServices } from '../../services/user';
const { findUser, updateUser, findAllUsers, findUserLastSeen } = userServices;
import { chatServices } from '../../services/chat';
const { createChat, findChat, updateChat, findChatWithPopulate, findChatAndPopulate, viewChat, updateManyChat, chatList, findChatMessage, chatBlock, findChatMessages, updateMessage } = chatServices;
import { groupServices } from '../../services/group';
const { findGroup, groupList, goupLeftMember, updateGroup } = groupServices;



import commonFunction from '../../../../helper/util';
import jwt from 'jsonwebtoken';
import status from '../../../../enums/status';
import userType from "../../../../enums/userType";

export class chatController {




    async ChattingHistory(req) {
        let query = {};
        let res
        return new Promise(async (resolve, reject) => {
            if (req.senderId) {
                query.$or = [{ receiverId: req.senderId }, { senderId: req.senderId }]
            }
            if (req.chatId) {
                query._id = req.chatId
            }

            var result = await findChatWithPopulate(req, query);
            res = new response(result, responseMessage.DATA_FOUND);
            resolve(res)
        })
    }

    async chatById(req) {
        var res;
        let newMessages = []
        return new Promise(async (resolve, reject) => {
            var chatResult = await viewChat({ _id: req.chatId, status: status.ACTIVE });
            if (!chatResult) {
                res = apiError.notFound(responseMessage.DATA_NOT_FOUND);
                resolve(res);
            } else {
                chatResult.messages.map(o => {
                    if (o.receiverId == req.senderId) {
                        o.messageStatus = "Read"
                    }
                    newMessages.push(o)
                })
                let update = await updateChat({ _id: chatResult._id }, { $set: { messages: newMessages } })
                let viewer = (req.userId).toString(), chatBlockResult;
                if (update.chatType == 'oneToOne') {
                    chatBlockResult = await chatBlock(update._id, viewer)
                    let showMessages = [];
                    if (chatBlockResult) {
                        for (let i in update['messages']) {
                            if (update['messages'][i].createdAt <= chatBlockResult.blockedBy[0].time) {
                                showMessages.push(update['messages'][i]);
                            }
                        }
                    }
                    else {
                        showMessages = update.messages
                    }
                    update.messages = showMessages;
                }
                res = new response(update, responseMessage.DATA_FOUND)
                resolve(res);
            }
        })
    }

    oneToOneChat(req) {
        var res, obj, result, saveResult;
        return new Promise(async (resolve, reject) => {
            let query = {};

            if (req.senderId && req.receiverId) {
                query.$and = [{ _id: req.chatId, status: { $ne: status.DELETE } }]
            }

            var chatResult = await findChat(query)
            if (!chatResult) {
                obj = {
                    senderId: req.senderId,
                    receiverId: req.receiverId,
                    chatType: "oneToOne",
                    messages: [{
                        senderId: req.senderId,
                        receiverId: req.receiverId,
                        message: req.message,
                        thumbnail: req.thumbnail ? req.thumbnail : "",
                        mediaType: req.mediaType ? req.mediaType : "text",
                        createdAt: new Date().toISOString()
                    }]

                };
                saveResult = await createChat(obj);
                result = await viewChat({ _id: saveResult._id })
            }
            else {
                obj = {
                    senderId: req.senderId,
                    receiverId: req.receiverId,
                    mediaType: req.mediaType ? req.mediaType : "text",
                    message: req.message,
                    thumbnail: req.thumbnail ? req.thumbnail : "",
                    createdAt: new Date().toISOString()
                }
                result = await updateChat({ _id: chatResult._id }, { $push: { messages: obj }, $pull: { chatDeleted: { $in: [req.senderId, req.receiverId] } } })

            }
            var senderResult = await findUser({ _id: req.senderId, status: status.ACTIVE });
            var receiverResult = await findUser({ _id: req.receiverId, status: status.ACTIVE });
            if (receiverResult.deviceToken) {
                var message = {
                    to: receiverResult.deviceToken,
                    data: {
                        senderId: req.senderId,
                        receiverId: req.receiverId,
                        mediaType: req.mediaType ? req.mediaType : "text",
                        title: senderResult.first_name,
                        body: req.mediaType != "text" ? (req.message.includes(".jpeg") || req.message.includes(".jpg") || req.message.includes(".png")) ? "Photo" : req.message.includes(".gif") ? "GIF" : "Video" : req.message,
                        image: req.mediaType != "text" ? req.message : "",
                        sound: 'default'
                    },
                    notification: {
                        title: senderResult.first_name,
                        body: req.mediaType != "text" ? (req.message.includes(".jpeg") || req.message.includes(".jpg") || req.message.includes(".png")) ? "Photo" : req.message.includes(".gif") ? "GIF" : "Video" : req.message,
                        image: req.mediaType != "text" ? req.message : "",
                        sound: 'default'
                    }
                };

                await commonFunction.pushNotification(message)
            }
            res = new response(result, responseMessage.MESSAGE_SEND)
            resolve(res);
        })
    }




    /**
      * @swagger
      * /chat/chatList:
      *   post:
      *     tags:
      *       - CHAT
      *     description: chatList ?? This is used to fetch all chat history details.
      *     produces:
      *       - application/json
      *     parameters:
      *       - name: token
      *         description: token
      *         in: header
      *         required: true
      *       - name: search
      *         description: search
      *         in: formData
      *         required: false
      *       - name: page
      *         description: page
      *         in: formData
      *         type: number
      *         required: false
      *       - name: limit
      *         description: limit
      *         in: formData
      *         type: number
      *         required: false
      *     responses:
      *       200:
      *         description: Returns success message
      */

    async chatList(req, res, next) {
        try {
            let user = await findUser({ _id: req.userId, userType: userType.USER })
            if (!user) {
                throw apiError.invalid(responseMessage.USER_NOT_FOUND)
            }
            var query = { $or: [{ senderId: user._id }, { receiverId: user._id }] };
            if (req.body.chatId) {
                query = { _id: req.body.chatId };
            }


            var result = await findChatWithPopulate(req.body, query);
            let chatHistory = result.docs
            if (result.docs.length == 0) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            let viewer = (user._id).toString(), groupLeftResult, chatBlockResult;
            for (let object of chatHistory) {
                object.isChatDeleted = false;
                object.isChatBlocked = false;
                if (object.chatDeleted.includes(viewer)) {
                    object.isChatDeleted = true
                }
                if (object.blockedBy.some(o => o.userId == viewer)) {
                    object.isChatBlocked = true
                }
                if (object.chatType == 'oneToOne' && object.senderId._id != viewer) {
                    let sender = object.senderId;
                    let receiver = object.receiverId;
                    object.senderId = receiver;
                    object.receiverId = sender;
                    console.log('Do change....');
                }
            }
            for (let object of chatHistory) {
                chatBlockResult = await chatBlock(object._id, viewer)
                let showMessages = [];
                if (chatBlockResult) {
                    for (let i in object['messages']) {
                        if (object['messages'][i].createdAt <= chatBlockResult.blockedBy[0].time) {
                            showMessages.push(object['messages'][i]);
                        }
                    }
                }
                else {
                    showMessages = object.messages
                }
                object.messages = showMessages;
            }
            return res.json(new response(result, responseMessage.DATA_FOUND));
        } catch (error) {
            console.log(error)
            return next(error)
        }
    }


    /**
     * @swagger
     * /chat/chat/{chatId}:
     *   get:
     *     tags:
     *       - CHAT
     *     description: view single chat by chatId
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: chatId
     *         description: chatId
     *         in: path
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async viewChat(req, res, next) {
        const validationSchema = {
            chatId: Joi.string().required(),
        }
        try {
            const { chatId } = await Joi.validate(req.params, validationSchema);

            let userRes = await findUser({ _id: req.userId, userType: userType.USER })
            if (!userRes) {
                throw apiError.invalid(responseMessage.INVALID_USER)
            }
            // var chatResult = await viewChat({ _id: chatId, status: status.ACTIVE });
            var chatResult = await viewChat({ chatId: chatId, status: status.ACTIVE });

            if (!chatResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            let viewer = (userRes._id).toString(), groupLeftResult, chatBlockResult;
            if (chatResult.chatType == 'group') {
                groupLeftResult = await goupLeftMember(chatResult.groupId._id, viewer)
                let showMessages = [];
                if (groupLeftResult) {
                    for (let i in chatResult['messages']) {
                        if (chatResult['messages'][i].createdAt <= groupLeftResult.membersLeft[0].time) {
                            showMessages.push(chatResult['messages'][i]);
                        }
                    }
                }
                else {
                    showMessages = chatResult.messages
                }
                chatResult.messages = showMessages;
            }
            if (chatResult.chatType == 'oneToOne') {
                chatBlockResult = await chatBlock(chatResult._id, viewer)
                let showMessages = [];
                if (chatBlockResult) {
                    for (let i in chatResult['messages']) {
                        if (chatResult['messages'][i].createdAt <= chatBlockResult.blockedBy[0].time) {
                            showMessages.push(chatResult['messages'][i]);
                        }
                    }
                }
                else {
                    showMessages = chatResult.messages
                }
                chatResult.messages = showMessages;
            }
            return res.json(new response(chatResult, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error)
        }
    }



    /**
    * @swagger
    * /chat/chat/{chatId}:
    *   delete:
    *     tags:
    *       - CHAT
    *     description: deleteChat ?? To delete specific chat details.
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: token
    *         description: token
    *         in: header
    *         required: true
    *       - name: chatId
    *         description: chatId
    *         in: path
    *         required: true
    *     responses:
    *       200:
    *         description: Returns success message
    */

    async deleteChat(req, res, next) {
        const validationSchema = {
            chatId: Joi.string().required()
        }
        try {
            const { chatId } = await Joi.validate(req.params, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var chatResult = await findChat({ _id: chatId, status: { $ne: status.DELETE } });
            if (!chatResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            var result = await updateChat({ _id: chatResult._id }, { $set: { status: status.DELETE } })
            return res.json(new response(result, responseMessage.DELETE_SUCCESS));
        }
        catch (error) {
            return next(error);
        }
    }


    /**
      * @swagger
      * /chat/blockUnblockChat:
      *   patch:
      *     tags:
      *       - CHAT
      *     description: blockUnblockChat ?? To block & Block chat like social app.
      *     produces:
      *       - application/json
      *     parameters:
      *       - name: token
      *         description: token
      *         in: header
      *         required: true
      *       - name: blockUnblockChat
      *         description: blockUnblockChat
      *         in: body
      *         required: true
      *         schema:
      *           $ref: '#/definitions/blockUnblockChat'
      *     responses:
      *       200:
      *         description: Returns success message
      */

    async blockUnblockChat(req, res, next) {
        const validationSchema = {
            chatId: Joi.string().required(),
            isBlock: Joi.boolean().required()
        }
        try {
            const { chatId, isBlock } = await Joi.validate(req.body, validationSchema);
            var updateObj = {}, chatBlockResult;
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var chatResult = await findChat({ _id: chatId, status: status.ACTIVE });

            if (!chatResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            if (isBlock == true) {
                updateObj = {
                    $addToSet: { blockedBy: { userId: userResult._id, time: new Date().toISOString() } }
                }
            }
            if (isBlock == false) {
                chatBlockResult = await chatBlock(chatResult._id, userResult._id)
                console.log("527", chatBlockResult.blockedBy[0].time)
                await updateManyChat({ _id: chatResult._id, "messages.receiverId": userResult._id, "blockedBy.time": { $gte: chatBlockResult.blockedBy[0].time } }, { $set: { "messages.$[i].receiverDelete": true }, $addToSet: { chatDeleted: userResult._id } }, { arrayFilters: [{ "i.receiverId": userResult._id }], multi: true });
                updateObj = {
                    $pull: { blockedBy: { userId: userResult._id } }
                }
            }
            let result = await updateChat({ _id: chatResult._id }, updateObj);
            return res.json(new response(result, isBlock == true ? responseMessage.BLOCK_SUCCESS : responseMessage.UNBLOCK_SUCCESS));
        } catch (error) {
            return next(error);
        }
    }


    /**
      * @swagger
      * /chat/blockList:
      *   get:
      *     tags:
      *       - CHAT
      *     description: blockList ?? To fetch all blocklist details.
      *     produces:
      *       - application/json
      *     parameters:
      *       - name: token
      *         description: token
      *         in: header
      *         required: true
      *     responses:
      *       200:
      *         description: Returns success message
      */

    async blockList(req, res, next) {
        try {
            var query;
            var query2;

            let userResult = await findUser({ _id: req.userId })

            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND)
            }
            if (req.senderId && req.receiverId) {
                query.$and = [{ $or: [{ senderId: req.senderId }, { senderId: req.receiverId }] }, { $or: [{ receiverId: req.receiverId }, { receiverId: req.senderId }] }]
            }
            var chatResult = await findChat(query);
            if (!chatResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            if (req.senderId && req.receiverId) {
                query2.$and = [{ $or: [{ senderId: chatResult.usersBlock }, { senderId: chatResult.usersBlock }] }, { $or: [{ receiverId: chatResult.usersBlock }, { receiverId: chatResult.usersBlock }] }]
            }
            let finalResult = await findChatAndPopulate(query2)
            return res.json(new response(finalResult, responseMessage.DATA_FOUND));

        } catch (error) {
            return next(error);

        }


    }


    /**
      * @swagger
      * /chat/reportChat:
      *   patch:
      *     tags:
      *       - CHAT
      *     description: reportChat ?? To report specific chat using chat id.
      *     produces:
      *       - application/json
      *     parameters:
      *       - name: token
      *         description: token
      *         in: header
      *         required: true
      *       - name: reportChat
      *         description: reportChat
      *         in: body
      *         required: true
      *         schema:
      *           $ref: '#/definitions/reportChat'
      *     responses:
      *       200:
      *         description: Returns success message
      */


    async reportChat(req, res, next) {
        let validationSchema = {
            chatId: Joi.string().required(),
            isReport: Joi.boolean().required()
        };
        try {
            const { chatId, isReport } = await Joi.validate(req.body, validationSchema);
            var updateObj
            var userResult = await findUser({ _id: req.userId, status: status.ACTIVE })
            if (!userResult) {
                throw apiError.invalid(responseMessage.USER_NOT_FOUND)
            }
            var chatResult = await findChat({ _id: chatId });
            if (!chatResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            if (isReport == true) {
                updateObj = {
                    $addToSet: { userReport: userResult._id }
                }
            }
            if (isReport == false) {
                updateObj = {
                    $pull: { userReport: userResult._id }
                }
            }

            let result = await updateChat({ _id: chatResult._id }, updateObj);
            return res.json(new response(result, responseMessage.UPDATE_SUCCESS));


        } catch (error) {
            return next(error);

        }
    }

    /**
      * @swagger
      * /chat/deleteMessage:
      *   patch:
      *     tags:
      *       - CHAT
      *     description: deleteMessage ?? To delete specific chat details.
      *     produces:
      *       - application/json
      *     parameters:
      *       - name: token
      *         description: token
      *         in: header
      *         required: true
      *       - name: deleteMessage
      *         description: deleteMessage
      *         in: body
      *         required: true
      *         schema:
      *           $ref: '#/definitions/deleteMessage'
      *     responses:
      *       200:
      *         description: Returns success message
      */

    async deleteMessage(req, res, next) {
        let validationSchema = {
            chatId: Joi.string().required(),
            messages: Joi.array().items(Joi.string()).required()
        };
        try {
            var { chatId, messages } = await Joi.validate(req.body, validationSchema);
            var userResult = await findUser({ _id: req.userId, status: status.ACTIVE })
            if (!userResult) {
                throw apiError.invalid(responseMessage.USER_NOT_FOUND)
            }
            var chatResult = await findChatMessages(chatId, messages);
            if (!chatResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            var user = (userResult._id).toString()
            for (let i of messages) {
                var checkResult = await findChatMessage(chatId, i)
                if (checkResult.messages[0].senderId == user) {
                    await updateMessage({ _id: chatId, "messages._id": i }, { $set: { "messages.$.senderDelete": true } })
                }
                else {
                    await updateMessage({ _id: chatId, "messages._id": i }, { $set: { "messages.$.receiverDelete": true } })
                }
            }

            return res.json(new response({}, responseMessage.DELETE_SUCCESS));

        }
        catch (error) {
            return next(error);
        }
    }

    /**
      * @swagger
      * /chat/deleteForEveryone:
      *   patch:
      *     tags:
      *       - CHAT
      *     description: deleteForEveryone ?? To delete chat for every one user.
      *     produces:
      *       - application/json
      *     parameters:
      *       - name: token
      *         description: token
      *         in: header
      *         required: true
      *       - name: deleteForEveryone
      *         description: deleteForEveryone
      *         in: body
      *         required: true
      *         schema:
      *           $ref: '#/definitions/deleteMessage'
      *     responses:
      *       200:
      *         description: Returns success message
      */

    async deleteForEveryone(req, res, next) {
        let validationSchema = {
            chatId: Joi.string().required(),
            messages: Joi.array().items(Joi.string()).required()
        };
        try {
            var { chatId, messages } = await Joi.validate(req.body, validationSchema);
            var userResult = await findUser({ _id: req.userId, status: status.ACTIVE })
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND)
            }
            var chatResult = await findChatMessages(chatId, messages);
            if (!chatResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            var user = (userResult._id).toString();
            for (let i of messages) {
                var checkResult = await findChatMessage(chatId, i)
                if (checkResult.messages[0].senderId == user) {
                    await updateMessage({ _id: chatId, "messages._id": i }, { $set: { "messages.$.isDeleted": true } })
                }
            }

            return res.json(new response({}, responseMessage.DELETE_SUCCESS));

        }
        catch (error) {
            return next(error);
        }
    }
    /**
      * @swagger
      * /chat/deleteChats:
      *   put:
      *     tags:
      *       - CHAT
      *     description: deleteChats ?? to delete chat details.
      *     produces:
      *       - application/json
      *     parameters:
      *       - name: token
      *         description: token
      *         in: header
      *         required: true
      *       - name: deleteChats
      *         description: deleteChats
      *         in: body
      *         required: true
      *         schema:
      *           $ref: '#/definitions/deleteChats'
      *     responses:
      *       200:
      *         description: Returns success message
      */

    async deleteChats(req, res, next) {
        const validationSchema = {
            chatId: Joi.array().items(Joi.string()).required()
        };
        try {
            var { chatId } = await Joi.validate(req.body, validationSchema);
            var userResult = await findUser({ _id: req.userId, status: status.ACTIVE })
            if (!userResult) {
                throw apiError.invalid(responseMessage.USER_NOT_FOUND)
            }
            var chatResult = await chatList({ _id: { $in: chatId }, status: status.ACTIVE })
            if (chatResult.length == 0) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            var groupResult;
            for (let i of chatResult) {
                if (i.chatType == "oneToOne") {
                    await updateManyChat({ _id: i._id, "messages.senderId": userResult._id }, { $set: { "messages.$[i].senderDelete": true }, $addToSet: { chatDeleted: userResult._id } }, { arrayFilters: [{ "i.senderId": userResult._id }], multi: true });
                    await updateManyChat({ _id: i._id, "messages.receiverId": userResult._id }, { $set: { "messages.$[i].receiverDelete": true }, $addToSet: { chatDeleted: userResult._id } }, { arrayFilters: [{ "i.receiverId": userResult._id }], multi: true });
                }
            }
            return res.json(new response({}, responseMessage.DELETE_SUCCESS));

        }
        catch (error) {
            return next(error)
        }
    }

    /**
  * @swagger
  * /chat/groupChat:
  *   post:
  *     tags:
  *       - SOCKET
  *     description: groupChat
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: groupChat
  *         description: groupChat
  *         in: body
  *         required: true
  *         schema:
  *           $ref: '#/definitions/groupChat'
  *     responses:
  *       200:
  *         description: Returns success message
  */

    async groupChat(req) {
        var res;
        return new Promise(async (resolve, reject) => {
            var groupResult = await findGroup({ _id: req.groupId, status: status.ACTIVE });
            if (!groupResult) {
                res = apiError.notFound(responseMessage.DATA_NOT_FOUND);
                resolve(res);
            }
            else {
                var chatResult = await findChat({ groupId: groupResult._id });

                var obj = {
                    senderId: req.senderId,
                    mediaType: req.mediaType ? req.mediaType : "text",
                    message: req.message,
                    thumbnail: req.thumbnail ? req.thumbnail : "",
                    createdAt: new Date().toISOString()
                }
                var result = await updateChat({ _id: chatResult._id }, { $push: { messages: obj } })

                if (groupResult.usersMuted.includes(req.senderId) == false) {
                    groupResult.usersMuted.push(req.senderId)
                }
                var senderResult = await findUser({ _id: req.senderId, status: status.ACTIVE });

                var arr = groupResult.members.filter(item => !groupResult.usersMuted.includes(item));
                var users = await findAllUsers({ _id: { $in: arr } })
                var device_tokens = [];
                users.forEach(t => {
                    if (t.deviceToken) {
                        return device_tokens.push(t.deviceToken)
                    }
                });
                if (device_tokens.length != 0) {
                    for (let i of device_tokens) {
                        var message = {
                            to: i,
                            data: {
                                senderId: req.senderId,
                                mediaType: req.mediaType ? req.mediaType : "text",
                                title: senderResult.first_name,
                                body: req.mediaType != "text" ? (req.message.includes(".jpeg") || req.message.includes(".jpg") || req.message.includes(".png")) ? "Photo" : req.message.includes(".gif") ? "GIF" : "Video" : req.message,
                                image: req.mediaType != "text" ? req.message : "",
                                sound: 'default'
                            },
                            notification: {
                                title: senderResult.first_name,
                                body: req.mediaType != "text" ? (req.message.includes(".jpeg") || req.message.includes(".jpg") || req.message.includes(".png")) ? "Photo" : req.message.includes(".gif") ? "GIF" : "Video" : req.message,
                                image: req.mediaType != "text" ? req.message : "",
                                sound: 'default'
                            }
                        };

                         commonFunction.pushNotification(message)
                    }
                }
                res = new response(result, responseMessage.MESSAGE_SEND)
                resolve(res);
            }
        })
    }



    async replyChat(req) {
        var res;
        return new Promise(async (resolve, reject) => {
            var chatResult = await findChat({ _id: req.chatId, status: status.ACTIVE });
            if (!chatResult) {
                res = apiError.notFound(responseMessage.DATA_NOT_FOUND);
                resolve(res);
            }
            else {
                var messageResult = await findChatMessage(chatResult._id, req.messageId);
                var obj = {
                    senderId: req.senderId,
                    receiverId: req.receiverId,
                    messageId: req.messageId,
                    mediaType: req.mediaType,
                    type: "reply",
                    message: req.message,
                    replyMessage: messageResult.messages[0].message,
                    replyMessageType: messageResult.messages[0].mediaType,
                    replySenderId: messageResult.messages[0].senderId,
                    createdAt: new Date().toISOString()
                }
                var result = await updateChat({ _id: chatResult._id }, { $push: { messages: obj } })
                res = new response(result, responseMessage.MESSAGE_SEND)
                resolve(res);
            }
        })
    }


    async onlineUser(req) {
        var res;
        return new Promise(async (resolve, reject) => {
            var userResult = await findUser({ _id: req.userId, status: status.ACTIVE });
            if (!userResult) {
                res = apiError.notFound(responseMessage.DATA_NOT_FOUND);
                resolve(res);
            }
            else {
                var result = await updateUser({ _id: userResult._id }, { $set: { isOnline: true, onlineTime: new Date().toISOString() } })
                res = new response(result, responseMessage.ONLINE_SUCCESS)
                resolve(res);
            }
        })
    }

    async offlineUser(req) {
        var res;
        return new Promise(async (resolve, reject) => {
            var userResult = await findUser({ _id: req.userId, status: status.ACTIVE });
            if (!userResult) {
                res = apiError.notFound(responseMessage.DATA_NOT_FOUND);
                resolve(res);
            }
            else {
                var result = await updateUser({ _id: userResult._id }, { $set: { isOnline: false, offlineTime: new Date().toISOString() } })
                res = new response(result, responseMessage.OFFLINE_SUCCESS)
                resolve(res);
            }
        })
    }

    async lastSeen(req) {
        var res;
        return new Promise(async (resolve, reject) => {
            var result = await findUserLastSeen({ _id: req.userId, status: status.ACTIVE });
            if (!result) {
                res = apiError.notFound(responseMessage.DATA_NOT_FOUND);
                resolve(res);
            }
            else {
                res = new response(result, responseMessage.DATA_FOUND)
                resolve(res);
            }
        })
    }















    /////    End Of Export /////////////////////////

}




export default new chatController()
