// import Joi from "joi";
// import _ from "lodash";
// import config from "config";
// import apiError from '../../../../helper/apiError';
// import response from '../../../../../assets/response';

// import responseMessage from '../../../../../assets/responseMessage';
// import { userServices } from '../../services/user';
// import { nftServices } from '../../services/nft';


// const { findUser, updateUser, userList } = userServices;
// const { createNft, findNft, updateNft, findAllNft } = nftServices;

// import commonFunction from '../../../../helper/util';
// import jwt from 'jsonwebtoken';
// import status from '../../../../enums/status';
// import userType from "../../../../enums/userType";

// import create from 'ipfs-http-client';
// // const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' });
// import fs from 'fs';
// import axios from 'axios';
// import date from "joi/lib/types/date";


// let projectId = config.get('ipfsProjectDetails.projectId') // juaan 
// let projectSecret = config.get('ipfsProjectDetails.projectSecret') // juaan
// const auth =
//     'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
// const ipfs = create({
//     host: 'ipfs.infura.io', port: '5001', protocol: 'https', headers: {
//         authorization: auth,
//     },
// });




// export class nftController {



//     /**
//      * @swagger
//      * /nft/getMetadata/{tokenId}:
//      *   get:
//      *     tags:
//      *       - NFT MANAGEMENT
//      *     description: getMetadata? available b/w 0-10k of all 10k dog metadata with thier attribute.
//      *     produces:
//      *       - application/json
//      *     parameters:
//      *       - name: tokenId
//      *         description: tokenId
//      *         in: path
//      *         required: true
//      *     responses:
//      *       200:
//      *         description: Returns success message
//      */
//     async getMetadata(req, res, next) {
//         const validationSchema = {
//             tokenId: Joi.number().required()
//         }
//         try {
//             const { tokenId } = await Joi.validate(req.params, validationSchema);
//             const config = {
//                 method: 'get',
//                 url: `https://pawsomedata.s3.amazonaws.com/metadata/${tokenId}`,
//                 headers: {
//                     'Content-Type': 'application/json'
//                 }
//             };
//             const result = await axios(config);
//             return res.json(new response(result.data, responseMessage.DATA_FOUND));
//         }
//         catch (error) {
//             return next(error);
//         }
//     }

//     /**
//      * @swagger
//      * /nft/ipfsUpload:
//      *   post:
//      *     tags:
//      *       - NFT MANAGEMENT
//      *     description: ipfsUpload ?? To upload media file into the IPFS server.
//      *     produces:
//      *       - application/json
//      *     parameters:
//      *       - name: token
//      *         description: token
//      *         in: header
//      *         required: true
//      *       - name: file
//      *         description: file
//      *         in: formData
//      *         type: file
//      *         required: true
//      *     responses:
//      *       200:
//      *         description: Returns success message
//      */
//     async ipfsUpload(req, res, next) {
//         try {
//             let userResult = await findUser({ _id: req.userId });
//             if (!userResult) {
//                 throw apiError.notFound(responseMessage.USER_NOT_FOUND);
//             }
//             const fileName = req.files[0].filename;
//             const filePath = req.files[0].path;
//             const fileHash = await addFile(fileName, filePath);
//             await deleteFile(filePath);
//             let tokenData = {
//                 image: "https://ipfs.io/ipfs/" + fileHash // hash
//             }
//             let ipfsRes = await ipfsUpload(tokenData);
//             let result = { ipfsHash: ipfsRes, fileHash: fileHash, imageUrl: tokenData.image };
//             console.log("110", result)
//             return res.json(new response(result, responseMessage.DATA_FOUND));
//         }
//         catch (error) {
//             console.log("===error==", error)
//             return next(error);
//         }
//     }

//     /**
//     * @swagger
//     * /nft/uploadNFT:
//     *   post:
//     *     tags:
//     *       - NFT MANAGEMENT
//     *     description: uploadNFT ?? To upload nft details into the IPFS server.
//     *     produces:
//     *       - application/json
//     *     parameters:
//     *       - name: token
//     *         description: token
//     *         in: header
//     *         required: true
//     *       - name: tokenName
//     *         description: tokenName
//     *         in: formData
//     *         required: false
//     *       - name: description
//     *         description: description
//     *         in: formData
//     *         required: false
//     *       - name: image
//     *         description: image
//     *         in: formData
//     *         required: false
//     *     responses:
//     *       200:
//     *         description: Returns success message
//     */
//     async uploadNFT(req, res, next) {
//         const validationSchema = {
//             tokenName: Joi.string().optional(),
//             description: Joi.string().optional(),
//             image: Joi.string().optional(),
//         }
//         try {
//             const { tokenName, description, image } = await Joi.validate(req.body, validationSchema);
//             let tokenData = {
//                 name: tokenName ? tokenName : "Test",
//                 description: description ? description : "Testing Data",
//                 image: image // hash
//             }
//             let ipfsRes = await ipfsUpload(tokenData);
//             tokenData.ipfsHash = ipfsRes;
//             return res.json(new response(tokenData, responseMessage.DATA_FOUND));
//         }
//         catch (error) {
//             return next(error);
//         }
//     }

//     /**
//     * @swagger
//     * /nft/createNFT:
//     *   post:
//     *     tags:
//     *       - NFT MANAGEMENT
//     *     description: createNFT ?? It is used to mint a nft.
//     *     produces:
//     *       - application/json
//     *     parameters:
//     *       - name: token
//     *         description: token
//     *         in: header
//     *         required: true
//     *       - name: createNFT
//     *         description: createNFT
//     *         in: body
//     *         required: true
//     *         schema:
//     *           $ref: '#/definitions/createNFT'
//     *     responses:
//     *       200:
//     *         description: Returns success message
//     */
//     async createNFT(req, res, next) {
//         let validationSchema = {
//             collectionId: Joi.string().optional(),
//             currentOwnerId: Joi.string().optional(),
//             tokenName: Joi.string().optional(),
//             tokenId: Joi.string().optional(),
//             mediaType: Joi.string().optional(),
//             coverImage: Joi.string().optional(),
//             network: Joi.string().optional(),
//             royalties: Joi.string().optional(),
//             title: Joi.string().optional(),
//             description: Joi.string().optional(),
//             properties: Joi.string().optional(),
//             uri: Joi.string().optional()
//         }
//         try {
//             const validatedBody = await Joi.validate(req.body, validationSchema);
//             let userResult = await findUser({ _id: req.userId });
//             if (!userResult) {
//                 throw apiError.notFound(responseMessage.USER_NOT_FOUND);
//             } else {
//                 validatedBody.userId = userResult._id;
//                 validatedBody.attributes = await randomAttributes();
//                 let result = await createNft(validatedBody);
//                 console.log("resultresultresult==", result)

//                 return res.json(new response(result, responseMessage.ADD_NFT));
//             }
//         } catch (error) {
//             return next(error);
//         }
//     }

//     /**
//     * @swagger
//     * /nft/viewNft/{_id}:
//     *   get:
//     *     tags:
//     *       - NFT MANAGEMENT
//     *     description: viewNft ?? to get details of perticular nft.
//     *     produces:
//     *       - application/json
//     *     parameters:
//     *       - name: token
//     *         description: token
//     *         in: header
//     *         required: true
//     *       - name: _id
//     *         description: _id
//     *         in: path
//     *         required: true
//     *     responses:
//     *       200:
//     *         description: Returns success message
//     */

//     async viewNft(req, res, next) {
//         const validationSchema = {
//             _id: Joi.string().required()
//         }
//         try {
//             const { _id } = await Joi.validate(req.params, validationSchema);
//             let userResult = await findUser({ _id: req.userId });
//             if (!userResult) {
//                 throw apiError.notFound(responseMessage.USER_NOT_FOUND);
//             }
//             var nftResult = await findNft({ _id: _id, status: status.ACTIVE });
//             var result = JSON.parse(JSON.stringify(nftResult));
//             result.properties = JSON.parse(nftResult.properties);
//             return res.json(new response(result, responseMessage.DATA_FOUND));
//         }
//         catch (error) {
//             return next(error);
//         }
//     }

//     /**
//     * @swagger
//     * /nft/setPetName:
//     *   put:
//     *     tags:
//     *       - NFT MANAGEMENT
//     *     description: setPetName ?? To set dog nft name.
//     *     produces:
//     *       - application/json
//     *     parameters:
//     *       - name: token
//     *         description: token
//     *         in: header
//     *         required: true
//     *       - name: petId
//     *         description: petId
//     *         in: formData
//     *         required: true
//     *       - name: petName
//     *         description: petName
//     *         in: formData
//     *         required: true
//     *     responses:
//     *       200:
//     *         description: Returns success message
//     */

//     async setPetName(req, res, next) {
//         const validationSchema = {
//             petId: Joi.string().required(),
//             petName: Joi.string().required()
//         }
//         try {
//             const { petId, petName } = await Joi.validate(req.body, validationSchema);
//             const userResult = await findUser({ _id: req.userId });
//             if (!userResult) {
//                 throw apiError.notFound(responseMessage.USER_NOT_FOUND);
//             }
//             const nftResult = await findNft({ _id: petId, status: status.ACTIVE });
//             if (!nftResult) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
//             const checkName = await findNft({ petName: petName, _id: { $ne: nftResult._id } });
//             if (checkName) throw apiError.alreadyExist(responseMessage.PETNAME_ALREADY_TAKEN);
//             const result = await updateNft({ _id: nftResult._id }, { petName: petName });
//             return res.json(new response(result, responseMessage.UPDATE_SUCCESS));
//         }
//         catch (error) {
//             return next(error);
//         }
//     }

//     /**
//     * @swagger
//     * /nft/listNft:
//     *   get:
//     *     tags:
//     *       - NFT MANAGEMENT
//     *     description: listNft ?? To get list of nft details.
//     *     produces:
//     *       - application/json
//     *     parameters:
//     *       - name: token
//     *         description: token
//     *         in: header
//     *         required: true
//     *     responses:
//     *       200:
//     *         description: Returns success message
//     */

//     async listNft(req, res, next) {
//         try {
//             let userResult = await findUser({ _id: req.userId });
//             if (!userResult) {
//                 throw apiError.notFound(responseMessage.USER_NOT_FOUND);
//             }
//             let nftResult = await findAllNft({ userId: userResult._id, status: status.ACTIVE });
//             var nfts;
//             if (nftResult.length != 0) {
//                 nfts = JSON.parse(JSON.stringify(nftResult));
//                 for (let i in nfts) {
//                     nfts[i].properties = JSON.parse(nfts[i]['properties']);
//                 }
//             }
//             return res.json(new response(nftResult.length != 0 ? nfts : [], responseMessage.DATA_FOUND));
//         }
//         catch (error) {
//             return next(error);
//         }
//     }

//      /**
//     * @swagger
//     * /nft/updatedValueNFTAttributes:
//     *   get:
//     *     tags:
//     *       - NFT MANAGEMENT
//     *     description: updatedValueNFTAttributes ?? To get list of nft details.
//     *     produces:
//     *       - application/json
//     *     responses:
//     *       200:
//     *         description: Returns success message
//     */

//     async updatedValueNFTAttributes(req, res, next) {
//         try {
//             let allNFT = await findAllNft({ status: status.ACTIVE });
//             if (allNFT.length != 0) {
//                 for (let i = 0; i < allNFT.length; i++) {
//                     let attributes = await randomAttributes();
//                     await updateNft({ _id: allNFT[i]._id }, { attributes: attributes });
//                     if (i == allNFT.length - 1) {
//                         return res.json(new response([], responseMessage.UPDATE_SUCCESS));
//                     }
//                 }
//             }else{
//                 throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
//             }
//         } catch (error) {
//             return next(error);
//         }
//     }

//      /**
//     * @swagger
//     * /nft/updatedValueNFTGenderAttributes:
//     *   get:
//     *     tags:
//     *       - NFT MANAGEMENT
//     *     description: updatedValueNFTAttributes ?? To get list of nft details.
//     *     produces:
//     *       - application/json
//     *     responses:
//     *       200:
//     *         description: Returns success message
//     */

//      async updatedValueNFTGenderAttributes(req, res, next) {
//         try {
//             let allNFT = await findAllNft({ status: status.ACTIVE,"attributes.gender":{$exists:false} });
//             let GenderArray= ["Male","Female"]
//             if (allNFT.length != 0) {
//                 for (let i = 0; i < allNFT.length; i++) {
//                     let GenderRes = Math.floor(Math.random() * GenderArray.length) 
//                     let gender=GenderArray[GenderRes]
//                     await updateNft({ _id: allNFT[i]._id }, { "attributes.gender": gender });
//                     if (i == allNFT.length - 1) {
//                         return res.json(new response([], responseMessage.UPDATE_SUCCESS));
//                     }
//                 }
//             }else{
//                 throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
//             }
//         } catch (error) {
//             return next(error);
//         }
//     }


// }

// export default new nftController()

// const ipfsUpload = async (tokenData) => {
//     try {
//         const { cid } = await ipfs.add({ content: JSON.stringify(tokenData) }, { cidVersion: 0, hashAlg: 'sha2-256' });
//         await ipfs.pin.add(cid);
//         return cid.toString()
//     } catch (error) {
//         console.log('error', error);
//     }
// }

// const addFile = async (fileName, filePath) => {
//     const file = fs.readFileSync(filePath);
//     const fileAdded = await ipfs.add({ path: fileName, content: file }, { cidVersion: 0, hashAlg: 'sha2-256' });
//     const fileHash = fileAdded.cid.toString();
//     await ipfs.pin.add(fileAdded.cid);
//     return fileHash;
// }

// const deleteFile = async (filePath) => {
//     fs.unlink(filePath, (deleteErr) => {
//         if (deleteErr) {
//             console.log("Error: failed to delete the file", deleteErr);
//         }
//     })
// }


// const randomAttributes = async () => {
//     let arr = [30, 40, 50, 60];
//     let ShoeTypeArray = ["Lightweight", "Trail", "Stability", "MotionControl", "Cushioned"]
//     let CoatsArray = ["Longer", "Short", "Medium", "Double", "Curly", "Silky"]
//     let TailArray = ["Bobbedm", "Curly", "Sickle", "Otter", "Whip", "Saber"]
//     let GenderArray= ["Male","Female"]
//     let Nurturing = Math.random() * 20.0
//     let Aerodynamics = Math.random() * 10.0;  

//     let CoatRes = Math.floor(Math.random() * CoatsArray.length) 
//     let Coat = CoatsArray[CoatRes]; 

//     let TailRes = Math.floor(Math.random() * TailArray.length) 
//     let Tail = TailArray[TailRes]; 


//     let preWeight = Math.floor(Math.random() * arr.length) 
//     let weight = arr[preWeight]; 

//     let ShoeTypeRes = Math.floor(Math.random() * ShoeTypeArray.length) 
//     let ShoeType = ShoeTypeArray[ShoeTypeRes]; 
//     let GenderRes = Math.floor(Math.random() * GenderArray.length) 
//     let gender=GenderArray[GenderRes]
//     let BMI = weight === 30 ? "Thin" : weight === 40 ? "Ideal" : weight === 50 ? "Overweight" : "Obese";
//     let Age = new Date().toISOString()

//     let attObj = {
//         Coat: Coat,
//         Nurturing: Nurturing,
//         Aerodynamics: Aerodynamics,
//         Tail: Tail,
//         weight: weight,
//         ShoeType: ShoeType,
//         BMI: BMI,
//         Age: Age,
//         gender:gender
//     }
//     return attObj
// }
// // randomAttributes()

