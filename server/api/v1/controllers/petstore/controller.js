import Joi from "joi";
import _ from "lodash";
import config from "config";
import apiError from '../../../../helper/apiError';
import response from '../../../../../assets/response';
import bcrypt from 'bcryptjs';

import responseMessage from '../../../../../assets/responseMessage';
import { userServices } from '../../services/user';
import { petstoreServices } from '../../services/petstore';
import categoryModel from '../../../../models/category'
const { findUser, updateUser, userList } = userServices;
const { createPetstore, findPetstore, updatePetstore, petstoreList, dropPetstoreData } = petstoreServices;

import commonFunction from '../../../../helper/util';
import jwt from 'jsonwebtoken';
import status from '../../../../enums/status';
import userType from "../../../../enums/userType";

import petStoreModel from '../../../../models/petstore'
import orderModel from '../../../../models/order'
import myPowerUpsModel from '../../../../models/myPurchasedItems'
import { nftServices } from '../../services/nft'
const { createNft, findNft, updateNft, findAllNft } = nftServices;
import nftModel from '../../../../models/nft'
export class petstoreController {

    /**
     * @swagger
     * /petstore/petstore:
     *   post:
     *     tags:
     *       - PETSTORE MANAGEMENT
     *     summary: Add pet items for pet store(deprecated).
     *     description: addPetstore ?? It is used to add petstore data.
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: name
     *         description: name
     *         in: formData
     *         required: true
     *       - name: description
     *         description: description
     *         in: formData
     *         required: true
     *       - name: price
     *         description: price
     *         in: formData
     *         required: true
     *       - name: image
     *         description: image
     *         in: formData
     *         type: file
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async addPetstore(req, res, next) {
        const validationSchema = {
            name: Joi.string().required(),
            description: Joi.string().required(),
            price: Joi.number().required(),
            image: Joi.string().optional()
        }
        try {
            const validatedBody = await Joi.validate(req.body);
            var adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            let petstoreResult = await findPetstore({ name: validatedBody.name, status: { $ne: status.DELETE } });
            if (petstoreResult) {
                throw apiError.conflict(responseMessage.DATA_EXIST);
            }
            if (req.files) {
                validatedBody.image = await commonFunction.getImageUrl(req.files);
            }

            let result = await createPetstore(validatedBody);
            return res.json(new response(result, responseMessage.PETSTORE_ADDED));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /petstore/viewPetItem/{_id}:
     *   get:
     *     tags:
     *       - PETSTORE MANAGEMENT
     *     summary: View pet items for pet store.
     *     description: viewPetItem ?? To get perticular petstore details.
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
    async viewPetstore(req, res, next) {
        try {
            const { _id } = await Joi.validate(req.params);
            var adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            let result = await findPetstore({ _id: _id, status: { $ne: status.DELETE } });
            if (!result) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            return res.json(new response(result, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /petstore/petstore:
     *   put:
     *     tags:
     *       - PETSTORE MANAGEMENT
     *     summary: Edit pet items for pet store(deprecated).
     *     description: editPetstore ?? To edit petstore details(deprecated).
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: _id
     *         description: _id
     *         in: formData
     *         required: true
     *       - name: name
     *         description: name
     *         in: formData
     *         required: false
     *       - name: description
     *         description: description
     *         in: formData
     *         required: false
     *       - name: price
     *         description: price
     *         in: formData
     *         required: false
     *       - name: image
     *         description: image
     *         in: formData
     *         type: file
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async editPetstore(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
            name: Joi.string().optional(),
            description: Joi.string().optional(),
            price: Joi.number().optional(),
            image: Joi.string().optional()
        }
        try {
            const validatedBody = await Joi.validate(req.body);
            var adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            let petstoreResult = await findPetstore({ _id: validatedBody._id, status: { $ne: status.DELETE } });
            if (!petstoreResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            // if (req.files && req.files.length != 0) {
            //     validatedBody.image = await commonFunction.getImageUrl(req.files);
            // }
            let result = await updatePetstore({ _id: petstoreResult._id }, { $set: validatedBody });
            return res.json(new response(result, responseMessage.UPDATE_SUCCESS));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /petstore/deletePetItems:
     *   delete:
     *     tags:
     *       - PETSTORE MANAGEMENT
     *     summary: delete pet items for pet store.
     *     description: deletePetItems ?? To delete pet items details.
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

    async deletePetItems(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
        }
        try {
            const { _id } = await Joi.validate(req.query, validationSchema);
            var adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            let petstoreResult = await findPetstore({ _id: _id, status: { $ne: status.DELETE } });
            if (!petstoreResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            let result = await updatePetstore({ _id: petstoreResult._id }, { $set: { status: status.DELETE } });
            return res.json(new response(result, responseMessage.DELETE_SUCCESS));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /petstore/listPetItems:
     *   get:
     *     tags:
     *       - PETSTORE MANAGEMENT
     *     summary: To fetch all petstore list.
     *     description: listPetItems ?? To fetch all petstore list.
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
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
     *         required: true
     *       - name: limit
     *         description: limit
     *         in: query
     *         required: true
     *       - name: search
     *         description: search
     *         in: query
     *         required: false
     *       - name: categoryId
     *         description: categoryId from categoryList api
     *         in: query
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async listPetstore(req, res, next) {
        // const validationSchema = {
        //     search: Joi.string().optional(),
        //     fromDate: Joi.string().optional(),
        //     toDate: Joi.string().optional(),
        //     page: Joi.number().optional(),
        //     limit: Joi.number().optional(),
        // }
        try {
            const validatedBody = await Joi.validate(req.query);
            var adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            let result = await petstoreList(validatedBody);
            return res.json(new response(result, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error);
        }
    }
    /**
     * @swagger
     * /petstore/createPetItems:
     *   post:
     *     tags:
     *       - PETSTORE MANAGEMENT
     *     summary: Add pet items for pet store.
     *     description: createPetItems ?? It is used to add pet items for pet store.
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: createPetItems
     *         description: createPetItems
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/createPetItems'
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async createPetItems(req, res, next) {
        try {
            console.log("=======createPetItems========>", req.body)
            var adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            let petstoreResult = await findPetstore({ name: req.body.name, status: { $ne: status.DELETE } });
            if (petstoreResult) {
                throw apiError.conflict(responseMessage.DATA_EXIST);
            }
            let saveData = await petStoreModel(req.body).save()
            return res.json(new response(saveData, responseMessage.PETSTORE_ADDED));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /petstore/editPetItems:
     *   put:
     *     tags:
     *       - PETSTORE MANAGEMENT
     *     summary: Edit pet items for pet store.
     *     description: editPetItems ?? To edit pet item details.
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
     *       - name: editPetItems
     *         description: editPetItems
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/editPetItems'
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async editPetItems(req, res, next) {
        try {
            var adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            let petstoreResult = await findPetstore({ _id: req.query._id, status: { $ne: status.DELETE } });
            if (!petstoreResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            let petstoreResultCheck = await findPetstore({ _id: { $ne: petstoreResult._id }, name: req.body.name, status: { $ne: status.DELETE } });
            if (petstoreResultCheck) {
                throw apiError.conflict(responseMessage.DATA_EXIST);
            }
            let result = await updatePetstore({ _id: petstoreResult._id }, { $set: req.body });
            return res.json(new response(result, responseMessage.UPDATE_SUCCESS));
        }
        catch (error) {
            return next(error);
        }
    }
    /**
     * @swagger
     * /petstore/listPetStoreApi:
     *   post:
     *     tags:
     *       - PETSTORE MANAGEMENT
     *     summary: To fetch all petstore list for user panel.
     *     description: listPetItems ?? To fetch all petstore list.
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
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
     *         required: false
     *       - name: limit
     *         description: limit
     *         in: formData
     *         required: false
     *       - name: search
     *         description: search
     *         in: formData
     *         required: false
     *       - name: categoryId
     *         description: categoryId from categoryList api
     *         in: formData
     *         required: false
     *       - name: categoryName
     *         description: categoryName 
     *         in: formData
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async listPetStoreApi(req, res, next) {
        try {
            let query = {
                status: status.ACTIVE
            }
            if (req.body.fromDate && !req.body.toDate) {
                query.createdAt = { $gte: req.body.fromDate };
            }
            if (!req.body.fromDate && req.body.toDate) {
                query.createdAt = { $lte: req.body.toDate };
            }
            if (req.body.fromDate && req.body.toDate) {
                query.$and = [
                    { createdAt: { $gte: req.body.fromDate } },
                    { createdAt: { $lte: req.body.toDate } },
                ]
            }
            if (req.body.categoryId) {
                query.categoryId = req.body.categoryId;
            }
            if (req.body.search) {
                query.$or = [
                    { name: { $regex: req.body.search, $options: 'i' } },
                    { description: { $regex: req.body.search, $options: 'i' } }
                ]
            }
            let petItemData = await petStoreModel.find(query).populate([{ path: 'categoryId' }])
            console.log("======================>", String(petItemData))
            if (req.body.categoryName) {
                petItemData = petItemData.filter(o => o.categoryId != undefined && o.categoryId.name === req.body.categoryName)
            }
            if (req.body.page && req.body.limit) {
                let page = Number(req.body.page) || 1
                let limit = Number(req.body.limit) || 10
                let pageLimit = await commonFunction.paginationFunction(petItemData, page, limit)
                if (pageLimit.docs.length == 0) {
                    throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
                }
                return res.json(new response(pageLimit, responseMessage.DATA_FOUND));
            }
            return res.json(new response({ docs: petItemData }, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }
    /**
     * @swagger
     * /petstore/buyPetItem:
     *   post:
     *     tags:
     *       - PETSTORE MANAGEMENT
     *     summary: To purchase pet power items for user panel.
     *     description: buyPetItem ?? To purchase pet power items for user panel.
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token of user
     *         in: header
     *         required: true
     *       - name: productId
     *         description: productId _id from listPetStoreApi api.
     *         in: formData
     *         required: true
     *       - name: quantity
     *         description: quantity wants to purchase
     *         in: formData
     *         required: true
     *       - name: price
     *         description: price from listPetStoreApi api.
     *         in: formData
     *         required: true
     *       - name: nftId
     *         description: nftId
     *         in: formData
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async buyPetItem(req, res, next) {
        try {
            var adminResult = await findUser({ _id: req.userId });
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            let orderObj = {
                userId: adminResult._id,
                productId: req.body.productId,
                quantity: req.body.quantity,
                price: req.body.price,
                nftId: req.body.nftId
            }
            let orderSave = await new orderModel(orderObj).save()
            let mypowers = await myPowerUpsModel.findOne({ userId: adminResult._id, productId: req.body.productId, nftId: req.body.nftId, status: status.ACTIVE })
            if (!mypowers) {
                let purchased = {
                    userId: adminResult._id,
                    productId: req.body.productId,
                    quantity: req.body.quantity,
                    used: false,
                    usedQuantity: 0,
                    availableQuantity: req.body.quantity,
                    nftId: req.body.nftId
                }
                let saved = await new myPowerUpsModel(purchased).save()
                return res.json(new response(saved, "Order saved successfully."));
            }
            let update = await myPowerUpsModel.findOneAndUpdate({ _id: mypowers._id }, { $inc: { quantity: req.body.quantity, availableQuantity: req.body.quantity }, $set: { used: false } }, { new: true })
            return res.json(new response(update, "Order saved successfully."));
        } catch (error) {
            return next(error);
        }
    }
    /**
     * @swagger
     * /petstore/powerUps:
     *   post:
     *     tags:
     *       - PETSTORE MANAGEMENT
     *     summary: To power up the dog(nft) for user panel.
     *     description: powerUps ?? To power up the dog(nft) for user panel.
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token of user
     *         in: header
     *         required: true
     *       - name: productId
     *         description: productId _id from myPurchaseList api.
     *         in: query
     *         required: true
     *       - name: nftId
     *         description: nftId wants to upgarde
     *         in: query
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async powerUps(req, res, next) {
        try {
            var adminResult = await findUser({ _id: req.userId });
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            let findDog = await findNft({ _id: req.query.nftId })
            if (!findDog) {
                throw apiError.notFound("Nft not found.");
            }
            let mypowers = await myPowerUpsModel.findOne({ userId: adminResult._id, _id: req.query.productId, status: status.ACTIVE }).populate([{ path: 'productId', populate: 'categoryId' }])
            if (!mypowers) {
                throw apiError.notFound("This power up is not in your list.");
            }
            if (mypowers.availableQuantity < 1) {
                throw apiError.notFound("This power up is finished.");
            }
            if (mypowers.used == true) {
                throw apiError.notFound("This power up is all used.");
            }
            let availableQuantity = mypowers.availableQuantity - 1
            let used = false
            if (availableQuantity == 0) {
                used = true
            }
            let update = await myPowerUpsModel.findOneAndUpdate({ _id: mypowers._id }, { $inc: { availableQuantity: -1, usedQuantity: 1 }, $set: { used: used } }, { new: true })
            // Aerodynamics: { type: Number },
            // weight: { type: String },
            // BMI: { type: String},
            // Age: { type: Date},
            // ShoeType: {type: String },
            // Coat: {type: String},
            // Tail: { type: String},
            // Nurturing: {type: Number }
            let updateNft1
            console.log("======mypowers.productId.attributes===========>", Object.assign({}, mypowers.productId.attributes))
            let obj = findDog.attributes
            Object.keys(mypowers.productId.attributes).map(o => {
                console.log("=========o=======>", o)
                if (mypowers.productId.attributes[o] != undefined) {
                    if (o == 'Aerodynamics' || o == 'weight' || o == 'Nurturing') {
                        obj[o] = Number(obj[o]) + Number(mypowers.productId.attributes[o])
                        obj.BMI = obj.weight === 30 ? "Thin" : obj.weight === 40 ? "Ideal" : obj.weight === 50 ? "Overweight" : "Obese";
                    } else {
                        obj[o] = mypowers.productId.attributes[o]
                        obj.BMI = obj.weight === 30 ? "Thin" : obj.weight === 40 ? "Ideal" : obj.weight === 50 ? "Overweight" : "Obese";
                    }
                }
            })
            let speed = await commonFunction.speedup(obj)
            console.log("==============>",speed)
            let properties=JSON.parse(findDog.properties)
            properties.dogSpeed=speed
            let jsonConvert=JSON.stringify(properties)
            updateNft1 = await updateNft({ _id: findDog._id }, { $set: { attributes: obj, "properties": jsonConvert }, $push: { usedPowerUps: mypowers.productId._id } })
            console.log("====updateNft1========>", updateNft1, obj)
            return res.json(new response(update, "Power up used successfully."));
        } catch (error) {
            return next(error);
        }
    }
    /**
 * @swagger
 * /petstore/myPurchaseList:
 *   post:
 *     tags:
 *       - PETSTORE MANAGEMENT
 *     summary: To get all the powers in mypurchase list for user panel.
 *     description: myPurchaseList ?? To get all the powers in mypurchase list for user panel.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: token of user
 *         in: header
 *         required: true
 *       - name: used
 *         description: used value will be 0 or 1. 0 denotes all used power up 1 denotes remaining powers it is optional so if you dont give the key it will show all power ups.
 *         in: query
 *         required: false
 *       - name: nftId
 *         description: nftId 
 *         in: formData
 *         required: false
 *       - name: categoryName
 *         description: categoryName 
 *         in: formData
 *         required: false
 *       - name: page
 *         description: page 
 *         in: formData
 *         required: false
 *       - name: limit
 *         description: limit
 *         in: formData
 *         required: false
 *     responses:
 *       200:
 *         description: Returns success message
 */
    async myPurchaseList(req, res, next) {
        try {
            var adminResult = await findUser({ _id: req.userId });
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            let query = { userId: adminResult._id, status: status.ACTIVE }
            if (req.query.used) {
                if (req.query.used == 1) {
                    query.used = true
                }
                if (req.query.used == 0) {
                    query.used = false
                }
            }
            if (req.body.nftId) {
                query.nftId = req.body.nftId
            }
            let mypowers = await myPowerUpsModel.find(query).populate([{ path: 'productId', populate: 'categoryId' }])
            if (req.body.categoryName) {
                mypowers = mypowers.filter(o => o.productId.categoryId.name === req.body.categoryName)
            }
            if (mypowers.length == 0) {
                return res.json(new response({ docs: [] }, "There is no power up in the purchase list."));
            }

            if (req.body.page && req.body.limit) {
                let page = Number(req.body.page) || 1
                let limit = Number(req.body.limit) || 10
                let pageLimit = await commonFunction.paginationFunction(mypowers, page, limit)
                if (pageLimit.docs.length == 0) {
                    return res.json(new response({ docs: [] }, "There is no power up in the purchase list."));
                }
                return res.json(new response(pageLimit, "My purchase list found successfully."));
            }
            return res.json(new response({ docs: mypowers }, "My purchase list found successfully."));
        } catch (error) {
            return next(error);
        }
    }
    /**
     * @swagger
     * /petstore/powerDown:
     *   post:
     *     tags:
     *       - PETSTORE MANAGEMENT
     *     summary: To power down the dog(nft) for user panel.
     *     description: powerDown ?? To power down the dog(nft) for user panel.
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token of user
     *         in: header
     *         required: true
     *       - name: nftId
     *         description: nftId wants to upgarde
     *         in: query
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async powerDown(req, res, next) {
        try {
            var adminResult = await findUser({ _id: req.userId });
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            let findDog = await nftModel.findOne({ _id: req.query.nftId }).populate([{ path: 'usedPowerUps', populate: 'categoryId' }])
            if (!findDog) {
                throw apiError.notFound("Nft not found.");
            }
            let updateNft1 = []
            let speed=0
            if (findDog.usedPowerUps && findDog.usedPowerUps.length > 0) {
                for (let i = 0; i < findDog.usedPowerUps.length; i++) {

                    if (findDog.usedPowerUps[i].categoryId.name == 'Aerodynamics' || findDog.usedPowerUps[i].categoryId.name == 'weight' || findDog.usedPowerUps[i].categoryId.name == 'Nurturing') {

                        findDog.attributes[findDog.usedPowerUps[i].categoryId.name] = findDog.attributes[findDog.usedPowerUps[i].categoryId.name] - findDog.usedPowerUps[i].attributes[findDog.usedPowerUps[i].categoryId.name]

                        findDog.attributes.BMI = findDog.attributes.weight === 30 ? "Thin" : findDog.attributes.weight === 40 ? "Ideal" : findDog.attributes.weight === 50 ? "Overweight" : "Obese";

                        updateNft1.push(updateNft({ _id: findDog._id }, { $set: { attributes: findDog.attributes }, $pull: { usedPowerUps: findDog.usedPowerUps[i]._id } }))
                    }
                    else {
                        findDog.attributes[findDog.usedPowerUps[i].categoryId.name] = ""
                        updateNft1.push(updateNft({ _id: findDog._id }, { $set: { attributes: findDog.attributes }, $pull: { usedPowerUps: findDog.usedPowerUps[i]._id } }))
                    }
                }
                let findDog1 = await nftModel.findOne({ _id: req.query.nftId }).populate([{ path: 'usedPowerUps', populate: 'categoryId' }])
                speed=await commonFunction.speeddownNumber(findDog1.attributes)
                let speed1=0
                speed1=await commonFunction.speeddownAlpha(findDog.usedPowerUps)
                let properties=JSON.parse(findDog.properties)
                properties.dogSpeed=Number(properties.dogSpeed)-Number(speed1+speed)
                if (properties.dogSpeed<15) {
                    properties.dogSpeed=15
                }
             
                let findDogUpdate = await nftModel.findOneAndUpdate({ _id: req.query.nftId },{$set:{"properties":JSON.stringify(properties)}},{new:true})
               
                console.log("==========findDogUpdate============>",findDogUpdate)
    
            }
            let update = await Promise.all(updateNft1)
            return res.json(new response(update, "Power down successfully."));
        } catch (error) {
            return next(error);
        }
    }
}

export default new petstoreController()

