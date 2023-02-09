import Express from "express";
import controller from "./controller";
import auth from '../../../../helper/auth';
import upload from '../../../../helper/uploadHandler';


export default Express.Router()

    .use(auth.verifyToken)
    .post('/practice', controller.addPractice)
    .get('/practice/:_id', controller.viewPractice)
    .put('/practice', controller.editPractice)
    .delete('/practice', controller.deletePractice)
    .get('/listPractice', controller.listPractice)
    .put('/customizePractice', controller.customizePractice)
    .get('/allPracticeModeDetails', controller.allPracticeModeDetails)
    .get('/practiceModeDetails', controller.getPracticeModeDetails)