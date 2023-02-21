import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";
import upload from '../../../../helper/uploadHandler';


export default Express.Router()

.get('viewTracking',controller.viewTracking)
    .use(auth.verifyToken)
    .post('/addTracking',controller.addTracking)
    .get('listTracking',controller.listTracking)
   


    .use(upload.uploadFile)


