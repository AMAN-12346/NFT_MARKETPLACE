import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";
import upload from '../../../../helper/uploadHandler';


export default Express.Router()

    .post('/groupChat', controller.groupChat)


    .use(auth.verifyToken)
    .get('/blockList', controller.blockList)
    .post('/chatList', controller.chatList)
    .patch('/blockUnblockChat', controller.blockUnblockChat)
    .patch('/reportChat', controller.reportChat)
    .patch('/deleteMessage', controller.deleteMessage)
    .patch('/deleteForEveryone', controller.deleteForEveryone)
    .put('/deleteChats', controller.deleteChats)


    .delete('/chat/:chatId', controller.deleteChat)
    .get('/chat/:chatId', controller.viewChat)



