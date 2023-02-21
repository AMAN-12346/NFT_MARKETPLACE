import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";
import upload from '../../../../helper/uploadHandler';


export default Express.Router()

    .get('/addLikesArray', controller.addLikesArray)
    .post('/allListOrder', controller.allListOrder)
    .get('/particularCollectionOrderList', controller.particularCollectionOrderList)
    .get('/listOrder', controller.listOrder)
    
    .get('/listfeedback',controller.listfeedback)
    
    .get('/floorTradeCount',controller.floorTradeCount)
    .get('/viewOrder/:_id', controller.viewOrder)
    .get('/viewPhysicalOrder/:_id', controller.viewPhysicalOrder)

    
    .use(auth.verifyToken)
    .get('/favouriteUnFavouriteOrder/:orderId', controller.favouriteUnFavouriteOrder)
    .put('/editOrder', controller.editOrder)
    .delete('/deleteOrder', controller.deleteOrder)
    .post('/buyOrder', controller.buyOrder)
    .post('/sendOrderToUser', controller.sendOrderToUser)
    .put('/cancelOrder', controller.cancelOrder)
    .get('/likeDislikeOrder/:orderId', controller.likeDislikeOrder)
    .get('/cancelOrderList',controller.cancelOrderList)
    .get('/viewCancelOrder/:_id',controller.viewCancelOrder)
    .post('/feedBack',controller.feedBack)
    .get('/downloadPrivateurl',controller.downloadPrivateurl)
    .post('/buyPhysicalNft',controller.buyPhysicalNft)

    .use(upload.uploadFile)
    .post('/createOrder', controller.createOrder)



    