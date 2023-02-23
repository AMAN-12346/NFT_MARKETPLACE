import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import status from '../enums/status';
var mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const schema = Mongoose.Schema;
var categorySchema = new schema({

    categoryTitle: {
        type: String
    },
    categoryIcon: {
        type: String,
        default: ""
    },
    status: { type: String, default: status.ACTIVE }
}, { timestamps: true }
);

categorySchema.plugin(mongoosePaginate);
categorySchema.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("category", categorySchema);


Mongoose.model("category", categorySchema).findOne({}, (err, result) => {
    if (err) {
      console.log("DEFAULT category ERROR", err);
    }
    else if (result) {
      console.log("Default category.");
    }
    else {
      let obj1 = {
        categoryTitle:"Artwork",
        categoryIcon: "https://res.cloudinary.com/dpiw7uxv9/image/upload/v1677148501/swc4np9tc0tlti2kw1ms.png",
      };

      Mongoose.model("category", categorySchema).create(obj1,  async (err1, result1) => {
        if (err1) {
          console.log("DEFAULT Collection  creation ERROR", err1);
        } else {
          console.log("DEFAULT Collection Created", result1);
        }
      });
    }
  });
  