import Joi from "joi";
import _ from "lodash";
import config from "config";
import apiError from '../../../../helper/apiError';
import response from '../../../../../assets/response';
import bcrypt from 'bcryptjs';
import responseMessage from '../../../../../assets/responseMessage';
import { userServices } from '../../services/user';
import { collectionServices } from '../../services/collection';
import { nftServices } from '../../services/nft';
import { reportServices } from '../../services/report';
import { activityServices } from '../../services/activity';
import { orderServices } from '../../services/order';

import { historyServices } from '../../services/history';
import { userSubscribeService } from '../../services/userSubscribeModel';
import lazyMintingService from '../../services/blockchain';
import { walletServices } from '../../services/wallet';
import { dashboardServices } from '../../services/dashboard';

import { contactUsServices } from '../../services/contactUs';
const { createContactUs } = contactUsServices;

import kycApprove from '../../../../enums/kyc';
import kycModel from '../../../../models/kyc'
import { kycServices } from '../../services/kyc';
import userModel from '../../../../models/user'

const { createKYC, findKYC, updateKYC, KYCList } = kycServices
const { createActivity, findActivity, updateActivity, paginateUserOwendActivity, activityList } = activityServices;
const { userCheck, userCount, checkUserExists, emailMobileExist, createUser, findUser, findfollowers, findfollowing, userDetailsWithNft, updateUser, updateUserById, paginateSearch, userAllDetails, topSaler, topBuyer, findAdminUser } = userServices;
const { paginateUserOnSaleOrder, findOrder, paginateUserOwendOrder, userBuyList, userBuyAndCreatedList, paginateSoldOrder, findOrderLike, findOrders1, findOrderFavourate, listOrder, paginateUserOrder, orderList, findOrders } = orderServices;
const { createCollection, checkCollectionExists, findCollection, myCollectionPaginateSearch, hotCollectionPaginateSearch, updateCollectionById, paginateCollection, paginateList, findCollectionForNft } = collectionServices
const { createreport, findReport, checkReport, paginateSearchReport } = reportServices;
const { createSubscribe, findSubscribe, emailExist, updateSubscribe, subscriberList } = userSubscribeService;
const { createNft, nftCheck, findNft, findNftLike, updateNft, paginateNft, findAllNft, updateNftById } = nftServices;
const { createHistory, findHistory, updateHistory, historyList, paginateShowNftHistory, paginateUserOwendHistory, paginateHistory } = historyServices;
const { createWallet, findWallet, updateWallet, multiUpdateWallet, listWallet } = walletServices;
const { dashboardList, dashboardCount } = dashboardServices;



import commonFunction from '../../../../helper/util';
import jwt from 'jsonwebtoken';
import status from '../../../../enums/status';


import speakeasy from 'speakeasy';
import { options } from "joi/lib/types/lazy";
import { query } from "express";
import userType from "../../../../enums/userType";
const secret = speakeasy.generateSecret({ length: 10 });

export class userController {



    /**
     * @swagger
     * /user/userWallet:
     *   post:
     *     tags:
     *       - USER
     *     description: userWallet
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: name
     *         description: name
     *         in: form Data
     *         required: false
     *       - name: countryCode
     *         description: countryCode
     *         in: form Data
     *         required: false
     *       - name: mobileNumber
     *         description: mobileNumber
     *         in: form Data
     *         required: false
     *       - name: email
     *         description: email
     *         in: form Data
     *         required: true
     *       - name: walletAddress
     *         description: walletAddress
     *         in: form Data
     *         required: true
     *       - name: profilePic
     *         description: profilePic
     *         in: formData
     *         type: file
     *         required: true
     *       - name: personalSite
     *         description: personalSite
     *         in: form Data
     *         required: false
     *       - name: twitterUsername
     *         description: twitterUsername
     *         in: form Data
     *         required: false
     *     responses:
     *       200:
     *         description: User wallet created.
     *       501:
     *         description: Something went wrong.
     *       500:
     *         description: Internal server error.
     *       409:
     *         description: User Exists.
     */

    async userWallet(req, res, next) {
        const validationSchema = {
            name: Joi.string().optional(),
            countryCode: Joi.string().optional(),
            mobileNumber: Joi.string().optional(),
            email: Joi.string().optional(),
            password: Joi.string().optional(),
            bio: Joi.string().optional(),
            walletAddress: Joi.string().optional(),
            profilePic: Joi.string().optional(),
            personalSite: Joi.string().optional(),
            twitterUsername: Joi.string().optional()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            const { name, countryCode, mobileNumber, email, bio, walletAddress, profilePic, personalSite, twitterUsername } = validatedBody;
            var userInfo = await checkUserExists(walletAddress);
            const { files } = req;
            if (!userInfo) {
                var obj = {
                    name: name,
                    mobileNumber: mobileNumber,
                    countryCode: countryCode,
                    walletAddress: walletAddress,
                    email: email,
                    profilePic: await commonFunction.getImageUrl(files),
                    bio: bio,
                    personalSite: personalSite,
                    twitterUsername: twitterUsername
                }
                var result = await createUser(obj)
                return res.json(new response(result, responseMessage.USER_WALLET_CREATED));
            } else {
                return res.json(new response([], responseMessage.USER_EXISTS));
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /user/connectWallet:
     *   post:
     *     tags:
     *       - USER
     *     description: connectWallet
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: walletAddress
     *         description: walletAddress
     *         in: formData
     *         required: true
     *     responses:
     *       200:
     *         description: Wallet connect successfully.
     *       500:
     *         description: Internal server error.
     *       501:
     *         description: Something went wrong.
     */

    async connectWallet(req, res, next) {
        let validationSchema = {
            walletAddress: Joi.string().required()
        }
        try {
            let validatedBody = await Joi.validate(req.body, validationSchema);
            const index = Math.floor(Math.random() * 5);

            let userResult = await findUser({ walletAddress: validatedBody.walletAddress, status: { $ne: status.DELETE } });
            if (!userResult) {
                let defaultCover = await commonFunction.generateRandomCoverImage(index);
                let profilePic = `https://avatars.dicebear.com/api/identicon/${validatedBody.walletAddress}.svg`
                var result = await createUser({ walletAddress: validatedBody.walletAddress, profilePic: profilePic, coverPic: defaultCover })
                var walletResult = await createWallet({ userId: result._id, walletAddress: validatedBody.walletAddress });
                let token = await commonFunction.getToken({ id: result._id, walletAddress: result.walletAddress, userType: result.userType });
                let obj = {
                    userId: result._id,
                    walletAddress: result.walletAddress,
                    userType: result.userType,
                    token: token,
                    status: result.status,
                    profilePic: result.profilePic,
                    coverPic: result.coverPic
                }
                return res.json(new response(obj, responseMessage.LOGIN));
            }
            else {
                let token = await commonFunction.getToken({ id: userResult._id, walletAddress: userResult.walletAddress, userType: userResult.userType });
                let obj = {
                    userId: userResult._id,
                    walletAddress: userResult.walletAddress,
                    token: token,
                    userType: userResult.userType,
                    status: userResult.status,
                    profilePic: userResult.profilePic,
                    coverPic: userResult.coverPic

                }
                return res.json(new response(obj, responseMessage.LOGIN));
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /user/addWallet:
     *   post:
     *     tags:
     *       - USER
     *     description: addWallet
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: walletAddress
     *         description: walletAddress
     *         in: formData
     *         required: true
      *       - name: walletType
     *         description: walletType
     *         in: formData
     *         required: true
     *     responses:
     *       200:
     *         description: Wallet added successfully.
     *       500:
     *         description: Internal server error.
     *       409:
     *         description: Already exist.
     *       501:
     *         description: Something went wrong.
     */

    async addWallet(req, res, next) {
        let validationSchema = {
            walletAddress: Joi.string().required(),
            walletType: Joi.string().required(),
        }
        try {
            let validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND)
            }
            let walletRes = await findUser({ walletAddress: req.body.walletAddress })
            if (walletRes) {
                throw apiError.alreadyExist(responseMessage.ALREADY_EXIST)
            } else {
                var obj = {
                    userId: userResult._id,
                    walletAddress: req.body.walletAddress,
                    walletType: req.body.walletType
                }
                var finalRes = await createWallet(obj)
                return res.json(new response(finalRes, responseMessage.DATA_SAVED));
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
    * @swagger
    * /user/viewWallet:
    *   get:
    *     tags:
    *       - USER
    *     description: viewWallet
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
    *         description: Data found successfully.
    *       500:
    *         description: Internal server error.
    *       409:
    *         description: Already exist.
    *       404:
    *         description: User not found.
    */

    async viewWallet(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required()
        };
        try {
            var validatedBody = await Joi.validate(req.query, validationSchema);
            var userResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE } })
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            } else {
                var reportRes = await findWallet({ _id: req.query._id, status: { $ne: status.DELETE } })
                if (!reportRes) {
                    throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
                } else {
                    return res.json(new response(reportRes, responseMessage.DATA_FOUND));
                }
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
      * @swagger
      * /user/editWallet:
      *   put:
      *     tags:
      *       - USER
      *     description: editWallet
      *     produces:
      *       - application/json
      *     parameters:
      *       - name: token
      *         description: token
      *         in: header
      *         required: true
      *       - name: walletId
      *         description: walletId ?? _id
      *         in: query
      *         required: true
      *       - name: walletType
      *         description: walletType ?? PRIMARY
      *         in: query
      *         required: false
      *     responses:
      *       200:
      *         description: Updated successfully.
      *       500:
      *         description: Internal server error.
      *       404:
      *         description: User not found/data not found.
      */

    async editWallet(req, res, next) {
        const validationSchema = {
            walletId: Joi.string().required(),
            walletType: Joi.string().optional(),
        };
        try {
            var validatedBody = await Joi.validate(req.query, validationSchema);
            var userResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE } })
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            } else {
                var walletRes = await findWallet({ _id: validatedBody.walletId, status: { $ne: status.DELETE } })
                if (!walletRes) {
                    throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
                } else {
                    let allWallet = await listWallet({ _id: { $ne: walletRes._id }, userId: userResult._id })
                    allWallet.map((i) => i._id);
                    await multiUpdateWallet({ _id: { $in: allWallet } }, { walletType: "SECONDARY" });
                    let updateRes = await updateWallet({ _id: walletRes._id }, { walletType: validatedBody.walletType });
                    return res.json(new response(updateRes, responseMessage.UPDATE_SUCCESS));
                }
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
       * @swagger
       * /user/listWallet:
       *   get:
       *     tags:
       *       - USER
       *     description: listWallet
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

    async listWallet(req, res, next) {

        try {

            var userResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE } })
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            } else {
                var reportRes = await listWallet({ userId: userResult._id, status: { $ne: status.DELETE } })
                if (reportRes.length == 0) {
                    throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
                } else {
                    return res.json(new response(reportRes, responseMessage.DATA_FOUND));
                }
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /user/profile:
     *   get:
     *     tags:
     *       - USER
     *     description: profile
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *     responses:
     *       200:
     *         description: User details.
     *       404:
     *         description: User not found.
     *       500:
     *         description: Internal server error.
     *       501:
     *         description: Something went wrong.
     */

    async profile(req, res, next) {
        try {
            let userResult = await findUser({ _id: req.userId });
    
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            kycModel.find({userId:userResult._id}).then((kycData)=>{
                console.log(kycData)
                if(kycData[0]===undefined){
                    return res.json(new response(userResult, responseMessage.USER_DETAILS))
                }else{
                    let result = { ...userResult._doc, approveStatus: kycData[0].approveStatus }
                    if(result){
                        return res.json(new response(result, responseMessage.USER_DETAILS));
                    }
                }
                
            })
            

        } catch (error) {
            return next(error);
        }
    }
    //    async profile(req, res, next) {
    //     try {
    //         let userResult = await findUser({ _id: req.userId });
    //         if (!userResult) {
    //             throw apiError.notFound(responseMessage.USER_NOT_FOUND);
    //         }
    //         return res.json(new response(userResult, responseMessage.USER_DETAILS));
    //     } catch (error) {
    //         return next(error);
    //     }
    // }


    /**
    * @swagger
    * /user/getUserDetails/{_id}:
    *   get:
    *     tags:
    *       - USER
    *     description: getUserDetails
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: _id
    *         description: _id
    *         in: path
    *         required: true
    *     responses:
    *       200:
    *         description: Data found successfully.
    *       404:
    *         description: User not found.
    */

    async getUserDetails(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required()
        };
        try {
            let userResult;
            const { _id } = await Joi.validate(req.params, validationSchema);
            userResult = await userAllDetails(_id);
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            return res.json(new response(userResult, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
      * @swagger
      * /user/updateProfile:
      *   put:
      *     tags:
      *       - USER
      *     description: updateProfile
      *     produces:
      *       - application/json
      *     parameters:
      *       - name: token
      *         description: token
      *         in: header
      *         required: true
      *       - name: userName
      *         description: userName
      *         in: formData
      *         required: false
      *       - name: name
      *         description: name
      *         in: formData
      *         required: false
      *       - name: email
      *         description: email
      *         in: formData
      *         required: false
      *       - name: profilePic
      *         description: profilePic ?? base64
      *         in: formData
      *         required: false
      *       - name: coverPic
      *         description: coverPic ?? base64
      *         in: formData
      *         required: false
      *       - name: bio
      *         description: bio
      *         in: formData
      *         required: false
      *       - name: customUrl
      *         description: customUrl
      *         in: formData
      *         required: false
      *       - name: twitterUsername
      *         description: twitterUsername
      *         in: formData
      *         required: false
      *       - name: personalSite
      *         description: personalSite
      *         in: formData
      *         required: false
      *     responses:
      *       200:
      *         description: Returns success message
      */

    async updateProfile(req, res, next) {
        try {
            var uniqueCheck, updated;
            let validatedBody = req.body;
            let userRes = await findUser({ _id: req.userId })
            if (!userRes) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND)
            }
            if (validatedBody.profilePic) {
                validatedBody.profilePic = await commonFunction.getSecureUrl(validatedBody.profilePic);
            }
            if (validatedBody.coverPic) {
                validatedBody.coverPic = await commonFunction.getSecureUrl(validatedBody.coverPic);
            }
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            updated = await updateUserById(userResult._id, { $set: validatedBody });
            return res.json(new response(updated, responseMessage.PROFILE_UPDATED));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /user/followUnfollow/{userId}:
     *   get:
     *     tags:
     *       -  USER
     *     description: Check for Social 
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: userId
     *         description: userId
     *         in: path
     *         required: true 
     *     responses:
     *       200:
     *         description: Data found successfully
     */

    async followUnfollow(req, res, next) {
        const validationSchema = {
            userId: Joi.string().required(),
        }
        var updated;
        try {
            const { userId } = await Joi.validate(req.params, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let userCheck = await findUser({ _id: userId, status: { $ne: status.DELETE } });
            if (!userCheck) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            if (userCheck.followers.includes(userResult._id)) {
                updated = await updateUser({ _id: userCheck._id }, { $pull: { followers: userResult._id }, $inc: { followersCount: -1 } });
                await updateUser({ _id: userResult._id }, { $pull: { following: userCheck._id }, $inc: { followingCount: -1 } });
                await createActivity({
                    userId: userResult._id,
                    followerId: userCheck._id,
                    title: "UNFOLLOW_USER",
                    desctiption: "Bad choise, I unfollowing it.",
                    type: "UNFOLLOW"
                })
                await createHistory({
                    userId: userResult._id,
                    followerId: userCheck._id,
                    title: "UNFOLLOW_USER",
                    desctiption: "Bad choise, I unfollowing it.",
                    type: "UNFOLLOW"
                })
                return res.json(new response(updated, responseMessage.UNFOLLOW));
            } else {
                await createActivity({
                    userId: userResult._id,
                    followerId: userCheck._id,
                    title: "FOLLOW_USER",
                    desctiption: "Nice person, I following it.",
                    type: "FOLLOW"
                })
                await createHistory({
                    userId: userResult._id,
                    followerId: userCheck._id,
                    title: "FOLLOW_USER",
                    desctiption: "Nice person, I following it.",
                    type: "FOLLOW"
                })
                updated = await updateUser({ _id: userCheck._id }, { $addToSet: { followers: userResult._id }, $inc: { followersCount: 1 } });
                await updateUser({ _id: userResult._id }, { $addToSet: { following: userCheck._id }, $inc: { followingCount: 1 } });
                return res.json(new response(updated, responseMessage.FOLLOW));
            }
        }
        catch (error) {
            return next(error);
        }
    }

    /**
    * @swagger
    * /user/createOrderReports:
    *   post:
    *     tags:
    *       - USER_ORDER_REPORT
    *     description: createOrderReports
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: token
    *         description: token
    *         in: header
    *         required: true
    *       - name: orderId
    *         description: orderId ? orderId 
    *         in: formData
    *         required: true
    *       - name: artist
    *         description: artist
    *         in: formData
    *         required: true
    *       - name: message
    *         description: message
    *         in: formData
    *         required: true
    *     responses:
    *       200:
    *         description: Report created.
    *       501:
    *         description: Something went wrong.
    *       404:
    *         description: Data not found.
    *       409:
    *         description: Already reported.
    */

    async createOrderReports(req, res, next) {
        let validationSchema = {
            orderId: Joi.string().required(),
            artist: Joi.string().required(),
            message: Joi.string().required()
        };
        try {
            let validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            } else {
                let orderCheck = await findOrder({ _id: validatedBody.orderId, status: { $ne: status.DELETE } });
                let reportCheck = await findReport({ userId: userResult._id, orderId: orderCheck._id, actionApply: false });
                if (!reportCheck) {
                    let obj = {
                        userId: userResult._id,
                        name: userResult.name ? userResult.name : "Unknown Name",
                        artist: validatedBody.artist,
                        nftId: orderCheck.nftId,
                        orderId: orderCheck._id,
                        tokenId: orderCheck.tokenId,
                        message: validatedBody.message,
                        reportType: "NFT_REPORT"
                    }
                    let result = await createreport(obj);
                    return res.json(new response(result, responseMessage.REPORTS_CREATED));
                } else {
                    throw apiError.alreadyExist([], responseMessage.ALREADY_REPORTED)
                }
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
    * @swagger
    * /nft/viewOrderReport/{_id}:
    *   get:
    *     tags:
    *       - USER_ORDER_REPORT
    *     description: viewReport
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: token
    *         description: token
    *         in: header
    *         required: truemonthly
    *       - name: _id
    *         description: reportId
    *         in: path
    *         required: true
    *     responses:
    *       200:
    *         description: Data found successfully.
    *       501:
    *         description: Something went wrong.
    *       404:
    *         description: User not found/Data not found.
    *       409:
    *         description: Already reported.
    */

    async viewOrderReport(req, res, next) {
        const validationSchema = {
            reportId: Joi.string().required()
        };
        try {
            var validatedBody = await Joi.validate(req.body, validationSchema);
            const { userId, artist, nftId, message, tokenId } = validatedBody;
            var userResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE } })
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            } else {
                var reportRes = await findReport({ _id: req.query.reportId, status: { $ne: status.DELETE } })
                if (!reportRes) {
                    throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
                } else {
                    return res.json(new response(reportRes, responseMessage.DATA_FOUND));
                }
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
    * @swagger
    * /nft/listorderReportedByUser:
    *   get:
    *     tags:
    *       - USER_ORDER_REPORT
    *     description: listorderReportedByUser
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
    *       501:
    *         description: Something went wrong.
    *       404:
    *         description: User not found/Data not found.
    *       409:
    *         description: Already reported.
    */

    async listorderReportedByUser(req, res, next) {
        try {
            let userDetailRes = await findUser({ _id: req.userId })
            if (!userDetailRes) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND)
            }
            let orderReportRes = await paginateSearchReport({ userId: userDetailRes._id })
            if (orderReportRes.length == 0) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            }
            return res.json(new response(orderReportRes, responseMessage.DATA_FOUND))
        } catch (error) {
            return next(error)
        }
    }

    /**
    * @swagger
    * /user/userReports:
    *   post:
    *     tags:
    *       - USER_USER_REPORT
    *     description: userReports
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: token
    *         description: token
    *         in: header
    *         required: true
    *       - name: userId
    *         description: userId ? userId 
    *         in: formData
    *         required: true
    *       - name: message
    *         description: message
    *         in: formData
    *         required: true
    *     responses:
    *       200:
    *         description: Report created.
    *       501:
    *         description: Something went wrong.
    *       404:
    *         description: Data not found.
    *       409:
    *         description: Already reported.
    */

    async userReports(req, res, next) {
        let validationSchema = {
            userId: Joi.string().required(),
            message: Joi.string().required()
        };
        try {
            let validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            } else {
                let userCheck = await findUser({ _id: validatedBody.userId, status: { $ne: status.DELETE } });
                let reportCheck = await findReport({ userId: userResult._id, userId: userCheck._id, actionApply: false });
                if (!reportCheck) {
                    let obj = {
                        userId: validatedBody.userId,
                        name: userResult.name ? userResult.name : "Unknown Name",
                        message: validatedBody.message,
                        reporterUserId: userResult._id,
                        reportType: "USER_REPORT"
                    }
                    let result = await createreport(obj);
                    return res.json(new response(result, responseMessage.REPORTS_CREATED));
                } else {
                    throw apiError.alreadyExist([], responseMessage.ALREADY_REPORTED)
                }
            }
        } catch (error) {
            return next(error);
        }
    }

    // async userReports(req, res, next) {
    //     let validationSchema = {
    //         userId: Joi.string().required(),
    //         message: Joi.string().required()
    //     };
    //     try {
    //         let validatedBody = await Joi.validate(req.body, validationSchema);
    //         let userResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE } });
    //         if (!userResult) {
    //             throw apiError.notFound(responseMessage.USER_NOT_FOUND);
    //         } else {
    //             let userCheck = await findUser({ _id: validatedBody.userId, status: { $ne: status.DELETE } });
    //             let reportCheck = await findReport({ userId: userResult._id, reporterUserId: userCheck._id, actionApply: false });
    //             if (!reportCheck) {
    //                 let obj = {
    //                     userId: userResult._id,
    //                     name: userResult.name ? userResult.name : "Unknown Name",
    //                     reporterUserId: userCheck._id,
    //                     message: validatedBody.message,
    //                     actionApply: true
    //                 }
    //                 let result = await createreport(obj);
    //                 return res.json(new response(result, responseMessage.REPORTS_CREATED));
    //             } else {
    //                 throw apiError.alreadyExist([], responseMessage.ALREADY_REPORTED)
    //             }
    //         }
    //     } catch (error) {
    //         return next(error);
    //     }
    // }

    /**
   * @swagger
   * /user/viewReportUser:
   *   get:
   *     tags:
   *       -  USER_USER_REPORT
   *     description: viewReport
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
   *         description: Data found successfully.
   *       501:
   *         description: Something went wrong.
   *       404:
   *         description: User not found/Data not found.
   *       409:
   *         description: Already reported.
   */

    async viewReport(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required()
        };
        try {
            var validatedBody = await Joi.validate(req.query, validationSchema);
            const { _id } = validatedBody;
            var userResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE } })
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            } else {
                var reportRes = await findReport({ _id: _id, status: { $ne: status.DELETE } })
                if (!reportRes) {
                    throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
                } else {
                    return res.json(new response(reportRes, responseMessage.DATA_FOUND));
                }
            }
        } catch (error) {
            return next(error);
        }
    }


    /**
       * @swagger
       * /user/listUserToUserReport:
       *   get:
       *     tags:
       *       - USER_USER_REPORT
       *     description: listUserToUserReport
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
       *       501:
       *         description: Something went wrong.
       *       404:
       *         description: User not found/Data not found.
       *       409:
       *         description: Already reported.
       */

    async listUserToUserReport(req, res, next) {
        try {
            let userDetailRes = await findUser({ _id: req.userId })
            if (!userDetailRes) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND)
            }
            let orderReportRes = await paginateSearchReport({ userId: userDetailRes._id })
            if (orderReportRes.length == 0) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            }
            return res.json(new response(orderReportRes, responseMessage.DATA_FOUND))

        } catch (error) {
            return next(error)
        }
    }

    /**
     * @swagger
     * /user/followingList/{userId}:
     *   get:
     *     tags:
     *       - USER
     *     description: Check for Social 
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: userId
     *         description: userId
     *         in: path
     *         required: true 
     *     responses:
     *       200:
     *         description: Details has been fetched successfully.
     *       404:
     *         description: User not found.
     */

    async followingList(req, res, next) {
        var validationSchema = {
            userId: Joi.string().optional(),
        };
        try {
            var validatedBody = await Joi.validate(req.params, validationSchema);
            var userResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE } })
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            else {
                let result = await findfollowing({ _id: validatedBody.userId, status: { $ne: status.DELETE } })
                if (!result) {
                    throw apiError.notFound(responseMessage.USER_NOT_FOUND);
                } else {
                    return res.json(new response(result, responseMessage.DETAILS_FETCHED))
                }
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
       * @swagger
       * /user/followersList/{userId}:
       *   get:
       *     tags:
       *       - USER
       *     description: Check for Social 
       *     produces:
       *       - application/json
       *     parameters:
       *       - name: token
       *         description: token
       *         in: header
       *         required: true
       *       - name: userId
       *         description: userId
       *         in: path
       *         required: true 
       *     responses:
       *       200:
       *         description: Details has been fetched successfully.
       *       404:
       *         description: User not found.
       */

    async followersList(req, res, next) {
        var validationSchema = {
            userId: Joi.string().optional(),
        };
        try {
            var validatedBody = await Joi.validate(req.params, validationSchema);
            var userResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE } })
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            else {
                let result = await findfollowers({ _id: validatedBody.userId, status: { $ne: status.DELETE } })
                if (!result) {
                    throw apiError.notFound(responseMessage.USER_NOT_FOUND);
                } else {
                    return res.json(new response(result, responseMessage.DETAILS_FETCHED))
                }
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /user/topSalers:
     *   get:
     *     tags:
     *       - USER
     *     description: topSalers
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: status
     *         description: status
     *         in: query
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
     *       - name: type
     *         description: type ?? Daily || Weekly || Monthly
     *         in: query
     *         required: false
     *     responses:
     *       200:
     *         description: Data found successfully.
     *       404:
     *         description: Data not found.
     */

    async topSalers(req, res, next) {
        const validationSchema = {
            status: Joi.string().optional(),
            type: Joi.string().optional(),
            search: Joi.string().optional(),
            fromDate: Joi.string().optional(),
            toDate: Joi.string().optional(),
            page: Joi.number().optional(),
            limit: Joi.number().optional(),
        };
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            let dataResults = await topSaler(validatedBody);
            if (dataResults.length == 0) {
                throw apiError.notFound([], responseMessage.DATA_NOT_FOUND)
            }
            return res.json(new response(dataResults, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /user/topBuyers:
     *   get:
     *     tags:
     *       - USER
     *     description: topBuyers
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: status
     *         description: status
     *         in: query
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
     *       - name: type
     *         description: type ?? Daily || Weekly || Monthly
     *         in: query
     *         required: false
     *     responses:
     *       200:
     *         description: Data found successfully.
     *       404:
     *         description: Data not found.
     */

    async topBuyers(req, res, next) {
        const validationSchema = {
            status: Joi.string().optional(),
            type: Joi.string().optional(),
            search: Joi.string().optional(),
            fromDate: Joi.string().optional(),
            toDate: Joi.string().optional(),
            page: Joi.number().optional(),
            limit: Joi.number().optional(),
        };
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            let dataResults = await topBuyer(validatedBody);
            if (dataResults.length == 0) {
                throw apiError.notfound([], responseMessage.DATA_NOT_FOUND)
            }
            return res.json(new response(dataResults, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /user/userList:
     *   get:
     *     tags:
     *       - USER
     *     description: userList
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: status
     *         description: status
     *         in: query
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
     *       404:
     *         description: Data not found.
     */

    async userList(req, res, next) {
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
            let dataResults = await paginateSearch(validatedBody);
            if (dataResults.length == 0) {
                throw apiError.notFound([], responseMessage.DATA_NOT_FOUND)
            }
            return res.json(new response(dataResults, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
         * @swagger
         * /user/viewFeesUser:
         *   get:
         *     tags:
         *       - USER
         *     description: viewFeesUser
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         description: Fees details found Succesfully.
         *       404:
         *         description: Fees not found.
         */

    async viewFeesUser(req, res, next) {
        try {
            var feesInfo = await findFees({ status: { $ne: status.DELETE } });
            if (!feesInfo) {
                throw apiError.notFound(responseMessage.FEES_NOT_FOUND);
            }
            return res.json(new response(feesInfo, responseMessage.FEES_DETAILS));
        } catch (error) {
            return next(error);
        }
    }

    /**
      * @swagger
      * /nft/onSaleCount:
      *   get:
      *     tags:
      *       - PLACEORDER DASHBOARD
      *     description: onSaleCount
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
      *     responses:
      *       200:
      *         description: Order details fetched successfully.
      *       501:
      *         description: Something went wrong.
      *       404:
      *         description: User not found/Data not found.
      *       409:
      *         description: Already reported.
      */

    async onSaleCount(req, res, next) {
        try {
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            } else {
                let orderInfo = await findSale(req.body)
                if (!orderInfo) {
                    throw apiError.notFound([], responseMessage.DATA_NOT_FOUND)
                } else {
                    return res.json(new response(orderInfo, responseMessage.ORDER_DETAILS));
                }
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
      * @swagger
      * /user/userOnSaleCount/{_id}:
      *   get:
      *     tags:
      *       - USER
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
      *         in: query
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
                let orderInfo = await paginateUserOnSaleOrder(userResult._id, req.query)
                if (orderInfo.length == 0) {
                    return res.json(new response([], responseMessage.DATA_NOT_FOUND));
                } else {
                    return res.json(new response(orderInfo, responseMessage.ORDER_DETAILS));
                }
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
      * @swagger
      * /user/userOwendCount/{_id}:
      *   get:
      *     tags:
      *       - USER
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

    async userOwendCount(req, res, next) {
        try {
            let userResult = await findUser({ _id: req.params._id });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            } else {
                let orderInfo = await paginateUserOwendOrder(userResult._id);
                if (orderInfo.length == 0) {
                    return res.json(new response([], responseMessage.DATA_NOT_FOUND)); //
                } else {
                    return res.json(new response(orderInfo, responseMessage.DATA_FOUND));
                }
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /user/userCreatedCount/{_id}:
     *   get:
     *     tags:
     *       - USER
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
                let createdInfo = await paginateUserOrder(userResult._id)
                if (createdInfo.length == 0) {
                    return res.json(new response([], responseMessage.DATA_NOT_FOUND));
                } else {
                    return res.json(new response(createdInfo, responseMessage.DATA_FOUND));
                }
            }
        } catch (error) {
            return next(error);
        }

    }

    /**
     * @swagger
     * /user/userBuyList/{_id}:
     *   get:
     *     tags:
     *       - USER
     *     description: userBuyList
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

    async userBuyList(req, res, next) {
        try {
            let userResult = await findUser({ _id: req.params._id });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            } else {
                let createdInfo = await userBuyList(userResult._id)
                if (createdInfo.length == 0) {
                    return res.json(new response([], responseMessage.DATA_NOT_FOUND));
                } else {
                    return res.json(new response(createdInfo, responseMessage.DATA_FOUND));
                }
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /user/userBuyAndCreatedList/{_id}:
     *   get:
     *     tags:
     *       - USER
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
                let createdInfo = await userBuyAndCreatedList(userResult._id)
                if (createdInfo.length == 0) {
                    throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
                } else {
                    return res.json(new response(createdInfo, responseMessage.DATA_FOUND));
                }
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /user/nftSoldCount/{_id}:
     *   get:
     *     tags:
     *       - USER
     *     description: nftSoldCount
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

    async nftSoldCount(req, res, next) {
        try {
            let userResult = await findUser({ _id: req.params._id });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            } else {
                let createdInfo = await paginateSoldOrder(userResult._id);
                if (createdInfo.length == 0) {
                    return res.json(new response([], responseMessage.DATA_NOT_FOUND));
                } else {
                    return res.json(new response(createdInfo, responseMessage.DATA_FOUND));
                }
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /user/userLikesCount/{_id}:
     *   get:
     *     tags:
     *       - USER
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
                let createdInfo = await findOrderLike(userResult._id);
                if (createdInfo.length == 0) {
                    return res.json(new response([], responseMessage.DATA_NOT_FOUND));
                } else {
                    return res.json(new response(createdInfo, responseMessage.DATA_FOUND));
                }
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
  * @swagger
  * /user/userFavourateCount/{_id}:
  *   get:
  *     tags:
  *       - USER
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
                let createdInfo = await findOrderFavourate(userResult._id);
                if (createdInfo.length == 0) {
                    return res.json(new response([], responseMessage.DATA_NOT_FOUND));
                } else {
                    return res.json(new response(createdInfo, responseMessage.DATA_FOUND));
                }
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /user/userFollowingCount/{_id}:
     *   get:
     *     tags:
     *       - USER
     *     description: userFollowingCount
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: _id
     *         description: _id for userId
     *         in: path
     *         required: true
     *     responses:
     *       200:
     *         description: Following list found successfully.
     *       404:
     *         description: User not found.
     */

    async userFollowingCount(req, res, next) {
        try {
            let userGet = await findfollowing({ _id: req.params._id, status: "ACTIVE" })
            if (!userGet) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            } else {
                return res.json(new response(userGet, responseMessage.FOLLOWING))
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /user/userFollowerCount/{_id}:
     *   get:
     *     tags:
     *       - USER
     *     description: userFollowingCount
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: _id
     *         description: _id for userId
     *         in: path
     *         required: true
     *     responses:
     *       200:
     *         description: Follower list found successfully.
     *       404:
     *         description: User not found.
     */

    async userFollowerCount(req, res, next) {
        try {
            let userGet = await findfollowers({ _id: req.params._id, status: "ACTIVE" })
            if (!userGet) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            } else {
                return res.json(new response(userGet, responseMessage.FOLLOWER));
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /user/showNftHistory/{_id}:
     *   get:
     *     tags:
     *       - USER
     *     description: onSaleCount
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: _id
     *         description: _id for nftId
     *         in: query
     *         required: true
     *       - name: search
     *         description: search 
     *         in: formData
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
     *         description: Nft history detail fetch successfully.
     *       501:
     *         description: Something went wrong.
     *       404:
     *         description: User not found/Data not found .
     *       409:
     *         description: Already reported.
     */

    async showNftHistory(req, res, next) {
        const validationSchema = {
            _id: Joi.string().optional(),
            page: Joi.number().optional(),
            limit: Joi.number().optional()
        };
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            let nftReuslt = await findNft({ _id: req.query._id });
            if (!nftReuslt) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            } else {
                let activityInfo = await paginateShowNftHistory(nftReuslt._id, validatedBody)
                if (!activityInfo) {
                    throw apiError.notFound([], responseMessage.DATA_NOT_FOUND)
                } else {
                    return res.json(new response(activityInfo, responseMessage.NFTHISTORY_DETAILS));
                }
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
    * @swagger
    * /user/userSubscribe:
    *   put:
    *     tags:
    *       - USER
    *     description: userFollowingCount
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: email
    *         description: email
    *         in: query
    *         required: true
    *       - name: link
    *         description: link
    *         in: query
    *         required: true
    *     responses:
    *       200:
    *         description: Subscribe successfully.
    *       409:
    *         description: Already Exist.
    */

    async userSubscribe(req, res, next) {
        const validationSchema = {
            email: Joi.string().required(),
            link: Joi.string().required()
        };
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema)
            const { email, link } = validatedBody
            let subscriptionRes = await findSubscribe({ email: email, isSubscribe: false })
            if (subscriptionRes) throw apiError.conflict(responseMessage.ALREADY_SUBSCRIBE)
            var obj = {
                email: email,
                isSubscribe: false
            }
            var finalResult = await createSubscribe(obj)
            console.log("=====", `${link}?${email}`)
            // let emailRes = await commonFunction.sendSubscribeTemplateForUser(email, `${link}?${(email)}`)
            // console.log("======emails", emailRes)

            return res.json(new response(finalResult, responseMessage.SUBSCRIBE_SUCCESS));
        } catch (error) {
            console.log("=====error==", error)
            return next(error);
        }
    }

    /**
    * @swagger
    * /user/userVerifySubscription:
    *   post:
    *     tags:
    *       - USER
    *     description: userVerifySubscription
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: email
    *         description: email
    *         in: formData
    *         required: true
    *     responses:
    *       200:
    *         description: Subscribe successfully.
    *       409:
    *         description: Already Exist.
    */

    async userVerifySubscription(req, res, next) {
        const validationSchema = {
            email: Joi.string().required(),
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema)
            const { email } = validatedBody
            let adminDetailRes = await findUser({ userType: userType.ADMIN })
            var result = await emailExist(email)
            if (result) {
                throw apiError.conflict(responseMessage.EMAIL_ALREADY_INUSE);
            }
            var finalResult = await updateSubscribe({ email: validatedBody.email }, { $set: { isSubscribe: true } })
            // await commonFunction.sendSubscribeTemplateForAdmin(adminDetailRes.email, email)
            return res.json(new response(finalResult, responseMessage.SUBSCRIBE_SUCCESS));

        } catch (error) {
            return next(error);
        }
    }

    /**
    * @swagger
    * /user/userRejectSubscription:
    *   post:
    *     tags:
    *       - USER
    *     description: userRejectSubscription
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: email
    *         description: email
    *         in: formData
    *         required: true
    *     responses:
    *       200:
    *         description: Subscribe successfully.
    *       409:
    *         description: Already Exist.
    */

    async userRejectSubscription(req, res, next) {
        const validationSchema = {
            email: Joi.string().required(),
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema)
            const { email } = validatedBody
            var result = await emailExist(email)
            if (result) {
                throw apiError.conflict(responseMessage.EMAIL_ALREADY_INUSE);
            }
            var finalResult = await updateSubscribe({ email: validatedBody.email }, { $set: { status: status.DELETE } })
            return res.json(new response(finalResult, responseMessage.SUBSCRIBE_SUCCESS));

        } catch (error) {
            return next(error);
        }
    }


    /**
     * @swagger
     * /user/hotCollections:
     *   get:
     *     tags:
     *       - USER
     *     description: hotCollections
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
     *         description: Nft history detail fetch successfully.
     *       501:
     *         description: Something went wrong.
     *       404:
     *         description: Data not found .
     *       409:
     *         description: Already reported.
     */

    async hotCollections(req, res, next) {
        const validationSchema = {
            search: Joi.string().optional(),
            fromDate: Joi.string().optional(),
            toDate: Joi.string().optional(),
            page: Joi.number().optional(),
            limit: Joi.number().optional(),
        };
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            let dataResults = await hotCollectionPaginateSearch(validatedBody);
            return res.json(new response(dataResults, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /user/dashboardSearch:
     *   get:
     *     tags:
     *       - DASHBOARD SEARCH
     *     description: dashboardSearch
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: search
     *         description: search
     *         in: query
     *         required: false
     *     responses:
     *       200:
     *         description: Nft history detail fetch successfully.
     *       501:
     *         description: Something went wrong.
     *       404:
     *         description: Data not found .
     *       409:
     *         description: Already reported.
     */

    async dashboardSearch(req, res, next) {
        const validationSchema = {
            search: Joi.string().optional()
        };
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            let { userResult, collectionResult, nftResult, orderResult } = await dashboardList(validatedBody);  //bid need
            return res.json(new response({ userResult, collectionResult, nftResult, orderResult }, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
    * @swagger
    * /user/dashboardCount:
    *   get:
    *     tags:
    *       - DASHBOARD SEARCH
    *     description: dashboardCount
    *     produces:
    *       - application/json
    *     responses:
    *       200:
    *         description: Nft history detail fetch successfully.
    *       501:
    *         description: Something went wrong.
    *       404:
    *         description: Data not found .
    */

    async dashboardCount(req, res, next) {
        try {
            let obj = await dashboardCount();
            return res.json(new response(obj, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error);
        }
    }


    /**
    * @swagger
    * /user/userDetails/{walletAddress}:
    *   get:
    *     tags:
    *       - USER NFT DETAILS
    *     description: userDetails
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: walletAddress
    *         description: walletAddress
    *         in: path
    *         required: true   
    *     responses:
    *       200:
    *         description: Nft history detail fetch successfully.
    *       501:
    *         description: Something went wrong.
    *       404:
    *         description: Data not found .
    */

    async userDetails(req, res, next) {
        let validationSchema = {
            walletAddress: Joi.string().required()
        }
        try {
            const { walletAddress } = await Joi.validate(req.params, validationSchema);
            let result = await userDetailsWithNft(walletAddress);
            return res.json(new response(result, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error);
        }
    }


    /**
    * @swagger
    * /user/userNftDetails:
    *   post:
    *     tags:
    *       - USER NFT DETAILS
    *     description: userNftDetails
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: contractAddress
    *         description: contractAddress
    *         in: formData
    *         required: true   
    *       - name: tokenId
    *         description: tokenId
    *         in: formData
    *         required: true   
    *     responses:
    *       200:
    *         description: Nft history detail fetch successfully.
    *       501:
    *         description: Something went wrong.
    *       404:
    *         description: Data not found.
    */

    async userNftDetails(req, res, next) {
        let validationSchema = {
            contractAddress: Joi.string().required(),
            tokenId: Joi.string().required()
        }
        try {
            const { contractAddress, tokenId } = await Joi.validate(req.body, validationSchema);
            // const [contractResult, nftRes] = await Promise.all([
            //     findCollectionForNft({ contractAddress: req.body.contractAddress }),
            //     findNft({ tokenId: tokenId })
            // ]);
            // if (!contractResult) throw apiError.notFound(responseMessage.COLLECTION_NOT_FOUND);
            // if (!nftRes) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);

            const nftRes = await findNft({ contractAddress: contractAddress, tokenId: tokenId });
            console.log("nftRes===>>", nftRes);
            if (!nftRes) throw apiError.notFound(responseMessage.NFT_NOT_FOUND);
            const result = await orderList({ nftId: nftRes._id });
            if (result.length == 0) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            return res.json(new response(result, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
    * @swagger
    * /user/getContactUs:
    *   get:
    *     tags:
    *       - CONTACT US
    *     description: getContactUs
    *     produces:
    *       - application/json
    *     responses:
    *       200:
    *         description: Data found successfully.
    */

    async getContactUs(req, res, next) {
        try {
            let adminRes = await findAdminUser({ userType: userType.ADMIN })
            return res.json(new response(adminRes, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
       * @swagger
       * /user/contactUs:
       *   post:
       *     tags:
       *       - CONTACT US
       *     description: contactUs
       *     produces:
       *       - application/json
       *     parameters:
       *       - name: contactUs
       *         description: contactUs
       *         in: body
       *         required: true
       *         schema:
       *           $ref: '#/definitions/contactUs'
       *     responses:
       *       200:
       *         description: Contact-Us data Saved successfully
       */

    async contactUs(req, res, next) {
        let validationSchema = {
            name: Joi.string().required(),  
            email: Joi.string().email().required(),
            mobileNumber: Joi.string().allow('').optional(),
            message: Joi.string().allow('').optional(),
        }
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);

            var result = await createContactUs(validatedBody);
            var adminResult = await findUser({ userType: userType.ADMIN, status: status.ACTIVE })
            // commonFunction.sendMailContactus(adminResult.email, adminResult.name, validatedBody)
            return res.json(new response(result, responseMessage.CONTACT_US));
        } catch (error) {
            return next(error);
        }
    }


    async swapNft(req, res, next) {
        let validationSchema = {
            receiverAddress: Joi.string().required(),
            tokenId: Joi.string().optional(),
        }
        try {
            let validatedBody = await Joi.validate(req.body, validationSchema);
            const { receiverAddress, tokenId } = validatedBody
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound([], responseMessage.USER_NOT_FOUND);
            }
            let senderAddress = await findUser({ _id: userResult._id, status: { $ne: status.DELETE } })
            if (!senderAddress) {
                throw apiError.notFound([], responseMessage.SENDER_NOT_FOUND);
            }
            let receiverAdd = await findUser({ walletAddress: validatedBody.receiverAddress, status: { $ne: status.DELETE } })
            if (!receiverAdd) {
                var receiver = await createUser({ walletAddress: req.body.receiverAddress, status: { $ne: status.DELETE } })
                receiverAdd = receiver;
            }
            let collection = await findCollection({ userId: receiverAdd._id, status: { $ne: status.DELETE } })
            if (!collection) {
                return res.json(new response([], responseMessage.DATA_NOT_FOUND));
            }
            let nftSend = await findNft({ tokenId: req.body.tokenId, userId: senderAddress._id, status: { $ne: status.DELETE } })
            if (!nftSend) {
                return res.json(new response([], responseMessage.DATA_NOT_FOUND));
            }


            let senderObj = {
                senderAddress: senderAddress._id,
                receiverAddress: receiverAddress._id,
                transferStatus: "COMPLETE",
                userId: senderAddress._id,
                transferType: "SEND",
                nftTokenId: nftSend.tokenId
            }
            let receiverObj = {
                senderAddress: senderAddress._id,
                receiverAddress: receiverAddress._id,
                transferStatus: "COMPLETE",
                userId: receiverAddress._id,
                transferType: "RECEIVED",
                nftTokenId: nftSend.tokenId
            }
            var send = await createTransfer(senderObj)

            req.body.walletAddress = receiverAddress.walletAddress;
            req.body.userId = receiverAddress._id;
            req.body.collectionId = collection._id;
            let sentNft = await updateNft({ _id: nftSend._id });
            let receive = await createTransfer(receiverObj)
            return res.json(new response({ send, sentNft, receive }, "NFT transferred."));
        } catch (error) {
            return next(error);

        }
    }

    /**
* @swagger
* /user/requestForUnblock:
*   put:
*     tags:
*       - USER REQUEST
*     description: requestForUnblock
*     produces:
*       - application/json
*     parameters:
*       - name: _id
*         description: _id
*         in: query
*         required: true
*       - name: message
*         description: message
*         in: query
*         required: true
*     responses:
*       200:
*         description: Returns success message
*/

    async requestForUnblock(req, res, next) {
        try {
            let userRes = await findUser({ _id: req.query._id, status: { $in: status.BLOCK } })
            if (!userRes) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND)
            }
            let adminRes = await findUser({ userType: userType.ADMIN })
            let unblockRes = await updateUser({ _id: userRes._id }, { $set: { message: req.query.message, isUnblockRequest: true } })
            let subject = 'UNBLOCK_REQUEST';
            let body = `Dear Admin kindly unblock my Account , My account walletAddress is : ${userRes.walletAddress}`
            var mail = await commonFunction.sendMailContent(adminRes.email, subject, body, userRes.walletAddress)
            return res.json(new response(unblockRes, responseMessage.REQUEST_SEND));

        } catch (error) {
            return next(error);
        }

    }

    async requestForUnblock(req, res, next) {
        try {
            let userRes = await findUser({ _id: req.query._id, status: { $in: status.BLOCK } })
            if (!userRes) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND)
            }
            let adminRes = await findUser({ userType: userType.ADMIN })
            let unblockRes = await updateUser({ _id: userRes._id }, { $set: { message: req.query.message, isUnblockRequest: true } })
            let subject = 'UNBLOCK_REQUEST';
            let body = `Dear Admin kindly unblock my Account , My account walletAddress is : ${userRes.walletAddress}`
            var mail = await commonFunction.sendMailContent(adminRes.email, subject, body, userRes.walletAddress)
            return res.json(new response(unblockRes, responseMessage.REQUEST_SEND));

        } catch (error) {
            return next(error);
        }

    }


    /**
    * @swagger
    * /user/userNftDetailsW:
    *   post:
    *     tags:
    *       - USER NFT DETAILS
    *     description: userNftDetails
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: contractAddress
    *         description: contractAddress
    *         in: formData
    *         required: true   
    *       - name: tokenId
    *         description: tokenId
    *         in: formData
    *         required: true   
    *     responses:
    *       200:
    *         description: Nft history detail fetch successfully.
    *       501:
    *         description: Something went wrong.
    *       404:
    *         description: Data not found.
    */

    async userNftDetailsW(req, res, next) {
        let validationSchema = {
            contractAddress: Joi.string().required(),
            // _id: Joi.string().required(),
            tokenId: Joi.string().required()

        }
        try {
            const { contractAddress, tokenId } = await Joi.validate(req.body, validationSchema);
            const [contractResult, nftRes] = await Promise.all([
                findCollectionForNft({ contractAddress: req.body.contractAddress }),
                findNft({ tokenId: tokenId })
            ]);
            if (!contractResult) throw apiError.notFound(responseMessage.COLLECTION_NOT_FOUND);
            if (!nftRes) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);

            let query = { collectionId: contractResult._id, tokenId: tokenId }
            const orderRes = await findOrders1(query);

            console.log("result===>", orderRes);
            if (orderRes.length == 0) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            return res.json(new response(orderRes, responseMessage.DATA_FOUND));
        }
        catch (error) {
            console.log("==error==", error)
            return next(error);
        }
    }


    /**
    * @swagger
    * /user/addKYC:
    *   post:
    *     tags:
    *       - KYC MANAGEMENT
    *     description: addKYC by USER for verified user before send/Withdraw Coins from plateform
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: token
    *         description: token
    *         in: header
    *         required: true
    *       - name: addKYC
    *         description: addKYC
    *         in: body
    *         required: true
    *         schema:
    *           $ref: '#/definitions/addKYC'
    *     responses:
    *       200:
    *         description: Returns success message
    */

     async addKYC(req, res, next) {
        const validationSchema = {
            firstName:Joi.string().optional(),
            lastName:Joi.string().optional(),
            mobileNumber:Joi.string().optional(),
            email:Joi.string().optional(),
            gender:Joi.string().optional(),
            address:Joi.string().optional(),
            country:Joi.string().optional(),
            countrycode:Joi.string().optional(),
            state:Joi.string().optional(),
            city:Joi.string().optional(),
            city:Joi.string().optional(),
            fullAddress:Joi.string().optional(),
            passport: Joi.object({
                idNumber: Joi.string().optional(),
                documentName: Joi.string().optional(),
                frontImage: Joi.string().optional(),
                backImage: Joi.string().optional()
            }).allow('').optional(),
            national: Joi.object({
                idNumber: Joi.string().optional(),
                documentName: Joi.string().optional(),
                frontImage: Joi.string().optional(),
                backImage: Joi.string().optional()
            }).allow('').optional(),
            driving: Joi.object({
                idNumber: Joi.string().optional(),
                documentName: Joi.string().optional(),
                frontImage: Joi.string().optional(),
                backImage: Joi.string().optional()
            }).allow('').optional(),
            companyHolder: Joi.array().items().optional(),
            selectHolder: Joi.object().keys().optional()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let kycResutl = await findKYC({ userId: userResult._id, status: { $ne: status.DELETE } })
            if (kycResutl) {
                throw apiError.alreadyExist(responseMessage.KYC_EXIST);
            }

            if (validatedBody.passport) {
                validatedBody.passport.frontImage = validatedBody.passport.frontImage;
                validatedBody.passport.backImage = validatedBody.passport.backImage;
            }
            if (validatedBody.national) {
                validatedBody.national.frontImage = validatedBody.national.frontImage;
                validatedBody.national.backImage = validatedBody.national.frontImage;
            }
            if (validatedBody.driving) {
                validatedBody.driving.frontImage = validatedBody.driving.frontImage;
                validatedBody.driving.backImage = validatedBody.driving.backImage;
            }

            validatedBody.userId = userResult._id;
            let saveRes = await createKYC(validatedBody)
            return res.json(new response(saveRes, responseMessage.ADD_KYC));
        } catch (error) {
            console.log(error)
            return next(error);
        }
    }


    /**
     * @swagger
     * /user/viewKyc:
     *   get:
     *     tags:
     *       - KYC MANAGEMENT
     *     description: viewKyc for particular KYC details with _id
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
     async viewKyc(req, res, next) {
        try {
            let userResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            else {
                let kycResutl = await findKYC({ userId: userResult._id, status: { $ne: status.DELETE } })
                if (kycResutl) {
                    return res.json(new response(kycResutl, responseMessage.KYC_FOUND));
                }
                else {
                    throw apiError.notFound(responseMessage.KYC_NOT_FOUND);
                }
            }
        }
        catch (error) {
            return next(error);
        }
    }

    /**
    * @swagger
    * /user/editKYC:
    *   post:
    *     tags:
    *       - KYC MANAGEMENT
    *     description: update KYC details if anything wrong added or to confirm the KYC details is right
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: token
    *         description: token
    *         in: header
    *         required: true
    *       - name: editKYC
    *         description: editKYC
    *         in: body
    *         required: true
    *         schema:
    *           $ref: '#/definitions/editKYC'
    *     responses:
    *       200:
    *         description: Returns success message
    */
    async editKYC(req, res, next) {
        const validationSchema = {
            firstName:Joi.string().optional(),
            lastName:Joi.string().optional(),
            mobileNumber:Joi.string().optional(),
            email:Joi.string().optional(),
            gender:Joi.string().optional(),
            address:Joi.string().optional(),
            country:Joi.string().optional(),
            countrycode:Joi.string().optional(),
            state:Joi.string().optional(),
            city:Joi.string().optional(),
            city:Joi.string().optional(),
            fullAddress:Joi.string().optional(),
            passport: Joi.object({
                idNumber: Joi.string().optional(),
                documentName: Joi.string().optional(),
                frontImage: Joi.string().optional(),
                backImage: Joi.string().optional()
            }).allow('').optional(),
            national: Joi.object({
                idNumber: Joi.string().optional(),
                documentName: Joi.string().optional(),
                frontImage: Joi.string().optional(),
                backImage: Joi.string().optional()
            }).allow('').optional(),
            driving: Joi.object({
                idNumber: Joi.string().optional(),
                documentName: Joi.string().optional(),
                frontImage: Joi.string().optional(),
                backImage: Joi.string().optional()
            }).allow('').optional(),
            companyHolder: Joi.array().items().optional(),
            selectHolder: Joi.object().keys().optional()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let kycResutl = await findKYC({ userId: userResult._id, status: { $ne: status.DELETE } })
            if (!kycResutl) {
                throw apiError.notFound(responseMessage.KYC_NOT_FOUND);
            }

            if (validatedBody.passport) {
                validatedBody.passport.frontImage = validatedBody.passport.frontImage;
                validatedBody.passport.backImage = validatedBody.passport.backImage;
            }
            if (validatedBody.national) {
                validatedBody.national.frontImage = validatedBody.national.frontImage;
                validatedBody.national.backImage = validatedBody.national.backImage;
            }
            if (validatedBody.driving) {
                validatedBody.driving.frontImage = validatedBody.driving.frontImage;
                validatedBody.driving.backImage = validatedBody.driving.backImage;
            }
            validatedBody.approveStatus = kycApprove.PENDING
            let updateRes = await updateKYC({ userId: userResult._id }, validatedBody)
            await updateUser({ _id: userResult._id }, { kycVerified: false })
            return res.json(new response(updateRes, responseMessage.KYC_UPDATE));
        } catch (error) {
            console.log(error)
            return next(error);
        }
    }



}

export default new userController()



// 0x9360c80CA79409b5e315A9791bB0208C02D6ae32


// 0xD083d906acE91238b6a4a63EA1cd69Dc7fD0d0Ef