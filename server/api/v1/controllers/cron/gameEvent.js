import config from "config";
import transStatusType from '../../../../enums/transactionStatusType';

import { eventServices } from '../../services/event';
import { eventRacingServices } from '../../services/eventRacing';

const { findEventWithSort, findEvent, updateEvent } = eventServices;
const { updateEventRacing, findAllEventRacingWithPopulate, findAllEventRacingWithSort } = eventRacingServices;


import { dogHistoryServices } from '../../services/dogHistory';
const { findDogHistory, updateDogHistory } = dogHistoryServices;

import status from '../../../../enums/status';
import blockchainFunction from '../../../../helper/blockchain';
const adminAddressLive = config.get('adminAddressLive');
import { transactionServices } from '../../services/transaction';
const { createTransaction, findTransaction, updateTransaction, transactionList, transactionHistory } = transactionServices;

const sendersData = {
    address: config.get('adminWalletAddress'),
    privateKey: config.get('adminPrivateKey')
}

const cronJob = require("cron").CronJob;

let JobMain = new cronJob('*/05 * * * * *', async function () {
    try {
        const events = await findEventWithSort({ isActive: true, rewardProvided: false });
        console.log("events=>>>",events.length);

        if (events.length != 0) {
            JobMain.stop();
            for (let event = 0; event < events.length; event++) {
                if (new Date(events[event].endDate) <= new Date(new Date().toISOString())) {
                    console.log("reward call for ==>>",events[event]._id);
                    try {
                        const result = await eventCompletionCall(events[event]._id);
                        if (result) {
                            // console.log("transactions details are: ", result);
                            // await updateEvent({ _id: events[event]._id }, { rewardProvided: true });
                        }

                    } catch (error) {
                        console.log("cron catch error==>>", error);
                    }

                }
                if (event == events.length - 1) {
                    JobMain.start();
                }
            }
        }
    } catch (error) {
        JobMain.stop();
        JobMain.start();
    }

})
JobMain.stop();


const eventCompletionCall = async (eventId) => {
    try {
        console.log("distribution calling==>>",eventId);
        var eventResult = await findEvent({ _id: eventId, status: status.ACTIVE });
        if (eventResult) {
             //console.log("eventResult ==>>",eventResult);
            var allRacingResult = await findAllEventRacingWithSort({ eventId: eventResult._id, status: status.ACTIVE });
            var rank = 1, data = [], failed = [];
            for (let race of allRacingResult) {
                let raceTotal = 0;
                race['lapsTime'].map(o => raceTotal += o.time);
                race.totalTime = raceTotal;
                if (race.totalTime > 0) {
                    data.push(race);
                }
                else {
                    failed.push(race);
                }
            }
            data.sort(function (a, b) {
                return a.totalTime - b.totalTime;
            });
            for (var i = 0; i < data.length; i++) {
                if (i > 0 && data[i].totalTime > data[i - 1].totalTime) {
                    rank++;
                }
                data[i].position = rank;
            }
            if (rank >= data.length) {
                for (var i = 0; i < failed.length; i++) {
                    rank++;
                    failed[i].position = rank;
                }
            }
            data = data.concat(failed);
             console.log("data==>>>", data, data.length);

            // return
            for (let obj of data) {
                console.log("obj==>>", obj.position);
                await updateEventRacing({ _id: obj._id }, { $set: { position: obj.position } });
            }

            if (eventResult.rewardProvided == false) {
                let eventRewardResult = await findAllEventRacingWithPopulate({ eventId: eventId, status: status.ACTIVE, position: { $lte: 3 } });
                console.log("eventRewardResult===>>", eventRewardResult.length);
                // return
                let totalReward = 3;
                if (eventRewardResult.length < 3) {
                    totalReward = eventRewardResult.length;
                }
                let totalRewardFirst = 50;
                let totalRewardSecond = 30;
                let totalRewardThird = 20;

                let price = eventResult.fee == 0 ? eventResult.price : (eventResult.fee * eventResult.userEntered);

                let distributionWholeAmount = (price * 90) / 100;
                const adminAmount = price - distributionWholeAmount;
                const firstUser = (distributionWholeAmount * totalRewardFirst) / 100;
                const secondUser = (distributionWholeAmount * totalRewardSecond) / 100;
                const thirdUser = (distributionWholeAmount * totalRewardThird) / 100;


                // if (eventRewardResult.length < 3) {
                //     totalReward = eventRewardResult.length;dogId
                // }
                let rewardCount = 0, amount;
        

                let address = [adminAddressLive], amounts = [adminAmount];
                for (let j = 0; j < eventRewardResult.length; j++) {
                    rewardCount++;
                    console.log("========>",j)
                    amount = rewardCount === 1 ? firstUser : rewardCount === 2 ? secondUser : thirdUser;
                    console.log("userid==>>",eventRewardResult[j]);
                    address.push(eventRewardResult[j].userId.walletAddress);
                    amounts.push(amount);
                }
            

                let transactionResult = await blockchainFunction.transferAmount(address, amounts);
                if (transactionResult.Success === true) {
                    for (let k = 0; k < eventRewardResult.length; k++) {
                        const dogDetails = await findDogHistory({ dogId: eventRewardResult[k].dogId._id });
                        let time = dogDetails.timeConsumed;
                        let latestTime;
                        if (time === 0 || eventRewardResult[k].totalTime < time) {
                            latestTime = eventRewardResult[k].totalTime;
                        } else {
                            latestTime = time;
                        }
                        await Promise.all([
                            // updateDogHistory({ eventRacingId: eventRewardResult[k]._id }, { $inc: { noOfTimeWin: 1 } }),
                            updateEventRacing({ _id: eventRewardResult[k]._id }, { $set: { isRewarded: true, points: amounts[k + 1] } }),
                            updateDogHistory({ dogId: eventRewardResult[k].dogId._id }, { $set: { timeConsumed: latestTime }, $inc: { noOfTimeWin: 1, awardAmount: amounts[k + 1] } }),
                            createTransaction({
                                eventId: eventRewardResult[k].eventId,
                                dogId: eventRewardResult[k].dogId,
                                userId: eventRewardResult[k].userId,
                                fromAddress: sendersData.address,
                                toAddress: eventRewardResult[k].userId.walletAddress,
                                amount: amounts[k + 1],
                                transStatusType: transStatusType.SUCCESS
                            })
                        ]);
                        if (k == eventRewardResult.length-1) {
                            await updateEvent({ _id: eventResult._id }, { rewardProvided: true });
                        }
                    }
                }

            }
            return data;
        }

    } catch (error) {
        console.log("115 error==>>>", error);
    }
}
