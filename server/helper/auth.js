import config from "config";
import jwt from "jsonwebtoken";
import apiError from './apiError';
import responseMessage from '../../assets/responseMessage';
import userModel from '../models/user';
import status from '../enums/status';
import requestIp from 'request-ip';
const parseIP = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
module.exports = {
  
  async verifyToken(req, res, next) {
    try {
      if (req.headers.token) {
        let result = await jwt.verify(req.headers.token, config.get('jwtsecret'));
        let userData = await userModel.findOne({ _id: result._id });
        if (!userData) {
          throw apiError.notFound(responseMessage.USER_NOT_FOUND);
        }
        else {
          if (userData.status == status.BLOCK) {
            throw apiError.forbidden(responseMessage.BLOCK_BY_ADMIN);
          }
          else if (userData.status == status.DELETE) {
            throw apiError.unauthorized(responseMessage.DELETE_BY_ADMIN);
          }
          else {
            req.userId = result._id;
            req.userDetails = result
            next();
          }
        }
      } else {
        throw apiError.badRequest(responseMessage.NO_TOKEN);
      }

    } catch (error) {
      return next(error);

    }
    
  },
}
