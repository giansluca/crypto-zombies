require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.20",
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {},
        // hardhat: {
        //     forking: {
        //         url: "https://mainnet.infura.io/v3/<key>",
        //     },
        // },
    },
};
