import Joi from "joi";
import _ from "lodash";
import config from "config";
import apiError from '../../../../helper/apiError';
import response from '../../../../../assets/response';
import responseMessage from '../../../../../assets/responseMessage';
import { userServices } from '../../services/user';
import { nftServices } from '../../services/nft';
import { orderServices } from '../../services/order';
import { bidServices } from '../../services/bid';
import { activityServices } from '../../services/activity';
import { historyServices } from '../../services/history';


const { userCheck, findUser, findUserData, updateUserById } = userServices;
const { createNft, findNft, updateNft, nftList, nftPaginateSearch, myNftPaginateSearch } = nftServices;
const { createOrder, findOrder, updateOrder, findHotOrder, hotOrderList, updateOrderById, orderList } = orderServices;
const { createBid, findBid, updateBid, updateManyBid, hotBidList, bidList } = bidServices;
const { createActivity, findActivity, updateActivity, paginateUserOwendActivity, activityList } = activityServices;
const { createHistory, findHistory, updateHistory, historyList, paginateShowNftHistory, paginateUserOwendHistory, paginateHistory } = historyServices;

import commonFunction from '../../../../helper/util';
import status from '../../../../enums/status';


export class bidController {

    /**
     * @swagger
     * /bid/createBid:
     *   post:
     *     tags:
     *       - USER BID
     *     description: createBid
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: createBid
     *         description: createBid
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/createBid'
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async createBid(req, res, next) {
        const validationSchema = {
            orderId: Joi.string().required(),
            name: Joi.string().optional(),
            bid: Joi.number().optional(),
            price: Joi.number().optional(),
            date: Joi.string().optional(),
            statues: Joi.string().optional(),
            walletAddress: Joi.string().optional()
            
        }
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let orderCheck = await findOrder({ _id: validatedBody.orderId, status: { $ne: status.DELETE } });
            if (!orderCheck) {
                throw apiError.conflict(responseMessage.ORDER_NOT_FOUND);
            }
            validatedBody.userId = userResult._id;
            validatedBody.nftId = orderCheck.nftId;
            validatedBody.collectionId = orderCheck.collectionId;
            await updateManyBid(validatedBody.orderId);
            var result = await createBid(validatedBody);
            await Promise.all([
                updateOrderById({ _id: orderCheck._id }, { $addToSet: { bidId: result._id }, $inc: { bidCount: 1 } }, { new: true }),
                updateNft({ _id: orderCheck.nftId._id }, { bidAmount: validatedBody.price })
            ])
            // await updateNft({ _id: orderCheck.nftId }, { $set: { isPlace: false } });
            await createActivity({
                userId: userResult._id,
                orderId: orderCheck._id,
                nftId: orderCheck.nftId,
                bidId: result._id,
                title: "NEW BID",
                desctiption: "A new bid has been placed successfully.",
                type: "BID_CREATE"
            });
            await createHistory({
                userId: userResult._id,
                orderId: orderCheck._id,
                nftId: orderCheck.nftId,
                bidId: result._id,
                title: "NEW BID",
                desctiption: "A new bid has been placed successfully.",
                type: "BID_CREATE"
            });
            return res.json(new response(result, responseMessage.BID_ADDED));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
        * @swagger
        * /bid/viewBid/{_id}:
        *   get:
        *     tags:
        *       - USER BID
        *     description: viewBid
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

    async viewBid(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required()
        }
        try {
            const { _id } = await Joi.validate(req.params, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var bidResult = await findBid({ _id: _id, status: { $ne: status.DELETE } });
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
     * /bid/editBid:
     *   put:
     *     tags:
     *       - USER BID
     *     description: editBid
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: editBid
     *         description: editBid
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/editBid'
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async editBid(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
            name: Joi.string().optional(),
            bid: Joi.string().optional(),
            date: Joi.string().optional(),
            statues: Joi.string().optional()
        }
        try {
            var validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            if (req.files.length != 0) {
                validatedBody.mediaUrl = await commonFunction.getImageUrl(req.files);
            }
            var bidResult = await findBid({ _id: validatedBody._id, status: { $ne: status.DELETE } });
            if (!bidResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            var result = await updateBid({ _id: bidResult._id }, validatedBody);
            return res.json(new response(result, responseMessage.DETAILS_FETCHED));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
       * @swagger
       * /bid/deleteBid:
       *   delete:
       *     tags:
       *       - USER BID
       *     description: deleteBid
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
       *         description: Returns success message
       */

    async deleteBid(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
        }
        try {
            const { _id } = await Joi.validate(req.query, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var bidResult = await findBid({ _id: _id, status: { $ne: status.DELETE } });
            if (!bidResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            var result = await updateBid({ _id: bidResult._id }, { status: status.DELETE });
            return res.json(new response(result, responseMessage.DETAILS_FETCHED));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
       * @swagger
       * /bid/acceptBid:
       *   put:
       *     tags:
       *       - USER BID
       *     description: acceptBid
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
       *         description: Returns success message
       */

    async acceptBid(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
        }
        try {
            const { _id } = await Joi.validate(req.query, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var bidResult = await findBid({ _id: _id, status: { $ne: status.DELETE } });
            console.log("===bidResult before accept bid", bidResult)
            if (!bidResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            var result = await updateBid({ _id: bidResult._id }, { bidStatus: "ACCEPTED" });
            validatedBody.buyerId = bidResult.userId;
            validatedBody.currentOwner = bidResult.userId;
            validatedBody.sellStatus = "SOLD";
            validatedBody.saleType = "OFFSALE";
            let updateOrder = await updateOrder({ _id: bidResult.orderId }, validatedBody);
            console.log("===updateOrder after accept bid", updateOrder)

            await updateNft({ _id: bidResult.nftId }, { $set: { isPlace: false, WalletAddress: bidResult.walletAddress } });
            updateEarning(bidResult.nftId, bidResult.price);
            return res.json(new response(result, responseMessage.DETAILS_FETCHED));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
   * @swagger
   * /bid/cancelBid:
   *   put:
   *     tags:
   *       - USER BID
   *     description: cancelBid
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
   *         description: Returns success message
   */

    async cancelBid(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
        }
        try {
            const { _id } = await Joi.validate(req.query, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var bidResult = await findBid({ _id: _id, status: { $ne: status.DELETE } });
            if (!bidResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            var result = await updateBid({ _id: bidResult._id }, { bidStatus: "CANCELLED" });
            return res.json(new response(result, responseMessage.DETAILS_FETCHED));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
         * @swagger
         * /bid/listBid:
         *   get:
         *     tags:
         *       - USER BID
         *     description: listBid
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
         *         description: Returns success message
         */

    async listBid(req, res, next) {
        const validationSchema = {
            orderId: Joi.string().required(),
        }
        try {
            const { orderId } = await Joi.validate(req.query, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let dataResults = await bidList({ orderId: orderId, status: { $ne: status.DELETE } });
            return res.json(new response(dataResults, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error);
        }

    }

    /**
         * @swagger
         * /bid/myBid:
         *   get:
         *     tags:
         *       - USER BID
         *     description: myBid
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

    async myBid(req, res, next) {
        try {
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let dataResults = await bidList({ bidStatus: { $ne: "REJECTED" }, userId: userResult._id, status: { $ne: status.DELETE } });
            return res.json(new response(dataResults, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
         * @swagger
         * /bid/hotBid:
         *   get:
         *     tags:
         *       - USER BID
         *     description: hotBid
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         description: Returns success message
         */

    async hotBid(req, res, next) {
        try {
            let dataResults = await hotBidList({ bidStatus: { $ne: "REJECTED" }, status: { $ne: status.DELETE } });
            return res.json(new response(dataResults, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error);
        }

    }
}

export default new bidController()


const updateEarning = async (nftId, amount) => {
    let nftData = await findNft({ _id: nftId });
    if (nftData) {
        await updateUserById({ _id: nftData.userId._id }, { $inc: { totalEarning: amount } });
    }

}
