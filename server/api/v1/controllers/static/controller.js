import Joi from "joi";
import _ from "lodash";
import apiError from '../../../../helper/apiError';
import response from '../../../../../assets/response';
import responseMessage from '../../../../../assets/responseMessage';
import commonFunction from '../../../../helper/util';
import { staticServices } from '../../services/static';
import { faqServices } from '../../services/faq';
import { userServices } from '../../services/user';
import { pressaMediaServices } from '../../services/pressMedia';

const { createStaticContent, findStaticContent, updateStaticContent, staticContentList } = staticServices;
const { createFAQ, findFAQ, updateFAQ, FAQList } = faqServices;
const { createpressaMedia, findpressaMedia, updatepressaMedia, pressaMediaList } = pressaMediaServices
const { userCheck, findUser, findUserData, createUser, updateUser, updateUserById, userSubscriberList } = userServices;

import status from '../../../../enums/status';


export class staticController {

    /**
     * @swagger
     * /static/addStaticContent:
     *   post:
     *     tags:
     *       - STATIC
     *     description: addStaticContent
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: addStaticContent
     *         description: addStaticContent
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/addStaticContent'
     *     responses:
     *       200:
     *         description: Static content added successfully.
     *       501:
     *         description: Something went wrong.
     *       404:
     *         description: User not found.
     *       409:
     *         description: Already exist.
     */
    async addStaticContent(req, res, next) {
        const validationSchema = {
            type: Joi.string().valid('termsConditions', 'privacyPolicy', 'aboutUs').required(),
            title: Joi.string().required(),
            description: Joi.string().required(),
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            const { type, title, description } = validatedBody;
            let check = await findStaticContent({ type: type, status: status.ACTIVE })
            if (check) {
                throw apiError.alreadyExist(responseMessage.ALREADY_EXIST)
            }
            var result = await createStaticContent({ type: type, title: title, description: description })
            return res.json(new response(result, responseMessage.CMS_SAVED));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /static/viewStaticContent:
     *   get:
     *     tags:
     *       - STATIC
     *     description: viewStaticContent
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: type
     *         description: type
     *         in: query
     *         required: true
     *     responses:
     *       200:
     *         description: Static data found successfully.
     *       501:
     *         description: Something went wrong.
     *       404:
     *         description: User not found.
     *       409:
     *         description: Already exist.
     */

    async viewStaticContent(req, res, next) {
        const validationSchema = {
            type: Joi.string().valid('termsConditions', 'privacyPolicy', 'aboutUs').required(),
        };
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            var result = await findStaticContent({ type: validatedBody.type })
            return res.json(new response(result, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /static/editStaticContent:
     *   put:
     *     tags:
     *       - STATIC
     *     description: editStaticContent
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: editStaticContent
     *         description: editStaticContent
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/editStaticContent'
     *     responses:
     *       200:
     *         description: Successfully updated.
     *       501:
     *         description: Something went wrong.
     *       404:
     *         description: Data not found.
     *       409:
     *         description: Already exist.
     */
    async editStaticContent(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
            title: Joi.string().optional(),
            description: Joi.string().optional(),

        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            var statisRes = await findStaticContent({ _id: validatedBody._id })
            if (!statisRes) {
                throw apiError.notFound([], responseMessage.DATA_NOT_FOUND)
            }
            var result = await updateStaticContent({ _id: statisRes._id }, validatedBody)
            return res.json(new response(result, responseMessage.UPDATE_SUCCESS));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /static/staticContentList:
     *   get:
     *     tags:
     *       - STATIC
     *     description: staticContentList
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Data found successfully.
     *       501:
     *         description: Something went wrong.
     *       404:
     *         description: Data not found.
     *       409:
     *         description: Already exist.
     */

    async staticContentList(req, res, next) {
        try {
            var result = await staticContentList()
            if (result.length == 0) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            }
            return res.json(new response(result, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /static/addFAQ:
     *   post:
     *     tags:
     *       - STATIC
     *     description: addFAQ
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: question
     *         description: question
     *         in: formData
     *         required: true
     *       - name: answer
     *         description: answer
     *         in: formData
     *         required: true
     *       - name: image
     *         description: image ?? base64
     *         in: formData
     *         required: false
     *       - name: url
     *         description: url
     *         in: formData
     *         required: false
     *     responses:
     *       200:
     *         description: FAQ added successfully.
     */

    async addFAQ(req, res, next) {
        try {
            const validatedBody = await Joi.validate(req.body);
            const { question, answer,image } = validatedBody;
            if (validatedBody.image) {
                validatedBody.image = await commonFunction.getSecureUrl(validatedBody.image);
            }
            var result = await createFAQ(validatedBody)

            return res.json(new response(result, responseMessage.FAQ_ADDED));
        } catch (error) {
            return next(error);
        }
    }

    /**
      * @swagger
      * /static/viewFAQ/{_id}:
      *   get:
      *     tags:
      *       - STATIC
      *     description: viewFAQ
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
      *       501:
      *         description: Something went wrong.
      *       404:
      *         description: Data not found.
      *       409:
      *         description: Already exist.
      */

    async viewFAQ(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
        };
        try {
            const validatedBody = await Joi.validate(req.params, validationSchema);
            var result = await findFAQ({ _id: validatedBody._id })
            if (!result) {
                throw apiError.notFound([], responseMessage.DATA_NOT_FOUND)
            }
            return res.json(new response(result, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
    * @swagger
    * /static/editFAQ:
    *   put:
    *     tags:
    *       - STATIC
    *     description: editFAQ
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: _id
    *         description: _id
    *         in: formData
    *         required: true
    *       - name: question
    *         description: question
    *         in: formData
    *         required: true
    *       - name: answer
    *         description: answer
    *         in: formData
    *         required: true
    *       - name: image
    *         description: image
    *         in: formData
    *         required: false
    *       - name: url
    *         description: url
    *         in: formData
    *         required: false
    *     responses:
    *       200:
    *         description: Data update successfully.
    *       501:
    *         description: Something went wrong.
    *       404:
    *         description: Data not found.
    *       409:
    *         description: Already exist.
    */

    async editFAQ(req, res, next) {
        try {
            const validatedBody = await Joi.validate(req.body);
            var faqRes = await findFAQ({ _id: validatedBody._id })
            if (!faqRes) {
                throw apiError.notFound([], responseMessage.DATA_NOT_FOUND)
            }
            if (validatedBody.image) {
                validatedBody.image = await commonFunction.getSecureUrl(validatedBody.image);
            }
            var result = await updateFAQ({ _id: faqRes._id }, validatedBody)
            console.log("===",result)

            return res.json(new response(result, responseMessage.UPDATE_SUCCESS));
        } catch (error) {
            return next(error);
        }
    }

    /**
    * @swagger
    * /static/deleteFAQ:
    *   delete:
    *     tags:
    *       - STATIC
    *     description: deleteFAQ
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: token
    *         description: token
    *         in: header
    *         required: true
    *       - name: deleteFAQ
    *         description: deleteFAQ
    *         in: body
    *         required: true
    *         schema:
    *           $ref: '#/definitions/deleteFAQ'
    *     responses:
    *       200:
    *         description: Deleted successfully.
    *       501:
    *         description: Something went wrong.
    *       404:
    *         description: FAQ data not found/User not found
    *       409:
    *         description: Already exist.
    */

    async deleteFAQ(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId, userType: "Admin" });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var faqInfo = await findFAQ({ _id: validatedBody._id, status: { $ne: status.DELETE } });
            if (!faqInfo) {
                throw apiError.notFound(responseMessage.FAQ_NOT_FOUND);
            }
            let deleteRes = await updateFAQ({ _id: faqInfo._id }, { status: status.DELETE });
            return res.json(new response(deleteRes, responseMessage.DELETE_SUCCESS));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /static/faqList:
     *   get:
     *     tags:
     *       - STATIC
     *     description: faqList
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: data found successfully.
     *       404:
     *         description: Data not found
     */

    async faqList(req, res, next) {
        try {
            var result = await FAQList()
            if (result.length == 0) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            }
            return res.json(new response(result, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    //********************************************************* */ pressaMedia static content***************************************************//


    /**
       * @swagger
       * /static/addPressMediaContent:
       *   post:
       *     tags:
       *       - STATIC_PRESS&MEDIA
       *     description: addPressMediaContent
       *     produces:
       *       - application/json
       *     parameters:
       *       - name: addPressMediaContent
       *         description: addPressMediaContent
       *         in: body
       *         required: true
       *         schema:
       *           $ref: '#/definitions/addPressMediaContent'
       *     responses:
       *       200:
       *         description: Press Media contend Added succsessfully..
       */

    async addPressMediaContent(req, res, next) {
        const validationSchema = {
            type: Joi.string().required(),
            title: Joi.string().required(),
            image: Joi.string().optional(),
            description: Joi.string().optional(),
            url:Joi.string().optional()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            if (validatedBody.image) validatedBody.image = await commonFunction.getSecureUrl(validatedBody.image);
            let result = await createpressaMedia(validatedBody)
            return res.json(new response(result, responseMessage.PRESS_ADD));
        } catch (error) {
            return next(error);
        }
    }

    /**
      * @swagger
      * /static/viewPressMedia/{_id}:
      *   get:
      *     tags:
      *       - STATIC_PRESS&MEDIA
      *     description: viewPressMedia
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
      *       501:
      *         description: Something went wrong.
      *       404:
      *         description: Data not found.
      *       409:
      *         description: Already exist.
      */

    async viewPressMedia(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
        };
        try {
            const validatedBody = await Joi.validate(req.params, validationSchema);
            var result = await findpressaMedia({ _id: validatedBody._id })
            if (!result) {
                throw apiError.notFound([], responseMessage.DATA_NOT_FOUND)
            }
            return res.json(new response(result, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
    * @swagger
    * /static/editPressMedia:
    *   put:
    *     tags:
    *       - STATIC_PRESS&MEDIA
    *     description: editPressMedia
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: editPressMedia
    *         description: editPressMedia
    *         in: body
    *         required: true
    *         schema:
    *           $ref: '#/definitions/editPressMedia'
    *     responses:
    *       200:
    *         description: Data found successfully.
    *       501:
    *         description: Something went wrong.
    *       404:
    *         description: Data not found.
    *       409:
    *         description: Already exist.
    */

    async editPressMedia(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
            type: Joi.string().optional(),
            title: Joi.string().required(),
            image: Joi.string().optional(),
            description: Joi.string().optional(),
            url:Joi.string().optional()

        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            var faqRes = await findpressaMedia({ _id: validatedBody._id })
            if (!faqRes) {
                throw apiError.notFound([], responseMessage.DATA_NOT_FOUND)
            }
            if (validatedBody.image) validatedBody.image = await commonFunction.getSecureUrl(validatedBody.image);

            var result = await updatepressaMedia({ _id: faqRes._id }, validatedBody)
            return res.json(new response(result, responseMessage.UPDATE_SUCCESS));
        } catch (error) {
            return next(error);
        }
    }

    /**
    * @swagger
    * /static/deletePressMedia:
    *   delete:
    *     tags:
    *       - STATIC_PRESS&MEDIA
    *     description: deletePressMedia
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: token
    *         description: token
    *         in: header
    *         required: true
    *       - name: deletePressMedia
    *         description: deletePressMedia
    *         in: body
    *         required: true
    *         schema:
    *           $ref: '#/definitions/deletePressMedia'
    *     responses:
    *       200:
    *         description: Deleted successfully.
    *       501:
    *         description: Something went wrong.
    *       404:
    *         description: pressMedia data not found/User not found
    *       409:
    *         description: Already exist.
    */

    async deletePressMedia(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId});
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var faqInfo = await findpressaMedia({ _id: validatedBody._id, status: { $ne: status.DELETE } });
            if (!faqInfo) {
                throw apiError.notFound(responseMessage.FAQ_NOT_FOUND);
            }
            let deleteRes = await updatepressaMedia({ _id: faqInfo._id }, { status: status.DELETE });
            return res.json(new response(deleteRes, responseMessage.DELETE_SUCCESS));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /static/pressMediaList:
     *   get:
     *     tags:
     *       - STATIC_PRESS&MEDIA
     *     description: pressMediaList
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: data found successfully.
     *       404:
     *         description: Data not found
     */

    async pressMediaList(req, res, next) {
        try {
            var result = await pressaMediaList()
            if (result.length == 0) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            }
            return res.json(new response(result, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }



     /**
        * @swagger
        * /admin/activeDeactiveMedia:
        *   put:
        *     tags:
        *       - ADMIN
        *     description: activeDeactiveMedia
        *     produces:
        *       - application/json
        *     parameters:
        *       - name: token
        *         description: token
        *         in: header
        *         required: true
        *       - name: activeDeactiveMedia
        *         description: activeDeactiveMedia
        *         in: body
        *         required: true
        *         schema:
        *           $ref: '#/definitions/activeDeactiveMedia'
        *     responses:
        *       200:
        *         description: Returns success message
        */
      async activeDeactiveMedia(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId, userType: { $in: userType.ADMIN } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var userInfo = await findpressaMedia({ _id: validatedBody._id, status: { $ne: status.DELETE } });
            if (!userInfo) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            if (userInfo.status == status.ACTIVE) {
                let blockRes = await updatepressaMedia({ _id: userInfo._id }, { status: status.BLOCK });
                return res.json(new response(blockRes, responseMessage.DEACTIVE_BY_ADMIN));
            } else {
                let activeRes = await updatepressaMedia({ _id: userInfo._id }, { status: status.ACTIVE });
                return res.json(new response(activeRes, responseMessage.ACTIVE_BY_ADMIN));
            }

        } catch (error) {
            return next(error);
        }
    }






}

export default new staticController()
