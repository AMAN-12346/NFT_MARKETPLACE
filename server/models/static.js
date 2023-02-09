import Mongoose, { Schema } from "mongoose";
import status from '../enums/status';

const options = {
    collection: "static_content",
    timestamps: true
};

const staticModel = new Schema(
    {
        type: { type: String },
        title: { type: String },
        description: { type: String },
        status: { type: String, default: status.ACTIVE }
    },
    options
);

module.exports = Mongoose.model("static_content", staticModel);
(async () => {
    const result = await Mongoose.model("static_content", staticModel).find({});
    if (result.length != 0) {
        console.log("Default static created.")
    } else {
        var obj1 = {
            type: "termsConditions",
            title: "Terms & Conditions",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar tempor. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam fermentum, nulla luctus pharetra vulputate, felis tellus mollis orci, sed rhoncus sapien nunc eget"
        };
        var obj2 = {
            type: "privacyPolicy",
            title: "Privacy Policy",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar tempor. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam fermentum, nulla luctus pharetra vulputate, felis tellus mollis orci, sed rhoncus sapien nunc eget."
        };
        var obj3 = {
            type: "aboutUs",
            title: "About Us",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar tempor. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam fermentum, nulla luctus pharetra vulputate, felis tellus mollis orci, sed rhoncus sapien nunc eget.",
        };

        const created = await Mongoose.model("static_content", staticModel).create(obj1, obj2, obj3);
        if (created) console.log("Static content created.", created);
    }
}).call();

