import { collectionServices } from '../../services/collection';
import { userServices } from '../../services/user';

import status from '../../../../enums/status';
const { updateCollection, collectionList, updateManyCollection } = collectionServices;
const { updateUser } = userServices;


const cronJob = require("cron").CronJob;

new cronJob('1 * * * *', async function () {

    var updateRes = await updateManyCollection({ tillDate: { $lte: new Date().toISOString() }, status: { $ne: status.DELETE } }, { isPromoted: false })
    console.log("======= for promote collection Crone Update ====", updateRes)


}).start();







