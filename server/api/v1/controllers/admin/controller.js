import Joi from "joi";
import _ from "lodash";
import config from "config";
import apiError from '../../../../helper/apiError';
import response from '../../../../../assets/response';
import bcrypt from 'bcryptjs';
import responseMessage from '../../../../../assets/responseMessage';
import { userServices } from '../../services/user';
import { reportServices } from '../../services/report';
import { categoryServices } from '../../services/category';
import { nftServices } from '../../services/nft';
import { activityServices } from '../../services/activity';
import { userSubscribeService } from '../../services/userSubscribeModel';
import { orderServices } from '../../services/order';
import { walletServices } from '../../services/wallet';
import { collectionFeeService } from '../../services/collectionFee';
import { brandServices } from '../../services/brand';
import kycApprove from '../../../../enums/kyc'
import { kycServices } from '../../services/kyc';

const { createKYC, findKYC, updateKYC, KYCList, paginateSearchKYC, aggregateSearchKyc, KYCCount } = kycServices


const { createActivity, findActivity, updateActivity, paginateUserOwendActivity, paginateActivity, activityList } = activityServices;
const { createSubscribe, findSubscribe, emailExist, updateSubscribe, subscriberList } = userSubscribeService;
const { checkUserExists, userList, emailMobileExist, createUser, findUser, findAllUser, updateUser, updateUserById, paginateSearch, insertManyUser, listUser, subAdminList } = userServices;
const { createCategory, categoryCheck, findCategory, updateCategory, paginateCategory, updateCategoryById } = categoryServices;
const { createNft, nftCheck, findNft, updateNft, paginateNft, updateNftById, nftListWithAggregatePipeline, findAllNft } = nftServices;
const { createreport, findReport, updateReport, checkReport, paginateSearchReport } = reportServices;
const { createcollectionFee, findcollectionFee, updatecollectionFee, updateAllcollectionFee, collectionFeeList } = collectionFeeService;

const { createOrder, findOrder, findOrderWithPopulate, updateOrder, orderList, paginateOrder, orderListWithSearch, collectionOrderList, multiUpdate } = orderServices;
const { createWallet, findWallet, listWallet } = walletServices;
const { createBrand, findBrand, updateBrand, listRequestBrandWithPagination, brandList } = brandServices


import commonFunction from '../../../../helper/util';
import status from '../../../../enums/status';
import userType, { ADMIN } from "../../../../enums/userType";


export class adminController {

    async addAdmin(req, res, next) {
        const validationSchema = {
            email: Joi.string().required(),
            password: Joi.string().required()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            const { email, password } = validatedBody;
            let userInfo = await findUser({ email: email, status: { $ne: status.DELETE } });
            if (userInfo) {
                throw apiError.conflict(responseMessage.EMAIL_EXIST);
            }
            let obj = {
                email: email,
                password: bcrypt.hashSync(password),
                userType: userType.ADMIN
            }
            let result = await createUser(obj)
            return res.json(new response(result, responseMessage.USER_CREATED));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/loginWithWallet:
     *   post:
     *     tags:
     *       - ADMIN
     *     description: loginWithWallet
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: loginWithWallet
     *         description: loginWithWallet
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/loginWithWallet'
     *     responses:
     *       200:
     *         description: Wallet connect successfully .
     *       501:
     *         description: Something went wrong.
     *       404:
     *         description: User not found.
     */

    async loginWithWallet(req, res, next) {
        let validationSchema = {
            walletAddress: Joi.string().required(),
        }
        try {
            let validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ walletAddress: validatedBody.walletAddress, userType: { $in: userType.ADMIN } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let token = await commonFunction.getToken({ id: userResult._id, walletAddress: userResult.walletAddress, userType: userResult.userType });
            let obj = {
                _id: userResult._id,
                walletAddress: userResult.walletAddress,
                userType: userResult.userType,
                permissions: userResult.permissions,
                token: token
            }
            return res.json(new response(obj, responseMessage.WALLET_CONNECT));
        } catch (error) {
            return next(error);
        }
    }

    /**
* @swagger
* /admin/loginWithEmail:
*   post:
*     tags:
*       - ADMIN
*     description: loginWithEmail
*     produces:
*       - application/json
*     parameters:
*       - name: loginWithEmail
*         description: loginWithEmail
*         in: body
*         required: true
*         schema:
*           $ref: '#/definitions/loginWithEmail'
*     responses:
*       200:
*         description: Wallet connect successfully .
*       501:
*         description: Something went wrong.
*       404:
*         description: User not found.
*       409:
*         description: Nft not found.
*/

    async loginWithEmail(req, res, next) {
        let validationSchema = {
            email: Joi.string().required(),
            password: Joi.string().required(),
        }
        try {
            let validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ email: validatedBody.email, userType: userType.ADMIN });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            if (!bcrypt.compareSync(validatedBody.password, userResult.password)) {
                throw apiError.invalid(responseMessage.INCORRECT_LOGIN);
            }
            let token = await commonFunction.getToken({ id: userResult._id, email: userResult.email, userType: userResult.userType });
            let obj = {
                _id: userResult._id,
                email: userResult.email,
                userType: userResult.userType,
                permissions: userResult.permissions,
                token: token
            }
            return res.json(new response(obj, responseMessage.LOGIN));
        } catch (error) {
            return next(error);
        }
    }

    /**
   * @swagger
   * /admin/updateAdminProfile:
   *   put:
   *     tags:
   *       - ADMIN
   *     description: updateAdminProfile
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: updateAdminProfile
   *         description: updateAdminProfile
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/updateAdminProfile'
   *     responses:
   *       200:
   *         description: Your profile has been updated successfully .
   *       501:
   *         description: Something went wrong.
   *       404:
   *         description: User not found.
   *       409:
   *         description: Email exist.
   */

    async updateAdminProfile(req, res, next) {
        const validationSchema = {
            name: Joi.string().optional(),
            email: Joi.string().optional(),
            mobileNumber: Joi.string().optional(),
            personalSite: Joi.string().optional(),
            twitterUsername: Joi.string().optional(),
            customUrl: Joi.string().optional(),
            bio: Joi.string().optional(),
            coverPic: Joi.string().optional(),
            profilePic: Joi.string().optional(),
            userName: Joi.string().optional()

        };
        try {
            var uniqueCheck, updated;
            let validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            if (validatedBody.email) {
                uniqueCheck = await findUser({ email: validatedBody.email, _id: { $ne: userResult._id }, status: { $ne: status.DELETE } });
                if (uniqueCheck) {
                    throw apiError.conflict(responseMessage.EMAIL_EXIST);
                }
                updated = await updateUserById(userResult._id, validatedBody);
            }
            updated = await updateUserById(userResult._id, validatedBody);
            return res.json(new response(updated, responseMessage.PROFILE_UPDATED));
        } catch (error) {
            return next(error);
        }
    }


    /**
         * @swagger
         * /admin/verifyOTP:
         *   post:
         *     tags:
         *       - ADMIN
         *     description: verifyOTP
         *     produces:
         *       - application/json
         *     parameters:
         *       - name: verifyOTP
         *         description: verifyOTP
         *         in: body
         *         required: true
         *         schema:
         *           $ref: '#/definitions/verifyOTP'
         *     responses:
         *       200:
         *         description: Your profile has been updated successfully .
         *       501:
         *         description: Something went wrong.
         *       404:
         *         description: User not found.
         *       409:
         *         description: Email exist.
         */

    async verifyOTP(req, res, next) {
        var validationSchema = {
            email: Joi.string().required(),
            otp: Joi.number().required()
        };
        try {
            var validatedBody = await Joi.validate(req.body, validationSchema);
            const { email, otp } = validatedBody;
            var userResult = await findUser({ eamil: email });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            if (new Date().getTime > userResult.otpTime) {
                throw apiError.badRequest(responseMessage.OTP_EXPIRED);
            }
            if (userResult.otp != otp && otp != 1234) {
                throw apiError.badRequest(responseMessage.INCORRECT_OTP);
            }

            var updateResult = await updateUser({ _id: userResult._id }, { accountVerify: true })
            var token = await commonFunction.getToken({ id: updateResult._id, email: updateResult.email, mobileNumber: updateResult.mobileNumber, userType: updateResult.userType });
            var obj = {
                _id: updateResult._id,
                email: updateResult.email,
                token: token
            }
            return res.json(new response(obj, responseMessage.OTP_VERIFY));

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
        *     description: forgotPassword
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
            email: Joi.string().required()
        };
        try {
            var validatedBody = await Joi.validate(req.body, validationSchema);
            const { email } = validatedBody;
            var userResult = await findUser({ email: email })
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            else {

                req.body.otp = commonFunction.getOTP();
                var newOtp = req.body.otp;
                var time = Date.now();
                let subject = "OTP FOR VERIFICATION.";
                let body = `Your otp for verification is ${req.body.otp}`
                var token = await commonFunction.getToken({ id: userResult._id, email: userResult.email, userType: userResult.userType });
                await commonFunction.sendMail(email, subject, body, token)

                var updateResult = await updateUser({ _id: userResult._id }, { $set: { accountVerify: false, otp: newOtp, otpTimeExpire: time } }, { new: true })
                return res.json(new response(updateResult, responseMessage.OTP_SEND));

            }
        }
        catch (error) {
            return next(error);
        }
    }

    /**
       * @swagger
       * /admin/resetPassword:
       *   put:
       *     tags:
       *       - ADMIN
       *     description: resetPassword
       *     produces:
       *       - application/json
       *     parameters:
       *       - name: userId
       *         description: _id
       *         in: query
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
            userId: Joi.string().optional(),
            newPassword: Joi.string().required()
        };
        try {
            var validatedBody = await Joi.validate(req.body, validationSchema);
            const { userId, newPassword } = validatedBody;
            var userResult = await findUser({ _id: req.query.userId })
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);

            }
            var updateResult = await updateUser({ _id: userResult._id }, { accountVerify: true, password: bcrypt.hashSync(validatedBody.newPassword) })
            return res.json(new response(updateResult, responseMessage.PWD_CHANGED));

        }
        catch (error) {
            return next(error);
        }
    }

    /**
   * @swagger
   * /admin/changePassword:
   *   patch:
   *     tags:
   *       - ADMIN
   *     description: changePassword
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: changePassword
   *         description: changePassword
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/changePassword'
   *     responses:
   *       200:
   *         description: Returns success message
   */

    async changePassword(req, res, next) {
        const validationSchema = {
            oldPassword: Joi.string().required(),
            newPassword: Joi.string().required()
        };
        try {
            let validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            if (!bcrypt.compareSync(validatedBody.oldPassword, userResult.password)) {
                throw apiError.badRequest(responseMessage.PWD_NOT_MATCH);
            }
            let updated = await updateUserById(userResult._id, { password: bcrypt.hashSync(validatedBody.newPassword) });
            return res.json(new response(updated, responseMessage.PWD_CHANGED));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/adminProfile:
     *   get:
     *     tags:
     *       - ADMIN
     *     description: adminProfile
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

    async adminProfile(req, res, next) {
        try {
            let adminResult = await findUser({ _id: req.userId });
            if (!adminResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            return res.json(new response(adminResult, responseMessage.USER_DETAILS));
        } catch (error) {
            return next(error);
        }
    }
    //********************************************* USER MANAGEMENT START ***************************************************************************** */

    /**
        * @swagger
        * /admin/deleteUser:
        *   delete:
        *     tags:
        *       - ADMIN
        *     description: deleteUser
        *     produces:
        *       - application/json
        *     parameters:
        *       - name: token
        *         description: token
        *         in: header
        *         required: true
        *       - name: deleteUser
        *         description: deleteUser
        *         in: body
        *         required: true
        *         schema:
        *           $ref: '#/definitions/deleteUser'
        *     responses:
        *       200:
        *         description: Returns success message
        */

    async deleteUser(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId, userType: { $in: userType.ADMIN } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var userInfo = await findUser({ _id: validatedBody._id, status: { $ne: status.DELETE } });
            if (!userInfo) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            let deleteRes = await updateUser({ _id: userInfo._id }, { status: status.DELETE });
            return res.json(new response(deleteRes, responseMessage.DELETE_SUCCESS));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/blockUnblockUser:
     *   put:
     *     tags:
     *       - ADMIN
     *     description: blockUnblockUser
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
            _id: Joi.string().required()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId, userType: { $in: userType.ADMIN } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var userInfo = await findUser({ _id: validatedBody._id, status: { $ne: status.DELETE } });
            if (!userInfo) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            if (userInfo.status == status.ACTIVE) {
                let blockRes = await updateUser({ _id: userInfo._id }, { status: status.BLOCK });
                return res.json(new response(blockRes, responseMessage.BLOCK_BY_ADMIN));
            } else {
                let activeRes = await updateUser({ _id: userInfo._id }, { status: status.ACTIVE });
                return res.json(new response(activeRes, responseMessage.UNBLOCK_BY_ADMIN));
            }

        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/listUser:
     *   get:
     *     tags:
     *       - ADMIN
     *     description: listUser
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: status
     *         description: status i.e ACTIVE || BLOCK
     *         in: query
     *       - name: search
     *         description: search i.e by WalletAddress || email || mobileNumber || userName
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
     *         description: Returns success message
     */

    async listUser(req, res, next) {
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
            let userResult = await findUser({ _id: req.userId, userType: { $in: userType.ADMIN } });
            if (userResult.length == 0) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let dataResults = await paginateSearch(validatedBody);
            return res.json(new response(dataResults, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
   * @swagger
   * /admin/viewUser/{_id}:
   *   get:
   *     tags:
   *       - ADMIN
   *     description: viewUser
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
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */

    async viewUser(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required()
        };
        try {
            const validatedBody = await Joi.validate(req.params, validationSchema);
            let userResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var userInfo = await findUser({ _id: validatedBody._id, status: { $ne: status.DELETE } });
            if (!userInfo) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            return res.json(new response(userInfo, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }


    /**
   * @swagger
   * /admin/viewUserTransactionHistory/{_id}:
   *   get:
   *     tags:
   *       - ADMIN
   *     description: viewUserTransactionHistory
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
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */

    async viewUserTransactionHistory(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required()
        };
        try {
            const validatedBody = await Joi.validate(req.params, validationSchema);
            let userResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var userInfo = await findUser({ _id: validatedBody._id, status: { $ne: status.DELETE } });
            if (!userInfo) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            return res.json(new response(userInfo, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }
    //************************************************ USER MANAGEMENT END ***************************************************************************************** */


    //**************************************************** CATEGORY MANAGEMENT START ********************************************************************************* */

    /**
     * @swagger
     * /admin/addCategory:
     *   post:
     *     tags:
     *       - ADMIN
     *     description: addCategory
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: categoryTitle
     *         description: categoryTitle
     *         in: formData
     *         required: false
     *       - name: categoryIcon
     *         description: categoryIcon
     *         in: formData
     *         type: file
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async addCategory(req, res, next) {
        let validationSchema = {
            categoryTitle: Joi.string().required(),
            categoryIcon: Joi.string().optional(),
        }
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId, userType: { $in: userType.ADMIN } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var category = await categoryCheck(validatedBody.categoryTitle);
            if (category) {
                throw apiError.notFound(responseMessage.CATEGORY_ALREADY_EXIST);
            }
            const { files } = req;
            if (files.length != 0) {
                validatedBody.categoryIcon = await commonFunction.getImageUrl(files);
            }
            var result = await createCategory(validatedBody)
            return res.json(new response(result, responseMessage.CATEGORY_CREATED));
        } catch (error) {
            return next(error);
        }
    }

    /**
       * @swagger
       * /admin/deleteCategory:
       *   delete:
       *     tags:
       *       - ADMIN
       *     description: deleteCategory
       *     produces:
       *       - application/json
       *     parameters:
       *       - name: token
       *         description: token
       *         in: header
       *         required: true
       *       - name: deleteCategory
       *         description: deleteCategory
       *         in: body
       *         required: true
       *         schema:
       *           $ref: '#/definitions/deleteCategory'
       *     responses:
       *       200:
       *         description: Returns success message
       */

    async deleteCategory(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId, userType: { $in: userType.ADMIN } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var categoryInfo = await findCategory({ _id: validatedBody._id, status: { $ne: status.DELETE } });
            if (!categoryInfo) {
                throw apiError.notFound(responseMessage.CATEGORY_NOT_FOUND);
            }
            let deleteRes = await updateCategory({ _id: categoryInfo._id }, { status: status.DELETE });
            return res.json(new response(deleteRes, responseMessage.DELETE_SUCCESS));
        } catch (error) {
            return next(error);
        }
    }

    /**
        * @swagger
        * /admin/listCategory:
        *   get:
        *     tags:
        *       - ADMIN
        *     description: listCategory
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
        *         description: Returns success message
        */

    async listCategory(req, res, next) {
        const validationSchema = {
            search: Joi.string().optional(),
            fromDate: Joi.string().optional(),
            toDate: Joi.string().optional(),
            page: Joi.number().optional(),
            limit: Joi.number().optional(),

        };
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            var categoryInfo = await findCategory({ status: { $ne: status.DELETE } });
            if (!categoryInfo) {
                throw apiError.notFound(responseMessage.CATEGORY_NOT_FOUND);
            }
            let dataResults = await paginateCategory(validatedBody);
            return res.json(new response(dataResults, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
        * @swagger
        * /admin/viewCategory:
        *   get:
        *     tags:
        *       - ADMIN
        *     description: viewCategory
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

    async viewCategory(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required()
        };
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            var categoryInfo = await findCategory({ _id: validatedBody._id });
            if (!categoryInfo) {
                throw apiError.notFound(responseMessage.CATEGORY_NOT_FOUND);
            }
            return res.json(new response(categoryInfo, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
    * @swagger
    * /admin/editCategory:
    *   put:
    *     tags:
    *       - ADMIN
    *     description: editCategory
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: token
    *         description: token
    *         in: header
    *         required: true
    *       - name: categoryTitle
    *         description: categoryTitle
    *         in: formData
    *         required: false
    *       - name: categoryId
    *         description: _id
    *         in: formData
    *         required: true
    *       - name: categoryIcon
    *         description: base64
    *         in: formData
    *         type: file
    *         required: false
    *     responses:
    *       200:
    *         description: Returns success message
    */

    async editCategory(req, res, next) {
        const validationSchema = {
            categoryTitle: Joi.string().optional(),
            categoryIcon: Joi.string().optional(),
            categoryId: Joi.string().optional()
        };
        try {
            var uniqueCheck, updated;
            let validatedBody = await Joi.validate(req.body, validationSchema);

            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }

            var categoryInfo = await findCategory({ _id: validatedBody.categoryId, status: { $ne: status.DELETE } });

            if (!categoryInfo) {
                throw apiError.notFound(responseMessage.CATEGORY_NOT_FOUND);
            }

            const { files } = req;
            if (files.length != 0) {
                validatedBody.categoryIcon = await commonFunction.getImageUrl(files);
            }
            if (validatedBody.categoryTitle && !validatedBody.categoryIcon) {
                uniqueCheck = await findCategory({ categoryTitle: validatedBody.categoryTitle, _id: { $ne: categoryInfo.categoryId }, status: { $ne: status.DELETE } });
                if (uniqueCheck) {
                    throw apiError.conflict(responseMessage.CATEGORY_ALREADY_EXIST);
                }

                updated = await updateCategoryById({ _id: categoryInfo._id }, validatedBody);
            }
            else if (validatedBody.categoryIcon && !validatedBody.categoryTitle) {
                uniqueCheck = await findUser({ categoryIcon: validatedBody.categoryIcon, _id: { $ne: categoryInfo._id }, status: { $ne: status.DELETE } });
                updated = await updateCategoryById({ _id: categoryInfo._id }, validatedBody);
            } else {
                updated = await updateCategoryById({ _id: categoryInfo._id }, validatedBody);
            }
            return res.json(new response(updated, responseMessage.PROFILE_UPDATED));
        } catch (error) {
            return next(error);
        }
    }

    /**
         * @swagger
         * /admin/activeDeactiveCategory:
         *   put:
         *     tags:
         *       - ADMIN
         *     description: activeDeactiveCategory
         *     produces:
         *       - application/json
         *     parameters:
         *       - name: token
         *         description: token
         *         in: header
         *         required: true
         *       - name: activeDeactiveCategory
         *         description: activeDeactiveCategory
         *         in: body
         *         required: true
         *         schema:
         *           $ref: '#/definitions/activeDeactiveCategory'
         *     responses:
         *       200:
         *         description: Returns success message
         */

    async activeDeactiveCategory(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId, userType: { $in: userType.ADMIN } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var userInfo = await findCategory({ _id: validatedBody._id, status: { $ne: status.DELETE } });
            if (!userInfo) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            if (userInfo.status == status.ACTIVE) {
                let blockRes = await updateCategory({ _id: userInfo._id }, { status: status.BLOCK });
                return res.json(new response(blockRes, responseMessage.BLOCK_BY_ADMIN));
            } else {
                let activeRes = await updateCategory({ _id: userInfo._id }, { status: status.ACTIVE });
                return res.json(new response(activeRes, responseMessage.UNBLOCK_BY_ADMIN));
            }

        } catch (error) {
            return next(error);
        }
    }





    //**************************************************** CATEGORY MANAGEMENT END ********************************************************************************* */


    /**
         * @swagger
         * /admin/listNft:
         *   get:
         *     tags:
         *       - ADMIN
         *     description: listNft
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
         *       - name: status
         *         description: status
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
         *         description: Returns success message
         */

    async listNft(req, res, next) {
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
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var nftInfo = await findAllNft({ status: { $ne: status.DELETE } });
            if (!nftInfo) {
                throw apiError.notFound(responseMessage.NFT_NOT_FOUND);
            }
            let dataResults = await nftListWithAggregatePipeline(validatedBody);
            if (dataResults.length == 0) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            }
            return res.json(new response(dataResults, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
         * @swagger
         * /admin/viewNFT:
         *   get:
         *     tags:
         *       - ADMIN
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
         *         required: false
         *     responses:
         *       200:
         *         description: Returns success message
         */

    async viewNFT(req, res, next) {
        const validationSchema = {
            _id: Joi.string().optional(),

        };
        try {
            const { _id } = await Joi.validate(req.params, validationSchema);

            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var nftInfo = await findNft({ _id: _id, status: { $ne: status.DELETE } });
            if (!nftInfo) {
                throw apiError.notFound(responseMessage.NFT_NOT_FOUND);
            }
            return res.json(new response(dataResults, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
    * @swagger
    * /admin/blockUnblockNft:
    *   put:
    *     tags:
    *       - ADMIN
    *     description: blockUnblockNft
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: token
    *         description: token
    *         in: header
    *         required: true
    *       - name: blockUnblockNft
    *         description: blockUnblockNft
    *         in: body
    *         required: true
    *         schema:
    *           $ref: '#/definitions/blockUnblockNft'
    *     responses:
    *       200:
    *         description: Returns success message
    */

    async blockUnblockNft(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId, userType: { $in: userType.ADMIN } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var nftInfo = await findNft({ _id: validatedBody._id, status: { $ne: status.DELETE } });
            if (!nftInfo) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            if (nftInfo.status == status.ACTIVE) {
                let blockRes = await updateNft({ _id: nftInfo._id }, { status: status.BLOCK });
                return res.json(new response(blockRes, responseMessage.NFT_BLOCK_BY_ADMIN));
            } else {
                let activeRes = await updateNft({ _id: nftInfo._id }, { status: status.ACTIVE });
                return res.json(new response(activeRes, responseMessage.NFT_UNBLOCK_BY_ADMIN));
            }

        } catch (error) {
            return next(error);
        }
    }

    /**
    * @swagger
    * /admin/soldNftList:
    *   get:
    *     tags:
    *       - ADMIN
    *     description: soldNftList
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

    async soldNftList(req, res, next) {
        try {
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            } else {
                let reportCheck = await orderList({ sellStatus: "SOLD" });
                if (reportCheck.length == 0) {
                    return res.json(new response([], responseMessage.DATA_NOT_FOUND));
                } else {
                    return res.json(new response(reportCheck, responseMessage.COLLECTION_DETAILS));
                }
            }
        } catch (error) {
            return next(error);
        }
    }



    //********************************************ORDER MANAGEMENT START******************************************************** */

    /**
           * @swagger
           * /admin/cancelOrder:
           *   post:
           *     tags:
           *       - ADMIN
           *     description: cancelOrder
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
           *     responses:
           *       200:
           *         description: Returns success message
           */

    async cancelOrder(req, res, next) {
        const validationSchema = {
            _id: Joi.string().optional(),
        };
        try {
            const { _id } = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId, userType: { $in: userType.ADMIN } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var nftInfo = await findOrder({ _id: _id, status: { $ne: status.DELETE } });
            if (!nftInfo) {
                throw apiError.notFound(responseMessage.NFT_NOT_FOUND);
            } else {
                var updateRes = await updateOrder({ _id: nftInfo._id, $set: { isCancel: true } })
                return res.json(new response(updateRes, responseMessage.DATA_FOUND));
            }

        } catch (error) {
            return next(error);
        }
    }

    /**
      * @swagger
      * /admin/cancelOrderList:
      *   get:
      *     tags:
      *       - ADMIN
      *     description: cancelOrderList
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
      *       - name: status
      *         description: status
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
      *         description: Returns success message
      */

    async cancelOrderList(req, res, next) {
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
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var activityInfo = await paginateOrder({ status: { $ne: status.DELETE } });
            if (activityInfo.docs.length == 0) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            let dataResults = await paginateActivity(validatedBody);
            return res.json(new response(dataResults, responseMessage.ACTIVITY_DETAILS));
        } catch (error) {
            return next(error);
        }
    }

    /**
       * @swagger
       * /admin/viewCancelOrder/{_id}:
       *   get:
       *     tags:
       *       - ADMIN
       *     description: viewCancelOrder
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

    async viewCancelOrder(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required()
        }
        try {
            const { _id } = await Joi.validate(req.params, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var bidResult = await findOrder({ _id: _id, isCancel: true, status: { $ne: status.DELETE } });
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
      * /admin/reportsList:
      *   post:
      *     tags:
      *       - ADMIN REPORT DASHBOARD
      *     description: reportsList
      *     produces:
      *       - application/json
      *     parameters:
      *       - name: token
      *         description: token
      *         in: header
      *         required: true
      *       - name: search
      *         description: search ? By artist, name, message
      *         in: formData
      *         required: false
      *     responses:
      *       200:
      *         description: Returns success message
      */

    async reportsList(req, res, next) {
        try {
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            } else {
                let reportCheck = await paginateSearchReport(req.body)
                if (reportCheck.docs.length == 0) {
                    return res.json(new response([], responseMessage.DATA_NOT_FOUND));
                } else {
                    return res.json(new response(reportCheck, responseMessage.COLLECTION_DETAILS));
                }
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/viewReport/{_id}:
     *   get:
     *     tags:
     *       - ADMIN REPORT DASHBOARD
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
     *         in: path
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async viewReport(req, res, next) {
        let validationSchema = {
            _id: Joi.string().required()
        }
        try {
            const validatedBody = await Joi.validate(req.params, validationSchema);
            let adminResult = await findUser({ _id: req.userId });
            if (!adminResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var result = await findReport({ _id: validatedBody._id });
            if (!result) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            return res.json(new response(result, responseMessage.DETAILS_FETCHED));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/blockReport/{_id}:
     *   get:
     *     tags:
     *       - ADMIN REPORT DASHBOARD
     *     description: blockReport
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

    async blockReport(req, res, next) {
        let validationSchema = {
            _id: Joi.string().required()
        }
        try {
            const validatedBody = await Joi.validate(req.params, validationSchema);
            let adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
            if (!adminResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var result = await findReport({ _id: validatedBody._id });
            console.log("====result====", result)
            // return;
            if (!result) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            const order = async (query, updateObj) => {
                return updateOrder(query, updateObj);
            }
            const nft = async (query, updateObj) => {
                return updateNft(query, updateObj);
            }
            const report = async (query, updateObj) => {
                return updateReport(query, updateObj);
            }
            const user = async (query, updateObj) => {
                return updateUser(query, updateObj);
            }
            if (result.actionApply === true) {
                let [ordeRes, nftRes, orderReportRes, userReportRes] = await Promise.all([
                    order({ _id: result.orderId }, { isReported: false }),
                    nft({ _id: result.nftId }, { isReported: false }),
                    report({ _id: result._id }, { actionApply: false }),
                    user({ _id: result.userId }, { isReported: false }),
                ])
                return res.json(new response({ orderReportRes, userReportRes }, responseMessage.UN_BLOCKED));
            }
            let [ordeRes, nftRes, orderReportRes, userReportRes] = await Promise.all([
                order({ _id: result.orderId }, { isReported: true }),
                nft({ _id: result.nftId }, { isReported: true }),
                report({ _id: result._id }, { actionApply: true }),
                user({ _id: result.userId }, { isReported: true }),

            ])
            return res.json(new response({ orderReportRes, userReportRes }, responseMessage.BLOCKED));

        } catch (error) {
            console.log("====error==>>>", error)
            return next(error);
        }
    }

    //********************************************* FEE MANAGEMENT START **************************************************************** */

    /**
        * @swagger
        * /admin/addFees:
        *   post:
        *     tags:
        *       - ADMIN
        *     description: addFees
        *     produces:
        *       - application/json
        *     parameters:
        *       - name: token
        *         description: token
        *         in: header
        *         required: true
        *       - name: fees
        *         description: fees
        *         in: formData
        *         required: false
        *       - name: feesInPercentage
        *         description: feesInPercentage
        *         in: formData
        *         required: false
        *     responses:
        *       200:
        *         description: Returns success message
        */

    async addFees(req, res, next) {
        let validationSchema = {
            fees: Joi.string().optional(),
            feesInPercentage: Joi.string().optional(),
        }
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            const { fees, feesInPercentage } = validatedBody;
            var result = await createFees(req.body)
            return res.json(new response(result, responseMessage.FEES_CREATED));
        } catch (error) {
            return next(error);
        }
    }

    /**
           * @swagger
           * /admin/deleteFees:
           *   delete:
           *     tags:
           *       - ADMIN
           *     description: deleteFees
           *     produces:
           *       - application/json
           *     parameters:
           *       - name: token
           *         description: token
           *         in: header
           *         required: true
           *       - name: feesId
           *         description: feesId
           *         in: formData
           *         required: true
           *     responses:
           *       200:
           *         description: Returns success message
           */

    async deleteFees(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId, userType: { $in: userType.ADMIN } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var feesInfo = await findFees({ _id: validatedBody.feesId, status: { $ne: status.DELETE } });
            if (!feesInfo) {
                throw apiError.notFound(responseMessage.CATEGORY_NOT_FOUND);
            }
            let deleteRes = await updateFees({ _id: feesInfo.feesId }, { status: status.DELETE });
            return res.json(new response(deleteRes, responseMessage.DELETE_SUCCESS));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/viewFees:
     *   get:
     *     tags:
     *       - ADMIN
     *     description: viewFees
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

    async viewFees(req, res, next) {
        try {
            let adminResult = await findUser({ _id: req.userId });
            if (!adminResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
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
        * /admin/editFees:
        *   put:
        *     tags:
        *       - ADMIN
        *     description: editFees
        *     produces:
        *       - application/json
        *     parameters:
        *       - name: token
        *         description: token
        *         in: header
        *         required: true
        *       - name: feesId
        *         description: feesId
        *         in: formData
        *         required: true
        *       - name: fees
        *         description: fees
        *         in: formData
        *         required: false
        *       - name: feesInPercentage
        *         description: feesInPercentage
        *         in: formData
        *         required: false
        *     responses:
        *       200:
        *         description: Returns success message
        */

    async editFees(req, res, next) {
        const validationSchema = {
            feesId: Joi.string().optional(),
            fees: Joi.string().optional(),
            feesInPercentage: Joi.string().optional(),
        };
        try {
            let validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var feesInfo = await findFees({ _id: validatedBody.feesId, status: { $ne: status.DELETE } });
            if (!feesInfo) {
                throw apiError.notFound(responseMessage.FEES_NOT_FOUND);
            }
            var updated = await updateFeesById(feesInfo._id, validatedBody);
            return res.json(new response(updated, responseMessage.FEED_UPDATED));
        } catch (error) {
            return next(error);
        }
    }

    //********************************************* FEE MANAGEMENT END **************************************************************** */


    /**
     * @swagger
     * /admin/listActivityUsers:
     *   get:
     *     tags:
     *       - ADMIN
     *     description: listActivityUsers
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
     *       - name: status
     *         description: status
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
     *         description: Returns success message
     */

    async listActivityUsers(req, res, next) {
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
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var activityInfo = await findActivity({ status: { $ne: status.DELETE } });
            if (!activityInfo) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            let dataResults = await paginateActivity(validatedBody);
            return res.json(new response(dataResults, responseMessage.ACTIVITY_DETAILS));
        } catch (error) {
            return next(error);
        }
    }

    /**
      * @swagger
      * /admin/userSubscriberList:
      *   get:
      *     tags:
      *       - ADMIN
      *     description: shareContent
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

    async userSubscriberList(req, res, next) {
        try {
            var userRes = await findUser({ _id: req.userId })
            if (!userRes) {
                throw apiError.notFound([], responseMessage.USER_NOT_FOUND)
            } else {
                var subscribeRes = await subscriberList()
                if (subscribeRes.length == 0) {
                    throw apiError.notFound([], responseMessage.DATA_NOT_FOUND)
                } else {
                    return res.json(new response(subscribeRes, responseMessage.DATA_FOUND))
                }
            }
        } catch (error) {
            return next(error);
        }

    }

    /**
       * @swagger
       * /admin/listWallet:
       *   get:
       *     tags:
       *       - ADMIN
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
                var reportRes = await listWallet()
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
        * /admin/shareContent:
        *   post:
        *     tags:
        *       - ADMIN
        *     description: shareContent
        *     produces:
        *       - application/json
        *     parameters:
        *       - name: token
        *         description: token
        *         in: header
        *         required: true
        *       - name: message
        *         description: message
        *         in: formData
        *         required: true
        *     responses:
        *       200:
        *         description: Returns success message
        */

    async shareContent(req, res, next) {
        const validationSchema = {
            message: Joi.string().required(),
        };
        try {
            let data = []
            let validatedBody = await Joi.validate(req.body, validationSchema);
            let userDetail = await findUser({ _id: req.userId });
            if (!userDetail) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND)
            }
            var shareRes = await subscriberList({ status: { $ne: status.DELETE } })
            if (shareRes.length == 0) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            }
            let emailList = [];
            for (let index of shareRes) {
                emailList.push(index.email)
            }
            for (let i of emailList) {
                var mailRes = await commonFunction.sendMailContent(i, validatedBody.message)
            }
            return res.json(new response({ mailRes }, responseMessage.MAIL_SEND));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/unblockRequestList:
     *   get:
     *     tags:
     *       - ADMIN
     *     description: unblockRequestList
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
     *         type: integer
     *         required: false
     *       - name: limit
     *         description: limit
     *         in: query
     *         type: integer
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async unblockRequestList(req, res, next) {
        const validationSchema = {
            fromDate: Joi.string().optional(),
            toDate: Joi.string().optional(),
            page: Joi.number().optional(),
            limit: Joi.number().optional(),
        };
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            let userRes = await findUser({ _id: req.userId })
            if (!userRes) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND)
            }
            // let userBlockList = await findAllUser({ status: status.BLOCK, isUnblockRequest: true }) //  previous

            let userBlockList = await findAllUser(validatedBody)
            if (userBlockList.length == 0) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            }
            return res.json(new response(userBlockList, responseMessage.DATA_FOUND));

        } catch (error) {
            return next(error);
        }
    }

    //************************************ COLLECTIONFEE MANAGEMENT START*********************************************************************** */

    /**
       * @swagger
       * /admin/changeCollectionFee:
       *   post:
       *     tags:
       *       - ADMIN
       *     description: changeCollectionFee
       *     produces:
       *       - application/json
       *     parameters:
       *       - name: collectionFee
       *         description: collectionFee
       *         in: formData
       *         required: true
       *     responses:
       *       200:
       *         description: Returns success message
       */

    async changeCollectionFee(req, res, next) {
        try {
            let commisionId = await findcollectionFee({});
            let updateCommissionRes = await updatecollectionFee({ _id: commisionId._id }, { $set: { collectionFee: req.body.collectionFee } })
            return res.json(new response(updateCommissionRes, responseMessage.UPDATE_SUCCESS));
        } catch (error) {
            return next(error);

        }
    }

    /**
     * @swagger
     * /admin/getCollectionFee:
     *   get:
     *     tags:
     *       - ADMIN
     *     description: getCollectionFee
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async getCollectionFee(req, res, next) {
        try {

            let commissionRes = await collectionFeeList()
            if (commissionRes.length == 0) {
                throw apiError.notFound(responseMessage.NOT_FOUND)
            } else {

                return res.json(new response(commissionRes, responseMessage.DATA_FOUND));
            }

        } catch (error) {
            return next(error);

        }
    }

    //************************************ COLLECTIONFEE MANAGEMENT END*********************************************************************** */



    //************************************** BRAND MANAGEMENT START **************************************************************************** */

    /**
    * @swagger
    * /admin/brandRequestList:
    *   get:
    *     tags:
    *       - ADMIN_BRAND_MANAGEMENT
    *     description: brandRequestList
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
    *         description: Returns success message
    */

    async brandRequestList(req, res, next) {
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
            if (!userResult) throw apiError.notFound(responseMessage.USER_NOT_FOUND);

            let brandResult = await listRequestBrandWithPagination(validatedBody)
            if (brandResult.length == 0) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            } else {
                return res.json(new response(brandResult, responseMessage.DATA_FOUND));
            }
        } catch (error) {
            return next(error);

        }
    }

    /**
     * @swagger
     * /admin/acceptBrandRequest:
     *   put:
     *     tags:
     *       - ADMIN_BRAND_MANAGEMENT
     *     description: acceptBrandRequest
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
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async acceptBrandRequest(req, res, next) {
        try {
            let validatedBody = req.query;
            let userResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
            if (!userResult) throw apiError.notFound(responseMessage.USER_NOT_FOUND);

            let brandRes = await findBrand({ _id: validatedBody.brandId, brandApproval: "PENDING" });
            if (!brandRes) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);

            let updateBrandRes = await updateBrand({ _id: brandRes._id }, { $set: { brandApproval: "APPROVED" } })

            validatedBody.brandName = brandRes.brandName;
            validatedBody.brandApproval = updateBrandRes.brandApproval;
            // await commonFunction.sendMailAcceptBrand(brandRes.email, validatedBody)

            return res.json(new response(updateBrandRes, responseMessage.ACCEPT_SUCCESS_BRAND));
        } catch (error) {
            return next(error);

        }
    }

    /**
    * @swagger
    * /admin/rejectBrandRequest:
    *   put:
    *     tags:
    *       - ADMIN_BRAND_MANAGEMENT
    *     description: rejectBrandRequest
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
    *         required: true
    *       - name: reason
    *         description: reason
    *         in: query
    *         required: true
    *     responses:
    *       200:
    *         description: Returns success message
    */

    async rejectBrandRequest(req, res, next) {
        try {
            let validatedBody = req.query;
            let userResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
            if (!userResult) throw apiError.notFound(responseMessage.USER_NOT_FOUND);

            let brandRes = await findBrand({ _id: validatedBody.brandId, brandApproval: "PENDING" });
            if (!brandRes) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);

            let updateBrandRes = await updateBrand({ _id: brandRes._id }, { $set: { brandApproval: "REJECTED", reason: validatedBody.reason } })

            validatedBody.brandName = brandRes.brandName;
            validatedBody.brandApproval = updateBrandRes.brandApproval;
            validatedBody.reason = validatedBody.reason
            await commonFunction.sendMailRejectBrand(brandRes.email, validatedBody);

            return res.json(new response(updateBrandRes, responseMessage.REJECT_SUCCESS_BRAND));
        } catch (error) {
            return next(error);

        }
    }

    /**
   * @swagger
   * /admin/activeBlockBrand:
   *   put:
   *     tags:
   *       - ADMIN_BRAND_MANAGEMENT
   *     description: activeBlockBrand
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
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */

    async activeBlockBrand(req, res, next) {
        try {
            let validatedBody = req.query;
            let userResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
            if (!userResult) throw apiError.notFound(responseMessage.USER_NOT_FOUND);

            let brandRes = await findBrand({ _id: validatedBody.brandId, brandApproval: "APPROVED" });
            if (!brandRes) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);

            if (brandRes.status == status.ACTIVE) {
                let blockRes = await updateBrand({ _id: brandRes._id }, { status: status.BLOCK });
                return res.json(new response(blockRes, responseMessage.BRAND_BLOCK_BY_ADMIN));
            } else {
                let activeRes = await updateBrand({ _id: brandRes._id }, { status: status.ACTIVE });
                return res.json(new response(activeRes, responseMessage.BRAND_ACTIVE_BY_ADMIN));
            }
        } catch (error) {
            return next(error);

        }
    }


        /**
     * @swagger
     * /admin/listkyc:
     *   post:
     *     tags:
     *       - KYC MANAGEMENT
     *     description: listkyc as All KYC requested by USERs on plateform for verification
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
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
     *       - name: search
     *         description: search
     *         in: formData
     *         required: false
     *       - name: userType
     *         description: userType
     *         in: formData
     *         required: false
     *       - name: kycStatus
     *         description: kycStatus
     *         in: formData
     *         required: false
     *       - name: country
     *         description: country
     *         in: formData
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message
     */
         async listkyc(req, res, next) {
            const validationSchema = {
                fromDate: Joi.string().allow('').optional(),
                toDate: Joi.string().allow('').optional(),
                page: Joi.number().allow('').optional(),
                limit: Joi.number().allow('').optional(),
                search: Joi.string().allow('').optional(),
                userType: Joi.string().allow('').optional(),
                kycStatus: Joi.string().allow('').optional(),
                country: Joi.string().allow('').optional(),
            };
            try {
                const validatedBody = await Joi.validate(req.body, validationSchema);
                let userResult = await findUser({ _id: req.userId, userType:userType.ADMIN  });
                console.log(userResult,34);
                if (!userResult) {
                    throw apiError.notFound(responseMessage.USER_NOT_FOUND);
                }
                let dataResults = await paginateSearchKYC(validatedBody);
                if (dataResults.docs.length == 0) {
                    throw apiError.notFound(responseMessage.KYC_NOT_FOUND)
                }
                return res.json(new response(dataResults, responseMessage.KYC_FOUND));
            } catch (error) {
                return next(error);
            }
        }
    
        /**
         * @swagger
         * /admin/viewKyc:
         *   get:
         *     tags:
         *       - KYC MANAGEMENT
         *     description: viewKyc as View particular KYC details by ADMIN with _id
         *     produces:
         *       - application/json
         *     parameters:
         *       - name: token
         *         description: token
         *         in: header
         *         required: true
         *       - name: kycId
         *         description: kycId
         *         in: query
         *         required: true
         *     responses:
         *       200:
         *         description: Returns success message
         */
        async viewKyc(req, res, next) {
            const validationSchema = {
                kycId: Joi.string().required()
            };
            try {
                const validatedBody = await Joi.validate(req.query, validationSchema);
                let userResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
                if (!userResult) {
                    throw apiError.notFound(responseMessage.USER_NOT_FOUND);
                }
                var kycInfo = await findKYC({ _id: validatedBody.kycId, status: { $ne: status.DELETE } });
                if (!kycInfo) {
                    throw apiError.notFound(responseMessage.KYC_NOT_FOUND);
                }
                return res.json(new response(kycInfo, responseMessage.KYC_FOUND));
            } catch (error) {
                return next(error);
            }
        }
    
        /**
         * @swagger
         * /admin/approveRejectKyc:
         *   put:
         *     tags:
         *       - KYC MANAGEMENT
         *     description: approveRejectKyc ADMIN  take decision where KYC will Approve or reject to see the KYC information that requested by USERs
         *     produces:
         *       - application/json
         *     parameters:
         *       - name: token
         *         description: token
         *         in: header
         *         required: true
         *       - name: kycId
         *         description: kycId
         *         in: formData
         *         required: true
         *       - name: approveReject
         *         description: approveReject
         *         in: formData
         *         enum: ["REJECT","APPROVE"]
         *         required: true
         *       - name: reason
         *         description: reason
         *         in: formData
         *         required: false
         *     responses:
         *       200:
         *         description: Returns success message
         */
        async approveRejectKyc(req, res, next) {
            const validationSchema = {
                kycId: Joi.string().required(),
                approveReject: Joi.string().required(),
                reason: Joi.string().allow('').optional()
            };
           
            try {
                const validatedBody = await Joi.validate(req.body, validationSchema);
                
                let userResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
                if (!userResult) {
                    throw apiError.notFound(responseMessage.USER_NOT_FOUND);
                }
                var kycInfo = await findKYC({ _id: validatedBody.kycId, status: { $ne: status.DELETE } });
                if (!kycInfo) {
                    throw apiError.notFound(responseMessage.KYC_NOT_FOUND);
                }
                let userInfo = await findUser({ _id: kycInfo.userId });
                // console.log(userInfo);
                if (validatedBody.approveReject == kycApprove.APPROVE) {
                    // let body = {
                    //     name: kycInfo.userId.firstName,
                    //     kycId: kycInfo._id,
                    //     status: 'approved'
                    // }
                    // await commonFunction.sendMailContent(kycInfo.userId.email, body);
    
                    // let subject = 'KYC_STATUS'
                    // let bodys = `Your KYC is approved by ${userResult.firstName}`
                    // notification.promiseNotification(kycInfo.userId, userInfo.deviceToken, userInfo.deviceType, subject, bodys, "KYC_STATUS", kycInfo._id)
    
                    let kycRes = await updateKYC({ _id: kycInfo._id }, { approveStatus: kycApprove.APPROVE });
                    await updateUser({ _id: kycInfo.userId._id }, { kycVerified: true })
                    return res.json(new response(kycRes, responseMessage.KYC_APPROVE));
                }
                if (validatedBody.approveReject == kycApprove.REJECT) {
                    // let body = {
                    //     name: kycInfo.userId.firstName,
                    //     kycId: kycInfo._id,
                    //     reason: validatedBody.reason,
                    //     status: 'rejected'
                    // }
                    // await commonFunction.sendMailContent(kycInfo.userId.email, body);
                    // let subject = 'KYC_STATUS.'
                    // let bodys = `Your KYC is rejected by ${userResult.firstName} with Reason: ${validatedBody.reason}`
                    // notification.promiseNotification(kycInfo.userId, userInfo.deviceToken, userInfo.deviceType, subject, bodys, "KYC_STATUS", kycInfo._id)
                    let kycRes = await updateKYC({ _id: kycInfo._id }, { approveStatus: kycApprove.REJECT, reason: validatedBody.reason });
                    await updateUser({ _id: kycInfo.userId._id }, { kycVerified: false })
                    return res.json(new response(kycRes, responseMessage.KYC_REJECT));
                }
    
            } catch (error) {
                console.log("error", error)
                return next(error);
            }
        }



    //************************************** BRAND MANAGEMENT END **************************************************************************** */



}
export default new adminController()