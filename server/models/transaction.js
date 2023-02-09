import mongoose from 'mongoose';
const schema = mongoose.Schema;
import mongoosePaginate from 'mongoose-paginate';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate';
import status from '../enums/status';
import transStatusType from '../enums/transactionStatusType';

const options = {
    collection: "transaction",
    timestamps: true
};

const schemaDefination = new schema(
    {
        title: { type: String },
        userId: { type: mongoose.Types.ObjectId, ref: 'user' },
        eventId: { type: mongoose.Types.ObjectId, ref: 'event' },
        dogId: { type: mongoose.Types.ObjectId, ref: 'nft' },
        fromAddress: { type: String },
        toAddress: { type: String },
        quantity: { type: Number },
        amount: { type: String },
        tokenAmount: { type: String },
        tokenId: { type: String },
        transactionHash: { type: String },
        transactionFee: { type: Number },
        receipt: schema.Types.Mixed,
        failedReason: schema.Types.Mixed,
        isAdminTransaction: { type: Boolean },
        interest: { type: Number },
        interest: { type: String },
        paymentType: { type: String },
        transStatusType: { type: String, enum: [transStatusType.PENDING, transStatusType.SUCCESS, transStatusType.FAILED, transStatusType.CANCEL] },
        status: { type: String, default: status.ACTIVE }
    },
    options
);


schemaDefination.plugin(mongoosePaginate);
schemaDefination.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("transaction", schemaDefination);

