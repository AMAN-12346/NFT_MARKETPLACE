import Joi from "joi";
import _ from "lodash";
import config from "config";
import apiError from '../../../../helper/apiError';
import response from '../../../../../assets/response';
import responseMessage from '../../../../../assets/responseMessage';

import { userServices } from '../../services/user';
import { activityServices } from '../../services/activity';
import { historyServices } from '../../services/history';
import { brandServices } from '../../services/brand';
import { collectionServices } from '../../services/collection';


const { userCheck, findUser, findUserData, updateUserById } = userServices;
const { createBrand, findBrand, updateBrand, listAllBrandWithPagination, brandList, listBrandWithPagination, allBrandListWithPagination, brandListWithPagination } = brandServices;
const { createCollection, findOneCollection, findCollectionForBrandformultiple, findCollectionForBrand, findCollection, updateCollection, collectionList, collectionPaginateSearch, collectionListWithPopulateService } = collectionServices;

import commonFunction from '../../../../helper/util';
import status from '../../../../enums/status';

import QRCode from 'qrcode';



export class brandController {

    /**
     * @swagger
     * /brand/addBrand:
     *   post:
     *     tags:
     *       - BRAND DASHBOARD
     *     description: addBrand
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: brandName
     *         description: brandName
     *         in: formData
     *         required: true
     *       - name: bio
     *         description: bio
     *         in: formData
     *         required: true
     *       - name: brandLogo
     *         description: brandLogo
     *         in: formData
     *         required: false
     *       - name: coverImage
     *         description: coverImage
     *         in: formData
     *         required: false
     *       - name: codeType
     *         description: codeType i.e ["BARCODE", "QRCODE"]
     *         in: formData
     *         required: false
     *       - name: facebookLink
     *         description: facebookLink
     *         in: formData
     *         required: false
     *       - name: twitterLink
     *         description: twitterLink
     *         in: formData
     *         required: false
     *       - name: instagramLink
     *         description: instagramLink
     *         in: formData
     *         required: false
     *       - name: telegramLink
     *         description: telegramLink
     *         in: formData
     *         required: false
     *       - name: pros
     *         description: pros
     *         in: formData
     *         required: false
     *       - name: cons
     *         description: cons
     *         in: formData
     *         required: false
     *       - name: benefits
     *         description: benefits
     *         in: formData
     *         required: false
     *       - name: storeAddress
     *         description: storeAddress
     *         in: formData
     *         required: false
     *       - name: email
     *         description: email
     *         in: formData
     *         required: false
     *       - name: mobileNumber
     *         description: mobileNumber
     *         in: formData
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async addBrand(req, res, next) {
        try {
            let validatedBody = req.body;
            const userToken = await findUser({ _id: req.userId });
            if (!userToken) throw apiError.notFound(responseMessage.USER_NOT_FOUND);

            // const collectionRes = await findCollection({ displayName: "HovR Hooligans" });
            const checkBrand = await findBrand({ brandName: validatedBody.brandName });
            if (checkBrand) throw apiError.alreadyExist(responseMessage.BRAND_ALREADY_EXIST);
            if (validatedBody.brandLogo) {
                validatedBody.brandLogo = await commonFunction.getSecureUrl(validatedBody.brandLogo);

            } if (validatedBody.coverImage) {
                validatedBody.coverImage = await commonFunction.getSecureUrl(validatedBody.coverImage);
            }

            var barQRcodeLink = await commonFunction.generateQR(validatedBody)
            console.log("barQRcodeLink==", barQRcodeLink);

            validatedBody.userId = userToken._id;
            validatedBody.barQRcodeLink = barQRcodeLink;
            validatedBody.brandApproval = "PENDING";
            // validatedBody.collectionId = collectionRes._id

            let result = await createBrand(validatedBody);
            return res.json(new response(result, responseMessage.BRAND_ADD));
        } catch (error) {
            console.log("error---", error)
            return next(error);
        }
    }

    /**
     * @swagger
     * /brand/viewBrand:
     *   get:
     *     tags:
     *       - BRAND DASHBOARD
     *     description: addBrand
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: _id
     *         description: _id
     *         in: query
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async viewBrand(req, res, next) {
        try {
            let validatedBody = req.query;
            const brandRes = await findBrand({ _id: validatedBody._id });
            if (!brandRes) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            return res.json(new response(brandRes, responseMessage.BRAND_ADD));
        } catch (error) {
            return next(error);
        }
    }

    /**
    * @swagger
    * /brand/listBrandOnCollection:
    *   post:
    *     tags:
    *       - BRAND DASHBOARD
    *     description: listBrandOnCollection
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: collectionId
    *         description: collectionId
    *         in: formData
    *         required: true
    *       - name: search
    *         description: search
    *         in: formData
    *         required: false
    *       - name: fromDate
    *         description: fromDate
    *         in: formData
    *         required: false
    *       - name: toDate
    *         description: toDate
    *         in: formData
    *         required: false
    *       - name: page
    *         description: page
    *         in: formData
    *         type: integer
    *         required: false
    *       - name: limit
    *         description: limit
    *         in: formData
    *         type: integer
    *         required: false
    *     responses:
    *       200:
    *         description: Returns success message
    */

    async listBrandOnCollection(req, res, next) {
        let validationSchema = {
            collectionId: Joi.string().required(),
            search: Joi.string().optional(),
            fromDate: Joi.string().optional(),
            toDate: Joi.string().optional(),
            page: Joi.number().optional(),
            limit: Joi.number().optional(),
        };
        try {
            let validatedBody = await Joi.validate(req.body, validationSchema);

            let collectionRes = await findCollection({ _id: validatedBody.collectionId });
            if (!collectionRes) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);

            validatedBody.collectionId = collectionRes._id;
            const brandRes = await listBrandWithPagination(validatedBody);
            if (brandRes.length == 0) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            return res.json(new response(brandRes, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
    * @swagger
    * /brand/brandListParticular:
    *   post:
    *     tags:
    *       - BRAND DASHBOARD
    *     description: brandListParticular
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
    *       - name: fromDate
    *         description: fromDate
    *         in: formData
    *         required: false
    *       - name: toDate
    *         description: toDate
    *         in: formData
    *         required: false
    *       - name: page
    *         description: page
    *         in: formData
    *         type: integer
    *         required: false
    *       - name: limit
    *         description: limit
    *         in: formData
    *         type: integer
    *         required: false
    *     responses:
    *       200:
    *         description: Returns success message
    */

    async brandListParticular(req, res, next) {
        let validationSchema = {
            search: Joi.string().optional(),
            fromDate: Joi.string().optional(),
            toDate: Joi.string().optional(),
            page: Joi.number().optional(),
            limit: Joi.number().optional(),
        };
        try {
            let validatedBody = await Joi.validate(req.body, validationSchema);

            let userToken = await findUser({ _id: req.userId });
            if (!userToken) throw apiError.notFound(responseMessage.USER_NOT_FOUND);

            // validatedBody.userId = userToken._id;
            const brandRes = await brandListWithPagination(validatedBody, userToken._id);
            if (brandRes.length == 0) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            return res.json(new response(brandRes, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
 * @swagger
 * /brand/myAllBrandList:
 *   post:
 *     tags:
 *       - BRAND DASHBOARD
 *     description: myAllBrandList
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
 *       - name: fromDate
 *         description: fromDate
 *         in: formData
 *         required: false
 *       - name: toDate
 *         description: toDate
 *         in: formData
 *         required: false
 *       - name: page
 *         description: page
 *         in: formData
 *         type: integer
 *         required: false
 *       - name: limit
 *         description: limit
 *         in: formData
 *         type: integer
 *         required: false
 *     responses:
 *       200:
 *         description: Returns success message
 */

    async myAllBrandList(req, res, next) {
        let validationSchema = {
            search: Joi.string().optional(),
            fromDate: Joi.string().optional(),
            toDate: Joi.string().optional(),
            page: Joi.number().optional(),
            limit: Joi.number().optional(),
        };
        try {
            let validatedBody = await Joi.validate(req.body, validationSchema);

            let userToken = await findUser({ _id: req.userId });
            if (!userToken) throw apiError.notFound(responseMessage.USER_NOT_FOUND);

            validatedBody.userId = userToken._id;
            const brandRes = await allBrandListWithPagination(validatedBody);
            if (brandRes.length == 0) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            return res.json(new response(brandRes, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

   /**
    * @swagger
    * /brand/updateBrand:
    *   put:
    *     tags:
    *       - BRAND DASHBOARD
    *     description: updateBrand
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
    *         required: true
    *       - name: brandName
    *         description: brandName
    *         in: formData
    *         required: true
    *       - name: bio
    *         description: bio
    *         in: formData
    *         required: true
    *       - name: brandLogo
    *         description: brandLogo
    *         in: formData
    *         required: false
    *       - name: coverImage
    *         description: coverImage
    *         in: formData
    *         required: false
    *       - name: codeType
    *         description: codeType i.e ["BARCODE", "QRCODE"]
    *         in: formData
    *         required: false
    *       - name: facebookLink
    *         description: facebookLink
    *         in: formData
    *         required: false
    *       - name: twitterLink
    *         description: twitterLink
    *         in: formData
    *         required: false
    *       - name: instagramLink
    *         description: instagramLink
    *         in: formData
    *         required: false
    *       - name: telegramLink
    *         description: telegramLink
    *         in: formData
    *         required: false
    *       - name: pros
    *         description: pros
    *         in: formData
    *         required: false
    *       - name: cons
    *         description: cons
    *         in: formData
    *         required: false
    *       - name: benefits
    *         description: benefits
    *         in: formData
    *         required: false
    *       - name: storeAddress
    *         description: storeAddress
    *         in: formData
    *         required: false
    *       - name: email
    *         description: email
    *         in: formData
    *         required: false
    *       - name: mobileNumber
    *         description: mobileNumber
    *         in: formData
    *         required: false
    *     responses:
    *       200:
    *         description: Returns success message
    */

    async updateBrand(req, res, next) {
        try {
            let validatedBody = req.body;
            const userToken = await findUser({ _id: req.userId });
            if (!userToken) throw apiError(responseMessage.USER_NOT_FOUND);

            let brandRes = await findBrand({ _id: validatedBody.brandId });
            if (!brandRes) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);

            if (validatedBody.brandLogo) {
                validatedBody.brandLogo = await commonFunction.getSecureUrl(validatedBody.brandLogo);

            } if (validatedBody.coverImage) {
                validatedBody.coverImage = await commonFunction.getSecureUrl(validatedBody.coverImage);
            }
            let result = await updateBrand({ _id: brandRes._id }, validatedBody);
            return res.json(new response(result, responseMessage.BRAND_UPDATE));
        } catch (error) {
            console.log("error---", error)
            return next(error);
        }
    }


    /**
     * @swagger
     * /brand/getCollectionOnBrand:
     *   get:
     *     tags:
     *       - BRAND DASHBOARD
     *     description: getCollectionOnBrand
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: brandId
     *         description: brandId
     *         in: query
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async getCollectionOnBrand(req, res, next) {
        let validationSchema = {
            brandId: Joi.string().optional()
        };
        try {
            let validatedBody = await Joi.validate(req.query, validationSchema);

            let userToken = await findUser({ _id: req.userId });
            if (!userToken) throw apiError.notFound(responseMessage.USER_NOT_FOUND);

            const collectionDetails = await findCollectionForBrand(validatedBody.brandId);
            if (collectionDetails.length == 0) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);

            return res.json(new response(collectionDetails, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
    * @swagger
    * /brand/getCollectionOnBrandMultiple:
    *   get:
    *     tags:
    *       - BRAND DASHBOARD
    *     description: getCollectionOnBrandMultiple
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: token
    *         description: token
    *         in: header
    *         required: true
    *       - name: brandId
    *         description: brandId
    *         in: query
    *         required: false
    *     responses:
    *       200:
    *         description: Returns success message
    */

    async getCollectionOnBrandMultiple(req, res, next) {
        let validationSchema = {
            brandId: Joi.string().optional()
        };
        try {
            let validatedBody = await Joi.validate(req.query, validationSchema);

            let userToken = await findUser({ _id: req.userId });
            if (!userToken) throw apiError.notFound(responseMessage.USER_NOT_FOUND);

            const collectionDetails = await findCollectionForBrandformultiple(validatedBody.brandId);
            if (collectionDetails.length == 0) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);

            return res.json(new response(collectionDetails, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }



    /**
   * @swagger
   * /brand/listAllApproveBrand:
   *   post:
   *     tags:
   *       - BRAND DASHBOARD
   *     description: listAllApproveBrand
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: search
   *         description: search
   *         in: formData
   *         required: false
   *       - name: fromDate
   *         description: fromDate
   *         in: formData
   *         required: false
   *       - name: toDate
   *         description: toDate
   *         in: formData
   *         required: false
   *       - name: page
   *         description: page
   *         in: formData
   *         type: integer
   *         required: false
   *       - name: limit
   *         description: limit
   *         in: formData
   *         type: integer
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */

    async listAllApproveBrand(req, res, next) {
        let validationSchema = {
            search: Joi.string().optional(),
            fromDate: Joi.string().optional(),
            toDate: Joi.string().optional(),
            page: Joi.number().optional(),
            limit: Joi.number().optional(),
        };
        try {
            let validatedBody = await Joi.validate(req.body, validationSchema);

            const brandRes = await listAllBrandWithPagination(validatedBody);
            if (brandRes.length == 0) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            return res.json(new response(brandRes, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }



    /**
   * @swagger
   * /brand/brandCollectionList:
   *   post:
   *     tags:
   *       - BRAND DASHBOARD
   *     description: brandCollectionList
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: search
   *         description: search
   *         in: formData
   *         required: false
   *       - name: brandId
   *         description: brandId
   *         in: formData
   *         required: false
   *       - name: fromDate
   *         description: fromDate
   *         in: formData
   *         required: false
   *       - name: toDate
   *         description: toDate
   *         in: formData
   *         required: false
   *       - name: page
   *         description: page
   *         in: formData
   *         type: integer
   *         required: false
   *       - name: limit
   *         description: limit
   *         in: formData
   *         type: integer
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */

    async brandCollectionList(req, res, next) {
        let validationSchema = {
            brandId: Joi.string().optional(),
            search: Joi.string().optional(),
            fromDate: Joi.string().optional(),
            toDate: Joi.string().optional(),
            page: Joi.number().optional(),
            limit: Joi.number().optional(),
        };
        try {
            let validatedBody = await Joi.validate(req.body, validationSchema);
            const brandRes = await collectionListWithPopulateService(validatedBody);
            if (brandRes.length == 0) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            return res.json(new response(brandRes, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }



}
export default new brandController()
