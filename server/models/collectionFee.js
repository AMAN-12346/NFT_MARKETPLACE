import Mongoose, { Schema } from "mongoose";
import status from '../enums/status';
import mongoosePaginate from "mongoose-paginate";


const options = {
    collection: "collectionFee",
    timestamps: true
};

const collectionFeeSchema = new Schema(
    {
        userId: {
            type: Mongoose.Types.ObjectId,
            ref: 'user'
        },
        collectionId: {
            type: Mongoose.Types.ObjectId,
            ref: 'collection'
        },
   
        collectionFee: { 
            type: String ,
        },

        status: { type: String, default: status.ACTIVE }
    },
    options
);
collectionFeeSchema.plugin(mongoosePaginate);

module.exports = Mongoose.model("collectionFee", collectionFeeSchema);

Mongoose.model("collectionFee", collectionFeeSchema).find({}, async (err, result) => {
    if (err) {
        console.log("DEFAULT COLLECTIONFEE ERROR", err);
    }
    else if (result.length != 0) {
        console.log("Default COLLECTIONFEE ");
    }
    else {
        let obj1 = {
            collectionFee: "0.001",
        };

        Mongoose.model("collectionFee", collectionFeeSchema).create(obj1, async (err1, result1) => {
            if (err1) {
                console.log("DEFAULT COLLECTIONFEE  creation ERROR", err1);
            } else {
                console.log("DEFAULT COLLECTIONFEE Created", result1);
            }
        });
    }
});











  
  

