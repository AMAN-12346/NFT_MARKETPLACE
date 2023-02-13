// import Joi from "joi";
// import _ from "lodash";
// import config from "config";
// import apiError from '../../../../helper/apiError';
// import response from '../../../../../assets/response';

// import responseMessage from '../../../../../assets/responseMessage';
// import { userServices } from '../../services/user';
// import { circuitServices } from '../../services/circuit';
// import { practiceServices } from '../../services/practice';
// import { practiceRacingServices } from '../../services/practiceRacing';


// const { findUser, updateUser, userList } = userServices;
// const { findCircuit, updateCircuit, circuitList } = circuitServices;
// const { createPractice, findPractice, updatePractice, practiceList } = practiceServices;
// const { createPracticeRacing, findPracticeRacingWithPopulate, findPracticeRacing, findAllPracticeRacingWithPopulate, updatePracticeRacing } = practiceRacingServices;

// import commonFunction from '../../../../helper/util';
// import jwt from 'jsonwebtoken';
// import status from '../../../../enums/status';
// import userType from "../../../../enums/userType";



// export class practiceController {

//     /**
//      * @swagger
//      * /practice/practice:
//      *   post:
//      *     tags:
//      *       - PRACTICE MANAGEMENT
//      *     description: addPractice ?? These api is used for practice mode.
//      *     produces:
//      *       - application/json
//      *     parameters:
//      *       - name: token
//      *         description: token
//      *         in: header
//      *         required: true
//      *       - name: addPractice
//      *         description: addPractice
//      *         in: body
//      *         required: true
//      *         schema:
//      *           $ref: '#/definitions/addPractice'
//      *     responses:
//      *       200:
//      *         description: Returns success message
//      */

//     async addPractice(req, res, next) {
//         const validationSchema = {
//             name: Joi.string().required(),
//             description: Joi.string().required(),
//             circuitId: Joi.string().required(),
//             fee: Joi.number().required(),
//             laps: Joi.number().required(),
//         }
//         try {
//             const validatedBody = await Joi.validate(req.body, validationSchema);
//             var adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN })
//             if (!adminResult) {
//                 throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
//             }
//             let practiceResult = await findPractice({ name: validatedBody.name, status: { $ne: status.DELETE } });
//             if (practiceResult) {
//                 throw apiError.conflict(responseMessage.DATA_EXIST);
//             }

//             let circuitResult = await findCircuit({ _id: validatedBody.circuitId, status: status.ACTIVE });
//             if (!circuitResult) {
//                 throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
//             }

//             let result = await createPractice(validatedBody);
//             return res.json(new response(result, responseMessage.PRACTICE_ADDED));
//         }
//         catch (error) {
//             return next(error);
//         }
//     }

//     /**
//      * @swagger
//      * /practice/practice/{_id}:
//      *   get:
//      *     tags:
//      *       - PRACTICE MANAGEMENT
//      *     description: viewPractice ?? These api is used for practice mode.
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

//     async viewPractice(req, res, next) {
//         const validationSchema = {
//             _id: Joi.string().required(),
//         }
//         try {
//             const { _id } = await Joi.validate(req.params, validationSchema);
//             var adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN })
//             if (!adminResult) {
//                 throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
//             }
//             let result = await findPractice({ _id: _id, status: { $ne: status.DELETE } });
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
//      * /practice/practice:
//      *   put:
//      *     tags:
//      *       - PRACTICE MANAGEMENT
//      *     description: editPractice ?? These api is used for practice mode.
//      *     produces:
//      *       - application/json
//      *     parameters:
//      *       - name: token
//      *         description: token
//      *         in: header
//      *         required: true
//      *       - name: editPractice
//      *         description: editPractice
//      *         in: body
//      *         required: true
//      *         schema:
//      *           $ref: '#/definitions/editPractice'
//      *     responses:
//      *       200:
//      *         description: Returns success message
//      */

//     async editPractice(req, res, next) {
//         const validationSchema = {
//             _id: Joi.string().required(),
//             name: Joi.string().optional(),
//             description: Joi.string().optional(),
//             circuitId: Joi.string().optional(),
//             fee: Joi.number().optional(),
//             laps: Joi.number().optional(),
//         }
//         try {
//             const validatedBody = await Joi.validate(req.body, validationSchema);
//             var adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN })
//             if (!adminResult) {
//                 throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
//             }
//             let practiceResult = await findPractice({ _id: validatedBody._id, status: { $ne: status.DELETE } });
//             if (!practiceResult) {
//                 throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
//             }
//             let result = await updatePractice({ _id: practiceResult._id }, { $set: validatedBody });
//             return res.json(new response(result, responseMessage.UPDATE_SUCCESS));
//         }
//         catch (error) {
//             return next(error);
//         }
//     }

//     /**
//      * @swagger
//      * /practice/practice:
//      *   delete:
//      *     tags:
//      *       - PRACTICE MANAGEMENT
//      *     description: deletePractice ?? These api is used for practice mode.
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

//     async deletePractice(req, res, next) {
//         const validationSchema = {
//             _id: Joi.string().required(),
//         }
//         try {
//             const { _id } = await Joi.validate(req.query, validationSchema);
//             var adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN })
//             if (!adminResult) {
//                 throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
//             }
//             let practiceResult = await findPractice({ _id: _id, status: { $ne: status.DELETE } });
//             if (!practiceResult) {
//                 throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
//             }
//             let result = await updatePractice({ _id: practiceResult._id }, { $set: { status: status.DELETE } });
//             return res.json(new response(result, responseMessage.DELETE_SUCCESS));
//         }
//         catch (error) {
//             return next(error);
//         }
//     }

//     /**
//      * @swagger
//      * /practice/listPractice:
//      *   get:
//      *     tags:
//      *       - PRACTICE MANAGEMENT
//      *     description: listPractice ?? These api is used for practice mode.
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

//     async listPractice(req, res, next) {
//         const validationSchema = {
//             search: Joi.string().optional(),
//             fromDate: Joi.string().optional(),
//             toDate: Joi.string().optional(),
//             page: Joi.number().optional(),
//             limit: Joi.number().optional(),
//         }
//         try {
//             const validatedBody = await Joi.validate(req.query, validationSchema);
//             var adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN })
//             if (!adminResult) {
//                 throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
//             }
//             let result = await practiceList(validatedBody);
//             return res.json(new response(result, responseMessage.DATA_FOUND));
//         }
//         catch (error) {
//             return next(error);
//         }
//     }

//     /**
//      * @swagger
//      * /practice/customizePractice:
//      *   put:
//      *     tags:
//      *       - PRACTICE MANAGEMENT
//      *     description: customizePractice ?? These api is used for practice mode.
//      *     produces:
//      *       - application/json
//      *     parameters:
//      *       - name: token
//      *         description: token
//      *         in: header
//      *         required: true
//      *       - name: customizePractice
//      *         description: customizePractice
//      *         in: body
//      *         required: true
//      *         schema:
//      *           $ref: '#/definitions/customizePractice'
//      *     responses:
//      *       200:
//      *         description: Returns success message
//      */

//     async customizePractice(req, res, next) {
//         const validationSchema = {
//             practiceId: Joi.string().required(),
//             dogId: Joi.string().required(),
//         }
//         try {
//             const validatedBody = await Joi.validate(req.body, validationSchema);
//             var userResult = await findUser({ _id: req.userId, userType: userType.USER })
//             if (!userResult) {
//                 throw apiError.notFound(responseMessage.USER_NOT_FOUND);
//             }
//             let practiceResult = await findPractice({ _id: validatedBody.practiceId, status: { $ne: status.DELETE } });
//             if (!practiceResult) {
//                 throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
//             }
//             validatedBody.userId = userResult._id;
//             let arr = [];
//             for (let i = 0; i < practiceResult.laps; i++) {
//                 arr.push({ lap: i + 1, time: 0 })
//             }
//             validatedBody.lapsTime = arr;
//             let result = await createPracticeRacing(validatedBody);
//             return res.json(new response(result, responseMessage.DATA_FOUND));
//         }
//         catch (error) {
//             return next(error);
//         }
//     }

//     /**
//      * @swagger
//      * /practice/allPracticeModeDetails:
//      *   get:
//      *     tags:
//      *       - PRACTICE MANAGEMENT
//      *     description: getPracticeModeDetails ?? These api is used for practice mode.
//      *     produces:
//      *       - application/json
//      *     parameters:
//      *       - name: token
//      *         description: token
//      *         in: header
//      *         required: true
//      *       - name: raceStatus
//      *         description: raceStatus
//      *         in: query
//      *         enum: [true,false]
//      *         default: false
//      *         required: false
//      *     responses:
//      *       200:
//      *         description: Returns success message
//      */

//     async allPracticeModeDetails(req, res, next) {
//         try {
//             var userResult = await findUser({ _id: req.userId, userType: userType.USER })
//             if (!userResult) {
//                 throw apiError.notFound(responseMessage.USER_NOT_FOUND);
//             }
//             if (!req.query) {
//                 req.query.raceStatus = false
//             }
//             var practiceDetails = await findAllPracticeRacingWithPopulate({ userId: userResult._id, isComplete: req.query.raceStatus });
//             for (let i in practiceDetails) {
//                 practiceDetails[i].dogId.properties = JSON.parse(practiceDetails[i].dogId['properties']);
//             }
//             if (practiceDetails.length == 0) {
//                 throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
//             }
//             return res.json(new response(practiceDetails, responseMessage.DATA_FOUND));
//         }
//         catch (error) {
//             return next(error);
//         }
//     }

//     /**
//      * @swagger
//      * /practice/practiceModeDetails:
//      *   get:
//      *     tags:
//      *       - PRACTICE MANAGEMENT
//      *     description: getPracticeModeDetails ?? These api is used for practice mode.
//      *     produces:
//      *       - application/json
//      *     parameters:
//      *       - name: token
//      *         description: token
//      *         in: header
//      *         required: true
//      *       - name: practiceId
//      *         description: query
//      *         in: query
//      *         required: true
//      *     responses:
//      *       200:
//      *         description: Returns success message
//      */

//     async getPracticeModeDetails(req, res, next) {
//         try {
//             var userResult = await findUser({ _id: req.userId, userType: userType.USER })
//             if (!userResult) {
//                 throw apiError.notFound(responseMessage.USER_NOT_FOUND);
//             }
//             var practiceDetails = await findPracticeRacingWithPopulate({ userId: userResult._id, practiceId: req.query.practiceId });
//             if (!practiceDetails) {
//                 throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
//             }
//             var result = JSON.parse(JSON.stringify(practiceDetails));
//             result.dogId.properties = JSON.parse(practiceDetails.dogId['properties']);
//             return res.json(new response(result, responseMessage.DATA_FOUND));
//         }
//         catch (error) {
//             return next(error);
//         }
//     }

//     async practiceRaceDetails(req) {
//         var res;
//         return new Promise(async (resolve, reject) => {
//             try {
//                 var userResult = await findUser({ _id: req.userId, userType: userType.USER })
//                 if (!userResult) {
//                     res = apiError.notFound(responseMessage.USER_NOT_FOUND);
//                     resolve(res);
//                 }
//                 var practiceDetails = await findPracticeRacingWithPopulate({ userId: userResult._id, practiceId: req.practiceId, isComplete: false });
//                 if (!practiceDetails) {
//                     res = apiError.notFound(responseMessage.DATA_NOT_FOUND);
//                     resolve(res);
//                 }
//                 var result = JSON.parse(JSON.stringify(practiceDetails));
//                 result.dogId.properties = JSON.parse(practiceDetails.dogId['properties']);
//                 res = new response(result, responseMessage.DATA_FOUND);
//                 resolve(res);
//             } catch (error) { console.log(error) }
//         })
//     }

//     async practiceMove(req) {
//         var res;
//         return new Promise(async (resolve, reject) => {
//             var practiceResult = await findPracticeRacing({ _id: req._id, status: status.ACTIVE, isComplete: false });
//             if (!practiceResult) {
//                 res = apiError.notFound(responseMessage.DATA_NOT_FOUND);
//                 resolve(res);
//             }
//             else {
//                 var result = await updatePracticeRacing({ _id: practiceResult._id }, { $set: { xMove: req.xMove, yMove: req.yMove, zMove: req.zMove } })
//                 res = new response(result, responseMessage.UPDATE_SUCCESS)
//                 resolve(res);
//             }
//         })
//     }

//     async practiceRotate(req) {
//         var res;
//         return new Promise(async (resolve, reject) => {
//             var practiceResult = await findPracticeRacing({ _id: req._id, status: status.ACTIVE, isComplete: false });
//             if (!practiceResult) {
//                 res = apiError.notFound(responseMessage.DATA_NOT_FOUND);
//                 resolve(res);
//             }
//             else {
//                 var result = await updatePracticeRacing({ _id: practiceResult._id }, { $set: { xRotate: req.xRotate, yRotate: req.yRotate, zRotate: req.zRotate } })
//                 res = new response(result, responseMessage.UPDATE_SUCCESS)
//                 resolve(res);
//             }
//         })
//     }

//     async practiceTimeStatus(req) {
//         let res;
//         return new Promise(async (resolve, reject) => {
//             try {
//                 var practiceResult = await findPracticeRacing({ _id: req._id, status: status.ACTIVE, isComplete: false });
//                 if (!practiceResult) {
//                     res = apiError.notFound(responseMessage.DATA_NOT_FOUND);
//                     resolve(res);
//                 }
//                 else {
//                     let updateData, result;
//                     let query;
//                     req._totalRaceTimer = req._lap1RaceTimer;
//                     if (req._lap2RaceTimer >= 1) {
//                         req._totalRaceTimer = req._totalRaceTimer + req._lap2RaceTimer
//                     }
//                     if (req._lap3RaceTimer >= 1) {
//                         req._totalRaceTimer = req._totalRaceTimer + req._lap3RaceTimer
//                     }
//                     if (req._lap1RaceTimer) {
//                         // console.log('C1 ==||');
//                         query = { _id: practiceResult._id, 'lapsTime.lap': 1 };
//                         updateData = { $set: { 'lapsTime.$.time': req._lap1RaceTimer, totalTime: req._totalRaceTimer } };
//                         result = await updatePracticeRacing(query, updateData);
//                     }
//                     if (req._lap2RaceTimer && practiceResult.lapsTime.length >= 2) {
//                         // console.log('C2 ==||');
//                         if (req._lap2RaceTimer >= 1) {
//                             query = { _id: practiceResult._id, 'lapsTime.lap': 2 };
//                             updateData = { $set: { 'lapsTime.$.time': req._lap2RaceTimer, totalTime: req._totalRaceTimer } };
//                             result = await updatePracticeRacing(query, updateData);
//                         }
//                     }
//                     if (req._lap3RaceTimer && practiceResult.lapsTime.length >= 3) {
//                         // console.log('C3 ==||');
//                         if (req._lap3RaceTimer >= 1) {
//                             query = { _id: practiceResult._id, 'lapsTime.lap': 3 };
//                             updateData = { $set: { 'lapsTime.$.time': req._lap3RaceTimer, totalTime: req._totalRaceTimer } };
//                             result = await updatePracticeRacing(query, updateData);
//                         }

//                     }
//                     if (result) {
//                         res = new response(result, responseMessage.UPDATE_SUCCESS)
//                         resolve(res);
//                     }
//                 }
//             } catch (error) { console.log(error) }
//         })
//     }

//     async practiceModeComplete(req) {
//         var res;
//         return new Promise(async (resolve, reject) => {
//             try {
//                 var practiceResult = await findPracticeRacing({ _id: req._id, status: status.ACTIVE, isComplete: false });
//                 if (!practiceResult) {
//                     res = apiError.notFound(responseMessage.DATA_NOT_FOUND);
//                     resolve(res);
//                 }
//                 else {
//                     var result = await updatePracticeRacing({ _id: practiceResult._id }, { $set: { isComplete: true } })
//                     res = new response(result, responseMessage.COMPLETE_SUCCESS)
//                     resolve(res);
//                 }
//             } catch (error) { console.log(error) }
//         })
//     }

//     async practiceRaceStatus(req) {
//         var res;
//         return new Promise(async (resolve, reject) => {
//             var result = await findPracticeRacingWithPopulate({ userId: req.userId, practiceId: req.practiceId, status: status.ACTIVE });
//             if (!result) {
//                 res = apiError.notFound(responseMessage.DATA_NOT_FOUND);
//                 resolve(res);
//             }
//             else {
//                 res = new response(result, responseMessage.DATA_FOUND)
//                 resolve(res);
//             }
//         })
//     }
// }

// export default new practiceController()

