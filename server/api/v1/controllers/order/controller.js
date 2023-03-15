import Joi from "joi";
import _, { update } from "lodash";
import config from "config";
import apiError from '../../../../helper/apiError';
import response from '../../../../../assets/response';
import responseMessage from '../../../../../assets/responseMessage';
import { userServices } from '../../services/user';
import { collectionServices } from '../../services/collection';
import { nftServices } from '../../services/nft';
import { orderServices } from '../../services/order';
import { activityServices } from '../../services/activity';
import { historyServices } from '../../services/history';
import { notificationServices } from '../../services/notification';
import { feedbackServices } from '../../services/feedback';


const { userCheck, userCount, checkUserExists, emailMobileExist, createUser, findUser, findUserData, updateUser, updateUserById, userAllDetails, checkSocialLogin, userSubscriberList } = userServices;
const { findCollection, updateCollection, collectionListWithPopulate } = collectionServices;
const { createNft, findNft, updateNft, nftList, nftListWithSearch, nftPaginateSearch, myNftPaginateSearch, collectionNftList } = nftServices;
const { createOrder, findOrder, findOrderWithPopulate, updateOrder, orderList, findOneOrder, findOnePhysicalOrder, paginateOrder, dowloadPrivateUrl, orderListWithSearch, paginateActivity, collectionOrderList, floorPriceNFT, multiUpdate, volumeTradeNFT } = orderServices;
const { createActivity, findActivity, updateActivity, paginateUserOwendActivity, activityList } = activityServices;
const { createHistory, findHistory, updateHistory, historyList, paginateUserOwendHistory, paginateHistory } = historyServices;
const { createNotification, findNotiication, updateNotification, multiUpdateNotification, notificationList } = notificationServices;
const { createFeedback, findFeedback, updateFeedback, FeedbackList } = feedbackServices



import commonFunction from '../../../../helper/util';
import status from '../../../../enums/status';
import fs from 'fs';
import ipfsClient from 'ipfs-http-client';
import { createHistogram } from "perf_hooks";
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' });


export class orderController {

    /**
     * @swagger
     * /order/createOrder:
     *   post:
     *     tags:
     *       - USER ORDER
     *     description: createOrder
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: createOrder
     *         description: createOrder
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/createOrder'
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

    async createOrder(req, res, next) {
        const validationSchema = {
            nftId: Joi.string().required(),
            orderId: Joi.string().optional(),
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
            brandId: Joi.string().optional(),

        }
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let nftCheck = await findNft({ _id: validatedBody.nftId, status: { $ne: status.DELETE } });
            if (!nftCheck) {
                throw apiError.notFound(responseMessage.NFT_NOT_FOUND);
            }
            validatedBody.userId = userResult._id;
            validatedBody.creatorId = nftCheck.userId; // new line
            validatedBody.collectionId = nftCheck.collectionId;
            validatedBody.itemCategory = nftCheck.itemCategory;
            validatedBody.isCreated = true;
            if (validatedBody.orderId) await updateOrder({ _id: validatedBody.orderId }, { isDeleted: true });
            var result = await createOrder(validatedBody);


            await updateCollection({ _id: nftCheck.collectionId }, { $inc: { placeNftCount: 1 } });
            await updateNft({ _id: nftCheck._id }, { isPlace: true }, { $inc: { treandingNftCount: 1 } });
            await updateUser({ _id: userResult._id }, { $inc: { orderCount: 1 } });
            await createActivity({
                userId: userResult._id,
                collectionId: nftCheck.collectionId,
                nftId: nftCheck._id,
                orderId: result._id,
                title: "NEW ORDER",
                description: "A new order has been placed successfully.",
                type: "ORDER_CREATE"
            });
            let obj = {
                userId: userResult._id,
                collectionId: nftCheck.collectionId,
                nftId: nftCheck._id,
                title: "NEW ORDER",
                description: "You have placed one order successfully.",
                notificationType: "New_ORDER",
                date: commonFunction.dateTime(),
                image: nftCheck.mediaFile ? nftCheck.mediaFile : "https://res.cloudinary.com/dkoznoze6/image/upload/v1563943105/n7zdoyvpxxqhexqybvkx.jpg"
            };
            await createNotification(obj);
            let historyRes = {
                userId: userResult._id,
                collectionId: nftCheck.collectionId,
                nftId: nftCheck._id,
                type: "ORDER_CREATE",
                title: "Create a new Order ",
                description: "A new order has been placed successfully."
            }
            let history = await createHistory(historyRes);
            console.log("====>", history)
            return res.json(new response(result, responseMessage.PLACE_ORDER));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /order/viewOrder/{_id}:
     *   get:
     *     tags:
     *       - USER ORDER
     *     description: viewOrder
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: _id
     *         description: _id
     *         in: path
     *         required: true
     *     responses:
     *       200:
     *         description: Details has been fetched successfully.
     *       404:
     *         description: Data not found.
     *       500:
     *         description: Internal server error.
     *       409:
     *         description: This nft is already placed.
     */
    async viewOrder(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required()
        }
        try {
            const { _id } = await Joi.validate(req.params, validationSchema);
            var orderResult = await findOneOrder(_id);
            if (!orderResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            let finalResult = _.omit(JSON.parse(JSON.stringify(orderResult)), (orderResult.nftId.itemCategory == "private documents" ? 'nftId.uri' : []));
            return res.json(new response(finalResult, responseMessage.DETAILS_FETCHED));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /order/viewPhysicalOrder/{_id}:
     *   get:
     *     tags:
     *       - USER ORDER
     *     description: viewPhysicalOrder
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: _id
     *         description: _id
     *         in: path
     *         required: true
     *     responses:
     *       200:
     *         description: Details has been fetched successfully.
     *       404:
     *         description: Data not found.
     *       500:
     *         description: Internal server error.
     *       409:
     *         description: This nft is already placed.
     */
    async viewPhysicalOrder(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required()
        }
        try {
            const { _id } = await Joi.validate(req.params, validationSchema);
            var orderResult = await findOnePhysicalOrder(_id);
            if (!orderResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            let finalResult = _.omit(JSON.parse(JSON.stringify(orderResult)), (orderResult.nftId.itemCategory == "private documents" ? 'nftId.uri' : []));
            return res.json(new response(finalResult, responseMessage.DETAILS_FETCHED));
        }
        catch (error) {
            return next(error);
        }
    }



    /**
     * @swagger
     * /order/favouriteUnFavouriteOrder/{orderId}:
     *   get:
     *     tags:
     *       - USER ORDER
     *     description: favouriteUnFavouriteOrder
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: orderId
     *         description: orderId
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

    async favouriteUnFavouriteOrder(req, res, next) {
        const validationSchema = {
            orderId: Joi.string().required(),
        }
        var updated;
        try {
            const { orderId } = await Joi.validate(req.params, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let orderCheck = await findOrder({ _id: orderId, status: { $ne: status.DELETE } });
            if (!orderCheck) {
                throw apiError.conflict(responseMessage.DATA_NOT_FOUND);
            }
            if (orderCheck.favouriteUsers.includes(userResult._id)) {
                updated = await updateOrder({ _id: orderCheck._id }, { $pull: { favouriteUsers: userResult._id }, $inc: { favouriteCount: -1 } });
                await updateUser({ _id: userResult._id }, { $pull: { favouriteOrder: orderCheck._id } });
                await createActivity({
                    userId: userResult._id,
                    orderId: orderCheck._id,
                    title: "UNFAVOURITE_ORDER",
                    desctiption: "Bad choice, I unfavourited it.",
                    type: "UNFAVOURITE"
                })
                await createHistory({
                    userId: userResult._id,
                    orderId: orderCheck._id,
                    title: "UNFAVOURITE_ORDER",
                    desctiption: "Bad choice, I unfavourited it.",
                    type: "UNFAVOURITE"
                })
                return res.json(new response(updated, responseMessage.UNFOURATED));
            } else {
                await createActivity({
                    userId: userResult._id,
                    orderId: orderCheck._id,
                    title: "FAVOURATE_ORDER",
                    desctiption: "Nice choice, I favourated it.",
                    type: "FAVOURATE"
                })
                await createHistory({
                    userId: userResult._id,
                    orderId: orderCheck._id,
                    title: "FAVOURATE_ORDER",
                    desctiption: "Nice choice, I favourated it.",
                    type: "FAVOURATE"
                })
                updated = await updateOrder({ _id: orderCheck._id }, { $addToSet: { favouriteUsers: userResult._id }, $inc: { favouriteCount: 1 } });
                await updateUser({ _id: userResult._id }, { $addToSet: { favouriteOrder: orderCheck._id } });
                return res.json(new response(updated, responseMessage.FAVOURATED));
            }
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /order/editOrder:
     *   put:
     *     tags:
     *       - USER ORDER
     *     description: editOrder
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: editOrder
     *         description: editOrder
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/editOrder'
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
    async editOrder(req, res, next) {
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
     * /order/deleteOrder:
     *   delete:
     *     tags:
     *       - USER ORDER
     *     description: deleteOrder
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: _id
     *         description: _id
     *         in: query
     *         required: true
     *     responses:
     *       200:
     *         description: Order delete successfully.
     *       404:
     *         description: User not found/Data not found.
     *       500:
     *         description: Internal server error.
     *       409:
     *         description: Already Exist.
     */

    async deleteOrder(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
        }
        try {
            const { _id } = await Joi.validate(req.query, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var orderResult = await findOrder({ _id: _id, status: { $ne: status.DELETE } });
            if (!orderResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            var result = await updateOrder({ _id: orderResult._id }, { status: status.DELETE });
            return res.json(new response(result, responseMessage.ORDER_DELETE));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /order/cancelOrder:
     *   put:
     *     tags:
     *       - USER ORDER
     *     description: cancelOrder
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: cancelOrder
     *         description: cancelOrder
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/cancelOrder'
     *     responses:
     *       200:
     *         description: Order cancel successfully.
     *       404:
     *         description: User not found/Data not found.
     *       500:
     *         description: Internal server error.
     *       409:
     *         description: Already Exist.
     */
    async cancelOrder(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var orderInfo = await findOrder({ _id: validatedBody._id, status: { $ne: status.DELETE } });
            if (!orderInfo) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            let deleteRes = await updateOrder({ _id: orderInfo._id }, { status: status.CANCEL });
            let nftRes = await updateNft({ _id: orderInfo.nftId }, { isCancel: true, isPlace: false });

            return res.json(new response(deleteRes, responseMessage.CANCEL_ORDER));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /order/cancelOrderList:
     *   get:
     *     tags:
     *       - USER ORDER
     *     description: cancelOrderList
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: search
     *         description: search
     *         in: query
     *         required: false
     *       - name: status
     *         description: status
     *         in: query
     *         required: false
     *       - name: fromDate
     *         description: fromDate
     *         in: query
     *         required: false
     *       - name: toDate
     *         description: toDate
     *         in: query
     *         required: false
     *       - name: page
     *         description: page
     *         in: query
     *         type: integer
     *         required: false
     *       - name: limit
     *         description: limit
     *         in: query
     *         type: integer
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async cancelOrderList(req, res, next) {
        const validationSchema = {
            status: Joi.string().optional(),
            search: Joi.string().optional(),
            fromDate: Joi.string().optional(),
            toDate: Joi.string().optional(),
            page: Joi.number().optional(),
            limit: Joi.number().optional(),

        };
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var activityInfo = await paginateOrder({ status: { $ne: status.DELETE } });
            if (activityInfo.docs.length == 0) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            let dataResults = await paginateActivity(validatedBody);
            return res.json(new response(dataResults, responseMessage.ACTIVITY_DETAILS));
        } catch (error) {
            return next(error);
        }
    }


    /**
       * @swagger
       * /order/viewCancelOrder/{_id}:
       *   get:
       *     tags:
       *       - ADMIN
       *     description: viewCancelOrder
       *     produces:
       *       - application/json
       *     parameters:
       *       - name: token
       *         description: token
       *         in: header
       *         required: true
       *       - name: _id
       *         description: _id
       *         in: path
       *         required: true
       *     responses:
       *       200:
       *         description: Returns success message
       */

    async viewCancelOrder(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required()
        }
        try {
            const { _id } = await Joi.validate(req.params, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var bidResult = await findOrder({ _id: _id, isCancel: true, status: { $ne: status.DELETE } });
            if (!bidResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            return res.json(new response(bidResult, responseMessage.DETAILS_FETCHED));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /order/listOrder:
     *   get:
     *     tags:
     *       - USER ORDER
     *     description: listOrder
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: search
     *         description: search ? By itemCategory
     *         in: query
     *         required: false
     *       - name: page
     *         description: page
     *         in: query
     *         type: integer
     *         required: false
     *       - name: limit
     *         description: limit
     *         in: query
     *         type: integer
     *         required: false
     *     responses:
     *       200:
     *         description: Order details fetched successfully.
     *       404:
     *         description: User not found/Data not found.
     *       500:
     *         description: Internal server error.
     *       409:
     *         description: Already Exist.
     */

    async listOrder(req, res, next) {
        const validationSchema = {
            search: Joi.string().optional(),
            fromDate: Joi.string().optional(),
            toDate: Joi.string().optional(),
            page: Joi.number().optional(),
            limit: Joi.number().optional(),
        };
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            let orderInfo = await paginateOrder(validatedBody);
            console.log("==paginateOrder==>>", orderInfo.endTime)
            if (orderInfo.docs.length == 0) {
                return res.json(new response([], responseMessage.DATA_NOT_FOUND));
            } else {
                return res.json(new response(orderInfo, responseMessage.ORDER_DETAILS));
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
         * @swagger
         * /order/allListOrder:
         *   post:
         *     tags:
         *       - USER ORDER
         *     description: allListOrder
         *     produces:
         *       - application/json
         *     parameters:
         *       - name: allListOrder
         *         description: allListOrder, mostVisited, mostSold , newest, oldest , endingSoon boolean type && price ? High or Low
         *         in: body
         *         required: true
         *         schema:
         *           $ref: '#/definitions/allListOrder'
         *     responses:
         *       200:
         *         description: Data found successfully.
         */

    async allListOrder(req, res, next) {
        try {
            let orderData = await orderListWithSearch(req.body);
            console.log("===orderData===>", orderData)
            return res.json(new response(orderData, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /order/particularCollectionOrderList:
     *   get:
     *     tags:
     *       - USER ORDER
     *     description: particularCollectionOrderList
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: _id
     *         description: collectionId
     *         in: query
     *         required: true
     *     responses:
     *       200:
     *         description: Data found successfully.
     *       404:
     *         description: Data not found.
     */

    async particularCollectionOrderList(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
            search: Joi.string().optional(),
            fromDate: Joi.string().optional(),
            toDate: Joi.string().optional(),
            page: Joi.number().optional(),
            limit: Joi.number().optional(),
        };
        try {
            let collectionRes = await collectionOrderList({ collectionId: req.query._id })
            if (collectionRes.length == 0) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            } else {
                return res.json(new response(collectionRes, responseMessage.DATA_FOUND));
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /order/buyOrder:
     *   post:
     *     tags:
     *       - USER ORDER
     *     description: buyOrder
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token is required.
     *         in: header
     *         required: true
     *       - in: body
     *         name: buyOrder 
     *         description: buyOrder.
     *         schema:
     *           type: object
     *           required:
     *             - orderId
     *           properties:
     *             orderId:
     *               type: string
     *             collectionId:
     *               type: string
     *             description:
     *               type: string
     *             royalties:
     *               type: string
     *             currentOwner:
     *               type: string
     *             network:
     *               type: string
     *             tokenId:
     *               type: string
     *             walletAddress:
     *               type: string        
     *     responses:
     *       200:
     *         description: Congrats!! You successfully buy this NFT.
     *       404:
     *         description: User not found/Order not found.
     *       500:
     *         description: Internal server error.
     *       409:
     *         description: Already Exist.
     */

    async buyOrder(req, res, next) {
        let validationSchema = {
            orderId: Joi.string().required(),
            quantity: Joi.string().optional(), // new changes
            collectionId: Joi.string().optional(),
            description: Joi.string().optional(),
            royalties: Joi.string().optional(),
            currentOwner: Joi.string().optional(),
            network: Joi.string().optional(),
            tokenId: Joi.string().optional(),
            walletAddress: Joi.string().optional()
        }
        try {
            let validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound([], responseMessage.USER_NOT_FOUND);
            }
            let orderRes = await findOrder({ _id: validatedBody.orderId, isCreated: true, saleType: "ONSALE", status: { $ne: status.DELETE } })
            if (!orderRes) {
                return res.json(new response([], responseMessage.DATA_NOT_FOUND));
            } else {
                validatedBody.userId = userResult._id;
                validatedBody.nftId = orderRes.nftId;
                validatedBody.price = orderRes.price;
                validatedBody.sellerId = orderRes.userId;
                validatedBody.saleType = "OFFSALE";
                validatedBody.isCreated = false;
                validatedBody.creatorId = orderRes.creatorId; // new line 17 oct
                validatedBody.sellCount = orderRes.sellCount === undefined ? 0 : orderRes.sellCount + 1;
                var buyResult = await createOrder(validatedBody);

                let updateUserRes = await updateUser({ _id: userResult._id }, { $inc: { topBuyer: 1 } }, { new: true })
                let updateSalerRes = await updateUser({ _id: orderRes.userId }, { $inc: { topSaler: 1 } }, { new: true })
                let getNftResult = await findNft({ _id: orderRes.nftId });

                await updateNft({ _id: orderRes.nftId }, { $set: { isPlace: false, buyerUserId: userResult._id, currentOwnerId: validatedBody.currentOwner, tokenId: validatedBody.tokenId, WalletAddress: validatedBody.walletAddress }, $addToSet: { ownerHistory: { userId: getNftResult.userId } } });
                delete validatedBody.sellerId;
                delete validatedBody.userId;
                delete validatedBody.isCreated;
                validatedBody.buyerId = userResult._id;
                validatedBody.sellStatus = "SOLD";
                validatedBody.saleType = "OFFSALE";
                validatedBody.isDeleted = true;
                await updateOrder({ _id: orderRes._id }, validatedBody);
                let nftHistory = {
                    userId: userResult._id,
                    price: orderRes.price,
                    nftId: orderRes.nftId,
                    orderId: orderRes._id,
                    description: orderRes.description,
                    type: "ORDER_SELL"
                }
                let activityResult = {
                    userId: userResult._id,
                    nftId: orderRes.nftId,
                    orderId: orderRes._id,
                    type: "ORDER_SELL"
                }
                let notificationResUser = {
                    userId: userResult._id,
                    nftId: buyResult._id,
                    title: "NEW ODER SELL",
                    description: "You have successfullt buy a new Order.",
                    notificationType: "ORDER SELL",
                    date: commonFunction.dateTime(),
                };
                await createNotification(notificationResUser);
                let notificationResOwner = {
                    userId: orderRes.userId,
                    nftId: buyResult._id,
                    title: "NEW ODER SELL",
                    description: `Your order is Successfully buy.`,
                    notificationType: "ORDER SELL",
                    date: commonFunction.dateTime(),
                };
                await createNotification(notificationResOwner);
                await createHistory(nftHistory)
                await createActivity(activityResult)
            }
            return res.json(new response(buyResult, responseMessage.BUY_SUCCESS));
        } catch (error) {
            throw error
        }
    }

    /**
     * @swagger
     * /order/sendOrderToUser:
     *   post:
     *     tags:
     *       - USER ORDER
     *     description: sendOrderToUser
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token is required.
     *         in: header
     *         required: true
     *       - in: body
     *         name: sendOrderToUser 
     *         description: sendOrderToUser.
     *         schema:
     *           type: object
     *           required:
     *             - orderId
     *             - userId
     *           properties:
     *             orderId:
     *               type: string
     *             userId:
     *               type: string
     *             collectionId:
     *               type: string        
     *             description:
     *               type: string  
     *             royalties:
     *               type: string    
     *             network:
     *               type: string    
     *             currentOwner:
     *               type: string  
     *             tokenId:
     *               type: string  
     *     responses:
     *       200:
     *         description: Order has been sent successfully..
     *       404:
     *         description: User not found/Order not found.
     *       500:
     *         description: Internal server error.
     *       409:
     *         description: Already Exist.
     */

    async sendOrderToUser(req, res, next) {
        let validationSchema = {
            orderId: Joi.string().required(),
            userId: Joi.string().required(),
            collectionId: Joi.string().optional(),
            description: Joi.string().optional(),
            royalties: Joi.string().optional(),
            network: Joi.string().optional(),
            currentOwner: Joi.string().optional(),
            tokenId: Joi.string().optional()
        }
        try {
            let validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound([], responseMessage.USER_NOT_FOUND);
            }
            const orderRes = await findOrder({ _id: validatedBody.orderId, status: { $ne: status.DELETE } })
            const userRes = await findUser({ _id: validatedBody.userId })
            if (!orderRes) {
                throw apiError.notFound(responseMessage.ORDER_NOT_FOUND)
            } else {
                validatedBody.userId = validatedBody.userId;
                validatedBody.nftId = orderRes.nftId;
                validatedBody.price = orderRes.price;
                validatedBody.sellerId = orderRes.userId;
                validatedBody.saleType = "OFFSALE";
                validatedBody.isCreated = false;
                validatedBody.sellCount = orderRes.sellCount === undefined ? 0 : orderRes.sellCount + 1;
                var buyResult = await createOrder(validatedBody);
                console.log("==order new created=", buyResult)
                let getNftResult = await findNft({ _id: orderRes.nftId });
                // userId: validatedBody.userId, for changing the query on line 906
                let updatedNFTRes = await updateNft({ _id: orderRes.nftId }, { $set: { isPlace: false, buyerUserId: userResult._id, currentOwnerId: validatedBody.currentOwner, tokenId: validatedBody.tokenId }, $addToSet: { ownerHistory: { userId: getNftResult.userId } } });
                console.log("==after acceptBid nft will be==", updatedNFTRes)

                delete validatedBody.sellerId;
                delete validatedBody.userId;
                delete validatedBody.isCreated;
                validatedBody.buyerId = userRes._id;
                validatedBody.sellStatus = "SOLD";
                validatedBody.saleType = "OFFSALE";
                validatedBody.isDeleted = true;
                let orderUpdate = await updateOrder({ _id: orderRes._id }, validatedBody);
                console.log("orderUpdate after sendOrderTouser=>", orderUpdate)
                await createActivity({
                    nftId: orderRes.nftId,
                    collectionId: orderRes.collectionId,
                    orderId: orderRes._id,
                    userId: userRes._id,
                    receiverId: userRes._id,
                    title: "Send Order",
                    type: "ORDER_SELL",
                    description: "You have sent successfully a order to the user."
                });
                let histryRes = await createHistory({
                    nftId: orderRes.nftId,
                    collectionId: orderRes.collectionId,
                    orderId: orderRes._id,
                    userId: userRes._id,
                    receiverId: userRes._id,
                    title: "Send Order",
                    type: "ORDER_SELL",
                    description: "You have sent successfully a order to the user."
                });
                console.log("histryRes=>", histryRes)
                let notificationResUser = {
                    userId: userRes._id,
                    nftId: buyResult._id,
                    orderId: orderUpdate._id,
                    title: "NEW ODER SELL",
                    description: "You have received a new Order.",
                    notificationType: "ORDER SELL",
                    date: commonFunction.dateTime(),
                };
                await createNotification(notificationResUser);
                let notificationResOwner = {
                    userId: orderRes.userId,
                    nftId: buyResult._id,
                    orderId: orderUpdate._id,
                    title: "NEW ODER SELL",
                    description: `Your order is Successfully buy.`,
                    notificationType: "ORDER SELL",
                    date: commonFunction.dateTime(),
                };
                await createNotification(notificationResOwner);
                return res.json(new response(orderUpdate, responseMessage.SEND_ORDER));
            }
        } catch (error) {
            throw error
        }
    }

    /**
     * @swagger
     * /order/likeDislikeOrder/{orderId}:
     *   get:
     *     tags:
     *       - USER ORDER
     *     description: likeDislikeOrder
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: orderId
     *         description: orderId
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

    async likeDislikeOrder(req, res, next) {
        const validationSchema = {
            orderId: Joi.string().required(),
        }
        var updated;
        try {
            const { orderId } = await Joi.validate(req.params, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let orderCheck = await findOrder({ _id: orderId, status: { $ne: status.DELETE } });
            if (!orderCheck) {
                throw apiError.notFound(responseMessage.NFT_NOT_FOUND);
            }
            if (orderCheck.likesUsers.includes(userResult._id)) {
                updated = await updateOrder({ _id: orderCheck._id }, { $pull: { likesUsers: userResult._id }, $inc: { likesCount: -1 } });
                await updateUser({ _id: userResult._id }, { $pull: { likesOrder: orderCheck._id } });
                await createActivity({
                    userId: userResult._id,
                    orderId: orderCheck._id,
                    nftId: orderCheck.nftId,
                    title: "DISLIKE_NFT",
                    desctiption: "Bad choise, I disliked it.",
                    type: "DISLIKE"
                })
                await createHistory({
                    userId: userResult._id,
                    orderId: orderCheck._id,
                    nftId: orderCheck.nftId,
                    title: "DISLIKE_NFT",
                    desctiption: "Bad choise, I disliked it.",
                    type: "DISLIKE"
                })
                let nftDisLikeNotification = {
                    userId: userResult._id,
                    orderId: orderCheck._id,
                    nftId: orderCheck.nftId,
                    title: "NFT DISLIKE",
                    description: "I dont like this Nft ",
                    notificationType: "NFT DISLIKE",

                }
                await createNotification(nftDisLikeNotification);
                return res.json(new response(updated, responseMessage.DISLIKE_ORDER));
            } else {
                await createActivity({
                    userId: userResult._id,
                    orderId: orderCheck._id,
                    nftId: orderCheck.nftId,
                    title: "LIKE_NFT",
                    desctiption: "Nice choise, I liked it.",
                    type: "LIKE"
                })
                await createHistory({
                    userId: userResult._id,
                    orderId: orderCheck._id,
                    nftId: orderCheck.nftId,
                    title: "LIKE_NFT",
                    desctiption: "Nice choise, I liked it.",
                    type: "LIKE"
                })
                let nftLikeNotification = {
                    userId: userResult._id,
                    orderId: orderCheck._id,
                    nftId: orderCheck.nftId,
                    title: "NFT LIKE",
                    description: "I Like This NFT",
                    notificationType: "NFT LIKE",
                }
                await createNotification(nftLikeNotification);
                updated = await updateOrder({ _id: orderCheck._id }, { $addToSet: { likesUsers: userResult._id }, $inc: { likesCount: 1 } });
                await updateUser({ _id: userResult._id }, { $addToSet: { likesOrder: orderCheck._id } });
                return res.json(new response(updated, responseMessage.LIKE_ORDER));
            }
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /order/addLikesArray:
     *   get:
     *     tags:
     *       - USER ORDER
     *     description: allNftList
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Data found successfully.
     */

    async addLikesArray(req, res, next) {
        try {
            let dataResults = await multiUpdate({ likesUsers: [], likesCount: 0 });
            return res.json(new response(dataResults, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error);
        }

    }


    /**
     * @swagger
     * /order/feedBack:
     *   post:
     *     tags:
     *       - USER FEEDBACK
     *     description: feedBack
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: orderId
     *         description: orderId
     *         in: formData
     *         required: false
     *       - name: rating
     *         description: rating
     *         in: formData
     *         required: true
     *       - name: comment
     *         description: comment
     *         in: formData
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async feedBack(req, res, next) {
        try {
            let userCheck = await findUser({ _id: req.userId })
            if (!userCheck) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let orderCheck, feedbackcheck, update, saveResult;
            let obj = {
                userId: userCheck._id,
                rating: req.body.rating,
                comment: req.body.comment
            }
            if (req.body.orderId) {
                orderCheck = await findOrder({ _id: req.body.orderId });
                obj["orderId"] = orderCheck._id;
                feedbackcheck = await findFeedback({ userId: userCheck._id, orderId: orderCheck._id });
                if (feedbackcheck) {
                    update = await updateFeedback({ _id: feedbackcheck._id }, obj);
                    return res.json(new response(update, responseMessage.DATA_FOUND));
                } else {
                    saveResult = await createFeedback(obj);
                    return res.json(new response(saveResult, responseMessage.DATA_FOUND));
                }
            }
            feedbackcheck = await findFeedback({ userId: userCheck._id });
            if (feedbackcheck) {
                update = await updateFeedback({ _id: feedbackcheck._id }, obj);
                return res.json(new response(update, responseMessage.DATA_FOUND));
            } else {
                saveResult = await createFeedback(obj);
                return res.json(new response(saveResult, responseMessage.DATA_FOUND));
            }

        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /order/listfeedback:
     *   get:
     *     tags:
     *       - USER FEEDBACK
     *     description: listfeedback
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: fromDate
     *         description: fromDate
     *         in: query
     *         required: false
     *       - name: toDate
     *         description: toDate
     *         in: query
     *         required: false
     *       - name: page
     *         description: page
     *         in: query
     *         type: integer
     *         required: false
     *       - name: limit
     *         description: limit
     *         in: query
     *         type: integer
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async listfeedback(req, res, next) {
        const validationSchema = {
            fromDate: Joi.string().optional(),
            toDate: Joi.string().optional(),
            page: Joi.number().optional(),
            limit: Joi.number().optional(),
        };
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            let dataResults = await FeedbackList(validatedBody);
            if (dataResults.docs.length == 0) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            return res.json(new response(dataResults, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
  * @swagger
  * /order/floorTradeCount:
  *   get:
  *     tags:
  *       - USER FEEDBACK
  *     description: floorTradeCount
  *     produces:                                    
  *       - application/json
  *     responses:
  *       200:
  *         description: Data found successfully.
  */

    async floorTradeCount(req, res, next) {
        try {
            const volume = async () => {
                return volumeTradeNFT();
            }
            const floor = async () => {
                return floorPriceNFT();
            }
            let [volumeTradeNFTRes, floorNFTRes] = await Promise.all([volume(), floor()])

            return res.json(new response({ volumeTradeNFTRes, floorNFTRes }, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error);
        }

    }

    /**
   * @swagger
   * /order/downloadPrivateurl:
   *   get:
   *     tags:
   *       - USER ORDER
   *     description: downloadPrivateurl
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token 
   *         in: header
   *         required: true
   *       - name: orderId
   *         description: orderId 
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Order details fetched successfully.
   *       404:
   *         description: User not found/Data not found.
   *       500:
   *         description: Internal server error.
   *       409:
   *         description: Already Exist.
   */

    async downloadPrivateurl(req, res, next) {
        try {
            const validatedBody = await Joi.validate(req.query);
            let userRes = await findUser({ _id: req.userId })
            if (!userRes) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND)
            }
            let order_res = await dowloadPrivateUrl({ _id: req.query.orderId }, userRes._id, userRes.walletAddress)
            if (!order_res) {
                throw apiError.notFound(responseMessage.ASSOCIATE_USER)
            }

            //     let finalResult = _.omit(JSON.parse(JSON.stringify(order_res)), (order_res.nftId.recipientWalletAddress == userRes.walletAddress || order_res.nftId.recipientBackupWalletAddress == userRes.walletAddress) ? [] );
            //   return;
            return res.json(new response(order_res, responseMessage.ORDER_DETAILS));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /order/buyPhysicalNft:
     *   post:
     *     tags:
     *       - USER ORDER
     *     description: buyPhysicalNft
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token is required.
     *         in: header
     *         required: true
     *       - in: body
     *         name: buyPhysicalNft 
     *         description: buyPhysicalNft.
     *         schema:
     *           type: object
     *           required:
     *             - orderId
     *           properties:
     *             orderId:
     *               type: string
     *             collectionId:
     *               type: string
     *             description:
     *               type: string
     *             royalties:
     *               type: string
     *             currentOwner:
     *               type: string
     *             network:
     *               type: string
     *             tokenId:
     *               type: string
     *             quantity:
     *               type: integer
     *             price:
     *               type: integer
     *     responses:
     *       200:
     *         description: Congrats!! You successfully buy this NFT.
     *       404:
     *         description: User not found/Order not found.
     *       500:
     *         description: Internal server error.
     *       409:
     *         description: Already Exist.
     */

    async buyPhysicalNft(req, res, next) {
        let validationSchema = {
            orderId: Joi.string().required(),
            quantity: Joi.number().optional(), // new changes
            collectionId: Joi.string().optional(),
            description: Joi.string().optional(),
            royalties: Joi.string().optional(),
            price: Joi.number().optional(),
            currentOwner: Joi.string().optional(),
            network: Joi.string().optional(),
            tokenId: Joi.string().optional(),
        }
        try {
            let nftRes;
            let validatedBody = await Joi.validate(req.body, validationSchema);

            const userResult = await findUser({ _id: req.userId });
            if (!userResult) throw apiError.notFound([], responseMessage.USER_NOT_FOUND);

            const orderResult = await findOrder({ _id: validatedBody.orderId });
            if (!orderResult) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);

            const nftQnty = Number(validatedBody.quantity);
            if (nftQnty > orderResult.quantity) {
                throw apiError.badRequest(responseMessage.LESS_QUANTITY);
            }

            const checkMyNft = await findNft({ nftId: orderResult.nftId, userId: userResult._id });
            const nftDetails = orderResult.nftId;

            if (checkMyNft) {
                nftRes = await updateNft({ _id: checkMyNft._id }, { $inc: { quantity: nftQnty, holdQuantity: nftQnty } });
            } else {
                nftRes = await createNft({
                    nftId: nftDetails._id,
                    nftType: nftDetails.nftType,
                    currentOwnerId: userResult._id,
                    userId: userResult._id,
                    collectionId: nftDetails.collectionId,
                    creatorId: nftDetails.creatorId,
                    tokenId: nftDetails.tokenId,
                    tokenName: nftDetails.tokenName,
                    uri: nftDetails.uri,
                    description: nftDetails.description,
                    coverImage: nftDetails.coverImage,
                    mediaFile: nftDetails.mediaFile,
                    royalties: nftDetails.royalties,
                    network: nftDetails.network,
                    mediaType: nftDetails.mediaType,
                    physicalType: nftDetails.physicalType,
                    quantity: nftQnty,
                    genQuantity: nftQnty,
                    holdQuantity: nftQnty,
                    contractAddress: nftDetails.contractAddress,
                    isCreated: false
                })
            }
            const [nftUpdatedRes, O] = await Promise.all([
                updateNft({ _id: nftDetails._id }, { $inc: { soldQuantity: nftQnty, placedQuantity: -nftQnty } }),
                updateOrder({ _id: orderResult._id }, { $inc: { quantity: -nftQnty }, $addToSet: { buyerDetails: { buyerId: userResult._id, quantity: nftQnty, price: validatedBody.price } } }),
            ]);
            // if (nftUpdatedRes.quantity === 0) await updateNft({ _id: nftUpdatedRes._id }, { isPlace: false });

            await Promise.all([
                createNotification({
                    userId: userResult._id,
                    nftId: nftDetails._id,
                    title: "NEW ODER SELL",
                    description: "You have successfullt buy a new Order.",
                    notificationType: "ORDER SELL",
                    date: commonFunction.dateTime(),
                }),
                createNotification({
                    userId: orderResult.userId,
                    nftId: nftDetails._id,
                    title: "NEW ODER SELL",
                    description: `Your order is Successfully buy.`,
                    notificationType: "ORDER SELL",
                    date: commonFunction.dateTime(),
                }),
                createHistory({
                    userId: userResult._id,
                    price: orderResult.price,
                    nftId: orderResult.nftId,
                    orderId: orderResult._id,
                    description: orderResult.description,
                    type: "ORDER_SELL"
                }),
                createActivity({
                    userId: userResult._id,
                    nftId: orderResult.nftId,
                    orderId: orderResult._id,
                    type: "ORDER_SELL"
                })

            ]);
            return res.json(new response({}, responseMessage.BUY_SUCCESS));



            /*
            let orderRes = await findOrder({ _id: validatedBody.orderId, isCreated: true, saleType: "ONSALE", status: { $ne: status.DELETE } })
            if (!orderRes) {
                return res.json(new response([], responseMessage.DATA_NOT_FOUND));
            }
            if (validatedBody.quantity > orderRes.quantity) {
                throw apiError.badRequest(responseMessage.LESS_QUANTITY);
            }
            let orderData = await findOrder({ userId: userResult._id, nftId: orderRes.nftId, status: { $ne: status.DELETE } });
            if (orderData) {
                let saveRes = await updateOrder({ _id: orderData._id }, { quantity: Number(validatedBody.quantity) + Number(orderData.quantity), price: (Number(validatedBody.price) + Number(orderData.price)) / 2 })

                await updateUser({ _id: userResult._id }, { $inc: { topBuyer: 1 } }, { new: true })
                await updateUser({ _id: orderRes.userId }, { $inc: { topSaler: 1 } }, { new: true })

                let getNftResult = await findNft({ _id: orderRes.nftId });
                await updateNft({ _id: orderRes.nftId }, { $set: { isPlace: false, buyerUserId: userResult._id, currentOwnerId: validatedBody.currentOwner, tokenId: validatedBody.tokenId }, $addToSet: { ownerHistory: { userId: getNftResult.userId } } });
                await updateOrder({ _id: orderRes._id }, { $push: { buyerDetails: { $each: [{ buyerId: userResult._id, quantity: validatedBody.quantity, price: validatedBody.price }] } }, $set: { quantity: Number(orderRes.quantity) - Number(validatedBody.quantity) } })

                let nftHistory = {
                    userId: userResult._id,
                    price: orderRes.price,
                    nftId: orderRes.nftId,
                    orderId: orderRes._id,
                    description: orderRes.description,
                    type: "ORDER_SELL"
                }
                let activityResult = {
                    userId: userResult._id,
                    nftId: orderRes.nftId,
                    orderId: orderRes._id,
                    type: "ORDER_SELL"
                }
                let notificationResUser = {
                    userId: userResult._id,
                    nftId: buyResult._id,
                    title: "NEW ODER SELL",
                    description: "You have successfullt buy a new Order.",
                    notificationType: "ORDER SELL",
                    date: commonFunction.dateTime(),
                };
                await createNotification(notificationResUser);
                let notificationResOwner = {
                    userId: orderRes.userId,
                    nftId: buyResult._id,
                    title: "NEW ODER SELL",
                    description: `Your order is Successfully buy.`,
                    notificationType: "ORDER SELL",
                    date: commonFunction.dateTime(),
                };
                await createNotification(notificationResOwner);
                await createHistory(nftHistory)
                await createActivity(activityResult)

                return res.json(new response(saveRes, responseMessage.BUY_SUCCESS));
            } else {
                validatedBody.userId = userResult._id;
                validatedBody.nftId = orderRes.nftId;
                validatedBody.quantity = validatedBody.quantity;
                validatedBody.price = orderRes.price;
                validatedBody.sellerId = orderRes.userId;
                validatedBody.saleType = "OFFSALE";
                validatedBody.isCreated = false;
                validatedBody.creatorId = orderRes.creatorId; // new line 17 oct
                validatedBody.sellCount = orderRes.sellCount === undefined ? 0 : orderRes.sellCount + 1;
                var buyResult = await createOrder(validatedBody);
                console.log("==buyResult===>", buyResult)

                let updateUserRes = await updateUser({ _id: userResult._id }, { $inc: { topBuyer: 1 } }, { new: true })
                let updateSalerRes = await updateUser({ _id: orderRes.userId }, { $inc: { topSaler: 1 } }, { new: true })
                let getNftResult = await findNft({ _id: orderRes.nftId });

                await updateNft({ _id: orderRes.nftId }, { $set: { isPlace: false, buyerUserId: userResult._id, currentOwnerId: validatedBody.currentOwner, tokenId: validatedBody.tokenId }, $addToSet: { ownerHistory: { userId: getNftResult.userId } } });


                delete validatedBody.sellerId;
                delete validatedBody.userId;
                delete validatedBody.isCreated;
                validatedBody.buyerId = userResult._id;
                validatedBody.sellStatus = "SOLD";
                validatedBody.saleType = "OFFSALE";
                validatedBody.isDeleted = true;
                validatedBody.buyerDetails = {
                    buyerId: userResult._id,
                    quantity: validatedBody.quantity,
                    price: validatedBody.price
                }
                await updateOrder({ _id: orderRes._id }, validatedBody);

                let nftHistory = {
                    userId: userResult._id,
                    price: orderRes.price,
                    nftId: orderRes.nftId,
                    orderId: orderRes._id,
                    description: orderRes.description,
                    type: "ORDER_SELL"
                }
                let activityResult = {
                    userId: userResult._id,
                    nftId: orderRes.nftId,
                    orderId: orderRes._id,
                    type: "ORDER_SELL"
                }
                let notificationResUser = {
                    userId: userResult._id,
                    nftId: buyResult._id,
                    title: "NEW ODER SELL",
                    description: "You have successfullt buy a new Order.",
                    notificationType: "ORDER SELL",
                    date: commonFunction.dateTime(),
                };
                let notificationResOwner = {
                    userId: orderRes.userId,
                    nftId: buyResult._id,
                    title: "NEW ODER SELL",
                    description: `Your order is Successfully buy.`,
                    notificationType: "ORDER SELL",
                    date: commonFunction.dateTime(),
                };
                await createNotification(notificationResUser);
                await createNotification(notificationResOwner);
                await createHistory(nftHistory)
                await createActivity(activityResult)
            }
            return res.json(new response(buyResult, responseMessage.BUY_SUCCESS));
            */
        } catch (error) {
            console.log("====error==>", error)
            throw error;
        }
    }


    /**
      * @swagger
      * /order/resalePhysicalOrder:
      *   post:
      *     tags:
      *       - USER ORDER
      *     description: resalePhysicalOrder
      *     produces:
      *       - application/json
      *     parameters:
      *       - name: token
      *         description: token
      *         in: header
      *         required: true
      *       - name: resalePhysicalOrder
      *         description: resalePhysicalOrder
      *         in: body
      *         required: true
      *         schema:
      *           $ref: '#/definitions/resalePhysicalOrder'
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

    async resalePhysicalOrder(req, res, next) {
        const validationSchema = {
            nftId: Joi.string().required(),
            orderId: Joi.string().optional(),
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
            quantity: Joi.string().optional()
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
            validatedBody.userId = userResult._id;
            validatedBody.creatorId = nftCheck.userId; // new line
            validatedBody.collectionId = nftCheck.collectionId;
            validatedBody.itemCategory = nftCheck.itemCategory;
            validatedBody.isCreated = true;
            if (validatedBody.orderId) await updateOrder({ _id: validatedBody.orderId }, { isDeleted: true });
            var result = await createOrder(validatedBody);

            await updateCollection({ _id: nftCheck.collectionId }, { $inc: { placeNftCount: 1 } });
            await updateNft({ _id: nftCheck._id }, { isPlace: true }, { $inc: { treandingNftCount: 1 } });
            await updateUser({ _id: userResult._id }, { $inc: { orderCount: 1, topSaler: 1 } });
            await createActivity({
                userId: userResult._id,
                collectionId: nftCheck.collectionId,
                nftId: nftCheck._id,
                orderId: result._id,
                title: "NEW ORDER",
                description: "A new order has been placed successfully.",
                type: "ORDER_CREATE"
            });
            let obj = {
                userId: userResult._id,
                collectionId: nftCheck.collectionId,
                nftId: nftCheck._id,
                title: "NEW ORDER",
                description: "You have placed one order successfully.",
                notificationType: "New_ORDER",
                date: commonFunction.dateTime(),
                image: nftCheck.mediaFile ? nftCheck.mediaFile : "https://res.cloudinary.com/dkoznoze6/image/upload/v1563943105/n7zdoyvpxxqhexqybvkx.jpg"
            };
            await createNotification(obj);
            let historyRes = {
                userId: userResult._id,
                collectionId: nftCheck.collectionId,
                nftId: nftCheck._id,
                type: "ORDER_CREATE",
                title: "Create a new Order ",
                description: "A new order has been placed successfully."
            }
            let history = await createHistory(historyRes);
            console.log("====>", history)
            return res.json(new response(result, responseMessage.PLACE_ORDER));
        }
        catch (error) {
            return next(error);
        }
    }




}

export default new orderController();

