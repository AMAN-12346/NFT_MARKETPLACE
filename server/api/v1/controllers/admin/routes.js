import Express from "express";
import controller from "./controller";
import auth from '../../../../helper/auth';
import upload from '../../../../helper/uploadHandler';


export default Express.Router()

    .post('/login', controller.login)
    .post('/forgotPassword', controller.forgotPassword)
    .put('/resetPassword/:token', controller.resetPassword)
    .get('/viewCategory',controller.viewCategory)
    .post('/listCategory',controller.listCategory)


    .use(auth.verifyToken)
    .get('/profile', controller.profile)
    .get('/user/:_id', controller.viewUser)
    .patch('/blockUnblockUser', controller.blockUnblockUser)
    .delete('/user', controller.deleteUser)
    .get('/userList', controller.userList)
    .get('/media/:_id', controller.viewMedia)
    .patch('/changeMediaStatus', controller.changeMediaStatus)
    .delete('/media', controller.deleteMedia)
    .get('/listMedia', controller.listMedia)
    .get('/socialLinkList', controller.socialLinkList)
    .put('/socialLink', controller.editSocialLink)
    .get('/dashboard', controller.dashboard)
    .post('/addCategory',controller.addCategory)
    .put('/editCategory',controller.editCategory)



    .use(upload.uploadFile)
    .put('/editProfile', controller.editProfile)
    .post('/media', controller.addMedia)
    .put('/media', controller.editMedia)
