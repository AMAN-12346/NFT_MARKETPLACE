import Mongoose, { Schema } from "mongoose";
import status from '../enums/status';
import number from "joi/lib/types/number";

const options = {
    collection: "temple_content",
    timestamps: true
};

const templeModel = new Schema(
    {
        templeNumber: { type: Number },
        templeName: { type: String },
        templeLength: { type: Number },
        status: { type: String, default: status.ACTIVE }
    },
    options
);

module.exports = Mongoose.model("temple_content", templeModel);
(async () => {
    const result = await Mongoose.model("temple_content", templeModel).find({});
    if (result.length != 0) {
        console.log("Default temple created.")
    } else {
        var obj1 = {
            templeNumber: 1,
            templeName: "Akshardham Temple",
            templeLength: "10"
        };
        var obj2 = {
            templeNumber: 2,
            templeName: "Gauri Shankar Temple",
            templeLength: "12"
        };
        var obj3 = {
            templeNumber: 3,
            templeName: "Hanuman Mandir",
            templeLength: 11
        };
        var obj4 = {
            templeNumber: 4,
            templeName: "Lotus Temple",
            templeLength: 10
        };
        var obj5 = {
            templeNumber: 5,
            templeName: " Tirupati Balaji",
            templeLength: 13
        };
        var obj6 = {
            templeNumber: 6,
            templeName: "Dwarkadhish Temple",
            templeLength: 12
        };
        var obj7 = {
            templeNumber: 7,
            templeName: "Iskcon Temple",
            templeLength: 11
        };
        var obj8 = {
            templeNumber: 8,
            templeName: "Shore Temple, Mahabalipuram",
            templeLength: 10
        };
        var obj9 = {
            templeNumber: 9,
            templeName: " Konark Temple",
            templeLength: 12
        };
        var obj10 = {

            templeNumber: 10,
            templeName: " Durga Temple Aihole",
            templeLength: 14
        };
        var obj11 = {
            templeNumber: 11,
            templeName: " 31. Har Ki Pauri, Haridwar",
            templeLength: 12
        };
        var obj12 = {
            templeNumber: 12,
            templeName: "Badrinath Temple",
            templeLength: 13
        };

        const created = await Mongoose.model("temple_content", templeModel).create(obj1, obj2, obj3, obj4, obj5, obj6, obj7, obj8, obj9, obj10,obj11,obj12);
        if (created) console.log("Static Temple content created.", created);
    }
}).call();