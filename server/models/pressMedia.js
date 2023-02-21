const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var schema = mongoose.Schema;
var pressMediaSchema = new schema({
    status: {
        type: String,
        enum: ["ACTIVE", "BLOCK", "DELETE"],
        default: "ACTIVE"
    },
    type: {
        type: String
    },
    title: {
        type: String,
    },
    image: {
        type: String,
    },
    url: { type: String },

    description: {
        type: String,
    },
},
    {
        timestamps: true
    })

pressMediaSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("pressMedia", pressMediaSchema)

mongoose.model("pressMedia", pressMediaSchema).find({}, (err, result) => {
    if (err) {
        console.log("Default pressMedia content error", err);
    }
    else if (result.length != 0) {
        console.log("Default pressMedia content");
    }
    else {
        var obj1 = {
            type: "Coinbase CEO",
            title: "Coinbase CEO Says NFTs Could Be As Big or Bigger Than Crypto Trading",
            url:"https://www.bloomberg.com/news/articles/2021-11-10/-big-or-bigger-than-crypto-trading-coinbase-bets-large-on-nfts",
            image: "https://res.cloudinary.com/mobiloittetech/image/upload/v1654576874/o2zirxyunfcf2jhzzqdg.jpg",
            description: "Coinbase Global Inc. co-founder Brian Armstrong says the market for non-fungible tokens could rival or even be larger than the companys cryptocurrency business."
        };

        var obj3 = {
            type: "Crypto and NFT Wallets",
            title: "Everything You Need to Know About Crypto and NFT Wallets",
            url:"https://nftnow.com/guides/everything-you-need-to-know-about-crypto-and-nft-wallets/",
            image: "https://res.cloudinary.com/mobiloittetech/image/upload/v1654576966/tiqvtzohwnwursma9e7o.png",
            description: `"You can take a dollar bill, fold it in half, and carry it around in your pocket. Or you can stack all your bills together and store them in a safe. Unfortunately, you can’t do the same with crypto and NFTs. So, before you get started with NFTs, you’ll need something to store your crypto and the digital assets you acquire in the crypto space. This is where crypto wallets come in."`,
        };
        var obj4 = {
            type: "Non-Fungible Tokens Explained",
            title: "What Is An NFT? Non-Fungible Tokens Explained",
            url:"https://www.forbes.com/advisor/investing/cryptocurrency/nft-non-fungible-token/",
            image: "https://res.cloudinary.com/mobiloittetech/image/upload/v1654577032/gdnln3hnlp1qsmi17jly.jpg",
            description: "Non-fungible tokens (NFTs) seem to be everywhere these days. From art and music to tacos and toilet paper, these digital assets are selling like 17th-century exotic Dutch tulips—some for millions of dollars.",
        };
        var obj5 = {
            type: "Cumulative NFT",
            title: "Cumulative NFT Sales Among 18 Blockchain Networks Surpass $36 Billion",
            url:"https://news.bitcoin.com/cumulative-nft-sales-among-18-blockchain-networks-surpass-36-billion/?fbclid=IwAR0MwfFd8bTTm6D4R8HJHsZS3ahrH2cv1hBAwZyACLtqn5KO5vLvYh9V-_I",
            image: "https://res.cloudinary.com/mobiloittetech/image/upload/v1654577144/abl8diycnang6fh9rpdn.webp",
            description: "Statistics recorded this week show that the aggregate number of non-fungible token (NFT) sales, settled across more than a dozen different blockchains, has officially surpassed $36 billion.",
        };
        mongoose.model("pressMedia", pressMediaSchema).create(obj1, obj3, obj4,obj5, (staticErr, staticResult) => {
            if (staticErr) {
                console.log("pressMedia content error.", staticErr);
            }
            else {
                console.log("pressMedia content created.", staticResult)
            }
        })
    }
})







