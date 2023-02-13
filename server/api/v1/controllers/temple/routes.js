import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";



export default Express.Router()

    // .post('/staticContent', controller.addStaticContent)
    
    
    .get('/templeList', controller.templeList)
    .use(auth.verifyToken)
    .get('/viewTemple', controller.viewTemple)
    .put('/editTemple', controller.editTemple)

