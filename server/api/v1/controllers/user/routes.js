import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";
import upload from '../../../../helper/uploadHandler';




export default Express.Router()
    .post('/connectWallet', controller.connectWallet)
    .get('/upcomingEvents', controller.upcomingEvents)


    .get('/pastEvents', controller.pastEvents)
    .get('/allPracticeModes', controller.allPracticeModes)
    .get('/petstores', controller.getPetstores)
    .get('/socialLinks', controller.getSocialLinks)
    .get('/driverConfirmation', controller.driverConfirmation)
    .get('/mediaList', controller.mediaList)
    .post('/subscribeNewsletter',controller.subscribeNewsletter)

    .use(auth.verifyToken)
    .get('/getProfile', controller.getProfile)
    .post('/buyPetstore', controller.buyPetstore)
    .patch('/assignDriver', controller.assignDriver)
    .get('/getEventDetails',controller.getEventDetails)
    .post('/likeDislikeEvent',controller.likeDislikeEvent)
    .post('/likeDislikePetStore',controller.likeDislikePetStore)

    .use(upload.uploadFile)
    .put('/editProfile', controller.editProfile)
    .post('/uploadFile', controller.uploadFile)

