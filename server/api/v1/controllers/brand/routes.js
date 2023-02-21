import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";
import upload from '../../../../helper/uploadHandler';


export default Express.Router()



    .get('/viewBrand', controller.viewBrand)
    .post('/listBrandOnCollection', controller.listBrandOnCollection)
    .post('/listAllApproveBrand',controller.listAllApproveBrand)
    .post('/brandCollectionList', controller.brandCollectionList)

    

    .use(auth.verifyToken)
    .post('/brandListParticular', controller.brandListParticular)
    .post('/myAllBrandList', controller.myAllBrandList)
    .get('/getCollectionOnBrand', controller.getCollectionOnBrand)
    .get('/getCollectionOnBrandMultiple',controller.getCollectionOnBrandMultiple)


    // .use(upload.uploadFile)

    .post('/addBrand', controller.addBrand)
    .put('/updateBrand', controller.updateBrand)







