import Joi from "joi";
import _ from "lodash";
import config from "config";
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
import { trackingServices } from '../../services/tracking';

const { createMetadata, findMetadata } = metadataServices;

const { userCheck, findUser, findUserData, createUser, updateUser, updateUserById, userSubscriberList } = userServices;
const { createCollection, findCollection, updateCollection, collectionList, collectionPaginateSearch, myCollectionPaginateSearch } = collectionServices;
const { createNft, findNft, updateNft, nftList, nftPaginateSearch, myNftPaginateSearch, nftListWithAggregate, listAllNft, nftListWithSearch, multiUpdate, nftListWithAggregatePipeline, findNftWithPopulateDetails } = nftServices;
const { createNotification, findNotification, updateNotification, multiUpdateNotification, notificationList, notificationListWithSort } = notificationServices;
const { createTransaction, findTransaction, updateTransaction, transactionList } = transactionServices;
const { createActivity, findActivity, updateActivity, paginateUserOwendActivity, paginateActivity, activityList } = activityServices;
const { createHistory, findHistory, updateHistory, historyList, paginateShowNftHistory, paginateUserOwendHistory, paginateHistory } = historyServices;
const { createOrder, findOrder, findOrderWithPopulate, updateOrder, orderList, findOneOrder, paginateOrder, dowloadPrivateUrl, orderListWithSearch, collectionOrderList, floorPriceNFT, volumeTradeNFT } = orderServices;
const { createTracking, findTracking,trackingListParticular, updateTracking, trackingList, trackingListWithPopulate } = trackingServices

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

export class trackingController {

    /**
        * @swagger
        * /tracking/addTracking:
        *   post:
        *     tags:
        *       - TRACKING
        *     description: addTracking
        *     produces:
        *       - application/json
        *     parameters:
        *       - name: token
        *         description: token is required.
        *         in: header
        *         required: true
        *       - in: body
        *         name: addTracking 
        *         description: addTracking.
        *         schema:
        *           type: object
        *           required:
        *             - orderId
        *           properties:
        *             orderId:
        *               type: string
        *             comment:
        *               type: string
        *             userId:
        *               type: string
        *     responses:
        *       200:
        *         description: Congrats!! You successfully tracking add.
        *       404:
        *         description: User not found/Order not found.
        *       500:
        *         description: Internal server error.
        *       409:
        *         description: Already Exist.
        */

    async addTracking(req, res, next) {
        let validationSchema = {
            orderId: Joi.string().required(),
            userId: Joi.string().optional(), // new changes
            comment: Joi.string().optional(),
        }
        try {
            let validatedBody = await Joi.validate(req.body, validationSchema);
            let useRes = await findUser({ _id: req.userId });
            if (!useRes) throw apiError.notFound(responseMessage.USER_NOT_FOUND);

            let trackingRes = await trackingListParticular(validatedBody);
            let updateOrderRes = await updateOrder({ _id: validatedBody.orderId }, { $push: { trackingDetails: { $each: [{ userId: userResult._id, quantity: validatedBody.quantity, comment: validatedBody.comment }] } } })
            return res.json(new response(trackingRes, responseMessage.TRACKING_ADD));
        } catch (error) {
            throw error
        }
    }


    /**
      * @swagger
      * /tracking/viewTracking:
      *   get:
      *     tags:
      *       - TRACKING
      *     description: viewTracking
      *     produces:
      *       - application/json
      *     parameters:
      *       - name: _id
      *         description: _id is required.
      *         in: query
      *         required: true
      *     responses:
      *       200:
      *         description: Congrats!! You successfully tracking add.
      *       404:
      *         description: User not found/Order not found.
      *       500:
      *         description: Internal server error.
      *       409:
      *         description: Already Exist.
      */

    async viewTracking(req, res, next) {
        let validationSchema = {
            _id: Joi.string().required(),
        }
        try {
            let { _id } = await Joi.validate(req.body, validationSchema);
            let useRes = await findTracking({ _id: _id });
            if (!useRes) throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            return res.json(new response(useRes, responseMessage.DATA_FOUND));
        } catch (error) {
            throw error
        }
    }


    /**
     * @swagger
     * /tracking/listTracking:
     *   get:
     *     tags:
     *       - TRACKING
     *     description: listTracking
     *     responses:
     *       200:
     *         description: DAta found successfully.
     *       404:
     *         description: User not found/Order not found.
     *       500:
     *         description: Internal server error.
     *       409:
     *         description: Already Exist.
     */

    async listTracking(req, res, next) {
        try {
            let { _id } = await Joi.validate(req.body);
            let userDetail = await findUser({ _id: req.userId });
            if (userDetail) throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            let useRes = await trackingListParticular(userDetail._id);
            return res.json(new response(useRes, responseMessage.DATA_FOUND));
        } catch (error) {
            throw error
        }
    }




}

export default new trackingController()

