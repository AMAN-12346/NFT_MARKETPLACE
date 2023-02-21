import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";
import upload from '../../../../helper/uploadHandler';


export default Express.Router()

    .post('/createAdmin', controller.addAdmin)
    .post('/loginWithWallet', controller.loginWithWallet)
    .post('/loginWithEmail', controller.loginWithEmail)
    .post('/forgotPassword', controller.forgotPassword)
    .post('/verifyOTP', controller.verifyOTP)
    .put('/resetPassword', controller.resetPassword)
    .get('/listCategory', controller.listCategory)
    .get('/viewCategory', controller.viewCategory)
    .get('/getCollectionFee', controller.getCollectionFee)
    .post('/changeCollectionFee', controller.changeCollectionFee)


    .use(auth.verifyToken)
    .get('/viewUser', controller.viewUser)
    .put('/blockUnblockUser', controller.blockUnblockUser)
    .put('/activeDeactiveCategory', controller.activeDeactiveCategory)
    .get('/listUser', controller.listUser)
    .get('/adminProfile', controller.adminProfile)
    .delete('/deleteUser', controller.deleteUser)
    .delete('/deleteCategory', controller.deleteCategory)
    .post('/addFees', controller.addFees)
    .get('/listNft', controller.listNft)
    .get('/viewNFT/:_id', controller.viewNFT)
    .post('/listkyc', controller.listkyc)
    .get('/viewKyc', controller.viewKyc)
    .put('/approveRejectKyc', controller.approveRejectKyc)

    .put('/blockUnblockNft', controller.blockUnblockNft)
    .patch('/changePassword', controller.changePassword)
    .put('/updateAdminProfile', controller.updateAdminProfile)

    .get('/soldNftList', controller.soldNftList)

    .post('/reportsList', controller.reportsList)
    .get('/viewReport/:_id', controller.viewReport)
    .get('/blockReport/:_id', controller.blockReport)


    .delete('/deleteFees', controller.deleteFees)
    .get('/viewFees', controller.viewFees)
    .put('/editFees', controller.editFees)
    .get('/listActivityUsers', controller.listActivityUsers)
    .post('/shareContent', controller.shareContent)
    .get('/userSubscriberList', controller.userSubscriberList)

    .post('/cancelOrder', controller.cancelOrder)
    .get('/cancelOrderList', controller.cancelOrderList)

    .get('/listWallet', controller.listWallet)


    .get('/viewCancelOrder/:_id', controller.viewCancelOrder)
    .get('/unblockRequestList', controller.unblockRequestList)

    .get('/brandRequestList', controller.brandRequestList)
    .put('/acceptBrandRequest', controller.acceptBrandRequest)
    .put('/rejectBrandRequest', controller.rejectBrandRequest)
    .put('/activeBlockBrand',controller.activeBlockBrand)


    .use(upload.uploadFile)
    .post('/addCategory', controller.addCategory)
    .put('/editCategory', controller.editCategory)
