import Joi from "joi";
import _ from "lodash";
import config from "config";

import apiError from '../../../../helper/apiError';
import response from '../../../../../assets/response';
import responseMessage from '../../../../../assets/responseMessage';

import commonFunction from '../../../../helper/util';
import status from '../../../../enums/status';
import { userServices } from '../../services/user';
import { groupServices } from '../../services/group';
import { chatServices } from '../../services/chat';

const { findUser, updateUser, findAllUsers } = userServices;
const { createChat } = chatServices;
const { createGroup, findGroup, updateGroup, findMembers, findGroupAndPopulate, goupLeftMember, groupList, updateManyGroup } = groupServices;

export class groupController {


    /**
      * @swagger
      * /group/group:
      *   post:
      *     tags:
      *       - GROUP
      *     description: addGroup ?? To create a group of a perticular events on the basis of events.
      *     produces:
      *       - application/json
      *     parameters:
      *       - name: token
      *         description: token
      *         in: header
      *         required: true
      *       - name: groupName
      *         description: groupName
      *         in: formData
      *         required: true
      *       - name: groupImage
      *         description: groupImage
      *         in: formData
      *         type: file
      *         required: false
      *       - name: members
      *         description: members-["61ee4eaaf02f32df33b94804","61ee4eaaf02f32df33b94804"]
      *         in: formData
      *         required: false
      *     responses:
      *       200:
      *         description: Returns success message
      */

    async addGroup(req, res, next) {
        try {
            const validationSchema = {
                groupName: Joi.string().required(),
                groupImage: Joi.string().optional(),
                members: Joi.array().items(Joi.string()).optional()
            }
            var validatedBody = await Joi.validate(req.body, validationSchema);
            var userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            if (req.files) {
                validatedBody.groupImage = await commonFunction.getImageUrl(req.files)
            }
            if (validatedBody.members) {
                validatedBody.members.push(userResult._id)
            }
            else {
                validatedBody.members = userResult._id;
            }
            validatedBody.createdBy = userResult._id
            let result = await createGroup(validatedBody);
            var obj = [{
                senderId: userResult._id,
                message: "Group created",
                createdAt: new Date().toISOString()
            }]
            await createChat({ chatType: "group", groupId: result._id, messages: obj })
            validatedBody.members = validatedBody.members.filter(function (item) {
                return item !== userResult._id
            })
            var users = await findAllUsers({ _id: { $in: validatedBody.members } })
            var device_tokens = [];
            users.forEach(t => {
                if (t.deviceToken) {
                    return device_tokens.push(t.deviceToken)
                }
            });
            if (device_tokens.length != 0) {
                for (let i of device_tokens) {
                    var message = {
                        to: i, // required fill with device token or topics
                        data: {
                            senderId: userResult._id,
                            title: 'Traliens',
                            body: `${userResult.first_name} added you in ${validatedBody.groupName} group`,
                            sound: 'default'
                        },
                        notification: {
                            title: 'Traliens',
                            body: `${userResult.first_name} added you in ${validatedBody.groupName} group`,
                            sound: 'default'
                        }
                    };

                    await commonFunction.pushNotification(message)
                }
            }
            return res.json(new response(result, responseMessage.GROUP_ADDED));
        } catch (error) {
            return next(error);
        }
    }

    /**
      * @swagger
      * /group/group:
      *   put:
      *     tags:
      *       - GROUP
      *     description: editGroup ?? To edit group details.
      *     produces:
      *       - application/json
      *     parameters:
      *       - name: token
      *         description: token
      *         in: header
      *         required: true
      *       - name: groupId
      *         description: groupId
      *         in: formData
      *         required: true
      *       - name: groupImage
      *         description: groupImage
      *         in: formData
      *         type: file
      *         required: false
      *       - name: groupName
      *         description: groupName
      *         in: formData
      *         required: false
      *     responses:
      *       200:
      *         description: Returns success message
      */


    async editGroup(req, res, next) {
        try {
            const validationSchema = {
                groupId: Joi.string().required(),
                groupName: Joi.string().optional(),
                groupImage: Joi.string().optional(),
            }
            var validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            if (req.files.length != 0) {
                validatedBody.groupImage = await commonFunction.getImageUrl(req.files)
            }
            let result = await updateGroup({ _id: validatedBody.groupId }, { $set: validatedBody });
            return res.json(new response(result, responseMessage.UPDATE_SUCCESS));
        } catch (error) {
            return next(error);
        }
    }


    /**
    * @swagger
    * /group/group/{groupId}:
    *   delete:
    *     tags:
    *       - GROUP
    *     description: deleteGroup ?? To delete group.
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: token
    *         description: token
    *         in: header
    *         required: true
    *       - name: groupId
    *         description: groupId
    *         in: path
    *         required: true
    *     responses:
    *       200:
    *         description: Returns success message
    */

    async deleteGroup(req, res, next) {
        const validationSchema = {
            groupId: Joi.string().required()
        }
        try {
            const { groupId } = await Joi.validate(req.params, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var groupResult = await findGroup({ _id: groupId, status: { $ne: status.DELETE } });
            if (!groupResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            var result = await updateGroup({ _id: groupResult._id }, { $pull: { membersLeft: { userId: userResult._id }, members: userResult._id } })
            if (result.members.length == 0 && result.membersLeft.length == 0) {
                await updateGroup({ _id: groupResult._id }, { $set: { status: status.DELETE } })
            }
            return res.json(new response({}, responseMessage.DELETE_SUCCESS));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
      * @swagger
      * /group/muteUnmuteGroup:
      *   patch:
      *     tags:
      *       - GROUP
      *     description: muteUnmuteGroup ?? Functionality of mute and unmute to avoid unwanted notifications.
      *     produces:
      *       - application/json
      *     parameters:
      *       - name: token
      *         description: token
      *         in: header
      *         required: true
      *       - name: muteUnmuteGroup
      *         description: muteUnmuteGroup
      *         in: body
      *         required: true
      *         schema:
      *           $ref: '#/definitions/muteUnmuteGroup'
      *     responses:
      *       200:
      *         description: Returns success message
      */

    async muteUnmuteGroup(req, res, next) {
        const validationSchema = {
            groupId: Joi.array().items(Joi.string()).required(),
            isMute: Joi.boolean().required()
        }
        try {
            const { groupId, isMute } = await Joi.validate(req.body, validationSchema);
            var updateObj = {};
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var groupResult = await groupList({ _id: { $in: groupId }, status: status.ACTIVE, members: { $in: userResult._id } });
            if (groupResult.length == 0) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            var groups = groupResult.map(g => g._id);
            if (isMute == true) {
                updateObj = {
                    $addToSet: { usersMuted: userResult._id }
                }
            }
            if (isMute == false) {
                updateObj = {
                    $pull: { usersMuted: userResult._id }
                }
            }
            await updateManyGroup({ _id: { $in: groups } }, updateObj);
            return res.json(new response({}, responseMessage.UPDATE_SUCCESS));
        } catch (error) {
            return next(error);
        }
    }

    /**
      * @swagger
      * /group/leaveGroup:
      *   patch:
      *     tags:
      *       - GROUP
      *     description: leaveGroup ?? To leave a group as per valid authentication.
      *     produces:
      *       - application/json
      *     parameters:
      *       - name: token
      *         description: token
      *         in: header
      *         required: true
      *       - name: leaveGroup
      *         description: leaveGroup
      *         in: body
      *         required: true
      *         schema:
      *           $ref: '#/definitions/leaveGroup'
      *     responses:
      *       200:
      *         description: Returns success message
      */

    async leaveGroup(req, res, next) {
        const validationSchema = {
            groupId: Joi.array().items(Joi.string()).required(),
        }
        try {
            const { groupId } = await Joi.validate(req.body, validationSchema);

            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var groupResult = await groupList({ _id: { $in: groupId }, status: status.ACTIVE, members: { $in: userResult._id } });
            if (groupResult.length == 0) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            var groups = groupResult.map(g => g._id);
            let result = await updateManyGroup({ _id: { $in: groups } }, { $pull: { members: userResult._id }, $addToSet: { membersLeft: { userId: userResult._id, time: new Date().toISOString() } } });
            return res.json(new response({}, responseMessage.UPDATE_SUCCESS));
        } catch (error) {
            return next(error);
        }
    }

    /**
      * @swagger
      * /group/group/{groupId}:
      *   get:
      *     tags:
      *       - GROUP
      *     description: viewGroup ?? To fetch specific group details.
      *     produces:
      *       - application/json
      *     parameters:
      *       - name: token
      *         description: token
      *         in: header
      *         required: true
      *       - name: groupId
      *         description: groupId
      *         in: path
      *         required: true
      *     responses:
      *       200:
      *         description: Returns success message
      */

    async viewGroup(req, res, next) {
        const validationSchema = {
            groupId: Joi.string().required(),
        }
        try {
            const { groupId } = await Joi.validate(req.params, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var groupResult = await findGroupAndPopulate({ _id: groupId, status: status.ACTIVE });
            if (!groupResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            var result = {
                _id: groupResult._id,
                groupName: groupResult.groupName,
                createdBy: groupResult.createdBy,
                groupImage: groupResult.groupImage,
                status: groupResult.status,
                members: groupResult.members,
                isMute: groupResult.usersMuted.includes(userResult._id) ? true : false
            }
            return res.json(new response(result, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error);
        }
    }



    /**
      * @swagger
      * /group/followUnfollowMember:
      *   patch:
      *     tags:
      *       - GROUP
      *     description: followUnfollowMember ?? Functionality of follow and unfollow member.
      *     produces:
      *       - application/json
      *     parameters:
      *       - name: token
      *         description: token
      *         in: header
      *         required: true
      *       - name: followUnfollowMember
      *         description: followUnfollowMember
      *         in: body
      *         required: true
      *         schema:
      *           $ref: '#/definitions/followUnfollowMember'
      *     responses:
      *       200:
      *         description: Returns success message
      */

    async followUnfollowMember(req, res, next) {
        const validationSchema = {
            groupId: Joi.string().required(),
            userId: Joi.string().required(),
            isFollow: Joi.boolean().required()
        }
        try {
            var query;

            const { userId, groupId, isFollow } = await Joi.validate(req.body, validationSchema);
            var updateObj = {};
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }

            var groupRes = await findGroup({ _id: groupId });

            if (!groupRes) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }

            var memberRes = await findGroup({ members: groupRes.members })
            console.log("memberRes====", memberRes)

            if (!memberRes) {
                throw apiError.notFound(responseMessage.NOT_MEMBER)
            }


            if (isFollow == true) {
                updateObj = {
                    $addToSet: { userFollower: userResult._id }
                }
            }
            // if (isFollow == false) {
            //     updateObj = {
            //         $pull: { userFollower: groupRes.senderId }
            //     }
            // }
            let result = await updateGroup({ senderId: groupRes.senderId }, updateObj);

            console.log("==414", result)
            return res.json(new response(result, responseMessage.UPDATE_SUCCESS));
        } catch (error) {
            return next(error);
        }
    }




    /**
      * @swagger
      * /group/members:
      *   post:
      *     tags:
      *       - GROUP
      *     description: addMembers ?? Add Members into the group.
      *     produces:
      *       - application/json
      *     parameters:
      *       - name: token
      *         description: token
      *         in: header
      *         required: true
      *       - name: addMembers
      *         description: addMembers
      *         in: body
      *         required: true
      *         schema:
      *           $ref: '#/definitions/addMembers'
      *     responses:
      *       200:
      *         description: Returns success message
      */

    async addMembers(req, res, next) {
        const validationSchema = {
            groupId: Joi.string().required(),
            members: Joi.array().items(Joi.string()).optional()
        }
        try {
            var groupLeftResult;
            var validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var groupResult = await findGroup({ _id: validatedBody.groupId, status: status.ACTIVE });
            if (!groupResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            if (groupResult.createdBy != (userResult._id).toString()) {
                throw apiError.badRequest(responseMessage.GROUP_MEMBER);
            }
            for (let i of validatedBody.members) {
                groupLeftResult = await goupLeftMember(groupResult._id, i)
                if (groupLeftResult) {
                    await updateGroup({ _id: groupResult._id }, { $pull: { membersLeft: { userId: i } } });
                }
            }
            let result = await updateGroup({ _id: groupResult._id }, { $addToSet: { members: validatedBody.members } });
            var users = await findAllUsers({ _id: { $in: validatedBody.members } })
            var device_tokens = [];
            users.forEach(t => {
                if (t.deviceToken) {
                    return device_tokens.push(t.deviceToken)
                }
            });
            if (device_tokens.length != 0) {
                for (let i of device_tokens) {
                    var message = {
                        to: i,
                        data: {
                            senderId: userResult._id,
                            title: 'Traliens',
                            body: `${userResult.first_name} added you in ${groupResult.groupName} group`,
                            sound: 'default'
                        },
                        notification: {
                            title: 'Traliens',
                            body: `${userResult.first_name} added you in ${groupResult.groupName} group`,
                            sound: 'default'
                        }
                    };

                    await commonFunction.pushNotification(message)
                }
            }
            return res.json(new response(result, responseMessage.MEMBERS_ADDED));
        }
        catch (error) {
            return next(error);
        }
    }


    /**
      * @swagger
      * /group/removeMember:
      *   patch:
      *     tags:
      *       - GROUP
      *     description: removeMember ?? Remove member from the group on the basis of valid user.
      *     produces:
      *       - application/json
      *     parameters:
      *       - name: token
      *         description: token
      *         in: header
      *         required: true
      *       - name: groupId
      *         description: groupId
      *         in: formData
      *         required: true
      *       - name: members
      *         description: members
      *         in: formData
      *         required: false
      *     responses:
      *       200:
      *         description: Returns success message
      */


    async removeMember(req, res, next) {
        const validationSchema = {
            groupId: Joi.string().required(),
            members: Joi.string().optional()
        }
        try {
            var validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var groupResult = await findGroup({ _id: validatedBody.groupId, status: status.ACTIVE, createdBy: userResult._id, members: { $in: validatedBody.members } });
            if (!groupResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            var updateObj = {
                $pull: { members: validatedBody.members }
            }
            let result = await updateGroup({ _id: groupResult._id }, updateObj);
            return res.json(new response(result, responseMessage.UPDATE_SUCCESS));
        }
        catch (error) {
            return next(error);
        }
    }


}



export default new groupController()
