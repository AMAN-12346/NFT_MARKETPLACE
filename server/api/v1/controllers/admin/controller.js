import Joi from "joi";
import _ from "lodash";
import config from "config";
import apiError from '../../../../helper/apiError';
import response from '../../../../../assets/response';
import bcrypt from 'bcryptjs';

import responseMessage from '../../../../../assets/responseMessage';
import { userServices } from '../../services/user';
import { mediaServices } from '../../services/media';
import { socialLinkServices } from '../../services/socialLink';
import { eventServices } from '../../services/event';

const { createUser, findUser, updateUser, userList, findAllUsers } = userServices;
const { createMedia, findMedia, updateMedia, mediaList } = mediaServices;
const { findSocialLink, findAllSocialLink, updateSocialLink } = socialLinkServices;
const { findAllEvent, findEvent } = eventServices;

import commonFunction from '../../../../helper/util';
import jwt from 'jsonwebtoken';
import status from '../../../../enums/status';
import userType from "../../../../enums/userType";
import mediaType from "../../../../enums/mediaType";
import categoryModel from '../../../../models/category'




export class adminController {

    /**
     * @swagger
     * /admin/login:
     *   post:
     *     tags:
     *       - ADMIN 
     *     description: login ?? To login admin using admin credentials.
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: login
     *         description: login of ADMIN ...................
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/login'
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async login(req, res, next) {
        const validationSchema = {
            email: Joi.string().required(),
            password: Joi.string().required()
        };
        try {
            const { email, password } = await Joi.validate(req.body, validationSchema);
            let query = { $and: [{ userType: userType.ADMIN }, { email: email }] }
            var userResult = await findUser(query);
            if (!userResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            if (!bcrypt.compareSync(password, userResult.password)) {
                throw apiError.invalid(responseMessage.INCORRECT_LOGIN);
            }
            let token = await commonFunction.getToken({ _id: userResult._id, email: userResult.email, userType: userResult.userType });
            let obj = {
                _id: userResult._id,
                name: userResult.name,
                email: userResult.email,
                token: token,
                userType: userResult.userType
            }
            return res.json(new response(obj, responseMessage.LOGIN));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/forgotPassword:
     *   post:
     *     tags:
     *       - ADMIN
     *     description: forgotPassword ?? To change password to sent verification code to registred mail.
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: forgotPassword
     *         description: forgotPassword
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/forgotPassword'
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async forgotPassword(req, res, next) {
        var validationSchema = {
            email: Joi.string().required(),
        };
        try {
            var validatedBody = await Joi.validate(req.body, validationSchema);
            const { email } = validatedBody;
            var userResult = await findUser({ email: email })
            if (!userResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            var token = await commonFunction.getToken({ _id: userResult._id, userName: userResult.userName, email: userResult.email, mobileNumber: userResult.mobileNumber, userType: userResult.userType });
            await commonFunction.sendMail(userResult.email, userResult.name, token)
            await updateUser({ _id: userResult._id }, { isReset: false })
            return res.json(new response({}, responseMessage.RESET_LINK_SEND));
        }
        catch (error) {
            return next(error);
        }
    }


    /**
     * @swagger
     * /admin/resetPassword/{token}:
     *   put:
     *     tags:
     *       - ADMIN
     *     description: resetPassword ?? To reset password.
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: path
     *         required: true
     *       - name: resetPassword
     *         description: resetPassword
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/resetPassword'
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async resetPassword(req, res, next) {
        var validationSchema = {
            newPassword: Joi.string().required()
        };
        try {
            var validatedBody = await Joi.validate(req.body, validationSchema);
            const { token } = req.params;
            var result = jwt.verify(token, config.get('jwtsecret'));
            var userResult = await findUser({ _id: result._id });
            if (!userResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            if (userResult.isReset == true) {
                throw apiError.badRequest(responseMessage.LINK_EXPIRED);
            }
            await updateUser({ _id: userResult._id }, { isReset: true, password: bcrypt.hashSync(validatedBody.newPassword) })
            return res.json(new response({}, responseMessage.PWD_CHANGED));

        }
        catch (error) {
            return next(error);
        }
    }


    /**
     * @swagger
     * /admin/profile:
     *   get:
     *     tags:
     *       - ADMIN
     *     description: profile ?? To get profile details as per token auth.
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

    async profile(req, res, next) {
        try {
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            return res.json(new response(userResult, responseMessage.USER_DETAILS));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/editProfile:
     *   put:
     *     tags:
     *       - ADMIN
     *     description: editProfile ?? To editProfile details of admin by admin.
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
        var validationSchema = {
            name: Joi.string().optional(),
            email: Joi.string().optional(),
            countryCode: Joi.string().optional(),
            mobileNumber: Joi.string().optional(),
            profilePic: Joi.string().optional(),
            coverImage: Joi.string().optional(),
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            if (validatedBody.email) {
                var emailResult = await findUser({ email: validatedBody.email, _id: { $ne: adminResult._id }, status: { $ne: status.DELETE } });
                if (emailResult) {
                    throw apiError.conflict(responseMessage.EMAIL_EXIST);
                }
            }
            if (validatedBody.mobileNumber) {
                var mobileResult = await findUser({ mobileNumber: validatedBody.mobileNumber, _id: { $ne: adminResult._id }, status: { $ne: status.DELETE } });
                if (mobileResult) {
                    throw apiError.conflict(responseMessage.MOBILE_EXIST);
                }
            }
            if (req.files || req.files.length != 0) {
                let profilePic = req['files'].find((o) => { return o.fieldname == 'profilePic' });
                let coverImage = req['files'].find((o) => { return o.fieldname == 'coverImage' });
                if (profilePic) {
                    validatedBody.profilePic = await commonFunction.getImageUrlByPathObj(profilePic);
                }
                if (coverImage) {
                    validatedBody.coverImage = await commonFunction.getImageUrlByPathObj(coverImage);
                }
            }
            var result = await updateUser({ _id: adminResult._id }, { $set: validatedBody })
            return res.json(new response(result, responseMessage.UPDATE_SUCCESS));
        }
        catch (error) {
            console.log('Error ==>', error)
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/user/{_id}:
     *   get:
     *     tags:
     *       - ADMIN
     *     description: viewUser ?? to feetch viewUser details as per user.
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

    async viewUser(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required()
        }
        try {
            const { _id } = await Joi.validate(req.params, validationSchema);
            var adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN })
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            var result = await findUser({ _id: _id, status: { $ne: status.DELETE } });
            return res.json(new response(result, responseMessage.DETAILS_FETCHED));

        }
        catch (error) {
            return next(error)
        }
    }

    /**
     * @swagger
     * /admin/blockUnblockUser:
     *   patch:
     *     tags:
     *       - ADMIN
     *     description: blockUnblockUser ?? To block and unblock user via user id.
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: blockUnblockUser
     *         description: blockUnblockUser
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/blockUnblockUser'
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async blockUnblockUser(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
            status: Joi.string().valid(status.ACTIVE, status.BLOCK).required()
        }
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            var userResult = await findUser({ _id: req.userId, userType: userType.ADMIN })
            if (!userResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            var subResult = await findUser({ _id: validatedBody._id, status: { $ne: status.DELETE } });
            if (!subResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var result = await updateUser({ _id: subResult._id }, { status: validatedBody.status })
            return res.json(new response(result, validatedBody.status == status.BLOCK ? responseMessage.BLOCK_SUCCESS : responseMessage.UNBLOCK_SUCCESS));
        }
        catch (error) {
            return next(error)
        }
    }

    /**
     * @swagger
     * /admin/user:
     *   delete:
     *     tags:
     *       - ADMIN
     *     description: deleteUser ?? To delete user from the platform using user id.
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

    async deleteUser(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
        }
        try {
            const { _id } = await Joi.validate(req.query, validationSchema);
            var userResult = await findUser({ _id: req.userId, userType: userType.ADMIN })
            if (!userResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            var subResult = await findUser({ _id: _id, status: { $ne: status.DELETE } });
            if (!subResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var result = await updateUser({ _id: subResult._id }, { status: status.DELETE })
            return res.json(new response(result, responseMessage.DELETE_SUCCESS));
        }
        catch (error) {
            return next(error)
        }
    }

    /**
     * @swagger
     * /admin/userList:
     *   get:
     *     tags:
     *       - ADMIN
     *     description: userList ?? To fetch user list details.
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
     *         required: false
     *       - name: limit
     *         description: limit
     *         in: query
     *         required: false
     *       - name: search
     *         description: search
     *         in: query
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async userList(req, res, next) {
        const validationSchema = {
            page: Joi.number().optional(),
            fromDate: Joi.string().optional(),
            toDate: Joi.string().optional(),
            limit: Joi.number().optional(),
            search: Joi.string().optional()
        }
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            var userResult = await findUser({ _id: req.userId, userType: userType.ADMIN })
            if (!userResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            var result = await userList(validatedBody);
            return res.json(new response(result, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error)
        }
    }

    /**
     * @swagger
     * /admin/media:
     *   post:
     *     tags:
     *       - ADMIN
     *     description: addMedia ?? add media details.
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: title
     *         description: title
     *         in: formData
     *         required: true
     *       - name: description
     *         description: description
     *         in: formData
     *         required: true
     *       - name: type
     *         description: type-LOGO/GALLERY
     *         in: formData
     *         required: true
     *       - name: url
     *         description: url
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

    async addMedia(req, res, next) {
        const validationSchema = {
            title: Joi.string().required(),
            description: Joi.string().required(),
            type: Joi.string().valid(mediaType.GALLERY, mediaType.LOGO).required(),
            image: Joi.string().optional(),
            url: Joi.string().optional()
        }
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            var adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN })
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            let mediaResult = await findMedia({ title: validatedBody.title, status: { $ne: status.DELETE } });
            if (mediaResult) {
                throw apiError.conflict(responseMessage.DATA_EXIST);
            }
            if (req.files) {
                validatedBody.image = await commonFunction.getImageUrl(req.files);
            }

            let result = await createMedia(validatedBody);
            return res.json(new response(result, responseMessage.MEDIA_ADDED));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/media/{_id}:
     *   get:
     *     tags:
     *       - ADMIN
     *     description: viewMedia ?? to fetch media details via media id.
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

    async viewMedia(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
        }
        try {
            const { _id } = await Joi.validate(req.params, validationSchema);
            var adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN })
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            let result = await findMedia({ _id: _id, status: { $ne: status.DELETE } });
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
     * /admin/media:
     *   put:
     *     tags:
     *       - ADMIN
     *     description: editMedia ?? to edit media details.
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
     *       - name: title
     *         description: title
     *         in: formData
     *         required: false
     *       - name: description
     *         description: description
     *         in: formData
     *         required: false
     *       - name: url
     *         description: url
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

    async editMedia(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
            title: Joi.string().optional(),
            description: Joi.string().optional(),
            image: Joi.string().optional(),
            url: Joi.string().optional()
        }
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            var adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN })
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            let mediaResult = await findMedia({ _id: validatedBody._id, status: { $ne: status.DELETE } });
            if (!mediaResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            if (req.files && req.files.length != 0) {
                validatedBody.image = await commonFunction.getImageUrl(req.files);
            }
            let result = await updateMedia({ _id: mediaResult._id }, { $set: validatedBody });
            return res.json(new response(result, responseMessage.UPDATE_SUCCESS));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/changeMediaStatus:
     *   patch:
     *     tags:
     *       - ADMIN
     *     description: changeMediaStatus ?? To change media status.
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: changeMediaStatus
     *         description: changeMediaStatus
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/changeMediaStatus'
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async changeMediaStatus(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
            status: Joi.string().required()
        }
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            var adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN })
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            let mediaResult = await findMedia({ _id: validatedBody._id, status: { $ne: status.DELETE } });
            if (!mediaResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            let result = await updateMedia({ _id: mediaResult._id }, { $set: { status: validatedBody.status } });
            return res.json(new response(result, validatedBody.status == status.BLOCK ? responseMessage.BLOCK_SUCCESS : responseMessage.UNBLOCK_SUCCESS));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/media:
     *   delete:
     *     tags:
     *       - ADMIN
     *     description: deleteMedia ?? to delete media details.
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

    async deleteMedia(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
        }
        try {
            const { _id } = await Joi.validate(req.query, validationSchema);
            var adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN })
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            let mediaResult = await findMedia({ _id: _id, status: { $ne: status.DELETE } });
            if (!mediaResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            let result = await updateMedia({ _id: mediaResult._id }, { $set: { status: status.DELETE } });
            return res.json(new response(result, responseMessage.DELETE_SUCCESS));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/listMedia:
     *   get:
     *     tags:
     *       - ADMIN
     *     description: listMedia ?? To fetch list media details.
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
     *         required: false
     *       - name: limit
     *         description: limit
     *         in: query
     *         required: false
     *       - name: search
     *         description: search
     *         in: query
     *         required: false
     *       - name: type
     *         description: type-LOGO/GALLERY
     *         in: query
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async listMedia(req, res, next) {
        const validationSchema = {
            type: Joi.string().optional(),
            search: Joi.string().optional(),
            fromDate: Joi.string().optional(),
            toDate: Joi.string().optional(),
            page: Joi.number().optional(),
            limit: Joi.number().optional(),
        }
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            var adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN })
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            let result = await mediaList(validatedBody);
            if (result.docs.length == 0) {
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
     * /admin/socialLinkList:
     *   get:
     *     tags:
     *       - ADMIN
     *     description: socialLinkList ?? To fetch all socialLink list.
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

    async socialLinkList(req, res, next) {
        try {
            var adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN })
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            let result = await findAllSocialLink({ status: { $ne: status.DELETE } });
            return res.json(new response(result, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/socialLink:
     *   put:
     *     tags:
     *       - ADMIN
     *     description: editSocialLink ?? to edit social link of platform.
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: editSocialLink
     *         description: editSocialLink
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/editSocialLink'
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async editSocialLink(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
            link: Joi.string().required()
        }
        try {
            const { _id, link } = await Joi.validate(req.body, validationSchema);
            var adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            var socialLinkResult = await findSocialLink({ _id: _id, status: status.ACTIVE });
            if (!socialLinkResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            let result = await updateSocialLink({ _id: socialLinkResult._id }, { $set: { link: link } });
            return res.json(new response(result, responseMessage.UPDATE_SUCCESS));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/dashboard:
     *   get:
     *     tags:
     *       - ADMIN
     *     description: dashboard ?? To fetch dashboard all count details like register user, active user, complete events and liveUpcomingevents.
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

    async dashboard(req, res, next) {
        try {
            var adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN })
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            let result = {
                totalRegisteredUser: 0,
                activeUser: 0,
                blockUser: 0,
                completedEvents: 0,
                liveUpcomingEvents: 0
            }
            result.totalRegisteredUser = (await findAllUsers({ status: { $ne: status.DELETE } })).length;
            result.activeUser = (await findAllUsers({ status: status.ACTIVE })).length;
            result.blockUser = (await findAllUsers({ status: status.BLOCK })).length;
            result.completedEvents = (await findAllEvent({ status: status.ACTIVE, endDate: { $lt: new Date().toISOString() } })).length;
            result.liveUpcomingEvents = (await findAllEvent({ status: status.ACTIVE, endDate: { $gte: new Date().toISOString() } })).length
            return res.json(new response(result, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
    * @swagger
    * /admin/editBanner:
    *   put:
    *     tags:
    *       - BANNER MANAGEMENT
    *     description: editBanner--> <br>Update banner details.
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: token
    *         description: Admin token
    *         in: header
    *         required: true
    *       - name: editBanner
    *         description: editBanner
    *         in: body
    *         required: true
    *         schema:
    *           $ref: '#/definitions/editBanner'
    *     responses:
    *       200:
    *         description:  successfully.
    */
    async editBanner(req, res, next) {
        // const validationSchema = {
        //     _id: Joi.string().required(),
        //     bannerName: Joi.string().optional(),
        //     bannerImage: Joi.string().optional(),
        //     description: Joi.string().optional()
        // };
        try {
            const validatedBody = await Joi.validate(req.body);
            const { _id, bannerName, bannerImage } = validatedBody;
            var adminCheck = await findUser({ _id: req.userId, userType: userType.ADMIN, status: { $ne: status.DELETE } });
            if (!adminCheck) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            } else {
                var bannerInfo = await findBanner({ _id: validatedBody._id, status: { $ne: status.DELETE } });
                if (!bannerInfo) {
                    throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
                } else {
                    let updateBanner = await updatebannerById({ _id: bannerInfo._id }, validatedBody)
                    return res.json(new response(updateBanner, responseMessage.UPDATE_SUCCESS))
                }
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/addCategory:
     *   post:
     *     tags:
     *       - CATEGORY MANAGEMENT
     *     summary: Api used for add categories by admin.
     *     description: addCategory--> <br>Api used for add categories by admin.
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token -> admin
     *         in: header
     *         required: true
     *       - name: name
     *         description: category name
     *         in: formData
     *         required: true
     *     responses:
     *       200:
     *         description: Category add successfully.
     *       404:
     *         description: User not found || Data not found.
     *       409:
     *         description: Data already exits.
     *       501:
     *         description: Something went wrong!
     */
    async addCategory(req, res, next) {
        try {
            console.log("-----------req.body",req.body);
            const validateBody = await Joi.validate(req.body);
            let authCheck = await findUser({ _id: req.userId, userType: userType.ADMIN, status: status.ACTIVE });
            if (!authCheck) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND)
            }
            else {
                let categoryCheck = await categoryModel.findOne({ name: validateBody.name, status: status.ACTIVE })
                console.log("-----------categoryCheck",categoryCheck);
                if (categoryCheck) {
                    throw apiError.conflict(responseMessage.ALREADY_EXITS)
                } else {
                    var saveRes = await categoryModel(validateBody).save();
                    return res.json(new response(saveRes, responseMessage.CATEGORY_CREATED));
                }
            }
        } catch (error) {
            return next(error)
        }
    }

    /**
     * @swagger
     * /admin/editCategory:
     *   put:
     *     tags:
     *       - CATEGORY MANAGEMENT
     *     summary: Update category details by admin.
     *     description: editCategory-> <br>Update category details by admin.
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token -> admin
     *         in: header
     *         required: true
     *       - name: _id
     *         description: _id
     *         in: formData
     *         required: true
     *       - name: name
     *         description: category name
     *         in: formData
     *         required: false
     *     responses:
     *       200:
     *         description: Category updated successfully.
     *       404:
     *         description: User not found || Data not found.
     *       409:
     *         description: Data already exits.
     *       501:
     *         description: Something went wrong!
     */
    async editCategory(req, res, next) {
        try {
            const validateBody = await Joi.validate(req.body);
            let authCheck = await findUser({ _id: req.userId, userType: userType.ADMIN, status: status.ACTIVE });
            if (!authCheck) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND)
            }
            else {
                let categoryCheck = await categoryModel.findOne({ _id: validateBody._id, status: status.ACTIVE })
                if (!categoryCheck) {
                    throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
                } else {
                    var UpdateRes = await categoryModel.findByIdAndUpdate({ _id: categoryCheck._id }, {$set:validateBody},{new:true});
                    return res.json(new response(UpdateRes, responseMessage.EDIT_CATEGORY));
                }
            }
        } catch (error) {
            return next(error)
        }

    }

    /**
     * @swagger
     * /admin/viewCategory:
     *   get:
     *     tags:
     *       - CATEGORY MANAGEMENT
     *     summary: view category details by admin and user
     *     description: viewCategory--> <br>view category details by admin and user
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: _id
     *         description: category _id
     *         in: query
     *         required: true
     *     responses:
     *       200:
     *         description: Data found successfully.
     *       404:
     *         description: User not found || Data not found.
     *       501:
     *         description: Something went wrong!
     */
    async viewCategory(req, res, next) {
        try {
            const validateBody = await Joi.validate(req.query);
            let categoryCheck = await categoryModel.findOne({ _id: validateBody._id, status: status.ACTIVE })
            if (!categoryCheck) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            } else {
                return res.json(new response(categoryCheck, responseMessage.DATA_FOUND));
            }
        } catch (error) {
            return next(error)
        }

    }

    /**
    * @swagger
    * /admin/listCategory:
    *   post:
    *     tags:
    *       - CATEGORY MANAGEMENT
    *     summary: List all categories added by admin and user.
    *     description: listCategory--> <br>List all categories added by admin and user.
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: search
    *         description: search by categoryName
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
    *         required: false
    *       - name: limit
    *         description: limit
    *         in: formData
    *         required: false
    *     responses:
    *       200:
    *         description: Data found successfully.
    *       404:
    *         description: User not found || Data not found.
    *       501:
    *         description: Something went wrong!
    */
    async listCategory(req, res, next) {
        try {
            const validatedBody = await Joi.validate(req.body);
            let query = {status: { $ne: status.DELETE }}
            if (!validatedBody.page && !validatedBody.limit) {
                let categoryCheck = await categoryModel.find(query);
                if (categoryCheck.length == 0) {
                    throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
                }
                return res.json(new response({ docs: categoryCheck }, responseMessage.DATA_FOUND))
            }
            else {
                let options={
                    page:Number(validatedBody.page)||1,
                    limit:Number(validatedBody.limit)||15,
                    sort: { createdAt: -1 }
                }
                let resultCategory = await categoryModel.paginate(query,options);
                if (resultCategory.docs.length == 0) {
                    throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
                }
                return res.json(new response(resultCategory, responseMessage.DATA_FOUND));
            }
        } catch (error) {
            return next(error);
        }
    }

}

export default new adminController()

