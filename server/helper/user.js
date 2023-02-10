
import { userServices } from '../api/v1/services/user';
const { findUser } = userServices;
import { dogHistoryServices } from '../api/v1/services/dogHistory';
const { findDogDetails } = dogHistoryServices;


let events = {};

const getUserPosition = async (id, data) => {
    data["x"] = data["posX"];
    data["y"] = data["posY"];
    data["z"] = data["posZ"];
    // console.log("data==>>", data);
    let obj = { id: id, userId: data.userId, eventId: data.eventId, x: data.x, y: data.y, z: data.z };

    console.log("events====?subhra", events)
    if (events[`${data.eventId}`]) {
        // console.log(true);
        const existingUser = events[`${data.eventId}`].find(
            user => String(user.userId) === String(data.userId)
        );
        console.log("I am here to see this=>>");

        if (!existingUser) {
            let [userDetails, eventDetails] = await Promise.all([
                findUser({ _id: data.userId }),
                findDogDetails({ userId: data.userId, eventId: data.eventId })
            ]);
            console.log("eventDetails= 1=>>", eventDetails);

            userDetails ? obj["walletAddress"] = userDetails["walletAddress"] : null;
            if (eventDetails) {
                obj["dogName"] = eventDetails.dogId["petName"];
            } else {
                obj["dogName"] = "Testing Dog";
            }
            obj["joined_time"]=new Date().toISOString();
            console.log("Obj 1====>>>", obj);

            events[`${data.eventId}`].push(obj);
        } else {
            const newArr = events[`${data.eventId}`].map(object => {
                if (object.userId === data.userId) {
                    return { ...object, z: data.z };
                }
                return object;
            });
            events[`${data.eventId}`] = newArr;
        }
    } else {
        let [userDetails, eventDetails] = await Promise.all([
            findUser({ _id: data.userId }),
            findDogDetails({ userId: data.userId, eventId: data.eventId })
        ]);
        userDetails ? obj["walletAddress"] = userDetails["walletAddress"] : null;
        if (eventDetails) {
            obj["dogName"] = eventDetails.dogId["petName"];
        } else {
            obj["dogName"] = "Testing Dog";
        }
        obj["joined_time"]=new Date().toISOString();
        console.log(false);
        events[`${data.eventId}`] = [obj];
    }
    events[`${data.eventId}`].sort((a, b) => b.z - a.z);
    let position = 0, newData = [];

    for (let index = 0; index < events[`${data.eventId}`].length; index++) {
        newData.push({
            // id: events[`${data.eventId}`][index].id,
            userId: events[`${data.eventId}`][index].userId,
            eventId: events[`${data.eventId}`][index].eventId,
            walletAddress: events[`${data.eventId}`][index].walletAddress,
            dogName: events[`${data.eventId}`][index].dogName,
            joined_time: events[`${data.eventId}`][index].joined_time,
            x: events[`${data.eventId}`][index].x,
            y: events[`${data.eventId}`][index].y,
            z: events[`${data.eventId}`][index].z,
            position: position
        });
        position += 1;

        if (index == events[`${data.eventId}`].length - 1) {
            position = 1;
            events[`${data.eventId}`] = newData;
            newData = new Array();
        }

        // delete events;
    }
    console.log("events==>>", events[`${data.eventId}`]);
    return events[`${data.eventId}`];
};


// program to empty an array
const emptyArray = async (id, data) => {
    data["x"] = data["posX"];
    data["y"] = data["posY"];
    data["z"] = data["posZ"];
    data["position"] = data["position"];
    let obj = { id: id, userId: data.userId, eventId: data.eventId, x: data.x, y: data.y, z: data.z };
    console.log("==events in empty===", events, data)

    let arr = {
        userId: [data.eventId].userId,
        eventId: [data.eventId].eventId,
        walletAddress: [data.eventId].walletAddress,
        dogName: [data.eventId].dogName,
        x: [data.eventId].x,
        y: [data.eventId].y,
        z: [data.eventId].z,
        position: data.position
    }
    let array2 = arr
    arr = [];
    return arr;
}




// // program to empty an array
// const emptyArray22 = async (id, data) => {

//     data["x"] = data["posX"];
//     data["y"] = data["posY"];
//     data["z"] = data["posZ"];
//     // console.log("data==>>", data);
//     let obj = { id: id, userId: data.userId, eventId: data.eventId, x: data.x, y: data.y, z: data.z };

//     let arr = {
//         "userId": "638748f6843aa904397327c1",
//         "eventId": "63ad3bf86e35f9f0c7bf7854",
//         "x": -5.260009765625,
//         "y": 1.0860826969146729,
//         "z": -511.4803161621094,
//         "position": 1
//     }

//     let array2 = arr
//     arr = [];
//     return arr;
// }


module.exports = { getUserPosition, emptyArray };