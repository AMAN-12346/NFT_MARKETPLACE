import Joi from "joi";
import _ from "lodash";
import config from "config";
import apiError from '../../../../helper/apiError';
import response from '../../../../../assets/response';
import bcrypt from 'bcryptjs';
import responseMessage from '../../../../../assets/responseMessage';
import { userServices } from '../../services/user';
import { eventServices } from '../../services/event';
import { practiceServices } from '../../services/practice';
import { petstoreServices } from '../../services/petstore';
import { nftServices } from '../../services/nft';
import { socialLinkServices } from '../../services/socialLink';
import { eventRacingServices } from '../../services/eventRacing';
import { mediaServices } from '../../services/media';
import { newsletterServices } from '../../services/newsletter';
const { createUser, findUser, updateUser, findUserWithPopulate } = userServices;
const { findAllEvent, findEvent, updateEvent } = eventServices;
const { findAllPractice } = practiceServices;
const { findAllPetstore, findPetstore, updatePetstore } = petstoreServices;
const { findAllNft, findNft, updateNft,findAllNft1 } = nftServices;
const { findAllSocialLink } = socialLinkServices;
const { createEventRacing, findEventRacing, findEventRacingWithPopulate, updateEventRacing, profileStats, updateManyEventRacing } = eventRacingServices;
const { findAllMedia } = mediaServices;
const { createNewsletterContent } = newsletterServices;
import commonFunction from '../../../../helper/util';
import jwt from 'jsonwebtoken';
import status from '../../../../enums/status';
import userType from "../../../../enums/userType";
import mediaType from "../../../../enums/mediaType";



export class userController {

    /**
     * @swagger
     * /user/connectWallet:
     *   post:
     *      tags:
     *       - USER
     *      description: connectWallet
     *      produces:
     *        - application/json
     *      parameters:
     *        - name: connectWallet
     *          description: connectWallet ?? Connect with metamask for signin the platform
     *          in: body
     *          required: true
     *          schema:
     *           $ref: '#/definitions/connectWallet'
     *      responses:
     *       200:
     *         description: Wallet connected successfully.
     *       500:
     *         description: Internal Server Error.
     *       501:
     *         description: Something went wrong!
     */
    async connectWallet(req, res, next) {
        const validationSchema = {
            walletAddress: Joi.string().required()
        }
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema)
            let resultRes = await findUser({ walletAddress: validatedBody.walletAddress, status: { $ne: status.DELETE } })
            if (resultRes) {
                var token = await commonFunction.getToken({ _id: resultRes._id, userType: resultRes.userType });
                var obj = {
                    _id: resultRes._id,
                    walletAddress: resultRes.walletAddress,
                    userType: resultRes.userType,
                    token: token
                }
                return res.json(new response(obj, responseMessage.LOGIN));
            }
            else {
                let saveRes = await createUser(validatedBody)
                var token = await commonFunction.getToken({ _id: saveRes._id, userType: saveRes.userType });
                var obj = {
                    _id: saveRes._id,
                    walletAddress: saveRes.walletAddress,
                    userType: saveRes.userType,
                    token: token
                }
                return res.json(new response(obj, responseMessage.LOGIN));
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /user/getProfile:
     *   get:
     *     tags:
     *       - USER
     *     description: profile ?? To get user profile details.
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
    async getProfile(req, res, next) {
        try {
            let userResult = await findUserWithPopulate({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let nftResult = await findAllNft1({ userId: userResult._id, status: status.ACTIVE });
            var nfts;
            if (nftResult.length != 0) {
                nfts = JSON.parse(JSON.stringify(nftResult));
                for (let i in nfts) {
                    nfts[i].properties = JSON.parse(nfts[i]['properties']);
                }
            }
            var result = {
                _id: userResult._id,
                walletAddress: userResult.walletAddress,
                name: userResult.name,
                email: userResult.email,
                userType: userResult.userType,
                country: userResult.country,
                countryCode: userResult.countryCode,
                mobileNumber: userResult.mobileNumber,
                profilePic: userResult.profilePic,
                coverImage: userResult.coverImage,
                bio: userResult.bio,
                petstores: userResult.petstores,
                nfts: nftResult.length != 0 ? nfts : []
            }
            return res.json(new response(result, responseMessage.USER_DETAILS));
        } catch (error) {
            console.log('142 ==>', error)
            return next(error);
        }
    }

    /**
     * @swagger
     * /user/editProfile:
     *   put:
     *     tags:
     *       - USER
     *     description: editProfile ?? Edit user profile details.
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
     *         required: false
     *       - name: email
     *         description: email
     *         in: formData
     *         required: false
     *       - name: countryCode
     *         description: countryCode
     *         in: formData
     *         required: false
     *       - name: mobileNumber
     *         description: mobileNumber
     *         in: formData
     *         required: false
     *       - name: bio
     *         description: bio
     *         in: formData
     *         required: false
     *       - name: profilePic
     *         description: profilePic
     *         in: formData
     *         type: file
     *         required: false
     *       - name: coverImage
     *         description: coverImage
     *         in: formData
     *         type: file
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async editProfile(req, res, next) {
        try {
            let userResult = await findUser({ _id: req.userId, userType: userType.USER });
            if (!userResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            if (req.body.email && req.body.email != '') {
                var emailResult = await findUser({ email: req.body.email, _id: { $ne: userResult._id }, status: { $ne: status.DELETE } });
                if (emailResult) {
                    throw apiError.conflict(responseMessage.EMAIL_EXIST);
                }
            }
            if (req.body.mobileNumber && req.body.mobileNumber != '') {
                var mobileResult = await findUser({ mobileNumber: req.body.mobileNumber, _id: { $ne: userResult._id }, status: { $ne: status.DELETE } });
                if (mobileResult) {
                    throw apiError.conflict(responseMessage.MOBILE_EXIST);
                }
            }
            if (req.files && req.files.length != 0) {
                if (req['files'].find((o) => { return o.fieldname == 'profilePic' })) { req.body.profilePic = await commonFunction.getImageUrlByPathObj(req['files'].find((o) => { return o.fieldname == 'profilePic' })) };
                if (req['files'].find((o) => { return o.fieldname == 'coverImage' })) { req.body.coverImage = await commonFunction.getImageUrlByPathObj(req['files'].find((o) => { return o.fieldname == 'coverImage' })) };
            }
            var result = await updateUser({ _id: userResult._id }, { $set: req.body })
            return res.json(new response(result, responseMessage.UPDATE_SUCCESS));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
    * @swagger
    * /user/upcomingEvents:
    *   get:
    *     tags:
    *       - USER
    *     description: upcomingEvents ?? Fetch all live upcoming game events list.
    *     produces:
    *       - application/json
    *     responses:
    *       200:
    *         description: Returns success message
    */

    async upcomingEvents(req, res, next) {
        try {
            var result = await findAllEvent({ status: status.ACTIVE, endDate: { $gte: new Date().toISOString() } });
            return res.json(new response(result, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
    * @swagger
    * /user/pastEvents:
    *   get:
    *     tags:
    *       - USER
    *     description: pastEvents
    *     produces:
    *       - application/json
    *     responses:
    *       200:
    *         description: Returns success message
    */

    async pastEvents(req, res, next) {
        try {
            var result = await findAllEvent({ status: status.ACTIVE, endDate: { $lt: new Date().toISOString() } });
            result.sort((a, b) => (a.startDate < b.startDate) ? 1 : ((b.startDate < a.startDate) ? -1 : 0));
            return res.json(new response(result, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error);
        }
    }

    // /**
    // * @swagger
    // * /user/allPracticeModes:
    // *   get:
    // *     tags:
    // *       - USER
    // *     description: allPracticeModes 
    // *     produces:
    // *       - application/json
    // *     responses:
    // *       200:
    // *         description: Returns success message
    // */

    async allPracticeModes(req, res, next) {
        try {
            var result = await findAllPractice({ status: status.ACTIVE });
            return res.json(new response(result, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
    * @swagger
    * /user/petstores:
    *   get:
    *     tags:
    *       - USER
    *     description: petstores ?? To fetch all petstore details.
    *     produces:
    *       - application/json
    *     responses:
    *       200:
    *         description: Returns success message
    */

    async getPetstores(req, res, next) {
        try {
            var result = await findAllPetstore({ status: status.ACTIVE });
            return res.json(new response(result, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
    * @swagger
    * /user/socialLinks:
    *   get:
    *     tags:
    *       - USER
    *     description: getSocialLinks ?? All social link list of platform.
    *     produces:
    *       - application/json
    *     responses:
    *       200:
    *         description: Returns success message
    */

    async getSocialLinks(req, res, next) {
        try {
            let result = await findAllSocialLink({ status: status.ACTIVE });
            return res.json(new response(result, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /user/buyPetstore:
     *   post:
     *      tags:
     *       - USER
     *      description: buyPetstore ?? Buy petstore details as per petstoreId and dogId with dogProperties.
     *      produces:
     *        - application/json
     *      parameters:
     *        - name: token
     *          description: token
     *          in: header
     *          required: true
     *        - name: buyPetstore
     *          description: buyPetstore
     *          in: body
     *          required: true
     *          schema:
     *           $ref: '#/definitions/buyPetstore'
     *      responses:
     *       200:
     *         description: Wallet connected successfully.
     *       500:
     *         description: Internal Server Error.
     *       501:
     *         description: Something went wrong!
     */
    async buyPetstore(req, res, next) {
        const validationSchema = {
            petstoreId: Joi.string().required(),
            dogId: Joi.string().required(),
            dogProperties: Joi.string().required(),
        }
        try {
            const { petstoreId, dogId, dogProperties } = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId, userType: userType.USER });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var petstoreResult = await findPetstore({ _id: petstoreId, status: status.ACTIVE });
            if (!petstoreResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            let nftResult = await findNft({ _id: dogId, userId: userResult._id, status: { $ne: status.DELETE } });
            if (!nftResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            await updateNft({ _id: nftResult._id }, { $set: { properties: dogProperties } });
            let data = await findUser({ _id: userResult._id, petstores: { $elemMatch: { petstoreId: petstoreId, dogId: dogId } } });
            if (data) {
                throw apiError.conflict(responseMessage.ALREADY_BUY);
            }
            let result = await updateUser({ _id: userResult._id }, { $addToSet: { petstores: { petstoreId: petstoreId, dogId: dogId } } });
            return res.json(new response(result, responseMessage.BUY_SUCCESS));


        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /user/uploadFile:
     *   post:
     *     tags:
     *       - USER
     *     description: uploadFile ?? To get secure url of image/video/file from the cloud after uploading.
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
     *         description: Returns success message
     */

    async uploadFile(req, res, next) {
        try {
            let result = await commonFunction.getImageUrl(req.files);
            return res.json(new response(result, responseMessage.UPLOAD_SUCCESS));

        }
        catch (error) {
            return next(error);
        }
    }

    async assignDriver(req, res, next) {
        const validationSchema = {
            eventId: Joi.string().required(),
            driverName: Joi.string().required()
        }
        try {
            const { eventId, driverName } = await Joi.validate(req.body, validationSchema);
            var userResult = await findUser({ _id: req.userId, userType: userType.USER })
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let eventResult = await findEvent({ _id: eventId, status: status.ACTIVE });
            if (!eventResult) {
                throw apiError.notFound(responseMessage.EVENT_NOT_EXIST);
            }
            var eventRacingResult = await findEventRacing({ eventId: eventResult._id, userId: userResult._id, status: status.ACTIVE, isComplete: false });
            if (!eventRacingResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            await updateEventRacing({ _id: eventRacingResult._id }, { $set: { driverAssigned: driverName, linkExpired: false } });
            let result = {
                link: `${config.get('driverLink')}?eventId=${eventId}&_id=${eventRacingResult._id}&userId=${req.userId}&driverAssigned=${driverName}&token=${req.headers.token}`
            }
            return res.json(new response(result, responseMessage.DRIVER_ASSIGNED));
        }
        catch (error) {
            return next(error);
        }
    }


    async driverConfirmation(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
            driverAssigned: Joi.string().required()
        }
        try {
            const { _id, driverAssigned } = await Joi.validate(req.query, validationSchema);
            var eventRacingResult = await findEventRacing({ _id: _id, driverAssigned: driverAssigned, status: status.ACTIVE, isComplete: false });
            if (!eventRacingResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            if (eventRacingResult.linkExpired == true) {
                throw apiError.notAllowed(responseMessage.LINK_EXPIRED)
            }
            await updateEventRacing({ _id: eventRacingResult._id }, { $set: { linkExpired: true } });
            return res.json(new response({}, responseMessage.UPDATE_SUCCESS));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /user/mediaList:
     *   get:
     *     tags:
     *       - USER
     *     description: mediaList ?? To fetch all media list
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: type
     *         description: type-LOGO/GALLERY
     *         in: query
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async mediaList(req, res, next) {
        const validationSchema = {
            type: Joi.string().valid(mediaType.GALLERY, mediaType.LOGO).required(),
        }
        try {
            const { type } = await Joi.validate(req.query, validationSchema);
            let result = await findAllMedia({ type: type, status: status.ACTIVE })
            return res.json(new response(result, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /user/getEventDetails:
     *   get:
     *     tags:
     *       - USER 
     *     description: getEventDetails ?? Get events details of game with page and limit as per user.
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: position
     *         description: position
     *         in: query
     *         enum: [ALL,WON,LOOS]
     *         required: false
     *       - name: page
     *         description: page
     *         in: query
     *         required: false
     *       - name: limit
     *         description: limit
     *         in: query
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async getEventDetails(req, res, next) {
        try {
            let userResult = await findUserWithPopulate({ _id: req.userId, userType: userType.USER });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let query = { isComplete: true, userId: userResult._id, status: status.ACTIVE };
            req.query.limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 10;
            req.query.page = parseInt(req.query.page) ? parseInt(req.query.page) : 1;
            if (req.query.position == 'WON') {
                query.points = { $gt: 0 };
            }
            if (req.query.position == 'LOOS') {
                query.points = { $eq: 0 };
            }
            let eventRacingDetails = await profileStats(query);
            let result = {
                docs: await commonFunction.paginateGood(eventRacingDetails, req.query.limit, req.query.page),
                total: eventRacingDetails.length,
                limit: req.query.limit,
                page: req.query.page,
                pages: Math.ceil(eventRacingDetails.length / req.query.limit)
            }
            return res.json(new response(result, responseMessage.USER_DETAILS));
        } catch (error) {
            return next(error);
        }
    }



    /**
     * @swagger
     * /user/subscribeNewsletter:
     *   post:
     *     tags:
     *       - USER
     *     description: subscribeNewsletter ?? To subscribe newsletter section and notified to admin via email services.
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: email
     *         description: email
     *         in: formData
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async subscribeNewsletter(req, res, next) {
        try {
            let adminResult = await findUser({ userType: userType.ADMIN });
            commonFunction.subscribeMail(adminResult.email, adminResult.userType, req.body.email);
            let result = await createNewsletterContent(req.body);
            return res.json(new response(result, responseMessage.SUBSCRIBE_SUCCESS));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /user/likeDislikeEvent:
     *   post:
     *     tags:
     *       - USER
     *     description: likeDislikeEvent ?? Simple like/dislike events as per user choice.
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: eventId
     *         description: _id of event
     *         in: formData
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async likeDislikeEvent(req, res, next) {
        const validationSchema = {
            eventId: Joi.string().required()
        }
        try {
            let result;
            const { eventId } = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId, userType: userType.USER });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let eventResult = await findEvent({ _id: eventId, status: status.ACTIVE });
            if (!eventResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            let likeExist = await findEvent({ _id: eventId, likesUsers: userResult._id, status: status.ACTIVE });
            if (likeExist) {
                result = await updateEvent({ _id: eventResult._id }, { $pull: { likesUsers: userResult._id } });
                return res.json(new response(result, responseMessage.EVENT_DISLIKED));
            }
            else {
                result = await updateEvent({ _id: eventResult._id }, { $addToSet: { likesUsers: userResult._id } });
                return res.json(new response(result, responseMessage.EVENT_LIKED));
            }

        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /user/likeDislikePetStore:
     *   post:
     *     tags:
     *       - USER
     *     description: likeDislikePetStore ?? Simple like/dislike petstore as per user choice.
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: petStoreId
     *         description: _id of event
     *         in: formData
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async likeDislikePetStore(req, res, next) {
        const validationSchema = {
            petStoreId: Joi.string().required()
        }
        try {
            let result;
            const { petStoreId } = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId, userType: userType.USER });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let petStoreResult = await findPetstore({ _id: petStoreId, status: status.ACTIVE });
            if (!petStoreResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            let likeExist = await findPetstore({ _id: petStoreId, likesUsers: userResult._id, status: status.ACTIVE });
            if (likeExist) {
                result = await updatePetstore({ _id: petStoreResult._id }, { $pull: { likesUsers: userResult._id } });
                return res.json(new response(result, responseMessage.ITEM_DISLIKED));
            }
            else {
                result = await updatePetstore({ _id: petStoreResult._id }, { $addToSet: { likesUsers: userResult._id } });
                return res.json(new response(result, responseMessage.ITEM_LIKED));
            }

        }
        catch (error) {
            return next(error);
        }
    }
}



export default new userController()
