require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.20",
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {},
        // hardhat: {
        //     forking: {
        //         url: API_KEY,
        //         blockNumber: 22156659, // Upgrade to fix ecrecover was executed on block #22156660
        //     },
        // },
    },
};
