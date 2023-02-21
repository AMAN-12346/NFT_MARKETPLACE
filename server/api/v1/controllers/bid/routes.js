import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";
import upload from '../../../../helper/uploadHandler';


export default Express.Router()
    .get('/hotBid', controller.hotBid)
    .use(auth.verifyToken)
    .post('/createBid', controller.createBid)
    .get('/viewBid/:_id', controller.viewBid)
    .put('/editBid', controller.editBid)
    .delete('/deleteBid', controller.deleteBid)
    .put('/acceptBid', controller.acceptBid)
    .put('/cancelBid', controller.cancelBid)
    .get('/listBid', controller.listBid)
    .get('/myBid', controller.myBid)






