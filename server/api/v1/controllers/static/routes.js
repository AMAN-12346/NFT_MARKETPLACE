import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";



export default Express.Router()

    .post('/staticContent', controller.addStaticContent)
    .get('/staticContent', controller.viewStaticContent)
    .put('/staticContent', controller.editStaticContent)
    .get('/staticContentList', controller.staticContentList)

    .post('/addFAQ', controller.addFAQ)
    .get('/viewFAQ/:_id', controller.viewFAQ)
    .put('/editFAQ', controller.editFAQ)
    .get('/faqList', controller.faqList)


    .use(auth.verifyToken)
    .delete('/deleteFAQ', controller.deleteFAQ)
