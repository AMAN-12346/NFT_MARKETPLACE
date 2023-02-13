// import Joi from "joi";
// import _ from "lodash";
// import config from "config";
// import apiError from '../../../../helper/apiError';
// import response from '../../../../../assets/response';

// import responseMessage from '../../../../../assets/responseMessage';
// import { userServices } from '../../services/user';
// import { circuitServices } from '../../services/circuit';


// const { findUser, updateUser, userList } = userServices;
// const { createCircuit, findCircuit, updateCircuit, circuitList } = circuitServices;

// import commonFunction from '../../../../helper/util';
// import jwt from 'jsonwebtoken';
// import status from '../../../../enums/status';
// import userType from "../../../../enums/userType";



// export class circuitController {

//     /**
//      * @swagger
//      * /circuit/circuit:
//      *   post:
//      *     tags:
//      *       - CIRCUIT MANAGEMENT
//      *     description: addCircuit ?? This api is used to create circuit details.
//      *     produces:
//      *       - application/json
//      *     parameters:
//      *       - name: token
//      *         description: token
//      *         in: header
//      *         required: true
//      *       - name: name
//      *         description: name
//      *         in: formData
//      *         required: true
//      *       - name: description
//      *         description: description
//      *         in: formData
//      *         required: true
//      *       - name: image
//      *         description: image
//      *         in: formData
//      *         type: file
//      *         required: false
//      *     responses:
//      *       200:
//      *         description: Returns success message
//      */

//     async addCircuit(req, res, next) {
//         const validationSchema = {
//             name: Joi.string().required(),
//             description: Joi.string().required(),
//             image: Joi.string().optional()
//         }
//         try {
//             const validatedBody = await Joi.validate(req.body, validationSchema);
//             var adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
//             if (!adminResult) {
//                 throw apiError.notFound(responseMessage.USER_NOT_FOUND);
//             }
//             let circuitResult = await findCircuit({ name: validatedBody.name, status: { $ne: status.DELETE } });
//             if (circuitResult) {
//                 throw apiError.conflict(responseMessage.DATA_EXIST);
//             }
//             if (req.files) {
//                 validatedBody.image = await commonFunction.getImageUrl(req.files);
//             }

//             let result = await createCircuit(validatedBody);
//             return res.json(new response(result, responseMessage.CIRCUIT_ADDED));
//         }
//         catch (error) {
//             return next(error);
//         }
//     }

//     /**
//      * @swagger
//      * /circuit/circuit/{_id}:
//      *   get:
//      *     tags:
//      *       - CIRCUIT MANAGEMENT
//      *     description: viewCircuit ?? This is used to fetch circuit id details on the basis of id.
//      *     produces:
//      *       - application/json
//      *     parameters:
//      *       - name: token
//      *         description: token
//      *         in: header
//      *         required: true
//      *       - name: _id
//      *         description: _id
//      *         in: path
//      *         required: true
//      *     responses:
//      *       200:
//      *         description: Returns success message
//      */

//     async viewCircuit(req, res, next) {
//         const validationSchema = {
//             _id: Joi.string().required(),
//         }
//         try {
//             const { _id } = await Joi.validate(req.params, validationSchema);
//             var adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
//             if (!adminResult) {
//                 throw apiError.notFound(responseMessage.USER_NOT_FOUND);
//             }
//             let result = await findCircuit({ _id: _id, status: { $ne: status.DELETE } });
//             if (!result) {
//                 throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
//             }
//             return res.json(new response(result, responseMessage.DATA_FOUND));
//         }
//         catch (error) {
//             return next(error);
//         }
//     }

//     /**
//      * @swagger
//      * /circuit/circuit:
//      *   put:
//      *     tags:
//      *       - CIRCUIT MANAGEMENT
//      *     description: editCircuit ?? This is used to edit details of circuit.
//      *     produces:
//      *       - application/json
//      *     parameters:
//      *       - name: token
//      *         description: token
//      *         in: header
//      *         required: true
//      *       - name: _id
//      *         description: _id
//      *         in: formData
//      *         required: true
//      *       - name: name
//      *         description: name
//      *         in: formData
//      *         required: false
//      *       - name: description
//      *         description: description
//      *         in: formData
//      *         required: false
//      *       - name: image
//      *         description: image
//      *         in: formData
//      *         type: file
//      *         required: false
//      *     responses:
//      *       200:
//      *         description: Returns success message
//      */

//     async editCircuit(req, res, next) {
//         const validationSchema = {
//             _id: Joi.string().required(),
//             name: Joi.string().optional(),
//             description: Joi.string().optional(),
//             image: Joi.string().optional()
//         }
//         try {
//             const validatedBody = await Joi.validate(req.body, validationSchema);
//             var adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
//             if (!adminResult) {
//                 throw apiError.notFound(responseMessage.USER_NOT_FOUND);
//             }
//             let circuitResult = await findCircuit({ _id: validatedBody._id, status: { $ne: status.DELETE } });
//             if (!circuitResult) {
//                 throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
//             }
//             console.log('184 ==>',req.files)
//             if (req.files) {
//                 validatedBody.image = await commonFunction.getImageUrl(req.files);
//             }
//             let result = await updateCircuit({ _id: circuitResult._id }, { $set: validatedBody });
//             return res.json(new response(result, responseMessage.UPDATE_SUCCESS));
//         }
//         catch (error) {
//             return next(error);
//         }
//     }

//     /**
//      * @swagger
//      * /circuit/circuit:
//      *   delete:
//      *     tags:
//      *       - CIRCUIT MANAGEMENT
//      *     description: deleteCircuit ?? This is used to delete circuit.
//      *     produces:
//      *       - application/json
//      *     parameters:
//      *       - name: token
//      *         description: token
//      *         in: header
//      *         required: true
//      *       - name: _id
//      *         description: _id
//      *         in: query
//      *         required: true
//      *     responses:
//      *       200:
//      *         description: Returns success message
//      */

//     async deleteCircuit(req, res, next) {
//         const validationSchema = {
//             _id: Joi.string().required(),
//         }
//         try {
//             const { _id } = await Joi.validate(req.query, validationSchema);
//             var adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
//             if (!adminResult) {
//                 throw apiError.notFound(responseMessage.USER_NOT_FOUND);
//             }
//             let circuitResult = await findCircuit({ _id: _id, status: { $ne: status.DELETE } });
//             if (!circuitResult) {
//                 throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
//             }
//             let result = await updateCircuit({ _id: circuitResult._id }, { $set: { status: status.DELETE } });
//             return res.json(new response(result, responseMessage.DELETE_SUCCESS));
//         }
//         catch (error) {
//             return next(error);
//         }
//     }

//     /**
//      * @swagger
//      * /circuit/listCircuit:
//      *   get:
//      *     tags:
//      *       - CIRCUIT MANAGEMENT
//      *     description: listCircuit ?? This is used to fetch all circuit history details.
//      *     produces:
//      *       - application/json
//      *     parameters:
//      *       - name: token
//      *         description: token
//      *         in: header
//      *         required: true
//      *       - name: fromDate
//      *         description: fromDate
//      *         in: query
//      *         required: false
//      *       - name: toDate
//      *         description: toDate
//      *         in: query
//      *         required: false
//      *       - name: page
//      *         description: page
//      *         in: query
//      *         required: false
//      *       - name: limit
//      *         description: limit
//      *         in: query
//      *         required: false
//      *       - name: search
//      *         description: search
//      *         in: query
//      *         required: false
//      *     responses:
//      *       200:
//      *         description: Returns success message
//      */

//     async listCircuit(req, res, next) {
//         const validationSchema = {
//             search: Joi.string().optional(),
//             fromDate: Joi.string().optional(),
//             toDate: Joi.string().optional(),
//             page: Joi.number().optional(),
//             limit: Joi.number().optional(),
//         }
//         try {
//             const validatedBody = await Joi.validate(req.query, validationSchema);
//             var adminResult = await findUser({ _id: req.userId });
//             if (!adminResult) {
//                 throw apiError.notFound(responseMessage.USER_NOT_FOUND);
//             }
//             let result = await circuitList(validatedBody);
//             return res.json(new response(result, responseMessage.DATA_FOUND));
//         }
//         catch (error) {
//             return next(error);
//         }
//     }
// }

// export default new circuitController()

