import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";
import upload from '../../../../helper/uploadHandler';



export default Express.Router()

    .post('/addStaticContent', controller.addStaticContent)
    .get('/viewStaticContent', controller.viewStaticContent)
    .put('/editStaticContent', controller.editStaticContent)
    .get('/staticContentList', controller.staticContentList)
    .post('/addFAQ', controller.addFAQ)
    .get('/viewFAQ/:_id', controller.viewFAQ)
    .put('/editPressMedia', controller.editPressMedia)
    .put('/editFAQ', controller.editFAQ)

    .get('/faqList', controller.faqList)

    .get('/viewPressMedia/:_id', controller.viewPressMedia)
    .get('/pressMediaList', controller.pressMediaList)





    .use(upload.uploadFile)
    .post('/addPressMediaContent', controller.addPressMediaContent)
    .put('/editPressMedia', controller.editPressMedia)


    
    .use(auth.verifyToken)
    .delete('/deleteFAQ', controller.deleteFAQ)
    .delete('/deletePressMedia',controller.deletePressMedia)
    .put('/activeDeactiveMedia',controller.activeDeactiveMedia)

 
