import Joi from "joi";
import _ from "lodash";
import config from "config";
import apiError from '../../../../helper/apiError';
import response from '../../../../../assets/response';
import responseMessage from '../../../../../assets/responseMessage';
import { userServices } from '../../services/user';
import { collectionServices } from '../../services/collection';
import { nftServices } from '../../services/nft';
import { orderServices } from '../../services/order';
import { historyServices } from '../../services/history';
import { activityServices } from '../../services/activity';


const { userCheck, userCount, checkUserExists, emailMobileExist, createUser, findUser, findUserData, updateUser, updateUserById, userAllDetails, checkSocialLogin, userSubscriberList } = userServices;
const { findCollection } = collectionServices;
const { createNft, findNft, updateNft, nftList, nftPaginateSearch, myNftPaginateSearch } = nftServices;
const { createOrder, findOrder, updateOrder, orderList } = orderServices;
const { createActivity, findActivity, updateActivity, paginateUserOwendActivity, activityList } = activityServices;
const { createHistory, findHistory, updateHistory, historyList, paginateUserOwendHistory, paginateHistory } = historyServices;


import commonFunction from '../../../../helper/util';
import status from '../../../../enums/status';



export class historyController {

    /**
     * @swagger
     * /history/createHistory:
     *   post:
     *     tags:
     *       - USER HISTORY
     *     description: createHistory
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: createHistory
     *         description: createHistory
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/createHistory'
     *     responses:
     *       creatorAddress: Joi.string().optional(),
     *       200:
     *         description: Returns success message
     */
    async createHistory(req, res, next) {
        const validationSchema = {
            title: Joi.string().optional(),
            desctiption: Joi.string().optional(),
            type: Joi.string().optional(),
        }
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            validatedBody.userId = userResult._id;
            let result = await createHistory(validatedBody);
            return res.json(new response(result, responseMessage.DATA_SAVED));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /history/viewHistory/{_id}:
     *   get:
     *     tags:
     *       - USER HISTORY
     *     description: viewActivity
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
    async viewHistory(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required()
        }
        try {
            const { _id } = await Joi.validate(req.params, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var historyResult = await findHistory({ _id: _id, status: { $ne: status.DELETE } });
            if (!historyResult) {
                throw apiError.conflict(responseMessage.DATA_NOT_FOUND);
            }
            return res.json(new response(historyResult, responseMessage.DETAILS_FETCHED));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /history/editHistory:
     *   put:
     *     tags:
     *       - USER HISTORY
     *     description: editHistory
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: editHistory
     *         description: editHistory
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/editHistory'
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async editHistory(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
            title: Joi.string().optional(),
            desctiption: Joi.string().optional(),
            type: Joi.string().optional()
        }
        try {
            var validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var historyResult = await findHistory({ _id: validatedBody._id, status: { $ne: status.DELETE } });
            if (!historyResult) {
                throw apiError.conflict(responseMessage.DATA_NOT_FOUND);
            }
            var result = await updateHistory({ _id: historyResult._id }, validatedBody);
            return res.json(new response(result, responseMessage.DETAILS_FETCHED));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /history/deleteHistory:
     *   delete:
     *     tags:
     *       - USER HISTORY
     *     description: deleteHistory
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
    async deleteHistory(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
        }
        try {
            const { _id } = await Joi.validate(req.query, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var historyResult = await findHistory({ _id: _id, status: { $ne: status.DELETE } });
            if (!historyResult) {
                throw apiError.conflict(responseMessage.DATA_NOT_FOUND);
            }
            var result = await updateHistory({ _id: historyResult._id }, { status: status.DELETE });
            return res.json(new response(result, responseMessage.DETAILS_FETCHED));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /history/listHistory:
     *   get:
     *     tags:
     *       - USER HISTORY
     *     description: listHistory
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
    async listHistory(req, res, next) {
        try {
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let dataResults = await historyList({ userId: userResult._id, status: { $ne: status.DELETE } });
            return res.json(new response(dataResults, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /history/allListHistory:
     *   get:
     *     tags:
     *       - USER HISTORY
     *     description: allListHistory
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
    async allListHistory(req, res, next) {
        try {
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let dataResults = await historyList({ status: { $ne: status.DELETE } });
            return res.json(new response(dataResults, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error);
        }
    }
}

export default new historyController();

