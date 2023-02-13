// import Joi from "joi";
// import _ from "lodash";
// import config from "config";
// import apiError from '../../../../helper/apiError';
// import response from '../../../../../assets/response';
// import responseMessage from '../../../../../assets/responseMessage';
// import { staticServices } from '../../services/static';
// const { createStaticContent, findStaticContent, updateStaticContent, staticContentList } = staticServices;

// import { faqServices } from '../../services/faq';
// const { createFAQ, findFAQ, updateFAQ, FAQList } = faqServices;

// import commonFunction from '../../../../helper/util';
// import status from '../../../../enums/status';


// export class staticController {

//     /**
//      * @swagger
//      * /static/staticContent:
//      *   post:
//      *     tags:
//      *       - STATIC
//      *     description: addStaticContent ?? Get static content details like termsConditions, privacyPolicy, aboutUs & contactUs.
//      *     produces:
//      *       - application/json
//      *     parameters:
//      *       - name: addStaticContent
//      *         description: addStaticContent
//      *         in: body
//      *         required: true
//      *         schema:
//      *           $ref: '#/definitions/addStaticContent'
//      *     responses:
//      *       200:
//      *         description: Returns success message
//      */

//     async addStaticContent(req, res, next) {
//         const validationSchema = {
//             type: Joi.string().valid('termsConditions', 'privacyPolicy', 'aboutUs', 'contactUs').required(),
//             title: Joi.string().required(),
//             description: Joi.string().required()
//         };
//         try {
//             const validatedBody = await Joi.validate(req.body, validationSchema);
//             const { type, title, description } = validatedBody;
//             var result = await createStaticContent({ type: type, title: title, description: description })
//             return res.json(new response(result, responseMessage.CMS_SAVED));
//         } catch (error) {
//             return next(error);
//         }
//     }

//     /**
//      * @swagger
//      * /static/staticContent:
//      *   get:
//      *     tags:
//      *       - STATIC
//      *     description: viewStaticContent ?? Get perticular static content details of termsConditions, privacyPolicy, aboutUs & contactUs.
//      *     produces:
//      *       - application/json
//      *     parameters:
//      *       - name: type
//      *         description: type
//      *         in: query
//      *         required: true
//      *     responses:
//      *       200:
//      *         description: Returns success message
//      */

//     async viewStaticContent(req, res, next) {
//         const validationSchema = {
//             type: Joi.string().valid('termsConditions', 'privacyPolicy', 'aboutUs').required(),
//         };
//         try {
//             const validatedBody = await Joi.validate(req.query, validationSchema);
//             var result = await findStaticContent({ type: validatedBody.type })
//             return res.json(new response(result, responseMessage.DATA_FOUND));
//         } catch (error) {
//             return next(error);
//         }
//     }

//     /**
//      * @swagger
//      * /static/staticContent:
//      *   put:
//      *     tags:
//      *       - STATIC
//      *     description: editStaticContent ?? Edit static content details of termsConditions, privacyPolicy, aboutUs & contactUs.
//      *     produces:
//      *       - application/json
//      *     parameters:
//      *       - name: editStaticContent
//      *         description: editStaticContent
//      *         in: body
//      *         required: true
//      *         schema:
//      *           $ref: '#/definitions/editStaticContent'
//      *     responses:
//      *       200:
//      *         description: Returns success message
//      */

//     async editStaticContent(req, res, next) {
//         const validationSchema = {
//             _id: Joi.string().required(),
//             title: Joi.string().optional(),
//             description: Joi.string().optional()
//         };
//         try {
//             const validatedBody = await Joi.validate(req.body, validationSchema);
//             var result = await updateStaticContent({ _id: validatedBody._id }, validatedBody)
//             return res.json(new response(result, responseMessage.UPDATE_SUCCESS));
//         } catch (error) {
//             return next(error);
//         }
//     }

//     /**
//      * @swagger
//      * /static/staticContentList:
//      *   get:
//      *     tags:
//      *       - STATIC
//      *     description: staticContentList ?? Get static content details w/t auth token like termsConditions, privacyPolicy, aboutUs & contactUs.
//      *     produces:
//      *       - application/json
//      *     responses:
//      *       200:
//      *         description: Returns success message
//      */

//     async staticContentList(req, res, next) {
//         try {
//             var result = await staticContentList()
//             return res.json(new response(result, responseMessage.DATA_FOUND));
//         } catch (error) {
//             return next(error);
//         }
//     }

//     //********************************* FAQ management ************************************ */

//     /**
//         * @swagger
//         * /static/addFAQ:
//         *   post:
//         *     tags:
//         *       - FAQ MANAGEMENT
//         *     description: addFAQ
//         *     produces:
//         *       - application/json
//         *     parameters:
//         *       - name: question
//         *         description: question
//         *         in: formData
//         *         required: true
//         *       - name: answer
//         *         description: answer
//         *         in: formData
//         *         required: true
//         *       - name: image
//         *         description: image ?? base64
//         *         in: formData
//         *         required: false
//         *       - name: url
//         *         description: url
//         *         in: formData
//         *         required: false
//         *     responses:
//         *       200:
//         *         description: FAQ added successfully.
//         */

//     async addFAQ(req, res, next) {
//         try {
//             const validatedBody = await Joi.validate(req.body);
//             const { question, answer, image } = validatedBody;
//             if (validatedBody.image) {
//                 validatedBody.image = await commonFunction.getSecureUrl(validatedBody.image);
//             }
//             var result = await createFAQ(validatedBody)

//             return res.json(new response(result, responseMessage.FAQ_ADDED));
//         } catch (error) {
//             return next(error);
//         }
//     }

//     /**
//       * @swagger
//       * /static/viewFAQ/{_id}:
//       *   get:
//       *     tags:
//       *       - FAQ MANAGEMENT
//       *     description: viewFAQ
//       *     produces:
//       *       - application/json
//       *     parameters:
//       *       - name: _id
//       *         description: _id
//       *         in: path
//       *         required: true
//       *     responses:
//       *       200:
//       *         description: Data found successfully.
//       *       501:
//       *         description: Something went wrong.
//       *       404:
//       *         description: Data not found.
//       *       409:
//       *         description: Already exist.
//       */

//     async viewFAQ(req, res, next) {
//         const validationSchema = {
//             _id: Joi.string().required(),
//         };
//         try {
//             const validatedBody = await Joi.validate(req.params, validationSchema);
//             var result = await findFAQ({ _id: validatedBody._id })
//             if (!result) {
//                 throw apiError.notFound([], responseMessage.DATA_NOT_FOUND)
//             }
//             return res.json(new response(result, responseMessage.DATA_FOUND));
//         } catch (error) {
//             return next(error);
//         }
//     }

//     /**
//     * @swagger
//     * /static/editFAQ:
//     *   put:
//     *     tags:
//     *       - FAQ MANAGEMENT
//     *     description: editFAQ
//     *     produces:
//     *       - application/json
//     *     parameters:
//     *       - name: _id
//     *         description: _id
//     *         in: formData
//     *         required: true
//     *       - name: question
//     *         description: question
//     *         in: formData
//     *         required: true
//     *       - name: answer
//     *         description: answer
//     *         in: formData
//     *         required: true
//     *       - name: image
//     *         description: image
//     *         in: formData
//     *         required: false
//     *       - name: url
//     *         description: url
//     *         in: formData
//     *         required: false
//     *     responses:
//     *       200:
//     *         description: Data update successfully.
//     *       501:
//     *         description: Something went wrong.
//     *       404:
//     *         description: Data not found.
//     *       409:
//     *         description: Already exist.
//     */

//     async editFAQ(req, res, next) {
//         try {
//             const validatedBody = await Joi.validate(req.body);
//             var faqRes = await findFAQ({ _id: validatedBody._id })
//             if (!faqRes) {
//                 throw apiError.notFound([], responseMessage.DATA_NOT_FOUND)
//             }
//             if (validatedBody.image) {
//                 validatedBody.image = await commonFunction.getSecureUrl(validatedBody.image);
//             }
//             var result = await updateFAQ({ _id: faqRes._id }, validatedBody)
//             console.log("===", result)

//             return res.json(new response(result, responseMessage.UPDATE_SUCCESS));
//         } catch (error) {
//             return next(error);
//         }
//     }

//     /**
//     * @swagger
//     * /static/deleteFAQ:
//     *   delete:
//     *     tags:
//     *       - FAQ MANAGEMENT
//     *     description: deleteFAQ
//     *     produces:
//     *       - application/json
//     *     parameters:
//     *       - name: token
//     *         description: token
//     *         in: header
//     *         required: true
//     *       - name: deleteFAQ
//     *         description: deleteFAQ
//     *         in: body
//     *         required: true
//     *         schema:
//     *           $ref: '#/definitions/deleteFAQ'
//     *     responses:
//     *       200:
//     *         description: Deleted successfully.
//     *       501:
//     *         description: Something went wrong.
//     *       404:
//     *         description: FAQ data not found/User not found
//     *       409:
//     *         description: Already exist.
//     */

//     async deleteFAQ(req, res, next) {
//         const validationSchema = {
//             _id: Joi.string().required()
//         };
//         try {
//             const validatedBody = await Joi.validate(req.body, validationSchema);
//             let userResult = await findUser({ _id: req.userId, userType: "Admin" });
//             if (!userResult) {
//                 throw apiError.notFound(responseMessage.USER_NOT_FOUND);
//             }
//             var faqInfo = await findFAQ({ _id: validatedBody._id, status: { $ne: status.DELETE } });
//             if (!faqInfo) {
//                 throw apiError.notFound(responseMessage.FAQ_NOT_FOUND);
//             }
//             let deleteRes = await updateFAQ({ _id: faqInfo._id }, { status: status.DELETE });
//             return res.json(new response(deleteRes, responseMessage.DELETE_SUCCESS));
//         } catch (error) {
//             return next(error);
//         }
//     }

//     /**
//      * @swagger
//      * /static/faqList:
//      *   get:
//      *     tags:
//      *       - FAQ MANAGEMENT
//      *     description: faqList
//      *     produces:
//      *       - application/json
//      *     responses:
//      *       200:
//      *         description: data found successfully.
//      *       404:
//      *         description: Data not found
//      */

//     async faqList(req, res, next) {
//         try {
//             var result = await FAQList()
//             if (result.length == 0) {
//                 throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
//             }
//             return res.json(new response(result, responseMessage.DATA_FOUND));
//         } catch (error) {
//             return next(error);
//         }
//     }



// }

// export default new staticController()