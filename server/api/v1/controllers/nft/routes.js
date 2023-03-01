import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";
import upload from '../../../../helper/uploadHandler';


export default Express.Router()

    .get('/addLikesArray', controller.addLikesArray)
    .get('/listAllNft', controller.listAllNft)
    .get('/showNftHistory', controller.showNftHistory)
    .post('/showActivity', controller.showActivity)
       
    .get('/image/:number',controller.image)
    .get('/saveImage',controller.saveImage)



    .use(auth.verifyToken)
    .post('/ipfsUploadBase64', controller.ipfsUploadBase64)
    .get('/viewNFT/:_id', controller.viewNFT)
    .put('/editNFT', controller.editNFT)
    .delete('/deleteNFT', controller.deleteNFT)
    .get('/listNFT', controller.listNFT)
    .get('/treandingNftList', controller.treandingNftList)
    .get('/listNFTWithPagination', controller.listNFTWithPagination)
    .post('/sendNFT', controller.sendNFT)
    .get('/likeDislikeNft/:nftId', controller.likeDislikeNft)

    .use(upload.uploadFile)
    .post('/uploadImage',controller.uploadImage)
    .post('/uploadNFT', controller.uploadNFT)
    .post('/createNFT', controller.createNFT)
    .post('/ipfsUpload', controller.ipfsUpload)



