
import nftModel from "../../../models/nft";
import status from '../../../enums/status';
import mongoose from "mongoose";

const nftServices = {

  createNft: async (insertObj) => {
    return await nftModel.create(insertObj);
  },

  findNft: async (query) => {
    return await nftModel.findOne(query).populate('userId ownerHistory.userId collectionId');
  },

  findNftWithSelect: async (query) => {
    return await nftModel.findOne(query).select('-uri');
  },

  findAllNft: async (query) => {
    return await nftModel.find(query).sort({ createdAt: -1 }).select('-nftId').populate('userId creatorId ownerHistory.userId collectionId');
  },

  findAllPhysicalNft: async (query, userId) => {
    // return await nftModel.find(query).sort({ createdAt: -1 }).select('-nftId').populate('userId creatorId ownerHistory.userId collectionId');
    return await nftModel.aggregate([
      { $match: query },
      {
        $addFields: {
          "isLike": {
            $cond: {
              if: { $in: [mongoose.Types.ObjectId(userId), "$likesUsers"] },
              then: true,
              else: false
            }
          }
        }
      },
      {
        $addFields: {
          "isFavourate": {
            $cond: {
              if: { $in: [mongoose.Types.ObjectId(userId), "$favouriteUsers"] },
              then: true,
              else: false
            }
          }
        }
      },
      {
        $lookup: {
          from: "user",
          localField: "userId",
          foreignField: "_id",
          as: "userId"
        }
      },
      {
        $lookup: {
          from: "user",
          localField: "creatorId",
          foreignField: "_id",
          as: "creatorId"
        }
      },
      {
        $lookup: {
          from: "collection",
          localField: "collectionId",
          foreignField: "_id",
          as: "collectionId"
        }
      },
      {
        $lookup: {
          from: "order",
          localField: "_id",
          foreignField: "nftId",
          as: "orderId"
        }
      },
      {
        $lookup: {
          from: "user",
          localField: "ownerHistory.userId",
          foreignField: "_id",
          as: "ownerHistory"
        }
      },
      {
        "$unwind": {
          "path": "$userId",
          "preserveNullAndEmptyArrays": true
        }
      },
      {
        "$unwind": {
          "path": "$creatorId",
          "preserveNullAndEmptyArrays": true
        }
      },
      {
        "$unwind": {
          "path": "$collectionId",
          "preserveNullAndEmptyArrays": true
        }
      },
      {
        "$unwind": {
          "path": "$orderId",
          "preserveNullAndEmptyArrays": true
        }
      },
      { $sort: { createdAt: -1 } }

    ])
  },


  findNftWithPopulateDetails: async (id, userId) => {
    let query = { _id: mongoose.Types.ObjectId(id), status: { $ne: status.DELETE } }
    return await nftModel.aggregate([
      { $match: query },
      {
        $addFields: {
          "isLike": {
            $cond: {
              if: { $in: [mongoose.Types.ObjectId(userId), "$likesUsers"] },
              then: true,
              else: false
            }
          }
        }
      },
      {
        $lookup: {
          from: "user",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $lookup: {
          from: "user",
          localField: "currentOwnerId",
          foreignField: "_id",
          as: "currentOwnerDetails"
        }
      },
      {
        $lookup: {
          from: "user",
          localField: "ownerHistory.userId",
          foreignField: "_id",
          as: "ownerHistory"
        }
      },
      {
        $lookup: {
          from: "order",
          as: "orderDetails",
          let: {
            order_id: "$_id"
          },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$$order_id", "$nftId"] },
              }
            }, {
              $lookup: {
                from: "bid",
                localField: "_id",
                foreignField: "orderId",
                as: "bidDetails"
              }
            }
          ],
        }
      },
      { $sort: { createdAt: -1 } }

    ])
  },


  updateNft: async (query, updateObj) => {
    return await nftModel.findOneAndUpdate(query, updateObj, { new: true });
  },

  nftList: async (userId) => {
    return await nftModel.aggregate([
      { $match: { userId: userId, status: { $ne: status.DELETE } } },
      {
        $addFields: {
          "isLike": {
            $cond: {
              if: { $in: [mongoose.Types.ObjectId(userId), "$likesUsers"] },
              then: true,
              else: false
            }
          }
        }
      },
      {
        $lookup: {
          from: "user",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $lookup: {
          from: "user",
          localField: "currentOwnerId",
          foreignField: "_id",
          as: "currentOwnerDetails"
        }
      },
      {
        $lookup: {
          from: "user",
          localField: "ownerHistory.userId",
          foreignField: "_id",
          as: "ownerHistory"
        }
      },
      {
        $lookup: {
          from: "order",
          localField: "orderId",
          foreignField: "_id",
          as: "orderDetails"
        }
      },
      {
        $lookup: {
          from: "bid",
          localField: "bidId",
          foreignField: "_id",
          as: "bidDetails"
        }
      },
      { $sort: { createdAt: -1 } }
    ])
  },

  findNftLike: async (userId, validatedBody) => {
    let query = { likesUsers: { $in: [userId] }, status: { $ne: status.DELETE } };
    const { search, page, limit } = validatedBody;
    if (search) {
      query.$or = [
        { tokenId: { $regex: search, $options: 'i' } },
        { contractAddress: { $regex: search, $options: 'i' } },
        { tokenName: { $regex: search, $options: 'i' } },
      ]
    }
    let options = {
      page: page || 1,
      limit: limit || 10,
      sort: { createdAt: -1 },
      populate: [{ path: 'userId' }, { path: 'collectionId currentOwnerId ownerHistory.userId' }]
    };
    return await nftModel.paginate(query, options);
  },

  nftListWithSearch: async (validatedBody) => {
    let query = { nftType: { $ne: "PHYSICAL" }, isPlace: false, currentOwnerId: validatedBody.userId }
    if (validatedBody.itemCategory) {
      query.itemCategory = { $in: validatedBody.itemCategory }
    }
    if (validatedBody.network) {
      query.network = { $in: validatedBody.network }
    }
    // let options = {
    //   page: validatedBody.page || 1,
    //   limit: validatedBody.limit || 10,
    //   sort: { createdAt: -1 },
    //   populate: [{ path: 'userId' }, { path: 'collectionId currentOwnerId ownerHistory.userId' }]

    // };
    return await nftModel.find(query).populate([{ path: 'userId' }, { path: 'collectionId currentOwnerId ownerHistory.userId' }]);

  },



  nftPaginateSearch: async (validatedBody) => {
    let query = { status: { $ne: status.DELETE }, isPlace: false, userId: validatedBody.userId };
    const { search, fromDate, toDate, page, limit } = validatedBody;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { symbol: { $regex: search, $options: 'i' } },
      ]
    }
    if (fromDate && !toDate) {
      query.createdAt = { $gte: fromDate };
    }
    if (!fromDate && toDate) {
      query.createdAt = { $lte: toDate };
    }
    if (fromDate && toDate) {
      query.$and = [
        { createdAt: { $gte: fromDate } },
        { createdAt: { $lte: toDate } },
      ]
    }
    let options = {
      page: page || 1,
      limit: limit || 10,
      sort: { createdAt: -1, treandingNftCount: -1 }
    };
    return await nftModel.paginate(query, options);
  },

  nftCount: async () => {
    return await nftModel.countDocuments();
  },

  listAllNft: async (validatedBody) => {
    let query = { status: { $ne: status.DELETE }, isPlace: { $ne: true } };
    const { search } = validatedBody;
    if (search) {
      query.$or = [
        { tokenId: { $regex: search, $options: 'i' } },
        // { bundleTitle: { $regex: search, $options: 'i' } },
        // { bundleName: { $regex: search, $options: 'i' } },
        { contractAddress: { $regex: search, $options: 'i' } },
        { tokenName: { $regex: search, $options: 'i' } },
      ]
    }
    return await nftModel.find(query).sort({ createdAt: -1 }).populate("userId collectionId currentOwnerId  ownerHistory.userId collectionId.brandId");
  },

  nftListWithAggregatePipeline: async (validatedBody, userId) => {
    let query = { status: status.ACTIVE, isPlace: false };
    const { search } = validatedBody;
    if (search) {
      query.$or = [
        { tokenId: { $regex: search, $options: 'i' } },
        { tokenName: { $regex: search, $options: 'i' } },
      ]
    }
    return await nftModel.aggregate([
      { $match: query },
      {
        $addFields: {
          "isLike": {
            $cond: {
              if: { $in: [mongoose.Types.ObjectId(userId), "$likesUsers"] },
              then: true,
              else: false
            }
          }
        }
      },
      {
        $lookup: {
          from: "user",
          localField: "userId",
          foreignField: "_id",
          as: "userId"
        }
      },
      {
        $lookup: {
          from: "collection",
          localField: "collectionId",
          foreignField: "_id",
          as: "collectionId"
        }
      },
      {
        $lookup: {
          from: "user",
          localField: "currentOwnerId",
          foreignField: "_id",
          as: "currentOwnerDetails"
        }
      },
      {
        $lookup: {
          from: "user",
          localField: "ownerHistory.userId",
          foreignField: "_id",
          as: "ownerHistory"
        }
      },
      { $sort: { createdAt: -1 } }
      // {
      //   $lookup: {
      //     from: "order",
      //     as: "orderDetails",
      //     let: {
      //       order_id: "$_id"
      //     },
      //     pipeline: [
      //       {
      //         $match: {
      //           $expr: { $eq: ["$$order_id", "$nftId"] },
      //         }
      //       }, {
      //         $lookup: {
      //           from: "bid",
      //           localField: "_id",
      //           foreignField: "orderId",
      //           as: "bidDetails"
      //         }
      //       }
      //     ],
      //   }
      // },

    ])
  },

  nftListWithAggregatePipelineForAll: async (validatedBody, userId) => {
    let query = { status: { $ne: status.DELETE } };
    const { search } = validatedBody;
    if (search) {
      query.$or = [
        { tokenId: { $regex: search, $options: 'i' } },
        { bundleTitle: { $regex: search, $options: 'i' } },
        { bundleName: { $regex: search, $options: 'i' } },
        { contractAddress: { $regex: search, $options: 'i' } },
        { tokenName: { $regex: search, $options: 'i' } },
      ]
    }
    return await nftModel.aggregate([
      { $match: query },
      {
        $addFields: {
          "isLike": {
            $cond: {
              if: { $in: [mongoose.Types.ObjectId(userId), "$likesUsers"] },
              then: true,
              else: false
            }
          }
        }
      },
      {
        $lookup: {
          from: "user",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $lookup: {
          from: "user",
          localField: "currentOwnerId",
          foreignField: "_id",
          as: "currentOwnerDetails"
        }
      },
      {
        $lookup: {
          from: "user",
          localField: "ownerHistory.userId",
          foreignField: "_id",
          as: "ownerHistory"
        }
      },
      {
        $lookup: {
          from: "order",
          as: "orderDetails",
          let: {
            order_id: "$_id"
          },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$$order_id", "$nftId"] },
              }
            }, {
              $lookup: {
                from: "bid",
                localField: "_id",
                foreignField: "orderId",
                as: "bidDetails"
              }
            }
          ],
        }
      },
      { $sort: { createdAt: -1 } }
    ])
  },

  multiUpdate: async (updateObj) => {
    return await nftModel.updateMany({}, updateObj, { multi: true });
  },



  collectionNftList: async (query) => {
    return await nftModel.find(query).sort({ createdAt: -1 }).populate([{ path: ' userId ' }]);
  },
  multiUpdateData: async (query,updateObj) => {
    return await nftModel.updateMany(query, updateObj, { multi: true });
  },

}

module.exports = { nftServices };
