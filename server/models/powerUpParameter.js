import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import status from '../enums/status';

const options = {
    collection: "category",
    timestamps: true,
};

const categoryModel = new Schema(
    {
        name: { type: String },
        categoryType:{type:String},
        range:{type:String},
        addDifferentials:{type:Number},
        removeDifferentials:{type:Number},
        status: {
            type: String,
            enum: [status.ACTIVE, status.BLOCK, status.DELETE],
            default: status.ACTIVE
        }
    },
    options
);
categoryModel.plugin(mongoosePaginate);
categoryModel.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("category", categoryModel)
Mongoose.model("category", categoryModel).find({ status: status.ACTIVE }, (err, result) => {
    if (err) {
        console.log("Default category error.", err);
    }
    else if (result.length != 0) {
        console.log("Default categories.");
    }
    else{
        let obj1={
            name:"Aerodynamics",
            categoryType:"Number",

        }
        let obj2={
            name:"weight",
            categoryType:"Number",
        }
        let obj3={
            name:"BMI",
            categoryType:"String",
        }
        let obj4={
            name:"Age",
            categoryType:"String",
        }
        let obj5={
            name:"ShoeType",
            categoryType:"String",
        }
        let obj6={
            name:"Coat",
            categoryType:"String",
        }
        let obj7={
            name:"Tail",
            categoryType:"String",
        }
        let obj8={
            name:"Nurturing",
            categoryType:"Number"
        }
        Mongoose.model("category",categoryModel).create(obj1,obj2,obj3,obj4,obj5,obj6,obj7,obj8,(catErr,catResult)=>{
            if(catErr){
                console.log("Default category added error.", catErr);
            }
            else{
                console.log("default category added.", catResult);
            }
        })
    }

});

