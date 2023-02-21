import Joi from "joi";
import _ from "lodash";
import config from "config";
import apiError from '../../../../helper/apiError';
import response from '../../../../../assets/response';
import responseMessage from '../../../../../assets/responseMessage';
import { userServices } from '../../services/user';
import { collectionServices } from '../../services/collection';
import { nftServices } from '../../services/nft';
import { reportServices } from '../../services/report';
import { activityServices } from '../../services/activity';
import { brandServices } from '../../services/brand';

const { createActivity, updateActivity, paginateUserOwendActivity, activityList } = activityServices;
const { userCheck, checkUserExists, emailMobileExist, createUser, findfollowers, findfollowing, findUser, updateUser, updateUserById, paginateSearch, checkSocialLogin, checkLogin } = userServices;
const { createCollection, findCollection, updateCollection, collectionList, collectionPaginateSearch, myCollectionPaginateSearch } = collectionServices;
const { createBrand, findBrand, updateBrand, brandList } = brandServices;



import commonFunction from '../../../../helper/util';
import status from '../../../../enums/status';
import date from "joi/lib/types/date";



export class collectionController {

    /**
     * @swagger
     * /collection/createCollection:
     *   post:
     *     tags:
     *       - TRANSFER FEE DASHBOARD
     *     description: createCollection
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: brandId
     *         description: brandId
     *         in: formData
     *         required: false
     *       - name: contractAddress
     *         description: contractAddress
     *         in: formData
     *         required: false
     *       - name: network
     *         description: network
     *         in: formData
     *         required: false
     *       - name: displayName
     *         description: displayName
     *         in: formData
     *         required: false
     *       - name: symbol
     *         description: symbol
     *         in: formData
     *         required: false
     *       - name: shortURL
     *         description: shortURL
     *         in: formData
     *         required: false
     *       - name: collectionImage
     *         description: collectionImage
     *         in: formData
     *         type: file
     *         required: false
     *       - name: bannerImage
     *         description: bannerImage
     *         type: file
     *         in: formData
     *         required: false
     *       - name: baseURI
     *         description: baseURI
     *         in: formData
     *         required: false
     *       - name: isPromoted
     *         description: isPromoted
     *         in: formData
     *         required: false
     *       - name: brandCollectionType
     *         description: brandCollectionType
     *         in: formData
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async createCollection(req, res, next) {
        var validationSchema = {
            brandId: Joi.string().optional(),
            contractAddress: Joi.string().optional(),
            network: Joi.string().optional(),
            displayName: Joi.string().optional(),
            symbol: Joi.string().optional(),
            description: Joi.string().optional(),
            shortURL: Joi.string().optional(),
            collectionImage: Joi.string().optional(),
            bannerImage: Joi.string().optional(),
            baseURI: Joi.string().optional(),
            isPromoted: Joi.boolean().optional(),
            brandCollectionType: Joi.string().optional()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let { contractAddress, brandCollectionType, displayName, bannerImage, symbol, description, network, shortURL, isPromoted, collectionImage, categoryType, isLazyMinting } = validatedBody;
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let contractAddressCheck = await findCollection({ contractAddress: contractAddress });
            if (contractAddressCheck) throw apiError.notFound(responseMessage.CONTRACT_ALREADY_EXIST);
            if (validatedBody.brandId) {
                var brandRes = await findBrand({ _id: validatedBody.brandId, brandApproval: "APPROVED" });
                if (!brandRes) throw apiError.notFound(responseMessage.DATA_NOT_FOUND_APPROVAL_PENDING);
                var brandIds = brandRes._id
            }
            if (req.files) {
                collectionImage = await commonFunction.getImageUrl(req.files);
            }

            if (req.files) {
                bannerImage = await commonFunction.getImageUrl(req.files);
            }
            let obj = {
                contractAddress: contractAddress,
                displayName: displayName,
                symbol: symbol,
                bannerImage: bannerImage,
                network: network,
                description: description,
                shortURL: shortURL,
                network: network,
                collectionImage: collectionImage,
                bannerImage: bannerImage,
                categoryType: categoryType,
                userId: userResult._id,
                isLazyMinting: isLazyMinting,
                collectionType: "REGULAR",
                brandId: brandIds,
                brandCollectionType:brandCollectionType
            };
            if (isPromoted === true) {
                obj["isPromoted"] = isPromoted;
                obj["tillDate"] = new Date(new Date().setDate(new Date().getDate() + 30)).toISOString();;
            }
            let collectionResult = await createCollection(obj);
            await createActivity({
                userId: userResult._id,
                collectionId: collectionResult._id,
                title: "NEW COLLECTION",
                desctiption: "A new collection has been created successfully.",
                type: "CREATE_COLLECTION"
            });
            return res.json(new response(collectionResult, responseMessage.COLLECTION_ADDED));
        }
        catch (error) {
            console.log("error", error)
            return next(error);
        }
    }

    /**
     * @swagger
     * /collection/viewCollection/{_id}:
     *   get:
     *     tags:
     *       - COLLECTION
     *     description: viewCollection
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: _id
     *         description: _id
     *         in: path
     *         required: true
     *     responses:
     *       200:
     *         description: Details has been fetched successfully..
     *       501:
     *         description: Something went wrong.
     *       404:
     *         description: User not found.
     *       409:
     *         description: Collection not found.
     */

    async viewCollection(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required()
        }
        try {
            const { _id } = await Joi.validate(req.params, validationSchema);
            var bundleResult = await findCollection({ _id: _id, status: { $ne: status.DELETE } });
            if (!bundleResult) {
                throw apiError.conflict(responseMessage.COLLECTION_NOT_FOUND);
            }
            return res.json(new response(bundleResult, responseMessage.DETAILS_FETCHED));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /collection/editCollection:
     *   put:
     *     tags:
     *       - COLLECTION
     *     description: editCollection
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: editCollection
     *         description: editCollection
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/editCollection'
     *     responses:
     *       200:
     *         description: Collection Update successfully.
     *       501:
     *         description: Something went wrong.
     *       404:
     *         description: User not found.
     *       409:
     *         description: Collection not found.
     */

    async editCollection(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
            displayName: Joi.string().allow("").optional(),
            contractAddress: Joi.string().optional(),
            symbol: Joi.string().optional(),
            description: Joi.string().optional(),
            shortURL: Joi.string().optional(),
            collectionImage: Joi.string().optional(),
            categoryType: Joi.string().optional(),
            isLazyMinting: Joi.boolean().optional(),
            isPromoted: Joi.boolean().optional()

        }
        try {
            var validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            if (validatedBody.collectionImage) {
                validatedBody.collectionImage = await commonFunction.getSecureUrl(validatedBody.collectionImage);
            }
            var bundleResult = await findCollection({ _id: validatedBody._id, status: { $ne: status.DELETE } });
            if (!bundleResult) {
                throw apiError.conflict(responseMessage.COLLECTION_NOT_FOUND);
            }
            if (validatedBody.isPromoted === true) {
                validatedBody["isPromoted"] = validatedBody.isPromoted;
                validatedBody["tillDate"] = new Date(new Date().setDate(new Date().getDate() + 30)).toISOString();;
            }
            var result = await updateCollection({ _id: bundleResult._id }, validatedBody);

            return res.json(new response(result, responseMessage.COLLECTION_UPDATE));
        }
        catch (error) {
            console.log("=====>>>", error)
            return next(error);
        }
    }

    /**
       * @swagger
       * /collection/deleteCollection:
       *   delete:
       *     tags:
       *       - COLLECTION
       *     description: deleteCollection
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
       *         description: Collection delete successfully.
       *       501:
       *         description: Something went wrong.
       *       404:
       *         description: User not found.
       *       409:
       *         description: Collection not found.
       */

    async deleteCollection(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
        }
        try {
            const { _id } = await Joi.validate(req.query, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var bundleResult = await findCollection({ _id: _id, collectionType: { $ne: "DEFAULT" }, status: { $ne: status.DELETE } });
            if (!bundleResult) {
                throw apiError.conflict(responseMessage.DATA_NOT_FOUND);
            }
            var result = await updateCollection({ _id: bundleResult._id }, { status: status.DELETE });
            return res.json(new response(result, responseMessage.COLLECTION_DELETE));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
         * @swagger
         * /collection/myCollectionList:
         *   get:
         *     tags:
         *       - COLLECTION
         *     description: myCollectionList
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
         *         description: Data found successfully.
         *       501:
         *         description: Something went wrong.
         *       404:
         *         description: User not found.
         *       409:
         *         description: Collection not found.
         */

    async myCollectionList(req, res, next) {
        const validationSchema = {
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
            let dataResults = await myCollectionPaginateSearch(validatedBody, userResult._id);
            return res.json(new response(dataResults, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
        * @swagger
        * /collection/collectionList:
        *   get:
        *     tags:
        *       - COLLECTION
        *     description: collectionList
        *     produces:
        *       - application/json
        *     parameters:
        *       - name: search
        *         description: search
        *         in: query
        *         required: false
        *       - name: isPromoted
        *         description: isPromoted
        *         in: query
        *         type: boolean
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
        *         description: Data found successfully.
        *       501:
        *         description: Something went wrong.
        *       404:
        *         description: User not found.
        */

    async collectionList(req, res, next) {
        const validationSchema = {
            search: Joi.string().optional(),
            isPromoted: Joi.boolean().optional(),
            fromDate: Joi.string().optional(),
            toDate: Joi.string().optional(),
            page: Joi.number().optional(),
            limit: Joi.number().optional(),
        };
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            let dataResults = await collectionPaginateSearch(validatedBody);
            return res.json(new response(dataResults, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
        * @swagger
        * /collection/recentCollectionList:
        *   get:
        *     tags:
        *       - COLLECTION
        *     description: recentCollectionList
        *     produces:
        *       - application/json
        *     parameters:
        *       - name: search
        *         description: search
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
        *         description: Data found successfully.
        *       501:
        *         description: Something went wrong.
        *       404:
        *         description: User not found.
        */

    async recentCollectionList(req, res, next) {
        const validationSchema = {
            search: Joi.string().optional(),
            fromDate: Joi.string().optional(),
            toDate: Joi.string().optional(),
            page: Joi.number().optional(),
            limit: Joi.number().optional(),
        };
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            let dataResults = await collectionPaginateSearch(validatedBody);
            return res.json(new response(dataResults, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error);
        }
    }
}

export default new collectionController()