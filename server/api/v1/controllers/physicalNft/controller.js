import Joi from "joi";
import _ from "lodash";
import config from "config";
import mongoose from "mongoose";
import apiError from '../../../../helper/apiError';
import response from '../../../../../assets/response';
import responseMessage from '../../../../../assets/responseMessage';
import { userServices } from '../../services/user';
import { collectionServices } from '../../services/collection';
import { nftServices } from '../../services/nft';
import { notificationServices } from '../../services/notification';
import { transactionServices } from '../../services/transaction';
import { activityServices } from '../../services/activity';
import { historyServices } from '../../services/history';
import { metadataServices } from '../../services/metadata';
import { orderServices } from '../../services/order';

const { createMetadata, findMetadata } = metadataServices;

const { userCheck, findUser, findUserData, createUser, updateUser, updateUserById, userSubscriberList } = userServices;
const { createCollection, findCollection, updateCollection, collectionList, collectionPaginateSearch, myCollectionPaginateSearch } = collectionServices;
const { createNft, findNft, updateNft, nftList, nftPaginateSearch, myNftPaginateSearch, nftListWithAggregate, findAllNft, findAllPhysicalNft, listAllNft, nftListWithSearch, multiUpdate, nftListWithAggregatePipeline, findNftWithPopulateDetails } = nftServices;
const { createNotification, findNotification, updateNotification, multiUpdateNotification, notificationList, notificationListWithSort } = notificationServices;
const { createTransaction, findTransaction, updateTransaction, transactionList } = transactionServices;
const { createActivity, findActivity, updateActivity, paginateUserOwendActivity, paginateActivity, activityList } = activityServices;
const { createHistory, findHistory, updateHistory, historyList, paginateShowNftHistory, paginateUserOwendHistory, paginateHistory } = historyServices;
const { createOrder, findOrder, findOrderWithPopulate, updateOrder, orderList, findOneOrder, paginateOrder, dowloadPrivateUrl, orderListWithSearch, collectionOrderList, floorPriceNFT, volumeTradeNFT } = orderServices;


import { imageServices } from '../../services/image';
const { createImage, findImage } = imageServices;

import commonFunction from '../../../../helper/util';
import status from '../../../../enums/status';
import userType from "../../../../enums/userType";
import fs from 'fs';
import create from 'ipfs-http-client';
import base64ToImage from 'base64-to-image';
import doAsync from 'doasync';

let projectId = "2DQYbpLriMtttDxE0rnwsDfpHHB"
let projectSecret = '9a286e29423b32f5c3519def68e57d30'
const auth =
    'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
const ipfs = create({
    host: 'ipfs.infura.io', port: '5001', protocol: 'https', headers: {
        authorization: auth,
    },
});

export class physicalNftController {


    /**
     * @swagger
     * /physicalNft/createPhysicalNft:
     *   post:
     *     tags:
     *       - PHYSICAL NFT MANAGEMENT
     *     description: createPhysicalNft => physicalType? SINGLE || MULTIPLE
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: createPhysicalNft
     *         description: createPhysicalNft Note:- mediaFile & coverImage accepted only base64.
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/createPhysicalNft'
     *     responses:
     *       200:
     *         description: Nft add successfully.
     *       501:
     *         description: Something went wrong.
     *       404:
     *         description: Data not found.
     *       409:
     *         description: User Exists.
     */

    async createPhysicalNft(req, res, next) {
        let validationSchema = {
            collectionId: Joi.string().optional(),
            currentOwnerId: Joi.string().optional(),
            itemCategory: Joi.string().optional().allow(""),
            recipientWalletAddress: Joi.string().optional(),
            recipientBackupWalletAddress: Joi.string().optional(),
            tokenName: Joi.string().optional(),
            tokenId: Joi.string().optional(),
            mediaFile: Joi.string().optional(),
            mediaType: Joi.string().optional(),
            coverImage: Joi.string().optional(),
            network: Joi.string().optional(),
            royalties: Joi.string().optional(),
            title: Joi.string().optional(),
            description: Joi.string().optional(),
            properties: Joi.string().optional(),
            alternativeTextForNFT: Joi.string().optional(),
            uri: Joi.string().optional(),
            isGenerativeNft: Joi.boolean().optional(),
            quantity: Joi.number().optional(),
            physicalType: Joi.string().optional(),

        }
        try {
            let result;
            // let validatedBody = await Joi.validate(req.body, validationSchema);

            let collectionRes = await findCollection({ _id: req.body.collectionId });

            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound([], responseMessage.USER_NOT_FOUND);
            }
            else {
                req.body.userId = userResult._id;

                if (req.body.isGenerativeNft && req.body.isGenerativeNft === true) {
                    const getMetadata = require(`../../../../../metadata_json/${Number(req.body.tokenId)}.json`);
                    req.body.uri = getMetadata.image;
                    req.body.coverImage = getMetadata.cloud_image;
                    req.body.mediaFile = getMetadata.cloud_image;
                    req.body.tokenName = `${getMetadata.name} ${getMetadata.attributes[0].value}`;
                    req.body.title = `${getMetadata.name} ${getMetadata.attributes[0].value}`;
                }

                if (!req.body.isGenerativeNft && (req.body.mediaFile || req.body.coverImage)) {
                    if (req.body.mediaFile) {
                        req.body.mediaFile = await commonFunction.getSecureUrl(req.body.mediaFile);
                    }
                    if (req.body.coverImage) {
                        req.body.coverImage = await commonFunction.getSecureUrl(req.body.coverImage);
                    }
                }

                if (req.body.collectionId) {
                    await updateCollection({ _id: req.body.collectionId }, { $inc: { topCollection: 1 } }, { new: true })
                }
                if (req.body.collectionId) {
                    if (collectionRes.brandId) {
                        let brandRes = await findCollection({ brandId: collectionRes.brandId });
                        if (brandRes.brandId) req.body.nftType = "PHYSICAL"
                    }
                }

                req.body.quantity = req.body.physicalType === "SINGLE" ? 1 : req.body.quantity;
                req.body.genQuantity = req.body.quantity;
                req.body.holdQuantity = req.body.quantity;


                req.body.barQRcodeLink = await commonFunction.generateQR(req.body)
                console.log("barQRcodeLink==", req.body.barQRcodeLink);
                req.body.contractAddress = collectionRes._id;
                req.body.isCreated = true;
                req.body.creatorId = userResult._id;
                result = await createNft(req.body);

                let obj = {
                    nftId: result._id,
                    userId: result.userId,
                    collectionId: result.collectionId,
                    title: "Create a new nft ",
                    type: "NFT_CREATE",
                    description: "Nft created "
                }
                let activity = await createActivity(obj);
                let historyRes = {
                    userId: userResult._id,
                    collectionId: result.collectionId,
                    nftId: result._id,
                    type: "NFT_CREATE",
                    title: "Create a new nft ",
                    description: "A new nft has been created successfully."
                }
                await createHistory(historyRes);
                let finalResult = _.omit(JSON.parse(JSON.stringify(result)), req.body.itemCategory == "private documents" ? 'uri' : []);
                return res.json(new response(finalResult, responseMessage.ADD_NFT));
            }
        } catch (error) {
            console.log("=====error==", error)
            return next(error);
        }
    }

    /**
  * @swagger
  * /physicalNft/editPhysicalNft:
  *   put:
  *     tags:
  *       - PHYSICAL NFT MANAGEMENT
  *     description: editPhysicalNft
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: token
  *         description: token
  *         in: header
  *         required: true
  *       - name: editPhysicalNft
  *         description: editPhysicalNft Note:- mediaFile & coverImage accepted only base64.
  *         in: body
  *         required: true
  *         schema:
  *           $ref: '#/definitions/editPhysicalNft'
  *     responses:
  *       200:
  *         description: Nft update successfully.
  *       501:
  *         description: Something went wrong.
  *       404:
  *         description: Data not found.
  *       409:
  *         description: User Exists.
  */

    async editPhysicalNft(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
            tokenName: Joi.string().optional(),
            tokenId: Joi.string().optional(),
            mediaFile: Joi.string().optional(),
            coverImage: Joi.string().optional(),
            priceType: Joi.string().optional(),
            price: Joi.string().optional(),
            startPrice: Joi.string().optional(),
            title: Joi.string().optional(),
            description: Joi.string().optional(),
            royalties: Joi.string().optional(),
            properties: Joi.string().optional(),
            alternativeTextForNFT: Joi.string().optional(),
            uri: Joi.string().optional(),
            quantity: Joi.number().optional()

        }
        try {
            var validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            if (validatedBody.mediaFile) {
                validatedBody.mediaFile = await commonFunction.getSecureUrl(validatedBody.mediaFile);
            }
            if (validatedBody.coverImage) {
                validatedBody.coverImage = await commonFunction.getSecureUrl(validatedBody.coverImage);
            }
            var nftResult = await findNft({ _id: validatedBody._id, status: { $ne: status.DELETE } });
            if (!nftResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            var result = await updateNft({ _id: nftResult._id }, validatedBody);
            return res.json(new response(result, responseMessage.NFT_UPDATE));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
   * @swagger
   * /physicalNft/createPhysicalOrder:
   *   post:
   *     tags:
   *       - PHYSICAL NFT MANAGEMENT
   *     description: createPhysicalOrder
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: createPhysicalOrder
   *         description: createPhysicalOrder
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/createPhysicalOrder'
   *     responses:
   *       200:
   *         description: Your order has been placed successfully.
   *       404:
   *         description: User not found/Nft not found.
   *       500:
   *         description: Internal server error.
   *       409:
   *         description: This nft is already placed.
   */

    async createPhysicalOrder(req, res, next) {
        const validationSchema = {
            nftId: Joi.string().required(),
            orderId: Joi.string().optional(),
            brandId: Joi.string().optional(),
            title: Joi.string().optional(),
            network: Joi.string().optional(),
            mediaType: Joi.string().optional(),
            details: Joi.string().optional(),
            time: Joi.string().optional(),
            startingBid: Joi.string().optional(),
            tokenName: Joi.string().optional(),
            royalties: Joi.string().optional(),
            startPrice: Joi.string().optional(),
            price: Joi.number().optional(),
            coupounAddress: Joi.string().optional(),
            startTime: Joi.string().optional(),
            endTime: Joi.string().optional(),
            expiryTime: Joi.string().optional(),
            description: Joi.string().optional(),
            saleType: Joi.string().optional(),
            currentOwner: Joi.string().optional(),
            quantity: Joi.number().optional()
        }
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUserData({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let nftCheck = await findNft({ _id: validatedBody.nftId, status: { $ne: status.DELETE } });
            if (!nftCheck) {
                throw apiError.notFound(responseMessage.NFT_NOT_FOUND);
            }
            if (validatedBody.quantity) {
                if (Number(validatedBody.quantity) > nftCheck.quantity) {
                    throw apiError.badRequest(responseMessage.LESS_QUANTITY);
                }
            }
            validatedBody.quantity = nftCheck.physicalType === "SINGLE" ? 1 : validatedBody.quantity;
            let orderRes = await findOrder({ nftId: nftCheck._id, status: status.ACTIVE });
            if (orderRes && (Number(orderRes.price) != Number(validatedBody.price))) {
                const updatedRes = await updateOrder({ _id: orderRes._id }, { $inc: { quantity: Number(validatedBody.quantity), price: Number(validatedBody.price) } });
                await updateNft({ _id: nftCheck._id }, { $set: { isPlace: true }, $inc: { quantity: -Number(validatedBody.quantity), holdQuantity: -Number(validatedBody.quantity), placedQuantity: Number(validatedBody.quantity) } });
                return res.json(new response(updatedRes, responseMessage.PLACE_ORDER));
            }
            validatedBody.userId = userResult._id;
            validatedBody.creatorId = nftCheck.userId; // new line
            validatedBody.collectionId = nftCheck.collectionId;
            validatedBody.itemCategory = nftCheck.itemCategory;
            validatedBody.isCreated = true;
            validatedBody.nftType = "PHYSICAL";

            const result = await createOrder(validatedBody);

            await Promise.all([
                updateNft({ _id: nftCheck._id }, { $set: { isPlace: true }, $inc: { treandingNftCount: 1, quantity: -Number(validatedBody.quantity), holdQuantity: -Number(validatedBody.quantity), placedQuantity: Number(validatedBody.quantity) } }),
                updateCollection({ _id: nftCheck.collectionId }, { $inc: { placeNftCount: 1 } }),
                updateUser({ _id: userResult._id }, { $inc: { orderCount: 1, topSaler: 1 } }),
                createActivity({
                    userId: userResult._id,
                    collectionId: nftCheck.collectionId,
                    nftId: nftCheck._id,
                    orderId: result._id,
                    quantity: validatedBody.quantity,
                    title: "NEW ORDER",
                    description: "A new order has been placed successfully.",
                    type: "ORDER_CREATE"
                }),
                createNotification({
                    userId: userResult._id,
                    collectionId: nftCheck.collectionId,
                    nftId: nftCheck._id,
                    quantity: validatedBody.quantity,
                    title: "NEW ORDER",
                    description: "You have placed one order successfully.",
                    notificationType: "New_ORDER",
                    date: commonFunction.dateTime(),
                    image: nftCheck.mediaFile ? nftCheck.mediaFile : "https://res.cloudinary.com/dkoznoze6/image/upload/v1563943105/n7zdoyvpxxqhexqybvkx.jpg"
                }),
                createHistory({
                    userId: userResult._id,
                    collectionId: nftCheck.collectionId,
                    nftId: nftCheck._id,
                    quantity: validatedBody.quantity,
                    type: "ORDER_CREATE",
                    title: "Create a new Order ",
                    description: "A new order has been placed successfully."
                })
            ])
            return res.json(new response(result, responseMessage.PLACE_ORDER));
        }
        catch (error) {
            console.log("error==>>", error);
            return next(error);
        }
    }

    /**
 * @swagger
 * /order/editPhysicalOrder:
 *   put:
 *     tags:
 *       - USER ORDER
 *     description: editPhysicalOrder
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: token
 *         in: header
 *         required: true
 *       - name: editPhysicalOrder
 *         description: editPhysicalOrder
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/editPhysicalOrder'
 *     responses:
 *       200:
 *         description: Your order has been successfully updated..
 *       404:
 *         description: User not found/Data not found.
 *       500:
 *         description: Internal server error.
 *       409:
 *         description: This nft is already placed.
 */
    async editPhysicalOrder(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
            collectionId: Joi.string().optional(),
            title: Joi.string().optional(),
            details: Joi.string().optional(),
            time: Joi.string().optional(),
            startingBid: Joi.string().optional(),
            tokenName: Joi.string().optional(),
            royalties: Joi.string().optional(),
            startPrice: Joi.string().optional(),
            price: Joi.string().optional(),
            coupounAddress: Joi.string().optional(),
            startTime: Joi.string().optional(),
            endTime: Joi.string().optional(),
            expiryTime: Joi.string().optional(),
            currentOwner: Joi.string().optional(),
            saleType: Joi.string().optional(),
            isResale: Joi.boolean().optional(),
            quantity: Joi.number().optional(),
        }
        try {
            var validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var orderResult = await findOrder({ _id: validatedBody._id, status: { $ne: status.DELETE } });
            if (!orderResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            let updateObj = {
            }
            if (validatedBody.collectionId) updateObj.collectionId = validatedBody.collectionId;
            if (validatedBody.isResale) updateObj.isResale = validatedBody.isResale;
            await updateNft({ _id: orderResult.nftId }, updateObj);
            var result = await updateOrder({ _id: orderResult._id }, validatedBody);
            return res.json(new response(result, responseMessage.ORDER_UPDATED));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
  * @swagger
  * /physicalNft/cancelPhysicalOrder:
  *   patch:
  *     tags:
  *       - PHYSICAL NFT MANAGEMENT
  *     description: cancelPhysicalOrder
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: token
  *         description: token
  *         in: header
  *         required: true
  *       - name: cancelPhysicalOrder
  *         description: cancelPhysicalOrder
  *         in: body
  *         required: true
  *         schema:
  *           $ref: '#/definitions/cancelPhysicalOrder'
  *     responses:
  *       200:
  *         description: Success response
  */

    async cancelPhysicalOrder(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
            // quantity: Joi.number().optional()
        }
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let orderRes = await findOrder({ _id: validatedBody._id, status: status.ACTIVE, userId: userResult._id });
            if (!orderRes) {
                throw apiError.notFound(responseMessage.ORDER_NOT_FOUND);
            }
            // if (Number(orderRes.quantity < validatedBody.quantity)) throw apiError.conflict(responseMessage.LESS_QUANTITY);

            await updateNft({ _id: orderRes.nftId }, { $inc: { quantity: orderRes.quantity, placedQuantity: -orderRes.quantity, holdQuantity: orderRes.quantity } });
            const result = await updateOrder({ _id: orderRes._id }, { $set: { status: status.CANCEL } });
            return res.json(new response(result, responseMessage.CANCEL_ORDER));
        }
        catch (error) {
            return next(error);
        }
    }


    /**
     * @swagger
     * /physicalNft/listNFT:
     *   get:
     *     tags:
     *       - PHYSICAL NFT MANAGEMENT
     *     description: listNFT
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *     responses:
     *       200:
     *         description: Data found successfully.
     *       404:
     *         description: User not found.
     */

    async listNFT(req, res, next) {
        try {
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let dataResults = await findAllNft({ quantity: { $gt: 0 }, userId: userResult._id, isCreated: true });
            if (dataResults.length == 0) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            }
            return res.json(new response(dataResults, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
    * @swagger
    * /physicalNft/likeDislike/{nftId}:
    *   get:
    *     tags:
    *       - PHYSICAL NFT MANAGEMENT
    *     description: likeDislike
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: token
    *         description: token
    *         in: header
    *         required: true
    *       - name: nftId
    *         description: nftId
    *         in: path
    *         required: true
    *     responses:
    *       200:
    *         description: like/dislike Nft successfully.
    *       404:
    *         description: User not found/Nft not found.
    *       500:
    *         description: Internal server error.
    *       409:
    *         description: Already Exist.
    */

    async likeDislike(req, res, next) {
        const validationSchema = {
            nftId: Joi.string().required(),
        }
        var updated;
        try {
            const { nftId } = await Joi.validate(req.params, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let nftResult = await findNft({ _id: nftId, status: { $ne: status.DELETE } });
            if (!nftResult) {
                throw apiError.notFound(responseMessage.NFT_NOT_FOUND);
            }
            if (nftResult.likesUsers.includes(userResult._id)) {
                updated = await updateNft({ _id: nftResult._id }, { $pull: { likesUsers: userResult._id }, $inc: { likesCount: -1 } });
                await updateUser({ _id: userResult._id }, { $pull: { likesOrder: nftResult._id } });
                await createActivity({
                    userId: userResult._id,
                    nftId: nftResult._id,
                    title: "DISLIKE_NFT",
                    desctiption: "Bad choise, I disliked it.",
                    type: "DISLIKE"
                })
                await createHistory({
                    userId: userResult._id,
                    nftId: nftResult._id,
                    title: "DISLIKE_NFT",
                    desctiption: "Bad choise, I disliked it.",
                    type: "DISLIKE"
                })
                let nftDisLikeNotification = {
                    userId: userResult._id,
                    nftId: nftResult._id,
                    title: "NFT DISLIKE",
                    description: "I dont like this Nft ",
                    notificationType: "NFT DISLIKE",

                }
                await createNotification(nftDisLikeNotification);
                return res.json(new response(updated, responseMessage.DISLIKE_ORDER));
            } else {
                await createActivity({
                    userId: userResult._id,
                    nftId: nftResult._id,
                    title: "LIKE_NFT",
                    desctiption: "Nice choise, I liked it.",
                    type: "LIKE"
                })
                await createHistory({
                    userId: userResult._id,
                    nftId: nftResult._id,
                    title: "LIKE_NFT",
                    desctiption: "Nice choise, I liked it.",
                    type: "LIKE"
                })
                let nftLikeNotification = {
                    userId: userResult._id,
                    nftId: nftResult._id,
                    title: "NFT LIKE",
                    description: "I Like This NFT",
                    notificationType: "NFT LIKE",
                }
                await createNotification(nftLikeNotification);
                updated = await updateNft({ _id: nftResult._id }, { $addToSet: { likesUsers: userResult._id }, $inc: { likesCount: 1 } });
                await updateUser({ _id: userResult._id }, { $addToSet: { likesOrder: nftResult._id } });
                return res.json(new response(updated, responseMessage.LIKE_ORDER));
            }
        }
        catch (error) {
            return next(error);
        }
    }


    /**
    * @swagger
    * /physicalNft/favouriteUnFavourite/{nftId}:
    *   get:
    *     tags:
    *       - PHYSICAL NFT MANAGEMENT
    *     description: favouriteUnFavourite
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: token
    *         description: token
    *         in: header
    *         required: true
    *       - name: nftId
    *         description: nftId
    *         in: path
    *         required: true
    *     responses:
    *       200:
    *         description: You have successfully favourite/unFavourite a order.
    *       501:
    *         description: Something went wrong.
    *       404:
    *         description: User not found.
    *       409:
    *         description: Order not found.
    */

    async favouriteUnFavourite(req, res, next) {
        const validationSchema = {
            nftId: Joi.string().required(),
        }
        var updated;
        try {
            const { nftId } = await Joi.validate(req.params, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let nftResult = await findNft({ _id: nftId, status: { $ne: status.DELETE } });
            if (!nftResult) {
                throw apiError.conflict(responseMessage.DATA_NOT_FOUND);
            }
            if (nftResult.favouriteUsers.includes(userResult._id)) {
                updated = await updateNft({ _id: nftResult._id }, { $pull: { favouriteUsers: userResult._id }, $inc: { favouriteCount: -1 } });
                await updateUser({ _id: userResult._id }, { $pull: { favouriteOrder: nftResult._id } });
                await createActivity({
                    userId: userResult._id,
                    nftId: nftResult._id,
                    title: "UNFAVOURITE_NFT",
                    desctiption: "Bad choice, I unfavourited it.",
                    type: "UNFAVOURITE"
                })
                await createHistory({
                    userId: userResult._id,
                    nftId: nftResult._id,
                    title: "UNFAVOURITE_NFT",
                    desctiption: "Bad choice, I unfavourited it.",
                    type: "UNFAVOURITE"
                })
                return res.json(new response(updated, responseMessage.UNFOURITED));
            } else {
                await createActivity({
                    userId: userResult._id,
                    nftId: nftResult._id,
                    title: "FAVOURITE_NFT",
                    desctiption: "Nice choice, I favourited it.",
                    type: "FAVOURITE"
                })
                await createHistory({
                    userId: userResult._id,
                    nftId: nftResult._id,
                    title: "FAVOURITE_NFT",
                    desctiption: "Nice choice, I favourited it.",
                    type: "FAVOURITE"
                })
                updated = await updateNft({ _id: nftResult._id }, { $addToSet: { favouriteUsers: userResult._id }, $inc: { favouriteCount: 1 } });
                await updateUser({ _id: userResult._id }, { $addToSet: { favouriteOrder: nftResult._id } });
                return res.json(new response(updated, responseMessage.FAVOURITED));
            }
        }
        catch (error) {
            return next(error);
        }
    }


    /**
     * @swagger
     * /physicalNft/userOwnedCount/{_id}:
     *   get:
     *     tags:
     *       - PHYSICAL NFT MANAGEMENT
     *     description: onSaleCount
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: _id
     *         description: _id for userId
     *         in: path
     *         required: true
     *     responses:
     *       200:
     *         description: Data found successfully.
     *       404:
     *         description: User not found/Data not found.
     */

    async userOwnedCount(req, res, next) {
        try {
            let userResult = await findUser({ _id: req.params._id });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            } else {
                let orderInfo = await findAllPhysicalNft({ nftType: { $eq: "PHYSICAL" }, isCreated: false, quantity: { $gt: 0 }, userId: mongoose.Types.ObjectId(userResult._id) }, userResult._id);

                // findAllNft({ nftType: { $eq: "PHYSICAL" }, quantity: { $gt: 0 }, userId: userResult._id, isCreated: false });
                if (orderInfo.length == 0) {
                    throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
                } else {
                    return res.json(new response(orderInfo, responseMessage.DATA_FOUND));
                }
            }
        } catch (error) {
            console.log("error===>>", error);
            return next(error);
        }
    }


    /**
     * @swagger
     * /physicalNft/userLikesCount/{_id}:
     *   get:
     *     tags:
     *       - PHYSICAL NFT MANAGEMENT
     *     description: userLikesCount
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: _id
     *         description: _id for userId
     *         in: path
     *         required: true
     *     responses:
     *       200:
     *         description: Data found successfully.
     *       404:
     *         description: User not found.
     */

    async userLikesCount(req, res, next) {
        try {
            let userResult = await findUser({ _id: req.params._id });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            } else {
                let result = await findAllPhysicalNft({ status: status.ACTIVE, nftType: { $eq: "PHYSICAL" }, likesUsers: { $in: [mongoose.Types.ObjectId(userResult._id)] } }, userResult._id);
                // findAllNft({ nftType: { $eq: "PHYSICAL" }, likesUsers: { $in: [userResult._id] }, status: status.ACTIVE });
                return res.json(new response(result, responseMessage.DATA_FOUND));
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
      * @swagger
      * /physicalNft/userFavourateCount/{_id}:
      *   get:
      *     tags:
      *       - PHYSICAL NFT MANAGEMENT
      *     description: userFavourateCount
      *     produces:
      *       - application/json
      *     parameters:
      *       - name: _id
      *         description: _id for userId
      *         in: path
      *         required: true
      *     responses:
      *       200:
      *         description: Data found successfully.
      *       404:
      *         description: User not found.
      */

    async userFavourateCount(req, res, next) {
        try {
            let userResult = await findUser({ _id: req.params._id });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            } else {
                let result = await findAllPhysicalNft({ nftType: { $eq: "PHYSICAL" }, favouriteUsers: { $in: [mongoose.Types.ObjectId(userResult._id)] }, status: status.ACTIVE }, userResult._id);
                // findAllNft({ nftType: { $eq: "PHYSICAL" }, favouriteUsers: { $in: [userResult._id] }, status: status.ACTIVE });
                return res.json(new response(result, responseMessage.DATA_FOUND));

            }
        } catch (error) {
            console.log("error===>>", error);
            return next(error);
        }
    }

    /**
    * @swagger
    * /physicalNft/userOnSaleCount/{_id}:
    *   get:
    *     tags:
    *       - PHYSICAL NFT MANAGEMENT
    *     description: onSaleCount
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: _id
    *         description: _id for userId
    *         in: path
    *         required: true
    *       - name: search
    *         description: search 
    *         in: formData
    *         required: false
    *     responses:
    *       200:
    *         description: Order details fetched successfully.
    *       404:
    *         description: User not found/Data not found.
    */

    async userOnSaleCount(req, res, next) {
        try {
            let userResult = await findUser({ _id: req.params._id });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            } else {
                let result = await findAllPhysicalNft({ nftType: { $eq: "PHYSICAL" }, userId: mongoose.Types.ObjectId(userResult._id) }, userResult._id);
                if (result.length == 0) {
                    throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
                } else {
                    return res.json(new response(result, responseMessage.ORDER_DETAILS));
                }
            }
        } catch (error) {
            console.log("error===>>", error);
            return next(error);
        }
    }

    /**
     * @swagger
     * /physicalNft/userCreatedCount/{_id}:
     *   get:
     *     tags:
     *       - PHYSICAL NFT MANAGEMENT
     *     description: userCreatedCount
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: _id
     *         description: _id for userId
     *         in: path
     *         required: true
     *     responses:
     *       200:
     *         description: Data found successfully.
     *       501:
     *         description: Something went wrong.
     *       404:
     *         description: User not found.
     *       409:
     *         description: Already reported.
     */

    async userCreatedCount(req, res, next) {
        try {
            let userResult = await findUser({ _id: req.params._id });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            } else {
                let result = await findAllPhysicalNft({ nftType: { $eq: "PHYSICAL" }, isCreated: true, userId: mongoose.Types.ObjectId(userResult._id) }, userResult._id);
                //  findAllNft({ nftType: { $eq: "PHYSICAL" }, userId: userResult._id, isCreated: true });
                if (result.length == 0) {
                    throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
                } else {
                    return res.json(new response(result, responseMessage.DATA_FOUND));
                }
            }
        } catch (error) {
            console.log("error===>>", error);
            return next(error);
        }

    }

    /**
     * @swagger
     * /physicalNft/userBuyAndCreatedList/{_id}:
     *   get:
     *     tags:
     *       - PHYSICAL NFT MANAGEMENT
     *     description: userBuyAndCreatedList
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: _id
     *         description: _id for userId
     *         in: path
     *         required: true
     *     responses:
     *       200:
     *         description: Data found successfully.
     *       404:
     *         description: User not found.
     */

    async userBuyAndCreatedList(req, res, next) {
        try {
            let userResult = await findUser({ _id: req.params._id });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            } else {
                let result = await findAllPhysicalNft({ nftType: { $eq: "PHYSICAL" }, userId: mongoose.Types.ObjectId(userResult._id) }, userResult._id);
                //  findAllNft({ nftType: { $eq: "PHYSICAL" }, userId: userResult._id });
                if (result.length == 0) {
                    throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
                } else {
                    return res.json(new response(result, responseMessage.DATA_FOUND));
                }
            }
        } catch (error) {
            console.log("error===>>", error);
            return next(error);
        }
    }
}

export default new physicalNftController()

