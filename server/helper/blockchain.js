// import axios from 'axios';
// import config from 'config';

// import Web3  from "web3";


const axios = require('axios');
const config = require('config');

const Web3 = require("web3");


// var web3 = new Web3(new Web3.providers.HttpProvider(config.get('BNB_URL')));


// var contractABI = config.get('contractABI');
// var coinContract = config.get('contractAddress');

// contractABI = contractABI.map(method => ({ ...method }));

// const contractAddress = new web3.eth.Contract(contractABI, coinContract)


//********************************QI functionality **************************************************/
// const Web3 = require("web3");
const EthereumTx = require('ethereumjs-tx').Transaction;
const common = require('ethereumjs-common');

// const axios = require('axios');
// const ethNetwork = 'https://rpc-main1.qiblockchain.online'; //mainnet
const ethNetwork = 'https://rpc-main2.qiblockchain.online'; //mainnet



var multisendABI = config.get('multisendABI');
var multisendContract = config.get('multisendAddress');

multisendABI = multisendABI.map(method => ({ ...method }));
const web3 = new Web3(new Web3.providers.HttpProvider(ethNetwork));

const multiContract = new web3.eth.Contract(multisendABI, multisendContract);


// const adminAddress = "0xE8C852FB61a6350caa4a5301ECaEa4F5DF2eAdE9";// mainnet
// const adminPrivateKey = "80a23ec96849eb42998ea20bc35e064f511767ecbfb434de95b94759402a1e1a";// mainnet


// const address = "0xef9444D0810a445689622A5dc9D3B06c68CE94B4";// testnet
// const privateKey = "80a23ec96849eb42998ea20bc35e064f511767ecbfb434de95b94759402a1e1a";// testnet

const sendersData = {
    address: config.get('adminWalletAddress'),
    privateKey: config.get('adminPrivateKey')
}

//***************************************************************************************************/

// const getCurrentGasPrices = async () => {
//     let response = await axios.get('https://ethgasstation.info/api/ethgasAPI.json?api-key=ce8da4d2e680dad6465330e7869efe101517aad8274be133e44a8119d5c0');
//     let prices = {
//         low: response.data.safeLow / 10,
//         medium: response.data.average / 10,
//         high: response.data.fast / 10
//     };
//     return prices;

// }

const EthHelper = async () => {
    let currentGasPrice = await getCurrentGasPrices();

    let gasPrice = currentGasPrice.high * 1000000000

    let gasLimit = 21000;
    let fee = gasLimit * gasPrice;

    let txFee = Number(web3.utils.fromWei(fee.toString(), "ether"));


    return { fee: txFee, gasPrice: gasPrice }
}
// /*

const transferAmount = async (address, amount) => {
    try {
        let amountToSend = 0;
        for (let i of amount) amountToSend += i;
        console.log('address, amount', address, amount);
        const newAmount = amount.map(i => web3.utils.toWei(i.toString()).toString());
        // amount = amount.map(i => console.log("testing data", i.toString()));

        console.log("amount==>90", newAmount);
        const transferRes = await multiContract.methods.distributeETH(address, newAmount).encodeABI();
        console.log("transferRes===>>", transferRes);


        function numZeroesAfterPoint(x) {
            if (x % 1 == 0) {
                return 0;
            } else {
                return -1 - Math.floor(Math.log10(x % 1));
            }
        }
        // let fixed = numZeroesAfterPoint(amountToSend);
        // amountToSend = amountToSend.toFixed(18 - fixed);

        let finalAmount = web3.utils.toWei(amountToSend.toString()).toString()

        var nonce = await web3.eth.getTransactionCount(sendersData.address);
        let result = await web3.eth.getBalance(sendersData.address);
        console.log("result==>>", result);
        let balance = web3.utils.fromWei(result, "ether");
        console.log("finalAmount", finalAmount)

        if (Number(result) < Number(finalAmount)) {
            return { Success: false, error: "Admin has insufficient funds to make this transaction." }
        }
        console.log("finalAmount", finalAmount);
        let gasPrices = await getCurrentGasPrices();
        let details = {
            "from": sendersData.address,
            "to": multisendContract,
            "data": transferRes,
            "value": web3.utils.toHex(finalAmount),
            "gas": 300000,
            "gasPrice": gasPrices.low * 1000000000,
            "nonce": nonce,
            "chainId": "0x2603" // EIP 155 chainId - mainnet: 1, rinkeby: 4
        };
        console.log("details==>>", details);

        const chain = common.default.forCustomChain(
            'mainnet', {
            name: 'qi',
            networkId: "0x2603",
            chainId: "0x2603"
        },
            "petersburg"
        )


        var rawTx = new EthereumTx(details, { common: chain });
        console.log("rawTx==>>", rawTx);

        // const transaction = new EthereumTx(details, {chain : "qi-blockchain"});
        // console.log('96 ==>',transaction)
        let privateKey = sendersData.privateKey.split('0x');
        let privKey = Buffer.from(privateKey[0], 'hex');



        rawTx.sign(privKey);

        const serializedTransaction = rawTx.serialize();
        const id = await web3.eth.sendSignedTransaction('0x' + serializedTransaction.toString('hex'));
        console.log("id===>>", id);

        // const url = `https://rinkeby.etherscan.io/tx/${id}`;
        // console.log("url======>>>", url);
        if (result) {
            return {
                Success: true,
                Hash: id
            };
        }
    } catch (error) {
        console.log("error=====>>163", error);
        return { Success: false, error: error }
    }
}
// */

// const transferAmount = async (address, amount) => {
//     try {
//         amount = amount.map(i => web3.utils.toHex(web3.utils.toWei(i.toString(), 'ether')));
//         console.log("amount==>", amount);
//         const transferRes = await multiContract.methods.distributeETH(address, amount).encodeABI();
//         console.log("transferRes===>>", transferRes);


//         let privateKey = sendersData.privateKey.split('0x');
//         let privKey = Buffer.from(privateKey[0], 'hex');



//         rawTx.sign(privKey);

//         const serializedTransaction = rawTx.serialize();
//         const id = await web3.eth.sendSignedTransaction('0x' + serializedTransaction.toString('hex'));
//         console.log("id===>>", id);
//         // if (result) {
//         //     return {
//         //         Success: true,
//         //         Hash: id
//         //     };
//         // }
//     } catch (error) {
//         console.log("error=====>>", error);
//         return { Success: false, error: error }
//     }
// }

module.exports = {
    transferAmount
}

async function getCurrentGasPrices() {
    try {
        let response = await axios.get('https://ethgasstation.info/json/ethgasAPI.json');
        let prices = {
            low: response.data.safeLow / 10,
            medium: response.data.average / 10,
            high: response.data.fast / 10
        };
        return prices;
    } catch (error) {
        console.log("catch error getCurrentGasPrices==>>", error);
    }

}

async function getBalance(address) {
    try {
        return new Promise((resolve, reject) => {
            web3.eth.getBalance(address, async (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(web3.utils.fromWei(result, "ether"));
            });
        });
    } catch (error) {
        console.log("catch error getBalance===>>", error);
    }

}



// 0xE8C852FB61a6350caa4a5301ECaEa4F5DF2eAdE9

// 80a23ec96849eb42998ea20bc35e064f511767ecbfb434de95b94759402a1e1a


// QI mainnet address

// (async () => {
//     let res = await transferAmount("0x582AE82fd48A57EF3b203A84E751Ba414599FE53", 0.01);
//     console.log("res==>>", res);
// }).call()