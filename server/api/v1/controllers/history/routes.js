import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";
import upload from '../../../../helper/uploadHandler';


export default Express.Router()



    .use(auth.verifyToken)
    .post('/createHistory', controller.createHistory)
    .get('/viewHistory/:_id', controller.viewHistory)
    .put('/editHistory', controller.editHistory)
    .delete('/deleteHistory', controller.deleteHistory)
    .get('/listHistory', controller.listHistory)
    .get('/allListHistory', controller.allListHistory)


    .use(upload.uploadFile)


