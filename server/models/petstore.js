import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import status from '../enums/status';

const options = {
    collection: "petstore",
    timestamps: true,
};

const petstoreModel = new Schema(
    {
        name: { type: String },
        description: { type: String },
        price: { type: Number },
        image: { type: String },
        availableQuantity:{ type: Number },
        likesUsers: [{
            type: Schema.Types.ObjectId,
            ref: 'user'
        }],
        categoryId:{
            type: Schema.Types.ObjectId,
            ref: 'category'
        },
        productType:{
            type:String
        },
        attributes: {
            Aerodynamics: { type: Number },
            weight: { type: String },
            BMI: { type: String},
            Age: { type: Date},
            ShoeType: {type: String },
            Coat: {type: String},
            Tail: { type: String},
            Nurturing: {type: Number }
        },
        status: {
            type: String,
            enum: [status.ACTIVE, status.BLOCK, status.DELETE],
            default: status.ACTIVE
        }
    },
    options
);
petstoreModel.plugin(mongoosePaginate);
petstoreModel.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("petstore", petstoreModel);

// let data = [
//     {
//         "name": "Trixie Dog Classic H-Harness Large 25mm (Black)",
//         "description": "This high quality nylon harness is an awesome tool to easily control your dog while allowing it freedom to enjoy daily walking, jogging, tracking and other training activities. The harness is water resistant and comes in a stylish red colour to make your dog look smart. It stretches without losing shape and is sturdy and durable to withstand fungi, insects etc and serve you for many years to come. The harness is adjustable and will fit perfectly around large breed to extra large dogs. It is super light in weight and provides your dog a soft feel. So shop with confidence This high quality nylon harness is an awesome tool to easily control your dog while allowing it freedom to enjoy daily walking, jogging, tracking and other training activities. The harness is water resistant and comes in a stylish red colour to make your dog look smart. It stretches without losing shape and is sturdy and durable to withstand fungi, insects etc and serve you for many years to come. The harness is adjustable and will fit perfectly around medium to large breed dogs. It is super light in weight and provides your dog a soft feel. So shop with confidence! We spice up Indian homes with our home improvement products every 45 seconds making us India’s leading Furniture and Home Décor destination. Max Length – 39 inch Min Length – 30 inch Width – 25 mm Color – Red",
//         "price": 23,
//         "image": "https://res.cloudinary.com/mobiloittetech/image/upload/v1665741227/g4cslepv6gvtym1rygkd.webp",
//     },
//     {
//         "name": "Royal Canin Labrador Puppy Dog Food 3 kg",
//         "description": "Labrador puppies start to eat solid foods at the age of 2 months. The pups will show great interest to foods and they usually consume more calories than their adult counterparts. A highly delicious meal with greater nutritional content makes your puppy Labradors fit and healthy. Royal Canin Labrador Retriever Puppy Dog Food 3 Kg is a top quality dog food having a nutritional profile that is ideal for making your Labrador pups healthy and strong. The kibble design and texture is formulated to adapt to the jaws of the junior Labradors. The diet is rich in protein for developing a strong musculoskeletal structure. Essential Omega 3 fatty acids like EPA and DHA improves cognitive functions and cardiovascular health. This food also contains natural fibres for keeping the puppy’s digestive systems healthy. The antioxidant present in Royal Canin Labrador Retriever Junior keeps excellent natural defences in the Labrador pups lowering the chances of illnesses.",
//         "price": 49,
//         "image": "https://res.cloudinary.com/mobiloittetech/image/upload/v1665741366/kmxb0dhpmmkrgeshirpx.webp",
//     },
//     {
//         "name": "Royal Canin Maxi Adult Dog Food 4 Kg",
//         "description": "The dogs who are between 15 months to 5 years of age and 26-44kg in weight are placed under the category/label ‘MAXI’. These dogs are lively and athletic by nature and therefore, they need the supply of the energy that matches their lifestyle, especially in extreme conditions. Keeping this in mind, Royal Canin Maxi Adult Dog Food 4 Kg is prepared in a way to provide healthy nutrition to each large dog. The meal contains essential omega 3 fatty acids for boosting skin and coat health. A balanced supply of dietary fibres promotes healthy digestion ensuring a higher nutrient absorption. This nutritious food is made exclusively for all the Large breed dogs of different age, activity level, psychological state and the individual sensitivities.",
//         "price": 59,
//         "image": "https://res.cloudinary.com/mobiloittetech/image/upload/v1665741472/yqv0oannhw0hhosatl9c.webp",
//     },
//     {
//         "name": "Pedigree Adult Wet Dog Food, Chicken & Liver Chunks in Gravy, Pack of 15 ( 15 x 70 Gm)",
//         "description": "Pedigree Adult Wet Dog Food, Chicken & Liver Chunks in Gravy, Pack of 15, is a top quality gravy food available at PetsWorld that maintains excellent health and wellbeing in dogs of all breeds. It has got ample amounts of protein that helps in endowing the dogs with a shiner coat and a healthy skin. Moreover, an ideal blend of Calcium to Phosphorus ratio maintains strong bones and joints in your dogs. The food also has organic fibres that support a higher nutrient absorption, apart from increasing the digestive health of your dogs. Pedigree Adult Chicken and Liver Chunks consist of Vitamin E as a natural antioxidant that bolsters the immune system of the dogs, keeping them safe against illnesses.",
//         "price": 40,
//         "image": "https://res.cloudinary.com/mobiloittetech/image/upload/v1665741546/zsjf0iqqdxbnmufc12e7.webp",
//     },
//     {
//         "name": "Petsnugs Retro Check Summer Shirt for Dogs and Cats (XS)",
//         "description": "Adjustable Cutting Length, Adjustable Height, Adjustable Volume, Adjustable Width, Lightweight, Easy To Clean",
//         "price": 45,
//         "image": "https://res.cloudinary.com/mobiloittetech/image/upload/v1665741768/ajxhbp5cspjvuv3hpmod.webp",
//     },
//     {
//         "name": "Petsnugs Winter wear Fluffy Pullover Sweatshirt for Dogs and Cats (XS)",
//         "description": "Adjustable Cutting Length, Adjustable Height, Adjustable Volume, Adjustable Width, Easy To Clean, External, Heating, Lightweight, Non-Irritating, Stretchable",
//         "price": 99,
//         "image": "https://res.cloudinary.com/mobiloittetech/image/upload/v1665741861/urez4moydz9u0gvugjvk.webp",
//     },
//     {
//         "name": "Silver Steel Chock Chain Dog Collar for Large Size Dogs",
//         "description": "Adjustable Cutting Length, Adjustable Height, Adjustable Volume, Adjustable Width, Artificial Product, Durable, Lightweight, Lockable, Non-Irritating",
//         "price": 29,
//         "image": "https://res.cloudinary.com/mobiloittetech/image/upload/v1665742053/agpkhjzpjwfwmd4zbglm.webp",
//     },
//     {
//         "name": "Golden Steel Chock Chain Dog Collar for Medium Size Dogs",
//         "description": "Choke chain for dogs is an excellent dog training tool used across. This choke chain collar is also called as training collar, choke chain, choke collars, chain control collar or slip collar. These choke chains or collars have a reputation of being inhumane, but are an effective and humane training product when used in a right way. Choke Chain is amazing when it comes to help you to control your dog. This choke chain will help you teach your dog learn submission to obedience commands and leash etiquette.",
//         "price": 199,
//         "image": "https://res.cloudinary.com/mobiloittetech/image/upload/v1665742116/d1vvcol8nd3ug2xi7zet.webp",
//     }
// ];

// (async () => {
//     const petStoreResult = await Mongoose.model("petstore", petstoreModel).find({})
//     if (petStoreResult.length != 0) {
//         console.log("Default petstore already created.");
//     }
//     else {
//         let result = await Mongoose.model("petstore", petstoreModel).create(data);
//         console.log("Default petstore created", result)
//     }

// }).call();