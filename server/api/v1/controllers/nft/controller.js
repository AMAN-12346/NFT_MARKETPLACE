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
import { userModel } from '../../../../models/user';
const { createMetadata, findMetadata } = metadataServices;

const { userCheck, findUser, findUserData, createUser, updateUser, updateUserById, userSubscriberList } = userServices;
const { createCollection, findCollection, updateCollection, collectionList, collectionPaginateSearch, myCollectionPaginateSearch } = collectionServices;
const { createNft, findNft, updateNft, nftList, nftPaginateSearch, myNftPaginateSearch, nftListWithAggregate, listAllNft, nftListWithSearch, multiUpdate, nftListWithAggregatePipeline, findNftWithPopulateDetails } = nftServices;
const { createNotification, findNotification, updateNotification, multiUpdateNotification, notificationList, notificationListWithSort } = notificationServices;
const { createTransaction, findTransaction, updateTransaction, transactionList } = transactionServices;
const { createActivity, findActivity, updateActivity, paginateUserOwendActivity, paginateActivity, activityList } = activityServices;
const { createHistory, findHistory, updateHistory, historyList, paginateShowNftHistory, paginateUserOwendHistory, paginateHistory } = historyServices;

import { imageServices } from '../../services/image';

const { createImage, findImage } = imageServices;

import commonFunction from '../../../../helper/util';
import status from '../../../../enums/status';
import userType from "../../../../enums/userType";
import fs from 'fs';
import create from 'ipfs-http-client';
import base64ToImage from 'base64-to-image';
import doAsync from 'doasync';
       
let projectId = "2DtOJNEhvQEKm7jiEwfvPlfrpdn"
let projectSecret = '24772f3d7228fe9980666ce5469023be'
const auth =
    'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
const ipfs = create({
    host: 'ipfs.infura.io', port: '5001', protocol: 'https', headers: {
        authorization: auth,
    },
});



export class nftController {

    /**
     * @swagger
     * /nft/ipfsUpload:
     *   post:
     *     tags:
     *       - NFT MANAGEMENT
     *     description: ipfsUpload
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: file
     *         description: file
     *         in: formData
     *         type: file
     *         required: true
     *     responses:
     *       200:
     *         description: Ipfs Upload Successfully
     *       501:
     *         description: Something went wrong.
     *       500:
     *         description: Internal server error.
     */

    async ipfsUpload(req, res, next) {
        try {
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            const fileName = req.files[0].filename;
            const filePath = req.files[0].path;
            const fileHash = await addFile(fileName, filePath);
            await deleteFile(filePath);
            let tokenData = {
                image: "https://ipfs.io/ipfs/" + fileHash //hash
            }
            let ipfsRes = await ipfsUpload(tokenData);
            let result = { ipfsHash: ipfsRes, fileHash: fileHash, type: req.files[0].mimetype, imageUrl: tokenData.image };
            return res.json(new response(result, responseMessage.DETAILS_FETCHED));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /nft/ipfsUploadBase64:
     *   post:
     *     tags:
     *       - NFT MANAGEMENT
     *     description: ipfsUploadBase64
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: image
     *         description: image?? base 64
     *         in: formData
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async ipfsUploadBase64(req, res, next) {
        try {
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            const fileHash = await addBase64File(req.body.image);
            let tokenData = {
                image: "https://ipfs.io/ipfs/" + fileHash // hash
            }
            let ipfsRes = await ipfsUpload(tokenData);
            let result = { ipfsHash: ipfsRes, fileHash: fileHash, imageUrl: tokenData.image };
            return res.json(new response(result, responseMessage.DETAILS_FETCHED));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /nft/uploadImage:
     *   post:
     *     tags:
     *       - USER
     *     description: uploadImage
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
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

    async uploadImage(req, res, next) {
        try { 
            console.log("req.files",req.files);   
            var result = await commonFunction.getImageUrlforPDF_docx(req.files)
            return res.json(new response(result, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /nft/uploadNFT:
     *   post:
     *     tags:
     *       - NFT MANAGEMENT
     *     description: uploadNFT
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: tokenName
     *         description: tokenName
     *         in: formData
     *         required: false
     *       - name: description
     *         description: description
     *         in: formData
     *         required: false
     *       - name: image
     *         description: image
     *         in: formData
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async uploadNFT(req, res, next) {
        const validationSchema = {
            tokenName: Joi.string().optional(),
            description: Joi.string().optional(),
            image: Joi.string().optional(),
        }
        try {
            const { tokenName, description, image } = await Joi.validate(req.body, validationSchema);
            let tokenData = {
                name: tokenName ? tokenName : "Test",
                description: description ? description : "Testing Data",
                image: image // hash
            }
            let ipfsRes = await ipfsUpload(tokenData);
            tokenData.ipfsHash = ipfsRes;
            return res.json(new response(tokenData, responseMessage.DETAILS_FETCHED));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /nft/createNFT:
     *   post:
     *     tags:
     *       - NFT MANAGEMENT
     *     description: createNFT
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: createNFT
     *         description: createNFT Note:- mediaFile & coverImage accepted only base64.
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/createNFT'
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

    async createNFT(req, res, next) {
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
            physicalType: Joi.string().optional(),
            walletAddress: Joi.string().required()
            // physicalNftImage: Joi.array().items(Joi.string()).optional(),

        }
        try {
            let result;
            let validatedBody = await Joi.validate(req.body, validationSchema);
            console.log("==validatedBody", validatedBody)

            let collectionRes = await findCollection({ _id: req.body.collectionId });

            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound([], responseMessage.USER_NOT_FOUND);
            }
            else {
                req.body.userId = userResult._id;

                if (req.body.isGenerativeNft && req.body.isGenerativeNft === true) {
                    // let getImage = await findImage({ number: req.body.isGenerativeNft });
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
  
                // var imageResult = []
                // if (req.body.physicalNftImage.length!= 0) {
                //     for (let i = 0; i < req.body.physicalNftImage.length; i++) {
                //         var imageRes = await commonFunction.getSecureUrl(req.body.physicalNftImage[i])
                //         console.log("imageRes===", imageRes)
                //         imageResult.push(imageRes)
                //     }
                //     req.body.physicalNftImage = imageResult
                // }
                req.body.contractAddress = collectionRes.contractAddress;
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
                let updated = await updateUserById(userResult._id, { $set: {walletAddress: validatedBody.walletAddress } })
                
                let history = await createHistory(historyRes);
                let finalResult = _.omit(JSON.parse(JSON.stringify(result)), req.body.itemCategory == "private documents" ? 'uri' : []);
                return res.json(new response(finalResult, responseMessage.ADD_NFT));
            }
        } catch (error) {
            console.log("===>>error in createNFT==", error)
            return next(error);
        }
    }

    /**
     * @swagger
     * /nft/viewNFT/{_id}:
     *   get:
     *     tags:
     *       - NFT MANAGEMENT
     *     description: viewNFT
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
     *         description: Nft found successfully.
     *       501:
     *         description: Something went wrong.
     *       404:
     *         description: Data not found.
     *       409:
     *         description: Nft data not found.
     */

    async viewNFT(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required()
        }
        try {
            const { _id } = await Joi.validate(req.params, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var nftResult = await findNft({ _id: _id });
            if (!nftResult) {
                throw apiError.notFound(responseMessage.NFT_NOT_FOUND);
            }
            return res.json(new response(nftResult, responseMessage.DETAILS_FETCHED));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /nft/editNFT:
     *   put:
     *     tags:
     *       - NFT MANAGEMENT
     *     description: editNFT
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: editNFT
     *         description: editNFT Note:- mediaFile & coverImage accepted only base64.
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/editNFT'
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

    async editNFT(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
            tokenName: Joi.string().optional(),
            tokenId: Joi.string().optional(),
            mediaFile: Joi.string().optional(),
            coverImage: Joi.string().optional(),
            priceType: Joi.string().optional(),
            price: Joi.string().optional(),
            title: Joi.string().optional(),
            description: Joi.string().optional(),
            royalties: Joi.string().optional(),
            properties: Joi.string().optional(),
            alternativeTextForNFT: Joi.string().optional(),
            uri: Joi.string().optional(),
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
     * /nft/deleteNFT:
     *   delete:
     *     tags:
     *       - NFT MANAGEMENT
     *     description: deleteNFT
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
     *         description: Nft delete successfully.
     *       501:
     *         description: Something went wrong.
     *       404:
     *         description: Data not found.
     *       409:
     *         description: Nft not found.
     */

    async deleteNFT(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
        }
        try {
            const { _id } = await Joi.validate(req.query, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var nftResult = await findNft({ _id: _id, status: { $ne: status.DELETE } });
            if (!nftResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            var result = await updateNft({ _id: nftResult._id }, { status: status.DELETE });
            return res.json(new response(result, responseMessage.NFT_DELETE));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /nft/listNFT:
     *   get:
     *     tags:
     *       - NFT MANAGEMENT
     *     description: listNFT
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: search
     *         description: search ?? tokenId || tokenName 
     *         in: query
     *         required: false
     *     responses:
     *       200:
     *         description: Data found successfully.
     *       404:
     *         description: User not found.
     */

    async listNFT(req, res, next) {
        const validationSchema = {
            search: Joi.string().optional(),
        }
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            validatedBody.userId = userResult._id;
            let dataResults = await nftListWithSearch(validatedBody);
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
     * /nft/listNFTWithPagination:
     *   get:
     *     tags:
     *       - NFT MANAGEMENT
     *     description: listNFTWithPagination
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: search
     *         description: search ?? name ,categoryType,symbol 
     *         in: query
     *         required: false
     *     responses:
     *       200:
     *         description: Data found successfully.
     *       404:
     *         description: User not found.
     */

    async listNFTWithPagination(req, res, next) {
        const validationSchema = {
            search: Joi.string().optional(),
        }
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            validatedBody.userId = userResult._id;
            let listResult = await nftPaginateSearch(validatedBody);
            return res.json(new response(listResult, responseMessage.DATA_FOUND))
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /nft/listAllNft:
     *   get:
     *     tags:
     *       - NFT MANAGEMENT
     *     description: listAllNft
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: search
     *         description: search ?? tokenId || tokenName || bundleTitle || bundleName || contractAddress
     *         in: query
     *         required: false
     *     responses:
     *       200:
     *         description: Data found successfully.
     */

    async listAllNft(req, res, next) {
        const validationSchema = {
            search: Joi.string().optional(),
        }
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            let dataResults = await listAllNft(validatedBody);
            return res.json(new response(dataResults, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
      * @swagger
      * /nft/sendNFT:
      *   post:
      *     tags:
      *       - NFT MANAGEMENT
      *     description: sendNFT
      *     produces:
      *       - application/json
      *     parameters:
      *       - name: token
      *         description: token is required.
      *         in: header
      *         required: true
      *       - in: body
      *         name: sendNFT 
      *         description: sendNFT.
      *         schema:
      *           type: object
      *           required:
      *             - nftId
      *             - receiverAddress
      *           properties:
      *             nftId:
      *               type: string
      *             receiverAddress:
      *               type: string
      *     responses:
      *       200:
      *         description: You have successfully sent a nft.
      *       501:
      *         description: Something went wrong.
      *       404:
      *         description: User not found.
      *       409:
      *         description: Nft not found.
      */

    async sendNFT(req, res, next) {
        let validationSchema = {
            receiverAddress: Joi.string().required(),
            nftId: Joi.string().optional(),
        }
        try {
            let validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound([], responseMessage.USER_NOT_FOUND);
            }
            let receiverRes = await findUser({ _id: validatedBody.receiverAddress, status: { $ne: status.DELETE } })
            if (!receiverRes) {
                throw apiError.notFound([], responseMessage.RECEIVER_NOT_FOUND);
            }
            let nftRes = await findNft({ _id: validatedBody.nftId, status: { $ne: status.DELETE } })
            if (!nftRes) {
                throw apiError.notFound(responseMessage.NFT_NOT_FOUND)
            }
            await updateNft({ _id: nftRes._id }, { sellStatus: "SOLD", receiverId: receiverRes._id });
            let senderNotificationObj = {
                userId: userResult._id,
                receiverId: receiverRes._id,
                nftId: nftRes._id,
                notificationType: "SENT_NFT",
                title: "SEND NFT",
                description: "You have sent successfully a nft to the user."
            }
            let receiverNotificationObj = {
                userId: receiverRes._id,
                senderId: userResult._id,
                nftId: nftRes._id,
                notificationType: "RECEIVED_NFT",
                title: "RECEIVE NFT",
                description: "You have received a new nft."
            }
            let transactionObj = {
                userId: userResult._id,
                receiverId: receiverRes._id,
                nftId: nftRes._id,
                transactionType: "SENT_NFT",
                description: "You have sent successfully a nft to the user."
            }
            let nftObj = {
                collectionId: nftRes.collectionId,
                likesUsers: nftRes.likesUsers,
                mediaFile: nftRes.mediaFile,
                coverImage: nftRes.coverImage,
                priceType: nftRes.priceType,
                price: nftRes.price,
                title: nftRes.title,
                uri: nftRes.uri,
                description: nftRes.description,
                royalties: nftRes.royalties,
                properties: nftRes.properties,
                alternativeTextForNFT: nftRes.alternativeTextForNFT,
                tokenId: nftRes.tokenId,
                tokenName: nftRes.tokenName,
                userId: receiverRes._id
            }
            await createNotification(senderNotificationObj);
            await createNotification(receiverNotificationObj);
            await createTransaction(transactionObj);
            await createActivity({
                nftId: nftRes._id,
                collectionId: nftRes.collectionId,
                userId: userResult.userId,
                receiverId: receiverRes._id,
                title: "Send NFT",
                type: "SEND_NFT",
                description: "You have sent successfully a nft to the user."
            });
            await createHistory({
                userId: userResult._id,
                collectionId: nftRes.collectionId,
                nftId: nftRes._id,
                receiverId: receiverRes._id,
                type: "SEND_NFT",
                title: "Send NFT",
                description: "You have sent successfully a nft to the user."
            });
            nftObj["contractAddress"] = nftRes.contractAddress;

            let assignedRes = await createNft(nftObj);

            let body = {
                name: userResult.firstName,
                nftId: nftRes._id,
                receiverId: receiverRes._id,
                title: "Send NFT"
            }
            await commonFunction.sendMailSendNFt(userResult.email, body);
            if (assignedRes) {
                return res.json(new response(assignedRes, responseMessage.NFT_SENT));
            }

        } catch (error) {
            return next(error);

        }
    }

    /**
     * @swagger
     * /nft/treandingNftList:
     *   get:
     *     tags:
     *       - NFT MANAGEMENT
     *     description: treandingNftList
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: search
     *         description: search ??  name || symbol || categoryType
     *         in: query
     *         required: false
     *     responses:
     *       200:
     *         description: Data found successfully.
     */

    async treandingNftList(req, res, next) {
        const validationSchema = {
            search: Joi.string().optional(),
        }
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            let nftResult = await nftPaginateSearch(validatedBody);
            return res.json(new response(nftResult, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /nft/likeDislikeNft/{nftId}:
     *   get:
     *     tags:
     *       - NFT MANAGEMENT
     *     description: likeDislikeNft
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
     *         description: You have successfully like/dislike a nft.
     *       501:
     *         description: Something went wrong.
     *       404:
     *         description: User not found.
     *       409:
     *         description: Nft not found.
     */

    async likeDislikeNft(req, res, next) {
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
            let nftCheck = await findNft({ _id: nftId, status: { $ne: status.DELETE } });
            if (!nftCheck) {
                throw apiError.conflict(responseMessage.NFT_NOT_FOUND);
            }
            if (nftCheck.likesUsers.includes(userResult._id)) {
                updated = await updateNft({ _id: nftCheck._id }, { $pull: { likesUsers: userResult._id }, $inc: { likesCount: -1 } });
                await updateUser({ _id: userResult._id }, { $pull: { likesNft: nftCheck._id } });
                await createActivity({
                    userId: userResult._id,
                    nftId: nftCheck._id,
                    title: "DISLIKE_NFT",
                    desctiption: "Bad choice, I disliked it.",
                    type: "DISLIKE"
                })
                await createHistory({
                    userId: userResult._id,
                    nftId: nftCheck._id,
                    title: "DISLIKE_NFT",
                    desctiption: "Bad choice, I disliked it.",
                    type: "DISLIKE"
                })
                return res.json(new response(updated, responseMessage.DISLIKES));
            } else {
                await createActivity({
                    userId: userResult._id,
                    nftId: nftCheck._id,
                    title: "LIKE_NFT",
                    desctiption: "Nice choice, I liked it.",
                    type: "LIKE"
                })
                await createHistory({
                    userId: userResult._id,
                    nftId: nftCheck._id,
                    title: "LIKE_NFT",
                    desctiption: "Nice choice, I liked it.",
                    type: "LIKE"
                })
                updated = await updateNft({ _id: nftCheck._id }, { $addToSet: { likesUsers: userResult._id }, $inc: { likesCount: 1 } });
                await updateUser({ _id: userResult._id }, { $addToSet: { likesNft: nftCheck._id } });
                return res.json(new response(updated, responseMessage.LIKES));
            }
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /nft/addLikesArray:
     *   get:
     *     tags:
     *       - NFT MANAGEMENT
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
    * /nft/showActivity:
    *   post:
    *     tags:
    *       - NFT MANAGEMENT
    *     description: showActivity
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: showActivity
    *         description: showActivity
    *         in: body
    *         required: true
    *         schema:
    *           $ref: '#/definitions/showActivity'
    *     responses:
    *       200:
    *         description: Activity details fetch successfully.
    *       501:
    *         description: Something went wrong.
    *       404:
    *         description: User not found.
    *       409:
    *         description: Nft not found.
    */

    async showActivity(req, res, next) {
        const validationSchema = {
            _id: Joi.string().optional(),
            search: Joi.string().optional(),
            type: Joi.array().optional(),
            page: Joi.number().optional(),
            limit: Joi.number().optional()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let activityInfo = await paginateUserOwendActivity(validatedBody)
            if (activityInfo.docs.length == 0) {
                return res.json(new response([], responseMessage.DATA_NOT_FOUND));
            } else {
                return res.json(new response(activityInfo, responseMessage.ACTIVITY_DETAILS));
            }
        } catch (error) {
            return next(error);
        }

    }

    /**
     * @swagger
     * /nft/showNftHistory:
     *   get:
     *     tags:
     *       - USER DASHBOARD
     *     description: onSaleCount
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: _id
     *         description: _id for nftId
     *         in: query
     *         required: false
     *       - name: search
     *         description: search 
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
     *         description: Nft not found.
     */

    async showNftHistory(req, res, next) {
        const validationSchema = {
            _id: Joi.string().optional(),
            search: Joi.string().optional(),
            page: Joi.number().optional(),
            limit: Joi.number().optional(),
        };
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            let activityInfo = await paginateShowNftHistory(validatedBody)
            if (activityInfo.docs.length == 0) {
                return res.json(new response([], responseMessage.DATA_NOT_FOUND));
            } else {
                return res.json(new response(activityInfo, responseMessage.DATA_FOUND));
            }
        } catch (error) {
            return next(error);
        }
    }


    /**
  * @swagger
  * /nft/image/{number}:
  *   get:
  *     tags:
  *       - image
  *     description: image
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: number
  *         description: number 
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
  *         description: Nft not found.
  */

    async image(req, res, next) {
        const validationSchema = {
            number: Joi.string().required(),
        };
        try {
            let imageFind = await findImage({ number: req.params.number })
            if (imageFind) {
                return res.json(new response(imageFind, responseMessage.DATA_FOUND));

            } else {
                return res.json(new response({}, responseMessage.DATA_NOT_FOUND));
            }

        } catch (error) {
            return next(error);
        }
    }

    /**
 * @swagger
 * /nft/saveImage:
 *   get:
 *     tags:
 *       - saveImage
 *     description: saveImage
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Data found successfully.
 *       501:
 *         description: Something went wrong.
 *       404:
 *         description: User not found.
 *       409:
 *         description: Nft not found.
 */

    async saveImage(req, res, next) {
        try {
            for (let i = 1; i < 10001; i++) {
                var imageUrl = require(`../../../../../image/${i + 1}.json`)
                console.log("=====imageUrl===>>>", imageUrl)
                let obj = {
                    number: i,
                    image: imageUrl.image
                }
                await createImage(obj)
            }
            return res.json(new response({}, responseMessage.DATA_FOUND));


        } catch (error) {
            return next(error);
        }
    }
}



export default new nftController()


const ipfsUpload = async (tokenData) => {
    try {
        const { cid } = await ipfs.add({ content: JSON.stringify(tokenData) }, { cidVersion: 0, hashAlg: 'sha2-256' });
        await ipfs.pin.add(cid);
        return cid.toString()
    } catch (error) {
    }
}

const addFile = async (fileName, filePath) => {
    const file = fs.readFileSync(filePath);
    const fileAdded = await ipfs.add({ path: fileName, content: file }, { cidVersion: 0, hashAlg: 'sha2-256' });
    const fileHash = fileAdded.cid.toString();
    await ipfs.pin.add(fileAdded.cid);
    return fileHash;
}

const addBase64File = async (base64) => {
    let fileName = "image";
    var optionalObj = { 'fileName': fileName, 'type': 'png' };
    var imageInfo = base64ToImage(base64, rawImage, optionalObj);
    let filePath = `${rawImage}${fileName}.png`;
    const file = await readData(filePath);
    const fileAdded = await ipfs.add({ path: fileName, content: file }, { cidVersion: 0, hashAlg: 'sha2-256' });
    const fileHash = fileAdded.cid.toString();
    await ipfs.pin.add(fileAdded.cid);
    deleteFile(filePath);
    return fileHash;
}

const readData = async (path) => {
    return new Promise((resolve, reject) => {
        doAsync(fs).readFile(path).then((data) => {
            resolve(data)
        })
    })
}

const deleteFile = async (filePath) => {
    fs.unlink(filePath, (deleteErr) => {
        if (deleteErr) {
            console.log("Error: failed to delete the file", deleteErr);
        }
    })
}

