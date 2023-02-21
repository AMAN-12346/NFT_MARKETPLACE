
// import ethers from 'ethers';
const ethers = require("ethers")


const lazyMintingService = {



    /**
       * @swagger
       * /user/createSignature:
       *   post:
       *     tags:
       *       - USER
       *     description: createSignature
       *     produces:
       *       - application/json
       *     parameters:
       *       - name: tokenId
       *         description: tokenId
       *         in: form Data
       *         required: false
       *       - name: uri
       *         description: uri
       *         in: form Data
       *         required: false
       *       - name: minPrice
       *         description: minPrice
       *         in: form Data
       *         required: false
       *     responses:
       *       200:
       *         description: User wallet created.
       *       501:
       *         description: Something went wrong.
       *       500:
       *         description: Internal server error.
       *       409:
       *         description: User Exists.
       */
    createVoucher: async (tokenId, uri, minPrice) => {
        const voucher = { tokenId, uri, minPrice }
        const domain = await this._signingDomain()
        const signature = await this.signer._signTypedData(domain, types, voucher)
        return {
            ...voucher,
            signature,
        }
    },

    async _signingDomain() {
        if (domain != null) {
            return domain
        }
        const chainId = await this.contract.getChainID()
        domain = {
            name: SIGNING_DOMAIN_NAME,
            version: SIGNING_DOMAIN_VERSION,
            verifyingContract: this.contract.address,
            chainId,
        }
        return this._domain
    }


}

module.exports = { lazyMintingService };
