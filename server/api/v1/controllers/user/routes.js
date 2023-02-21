import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";
import upload from '../../../../helper/uploadHandler';


export default Express.Router()


    .get('/dashboardSearch', controller.dashboardSearch)
    .get('/dashboardCount', controller.dashboardCount)

    .get('/userDetails/:walletAddress', controller.userDetails)
    .post('/userNftDetails', controller.userNftDetails)
    .post('/userNftDetailsW',controller.userNftDetailsW)




    .get('/userCreatedCount/:_id', controller.userCreatedCount) // done
    .get('/userBuyAndCreatedList/:_id', controller.userBuyAndCreatedList) //done
    .get('/userBuyList/:_id', controller.userBuyList) // done

    .post('/connectWallet', controller.connectWallet)
    .get('/userList', controller.userList)
    .get('/viewFeesUser', controller.viewFeesUser)
    .get('/userLikesCount/:_id', controller.userLikesCount)
    .get('/userFavourateCount/:_id', controller.userFavourateCount)

    .get('/userOnSaleCount/:_id', controller.userOnSaleCount)
    .get('/userFollowerCount/:_id', controller.userFollowerCount)
    .get('/userFollowingCount/:_id', controller.userFollowingCount)
    .get('/showNftHistory', controller.showNftHistory)
    .get('/userOwendCount/:_id', controller.userOwendCount) //done
    .get('/nftSoldCount/:_id', controller.nftSoldCount) //
    .get('/getUserDetails/:_id', controller.getUserDetails)
    .get('/topSalers', controller.topSalers)
    .get('/hotCollections', controller.hotCollections)
    .get('/getContactUs', controller.getContactUs)
    .post('/contactUs', controller.contactUs)

    .put('/requestForUnblock', controller.requestForUnblock)

    .put('/userSubscribe', controller.userSubscribe)
    .post('/userVerifySubscription', controller.userVerifySubscription)
    .get('/topBuyers', controller.topBuyers)
    .post('/userRejectSubscription', controller.userRejectSubscription)



    .use(auth.verifyToken)
    .get('/profile', controller.profile)
    .get('/followUnfollow/:userId', controller.followUnfollow)
    .get('/followingList/:userId', controller.followingList)
    .get('/followersList/:userId', controller.followersList)
    .get('/viewKyc', controller.viewKyc)
    .post('/addWallet', controller.addWallet)
    .get('/viewWallet', controller.viewWallet)
    .put('/editWallet', controller.editWallet)
    .get('/listWallet', controller.listWallet)

    .post('/createOrderReports', controller.createOrderReports)
    .get('/viewOrderReport', controller.viewOrderReport)
    .get('/listorderReportedByUser', controller.listorderReportedByUser)

    .get('/listUserToUserReport', controller.listUserToUserReport)
    .get('/viewReportUser', controller.viewReport)



    .use(upload.uploadFile)
    .post('/userWallet', controller.userWallet)
    .put('/updateProfile', controller.updateProfile)
    .post('/userReports', controller.userReports)
    .post('/addKYC', controller.addKYC)
    .post('/editKYC', controller.editKYC)

