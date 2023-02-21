import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";
import upload from '../../../../helper/uploadHandler';


export default Express.Router()

    .get('/userOwnedCount/:_id', controller.userOwnedCount) //done
    .get('/userLikesCount/:_id', controller.userLikesCount) //done
    .get('/userFavourateCount/:_id', controller.userFavourateCount)//done

    .get('/userOnSaleCount/:_id', controller.userOnSaleCount) //done
    .get('/userCreatedCount/:_id', controller.userCreatedCount) //done
    .get('/userBuyAndCreatedList/:_id', controller.userBuyAndCreatedList) //done


    .use(auth.verifyToken)

    .post('/createPhysicalNft', controller.createPhysicalNft)
    .put('/editPhysicalNft', controller.editPhysicalNft)
    .post('/createPhysicalOrder', controller.createPhysicalOrder)
    .patch('/cancelPhysicalOrder', controller.cancelPhysicalOrder)
    .put('/editPhysicalOrder', controller.editPhysicalOrder)
    .get('/listNFT', controller.listNFT)


    .get('/likeDislike/:nftId', controller.likeDislike)
    .get('/favouriteUnFavourite/:nftId', controller.favouriteUnFavourite)




    .use(upload.uploadFile)


