import Joi from "joi";
import _ from "lodash";
import config from "config";
import apiError from '../../../../helper/apiError';
import response from '../../../../../assets/response';

import responseMessage from '../../../../../assets/responseMessage';
import { userServices } from '../../services/user';
import { circuitServices } from '../../services/circuit';
import { eventServices } from '../../services/event';
import { eventRacingServices } from '../../services/eventRacing';
import { nftServices } from '../../services/nft';


const { findUser, updateUser, userList } = userServices;
const { findCircuit, updateCircuit, circuitList } = circuitServices;
const { createEvent, findEvent, updateEvent, eventList, findEventWithTimeSort, findEventWithPopulate, createScheduleEvent, findEventWithSort } = eventServices;
const { createEventRacing, findEventRacing, findEventRacingWithPopulate, updateEventRacing, multiUpdateEventRaceing, findAllEventRacingWithPopulate, findAllEventRacing, findAllEventRacingWithSort } = eventRacingServices;
const { findNft, updateNft } = nftServices;

import { dogHistoryServices } from '../../services/dogHistory';
const { createDogHistory, findDogHistory, updateDogHistory, listDogHistory, listDogHistorySearch } = dogHistoryServices;

import { chatServices } from '../../services/chat';
const { createManyChat } = chatServices;
import { groupServices } from '../../services/group';
const { createManyGroup, findGroup, findGroupAndPopulate, updateGroup } = groupServices;

import { transactionServices } from '../../services/transaction';
const { createTransaction, findTransaction, updateTransaction, transactionList, transactionHistory } = transactionServices;



import commonFunction from '../../../../helper/util';
import status from '../../../../enums/status';
import userType from "../../../../enums/userType";
import blockchainFunction from '../../../../helper/blockchain';
const adminAddressLive = config.get('adminAddressLive');


export class eventController {

    /**
  * @swagger
  * /event/listTransaction:
  *   get:
  *     tags:
  *       - TRANSACTION MANAGEMENT
  *     description: listTransaction ?? To fetch all transaction history details.
  *     produces:
  *       - application/json
  *     responses:
  *       200:
  *         description: Returns success message
  */

    async listTransaction(req, res, next) {

        try {
            let result = await transactionList({});
            return res.json(new response(result, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /event/eventSchedule:
     *   post:
     *     tags:
     *       - EVENT MANAGEMENT
     *     description: addEventSchedule ?? This is used to create multiple events with the intervals of time duration as per requested.
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
     *         required: false
     *       - name: circuitId
     *         description: circuitId
     *         in: formData
     *         required: true
     *       - name: fee
     *         description: fee
     *         in: formData
     *         required: true
     *       - name: price
     *         description: price
     *         in: formData
     *         required: true
     *       - name: startDate
     *         description: startDate
     *         in: formData
     *         required: true
     *       - name: registrationTime
     *         description: registrationTime
     *         in: formData
     *         required: true
     *       - name: raceStartTime
     *         description: raceStartTime
     *         in: formData
     *         required: true
     *       - name: gameTime
     *         description: gameTime
     *         in: formData
     *         required: true
     *       - name: noOfPlayers
     *         description: noOfPlayers
     *         in: formData
     *         required: true
     *       - name: timeDuration
     *         description: timeDuration
     *         in: formData
     *         required: true
     *       - name: scheduleCount
     *         description: scheduleCount
     *         in: formData
     *         required: true
     *       - name: image
     *         description: image
     *         in: formData
     *         type: file
     *         required: false
     *       - name: logo
     *         description: logo
     *         in: formData
     *         type: file
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async addEventSchedule(req, res, next) {
        const validationSchema = {
            name: Joi.string().required(),
            description: Joi.string().optional(),
            circuitId: Joi.string().required(),
            fee: Joi.number().required(),
            price: Joi.number().optional(),
            startDate: Joi.string().required(),
            registrationTime: Joi.number().required(),
            raceStartTime: Joi.number().required(),
            gameTime: Joi.number().required(),
            noOfPlayers: Joi.number().required(),
            timeDuration: Joi.number().required(),
            scheduleCount: Joi.number().required(),
            image: Joi.string().optional(),
            logo: Joi.string().optional()
        }
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            var adminResult = await findUser({ _id: req.userId })
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            let circuitResult = await findCircuit({ _id: validatedBody.circuitId, status: status.ACTIVE });
            if (!circuitResult) {
                throw apiError.notFound(responseMessage.EVENT_NOT_EXIST);
            }

            /*
            let lastEvent = await findEventWithSort({ status: status.ACTIVE, userId: adminResult._id });
            console.log("lastEvent===>>", lastEvent);
            if (lastEvent) {
                let totalTime = Number(validatedBody.timeDuration) * Number(validatedBody.scheduleCount);
                console.log("totalTime====>>", totalTime);
                let newTime = new Date(new Date(validatedBody.startDate).setMinutes(new Date(validatedBody.startDate).getMinutes() + totalTime)).toISOString();

                let eventScheduleStart = new Date(lastEvent.scheduleRange.startDate);
                let eventScheduleEnd = new Date(lastEvent.scheduleRange.endDate);
                let currentStart = new Date(validatedBody.startDate);
                let currentEnd = new Date(newTime);
                console.log("eventScheduleStart==>>", eventScheduleStart);
                console.log("eventScheduleEnd==>>", eventScheduleEnd);
                console.log("currentStart==>>", currentStart);
                console.log("currentEnd==>>", currentEnd);


                if (((currentStart >= eventScheduleStart && currentStart <= eventScheduleEnd) || (currentEnd >= eventScheduleStart && currentEnd <= eventScheduleEnd))) {
                    throw apiError.badRequest(responseMessage.EVENT_NOT_ADD(new Date(lastEvent.scheduleRange.endDate)));
                }
            }
            */

            let [lastEvent, lastTime] = await Promise.all([
                findEventWithSort({ startDate: { $gte: new Date().toISOString() }, status: status.ACTIVE, userId: adminResult._id }),
                findEventWithTimeSort({ status: status.ACTIVE, userId: adminResult._id })
            ]);
            const timeRes = await getTimeFrame(validatedBody.startDate, validatedBody.scheduleCount, validatedBody.timeDuration);
            for (let time of timeRes) {
                const search = lastEvent.find(element => ((new Date(time.startDate) >= element.startDate && new Date(time.startDate) <= element.endDate) || (new Date(time.endDate) >= element.startDate && new Date(time.endDate) <= element.endDate)));
                if (search) throw apiError.badRequest(responseMessage.EVENT_NOT_ADD(new Date(lastTime.scheduleRange.endDate)));
            }


            // return
            let eventResult = await findEvent({ name: validatedBody.name, status: { $ne: status.DELETE } });
            if (eventResult) {
                throw apiError.conflict(responseMessage.DATA_EXIST);
            }
            // if (req.files) {
            //     console.log(req.files)
            //     validatedBody.image = await commonFunction.getImageUrl(req.files);
            // }
            if (req.files || req.files.length != 0) {
                let image = req['files'].find((o) => { return o.fieldname == 'image' });
                let logo = req['files'].find((o) => { return o.fieldname == 'logo' });
                if (image) {
                    validatedBody.image = await commonFunction.getImageUrlByPathObj(image);
                }
                if (logo) {
                    validatedBody.logo = await commonFunction.getImageUrlByPathObj(logo);
                }
            }

            var startDate = validatedBody.startDate;
            let scheduleRange = {
                startDate: validatedBody.startDate
            };
            var arr = [], groupArr = [], chatArr = [], endDate, et, alphabet, month, date;
            for (let i = 0; i < validatedBody.scheduleCount; i++) {
                et = new Date(startDate);
                et.setMinutes(et.getMinutes() + validatedBody.timeDuration);
                endDate = new Date(et).toISOString();
                month = new Date(startDate).getMonth() + 1;
                date = new Date(startDate).getDate();
                alphabet = alphabet == undefined ? "A" : String.fromCharCode(alphabet.charCodeAt(0) + 1)
                if (validatedBody.timeDuration >= 60) {
                    validatedBody.laps = 2;
                }
                arr.push({
                    userId: adminResult._id,
                    startDate: startDate,
                    endDate: endDate,
                    name: `${validatedBody.name} ${date}/${month} ${alphabet}`,
                    description: validatedBody.description,
                    circuitId: validatedBody.circuitId,
                    laps: validatedBody.laps == 2 ? 2 : 1,
                    fee: validatedBody.fee,
                    price: validatedBody.price,
                    // price: 0,
                    registrationTime: validatedBody.registrationTime,
                    raceStartTime: validatedBody.raceStartTime,
                    gameTime: validatedBody.gameTime,
                    noOfPlayers: validatedBody.noOfPlayers,
                    image: validatedBody.image,
                    logo: validatedBody.logo
                })

                startDate = endDate;
            }
            scheduleRange["endDate"] = arr[arr.length - 1].endDate;
            arr.forEach((element) => {
                element["scheduleRange"] = scheduleRange;
            });
            let result = await createScheduleEvent(arr);
            if (result.length != 0) {
                for (let index of result) {
                    groupArr.push({
                        eventId: index._id,
                        groupName: index.name,
                        groupImage: index.image,
                        createdBy: index.userId,
                        members: [index.userId]
                    })
                }
            }

            const groupRes = await createManyGroup(groupArr);
            if (groupRes.length != 0) {
                for (let index of groupRes) {
                    let obj = [{
                        senderId: index.createdBy,
                        message: "Group created",
                        createdAt: new Date().toISOString()
                    }]
                    chatArr.push({
                        eventId: index.eventId,
                        chatType: "group",
                        groupId: index._id,
                        messages: obj
                    })
                }
            }
            await createManyChat(chatArr);
            return res.json(new response(result, responseMessage.EVENT_ADDED));
        }
        catch (error) {
            console.log('174 ===>', error);
            return next(error);
        }
    }

    /**
     * @swagger
     * /event/getDogHistory:
     *   get:
     *     tags:
     *       - EVENT MANAGEMENT
     *     description: viewEvent ?? To get a perticular dog nft all details.
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: filterBy
     *         description: filterBy ?? topParticipated || topWinner || topPerformer
     *         in: query
     *         required: false 
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async getDogHistory(req, res, next) {
        const validationSchema = {
            filterBy: Joi.string().optional()
        }
        try {
            const { filterBy } = await Joi.validate(req.query, validationSchema);
            let result = await listDogHistorySearch(filterBy);
            if (result.length == 0) {
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
     * /event/event/{_id}:
     *   get:
     *     tags:
     *       - EVENT MANAGEMENT
     *     description: viewEvent ?? To view events details.
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

    async viewEvent(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
        }
        try {
            const { _id } = await Joi.validate(req.params, validationSchema);
            var adminResult = await findUser({ _id: req.userId })
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            let result = await findEvent({ _id: _id, status: { $ne: status.DELETE } });
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
     * /event/group/{eventId}:
     *   get:
     *     tags:
     *       - EVENT MANAGEMENT
     *     description: viewGroup ?? This is used for showing the specific group as per events.
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: eventId
     *         description: eventId
     *         in: path
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async viewGroup(req, res, next) {
        const validationSchema = {
            eventId: Joi.string().required(),
        }
        try {
            const { eventId } = await Joi.validate(req.params, validationSchema);
            var userResult = await findUser({ _id: req.userId })
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let result = await findGroupAndPopulate(eventId);
            result = result[0];
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
     * /event/event:
     *   put:
     *     tags:
     *       - EVENT MANAGEMENT
     *     description: editEvent ?? To change details of events.
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
     *       - name: circuitId
     *         description: circuitId
     *         in: formData
     *         required: false
     *       - name: price
     *         description: price
     *         in: formData
     *         required: false
     *       - name: fee
     *         description: fee
     *         in: formData
     *         required: false
     *       - name: startDate
     *         description: startDate
     *         in: formData
     *         required: false
     *       - name: endDate
     *         description: endDate
     *         in: formData
     *         required: false
     *       - name: registrationTime
     *         description: registrationTime
     *         in: formData
     *         required: false
     *       - name: raceStartTime
     *         description: raceStartTime
     *         in: formData
     *         required: false
     *       - name: gameTime
     *         description: gameTime
     *         in: formData
     *         required: false
     *       - name: noOfPlayers
     *         description: noOfPlayers
     *         in: formData
     *         required: false
     *       - name: image
     *         description: image
     *         in: formData
     *         type: file
     *         required: false
     *       - name: logo
     *         description: logo
     *         in: formData
     *         type: file
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async editEvent(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
            name: Joi.string().optional(),
            description: Joi.string().optional(),
            circuitId: Joi.string().optional(),
            fee: Joi.number().optional(),
            price: Joi.number().optional(),
            registrationTime: Joi.number().optional(),
            raceStartTime: Joi.number().optional(),
            gameTime: Joi.number().optional(),
            noOfPlayers: Joi.number().optional(),
            startDate: Joi.string().optional(),
            endDate: Joi.string().optional(),
            image: Joi.string().optional(),
            logo: Joi.string().optional()
        }
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            var adminResult = await findUser({ _id: req.userId })
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            let eventResult = await findEvent({ _id: validatedBody._id, status: { $ne: status.DELETE }, userId: adminResult._id });
            if (!eventResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            if (req.files || req.files.length != 0) {
                let image = req['files'].find((o) => { return o.fieldname == 'image' });
                let logo = req['files'].find((o) => { return o.fieldname == 'logo' });
                if (image) {
                    validatedBody.image = await commonFunction.getImageUrlByPathObj(image);
                }
                if (logo) {
                    validatedBody.logo = await commonFunction.getImageUrlByPathObj(logo);
                }
            }
            let result = await updateEvent({ _id: eventResult._id }, { $set: validatedBody });
            return res.json(new response(result, responseMessage.UPDATE_SUCCESS));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /event/event:
     *   delete:
     *     tags:
     *       - EVENT MANAGEMENT
     *     description: deleteEvent
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

    async deleteEvent(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
        }
        try {
            const { _id } = await Joi.validate(req.query, validationSchema);
            var adminResult = await findUser({ _id: req.userId })
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            let eventResult = await findEvent({ _id: _id, status: { $ne: status.DELETE }, userId: adminResult._id });
            if (!eventResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            // || eventResult.startDate > new Date(new Date().toISOString())
            if (eventResult.usersJoined.length > 0) {
                throw apiError.notAllowed(responseMessage.NOT_ABLE_TO_DELETE);
            }
            let result = await updateEvent({ _id: eventResult._id }, { $set: { status: status.DELETE } });
            return res.json(new response(result, responseMessage.DELETE_SUCCESS));
        }
        catch (error) {
            return next(error);
        }
    }


    /**
     * @swagger
     * /event/updateEventRace:
     *   put:
     *     tags:
     *       - EVENT MANAGEMENT
     *     description: updateEventRace ?? update event race details.
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: _id
     *         description: _id
     *         in: formData
     *         required: true
     *       - name: position
     *         description: position
     *         in: formData
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async updateEventRace(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
            position: Joi.string().required(),
        }
        try {
            const { _id, position } = await Joi.validate(req.body, validationSchema);
            let eventRaceResult = await findEventRacing({ _id: _id, status: { $ne: status.DELETE } });
            if (!eventRaceResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            let result = await updateEventRacing({ _id: eventRaceResult._id }, { $set: { position: position } });
            return res.json(new response(result, responseMessage.UPDATE_SUCCESS));
        }
        catch (error) {
            return next(error);
        }
    }


    /**
      * @swagger
      * /event/updateMultiEventRace:
      *   put:
      *     tags:
      *       - EVENT MANAGEMENT
      *     description: updateMultiEventRace ?? update multiracing details.
      *     produces:
      *       - application/json
      *     parameters:
      *       - name: position
      *         description: position
      *         in: formData
      *         required: true
      *       - name: status
      *         description: status
      *         in: formData
      *         required: true
      *     responses:
      *       200:
      *         description: Returns success message
      */

    async updateMultiEventRace(req, res, next) {
        try {
            let result = await multiUpdateEventRaceing({ position: { $gte: Number(req.body.position) } }, { status: req.body.status });
            return res.json(new response(result, responseMessage.UPDATE_SUCCESS));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /event/listEvent:
     *   get:
     *     tags:
     *       - EVENT MANAGEMENT
     *     description: listEvent ?? To fetch all events list.
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

    async listEvent(req, res, next) {
        const validationSchema = {
            search: Joi.string().optional(),
            fromDate: Joi.string().optional(),
            toDate: Joi.string().optional(),
            page: Joi.number().optional(),
            limit: Joi.number().optional(),
        }
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            var adminResult = await findUser({ _id: req.userId })
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            validatedBody.userId = adminResult._id
            let result = await eventList(validatedBody);
            return res.json(new response(result, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /event/enterEvent:
     *   post:
     *     tags:
     *       - USER-EVENT
     *     description: enterEvent ?? This api is used enter the room during start game.
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: enterEvent
     *         description: enterEvent
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/enterEvent'
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async enterEvent(req, res, next) {
        const validationSchema = {
            eventId: Joi.string().required(),
            dogId: Joi.string().required()
        }
        try {
            const { eventId, dogId } = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId, userType: { $in: [userType.USER, userType.ADMIN] } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let eventResult = await findEvent({ _id: eventId, status: status.ACTIVE });
            if (!eventResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            if (new Date(new Date().toISOString()) > eventResult.endDate) {
                throw apiError.badRequest(responseMessage.EVENT_ENDED);
            }
            var nftResult = await findNft({ _id: dogId, status: status.ACTIVE, userId: userResult._id });
            if (!nftResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            let eventRacingResult = await findEventRacing({ eventId: eventId, userId: userResult._id, isComplete: false, status: status.ACTIVE });
            if (eventRacingResult) {
                throw apiError.conflict(responseMessage.EVENT_EXIST);
            }
            var obj = {
                eventId: eventId,
                userId: userResult._id,
                dogId: dogId
            }
            let arr = [];
            for (let i = 0; i < eventResult.laps; i++) {
                arr.push({ lap: i + 1, time: 0 })
            }
            obj.lapsTime = arr;
            let [result, nftRes] = await Promise.all([
                createEventRacing(obj),
                updateNft({ _id: nftResult._id }, { $inc: { raceCount: 1 } })
            ])
            //*****************************Dated 1 Nov 22 ******************************************************/
            const checkDogRes = await findDogHistory({ dogId: dogId });
            if (!checkDogRes) {
                obj["noOfTimeParticipated"] = 1;
                obj["eventRacingId"] = result._id;
                await createDogHistory(obj);
            } else {
                await updateDogHistory({ _id: checkDogRes._id }, { $inc: { noOfTimeParticipated: 1 } });
            }
            await updateEvent({ _id: eventResult._id }, { isActive: true });
            return res.json(new response(result, responseMessage.ENTERED_SUCCESS));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /event/joinEvent:
     *   post:
     *     tags:
     *       - USER-EVENT
     *     description: enterEvent ?? It is used to joinEvents.
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: eventId
     *         description: eventId
     *         in: formData
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async joinEvent(req, res, next) {
        const validationSchema = {
            eventId: Joi.string().required()
        }
        try {
            const { eventId } = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId, userType: userType.USER });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let [eventResult, groupResult] = await Promise.all([
                findEvent({ _id: eventId, status: status.ACTIVE }),
                findGroup({ eventId: eventId, status: status.ACTIVE })
            ]);
            if (!eventResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            if (eventResult['usersJoined'].includes(userResult._id) == true) {
                throw apiError.conflict(responseMessage.EVENT_USER_EXIST);
            }
            if (new Date(new Date().toISOString()) > eventResult.endDate) {
                throw apiError.badRequest(responseMessage.EVENT_ENDED);
            }
            let eventRacingResult = await findEventRacing({ eventId: eventId, userId: userResult._id, isComplete: false, status: status.ACTIVE });
            if (eventRacingResult) {
                throw apiError.conflict(responseMessage.EVENT_EXIST);
            }
            if (groupResult) {
                await updateGroup({ _id: groupResult._id }, { $addToSet: { members: userResult._id } });
            }
            let result = await updateEvent({ _id: eventResult._id }, { $addToSet: { usersJoined: userResult._id }, $inc: { userEntered: 1 } })
            return res.json(new response(result, responseMessage.ENTERED_SUCCESS));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /event/eventRacingDetails:
     *   get:
     *     tags:
     *       - USER-EVENT
     *     description: getEventRacingDetails ?? To fetch all events details history.
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: eventId
     *         description: eventId
     *         in: query
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async getEventRacingDetails(req, res, next) {
        const validationSchema = {
            eventId: Joi.string().required(),
        }
        try {
            const { eventId } = await Joi.validate(req.query, validationSchema);
            var userResult = await findUser({ _id: req.userId, userType: userType.USER })
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            // eventCompleteFunction(eventId); // for game amount distribution
            let eventResult = await findEventWithPopulate({ _id: eventId, status: status.ACTIVE });
            if (!eventResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            var eventDetails = await findAllEventRacingWithPopulate({ eventId: eventResult._id, status: status.ACTIVE });
            var result = JSON.parse(JSON.stringify(eventDetails));
            for (let i in result) {
                result[i].dogId.properties = JSON.parse(result[i].dogId['properties']);
            }
            let finalResult = {
                event: eventResult,
                racingDetails: result
            }
            return res.json(new response(finalResult, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /event/eventRaceCompleteResult:
     *   get:
     *     tags:
     *       - USER-EVENT
     *     description: geteventRaceCompleteResult ?? To fetch all events race result details.
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: eventId
     *         description: eventId
     *         in: query
     *         required: true 
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async eventRaceCompleteResult(req, res, next) {
        try {
            // const data = await eventCompleteFunction(req.query.eventId);
            return res.json(new response({}, "Amount distribution function calling..."));
        }
        catch (error) {
            console.log("eventRaceCompleteResult ==>", error)
            return next(error);
        }
    }




    async eventRaceAllDetails(req) {
        var res;
        return new Promise(async (resolve, reject) => {
            try {
                let eventResult = await findEventWithPopulate({ _id: req.eventId, status: status.ACTIVE });
                if (!eventResult) {
                    res = apiError.notFound(responseMessage.DATA_NOT_FOUND);
                    resolve(res);
                }
                else {
                    var eventDetails = await findAllEventRacingWithPopulate({ eventId: eventResult._id, isComplete: false, status: status.ACTIVE });
                    var result = JSON.parse(JSON.stringify(eventDetails));
                    for (let i in result) {
                        result[i].dogId.properties = JSON.parse(result[i].dogId['properties']);
                    }
                    let finalResult = {
                        event: eventResult,
                        racingDetails: result
                    }
                    res = new response(finalResult, responseMessage.DATA_FOUND)
                    resolve(res);
                }
            } catch (error) { console.log("eventRaceAllDetails ==>", error) }
        })
    }

    async liveEventDetails() {
        var res;
        return new Promise(async (resolve, reject) => {
            try {
                let query = { endDate: { $gte: new Date().toISOString() }, status: status.ACTIVE };
                let eventResult = await findEventWithPopulate(query);
                if (!eventResult) {
                    res = apiError.notFound(responseMessage.DATA_NOT_FOUND);
                    resolve(res);
                }
                else {
                    var eventDetails = await findAllEventRacingWithPopulate({ eventId: eventResult._id, isComplete: false, status: status.ACTIVE });
                    var result = JSON.parse(JSON.stringify(eventDetails));
                    for (let i in result) {
                        result[i].dogId.properties = JSON.parse(result[i].dogId['properties']);
                    }
                    let finalResult = {
                        event: eventResult,
                        racingDetails: result
                    }
                    res = new response(finalResult, responseMessage.DATA_FOUND)
                    resolve(res);
                }
            } catch (error) { console.log("liveEventDetails ==>", error) }
        })
    }

    async eventRaceMove(req) {
        var res;
        return new Promise(async (resolve, reject) => {
            try {
                var eventRacingResult = await findEventRacing({ _id: req._id, userId: req.userId, status: status.ACTIVE, isComplete: false });
                if (!eventRacingResult) {
                    res = apiError.notFound(responseMessage.DATA_NOT_FOUND);
                    resolve(res);
                }
                else {
                    var result = await updateEventRacing({ _id: eventRacingResult._id }, { $set: { xMove: req.xMove, yMove: req.yMove, zMove: req.zMove } })
                    res = new response(result, responseMessage.UPDATE_SUCCESS)
                    resolve(res);
                }
            } catch (error) { console.log("eventRaceMove ==>", error) }
        })
    }

    async eventRaceRotate(req) {
        var res;
        return new Promise(async (resolve, MANAGEMENTM) => {
            try {
                var eventRacingResult = await findEventRacing({ _id: req._id, userId: req.userId, status: status.ACTIVE, isComplete: false });
                if (!eventRacingResult) {
                    res = apiError.notFound(responseMessage.DATA_NOT_FOUND);
                    resolve(res);
                }
                else {
                    var result = await updateEventRacing({ _id: eventRacingResult._id }, { $set: { xRotate: req.xRotate, yRotate: req.yRotate, zRotate: req.zRotate } })
                    res = new response(result, responseMessage.UPDATE_SUCCESS)
                    resolve(res);
                }
            } catch (error) { console.log("eventRaceRotate ==>", error) }
        })
    }

    async eventRaceTimeStatus(req) {
        var res;
        return new Promise(async (resolve, reject) => {
            try {
                var eventRacingResult = await findEventRacing({ _id: req._id, userId: req.userId, status: status.ACTIVE, isComplete: false });
                if (!eventRacingResult) {
                    res = apiError.notFound(responseMessage.DATA_NOT_FOUND);
                    resolve(res);
                }
                else {
                    let updateData, result;
                    let query;
                    req._totalRaceTimer = req._lap1RaceTimer;
                    if (req._lap2RaceTimer >= 1) {
                        req._totalRaceTimer = req._totalRaceTimer + req._lap2RaceTimer
                    }
                    if (req._lap3RaceTimer >= 1) {
                        req._totalRaceTimer = req._totalRaceTimer + req._lap3RaceTimer
                    }
                    if (req._lap1RaceTimer) {
                        query = { _id: eventRacingResult._id, 'lapsTime.lap': 1 };
                        updateData = { $set: { 'lapsTime.$.time': req._lap1RaceTimer, totalTime: req._totalRaceTimer } };
                        result = await updateEventRacing(query, updateData);
                    }
                    if (req._lap2RaceTimer && eventRacingResult.lapsTime.length >= 2) {
                        if (req._lap2RaceTimer >= 1) {
                            query = { _id: eventRacingResult._id, 'lapsTime.lap': 2 };
                            updateData = { $set: { 'lapsTime.$.time': req._lap2RaceTimer, totalTime: req._totalRaceTimer } };
                            result = await updateEventRacing(query, updateData);
                        }
                    }
                    if (req._lap3RaceTimer && eventRacingResult.lapsTime.length >= 3) {
                        if (req._lap3RaceTimer >= 1) {
                            query = { _id: eventRacingResult._id, 'lapsTime.lap': 3 };
                            updateData = { $set: { 'lapsTime.$.time': req._lap3RaceTimer, totalTime: req._totalRaceTimer } };
                            result = await updateEventRacing(query, updateData);
                        }
                    }
                    if (result) {
                        res = new response(result, responseMessage.UPDATE_SUCCESS)
                        resolve(res);
                    }
                }
            } catch (error) { console.log("eventRaceTimeStatus ==>", error) }
        })
    }

    async eventRaceComplete(req) {
        var res;
        return new Promise(async (resolve, reject) => {
            try {

                const flag = true;
                if (flag === true) {
                    var eventRacingResult = await findEventRacing({ _id: req._id, userId: req.userId, status: status.ACTIVE, isComplete: false });
                    console.log("eventRacingResult==>>", eventRacingResult);
                    if (!eventRacingResult) {
                        res = apiError.notFound(responseMessage.DATA_NOT_FOUND);
                        resolve(res);
                    }
                    else {
                        var [result, e] = await Promise.all([
                            updateEventRacing({ _id: eventRacingResult._id }, { $set: { isComplete: true } }),
                            updateDogHistory({ eventRacingId: eventRacingResult._id }, { timeConsumed: parseFloat(eventRacingResult.totalTime) })
                        ]);
                        res = new response(result, responseMessage.COMPLETE_SUCCESS)
                        resolve(res);
                        var eventResult = await findEvent({ _id: result.eventId, status: status.ACTIVE });
                        var allRacingResult = await findAllEventRacingWithSort({ status: status.ACTIVE, isComplete: true });
                        var rank = 1, data = [], amountSum = 0;
                   
                        // if (allRacingResult.length == eventResult.userEntered) {
                        for (let i = 0; i < allRacingResult.length; i++) {
                            let checkData = data.find((index) => index.totalTime === allRacingResult[i].totalTime);
                            if (checkData) {
                                allRacingResult[i]["position"] = checkData.position;
                                await Promise.all([
                                    updateEventRacing({ _id: allRacingResult[i]._id }, { $set: { position: checkData.position } }),
                                    updateDogHistory({ eventRacingId: allRacingResult[i]._id }, { timeConsumed: parseFloat(allRacingResult[i].totalTime) })
                                ]);
                                data.push(allRacingResult[i]);
                            } else {
                                allRacingResult[i]["position"] = rank;
                                await Promise.all([
                                    updateEventRacing({ _id: allRacingResult[i]._id }, { $set: { position: rank } }),
                                    updateDogHistory({ eventRacingId: allRacingResult[i]._id }, { timeConsumed: parseFloat(allRacingResult[i].totalTime) })
                                ]);
                                data.push(allRacingResult[i]);
                                rank++;
                            }
                        }
                        await findAllEventRacingWithPopulate({ status: status.ACTIVE, position: { $lte: 3 } });
                    }
                }

            } catch (error) { console.log("eventRaceComplete ==>", error) }
        })
    }

    async disconnectFromRace(req) {
        var res;
        return new Promise(async (resolve, reject) => {
            try {
                var eventRacingResult = await findEventRacing({ eventId: req.eventId, userId: req.userId, status: status.ACTIVE, isComplete: false });
                if (!eventRacingResult) {
                    res = apiError.notFound(responseMessage.DATA_NOT_FOUND);
                    resolve(res);
                }
                else {
                    var result = await updateEventRacing({ _id: eventRacingResult._id }, { $set: { isComplete: true, status: status.DELETE } })
                    res = new response(result, responseMessage.DISCONNECT_SUCCESS)
                    resolve(res);
                }
            } catch (error) { console.log("disconnectFromRace ==>", error) }
        })
    }

    async eventRaceStatus(req) {
        var res;
        return new Promise(async (resolve, reject) => {
            try {
                var result = await findEventRacingWithPopulate({ eventId: req.eventId, userId: req.userId, status: status.ACTIVE });
                if (!result) {
                    res = apiError.notFound(responseMessage.DATA_NOT_FOUND);
                    resolve(res);
                }
                else {
                    res = new response(result, responseMessage.DATA_FOUND)
                    resolve(res);
                }
            } catch (error) { console.log("eventRaceStatus ==>", error) }
        })
    }


    /**
     * @swagger
     * /event/refundFundForEvents:
     *   post:
     *     tags:
     *       - USER-EVENT
     *     description: refundFundForEvents ?? This api is used to refund join room fee to all participated user during cancel and delete events by owner.
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: eventId
     *         description: eventId
     *         in: formData
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async refundFundForEvents(req, res, next) {
        const validationSchema = {
            eventId: Joi.string().required()
        }
        try {
            const { eventId } = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId, userType: { $in: [userType.USER, userType.ADMIN] } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let [eventResult, eventRaceRes] = await Promise.all([
                findEventWithPopulate({ _id: eventId, status: status.ACTIVE }),
                findAllEventRacing({ eventId: eventId })
            ]);
            if (!eventResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            if (eventResult.isRefunded === true) throw apiError.alreadyExist(responseMessage.ALREADY_REFUNDED);
            if (eventResult.fee == 0) {

            }

            const users = eventResult.usersJoined;
            let arr = [];
            console.log("eventResult===>>", eventResult);
            console.log("eventResult===>>", eventResult);
            let address = [], amounts = [];
            if (users.length != 0) {
                for (let index = 0; index < users.length; index++) {
                    console.log("index==>", index);
                    address.push(users[index]["walletAddress"]);
                    amounts.push(eventResult.fee);

                    // let transactionResult = await blockchainFunction.transferAmount(users[index]["walletAddress"], eventResult.fee);
                    // console.log("transactionResult===>>", transactionResult);
                    // if (transactionResult.Success == true) {
                    //     arr.push(transactionResult);
                    //     // continue;
                    // }
                    // if (index == users.length - 1) {
                    //     await updateEvent({ _id: eventResult._id }, { isRefunded: true });
                    // }
                }
            }
            let transactionResult = await blockchainFunction.transferAmount(address, amounts);
            if (transactionResult.Success == true) {
                await updateEvent({ _id: eventResult._id }, { isRefunded: true });
            }

            if (eventRaceRes.length != 0) {
                for (let dog of eventRaceRes) {
                    await updateNft({ _id: dog.dogId }, { $inc: { raceCount: -1 } })
                }
            }
            return res.json(new response(arr, responseMessage.REFUNDED));
        }
        catch (error) {
            return next(error);
        }
    }

}

export default new eventController()

const getTimeFrame = async (startDate, scheduleCount, timeDuration) => {
    console.log("1261 startDate=====>>", startDate);
    startDate = new Date(startDate).toISOString();
    let data = [], et, endDate;
    for (let i = 0; i < scheduleCount; i++) {
        et = new Date(startDate);
        et.setMinutes(et.getMinutes() + timeDuration);
        endDate = new Date(et).toISOString();
        data.push({
            startDate: startDate,
            endDate: endDate
        })
        startDate = endDate;
    }
    return data;
}

