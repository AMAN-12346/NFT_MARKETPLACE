// import Express from "express";
// import controller from "./controller";
// import auth from '../../../../helper/auth';
// import upload from '../../../../helper/uploadHandler';


// export default Express.Router()
//     .get('/listTransaction', controller.listTransaction)

//     .get('/eventRaceCompleteResult', controller.eventRaceCompleteResult)
//     .get('/getDogHistory', controller.getDogHistory)
//     .put('/updateEventRace', controller.updateEventRace)
//     .put('/updateMultiEventRace', controller.updateMultiEventRace)


//     .use(auth.verifyToken)
//     .get('/group/:eventId', controller.viewGroup)

//     .get('/event/:_id', controller.viewEvent)
//     .delete('/event', controller.deleteEvent)
//     .get('/listEvent', controller.listEvent)
//     .post('/enterEvent', controller.enterEvent)
//     .post('/joinEvent', controller.joinEvent)
//     .get('/eventRacingDetails', controller.getEventRacingDetails)
//     .post('/refundFundForEvents', controller.refundFundForEvents)


//     .use(upload.uploadFile)
//     .post('/eventSchedule', controller.addEventSchedule)
//     .put('/event', controller.editEvent)