import { ethers, BigNumber, constants, utils } from "ethers";

import {
	BasicOrderParameters,
	ConsiderationItem,
	CriteriaResolver,
	FulfillmentComponent,
	OfferItem,
	Order,
	OrderComponents,
} from "../test/utils/types";

import type { BigNumberish, ContractTransaction } from "ethers";

import { getItemETH, convertSignatureToEIP2098, toKey,toHex,toBN} from "../test/utils/encoding";
import { marketplaceFixture } from "../test/utils/fixtures/marketplace";

const hexRegex = /[A-Fa-fx]/g;

const main = async () => {

	// // get USDC
	// {
	// 	const usdcWhale = "0x725efdc61c6a10b3b2cbef14371532c5a45f62b7";
	// 	const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
	// 	const ERC20ABI = require("./ERC20ABI.json");
	// 	const signer = provider.getSigner(usdcWhale);
	// 	const USDC = new ethers.Contract(USDC_ADDRESS, ERC20ABI, signer);
	// 	await USDC.transfer(alice, 1000);
	// 	let bal = await USDC.balanceOf(alice);
	// 	console.log(bal);
	// }

	let order = {
		parameters: {
			offerer: "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1",
			zone: "0x0000000000000000000000000000000000000000",
			offer: [
				{
					itemType: 2,
					token: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
					identifierOrCriteria: BigNumber.from("0x1759"),
					startAmount: BigNumber.from("0x01"),
					endAmount: BigNumber.from("0x01"),
				},
			],
			consideration: [
				{
					itemType: 0,
					token: "0x0000000000000000000000000000000000000000",
					identifierOrCriteria: BigNumber.from("0x00"),
					startAmount: BigNumber.from("0x0de0b6b3a7640000"),
					endAmount: BigNumber.from("0x0de0b6b3a7640000"),
					recipient: "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1",
				},
			],
			totalOriginalConsiderationItems: 1,
			orderType: 0,
			zoneHash:
				"0x0000000000000000000000000000000000000000000000000000000000000000",
			salt: "0x0000000000000000000000000000000000000000000000000000000000000000",
			conduitKey:
				"0x0000000000000000000000000000000000000000000000000000000000000000",
			startTime: 0,
			endTime: BigNumber.from("0xff00000000000000000000000000"),
		},
		signature:
			"0xc183d83904ed09ee48226f3da769b0f3e72722041f7af6fcc57b781e91b5c25e8a12385960eaa09f8d4b5f7473b34c2dd41e13c5504a00e9a6d938a26d852694",
		numerator: 1,
		denominator: 1,
		extraData: "0x",
	};

	console.dir(order, {depth: null})

	// THIS KEY IS A DEFAULT KEY FROM GANACHE
	const priv_key =
		"0x6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1";
	const endpoint = "http://localhost:8545";
	const bob = "0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0"

	const provider = new ethers.providers.JsonRpcProvider(endpoint);
	let signer = new ethers.Wallet(priv_key);
	signer = signer.connect(provider);

	// // Local deployment
	// const conduitController = "0x79f86fdb626533f6ed19722d7cc3784ed24876dd";
	// const seaport = "0xdf2d0269776aa20c6ab98ed750562144b509151d";
	
	const conduitController = "0x00000000F9490004C11Cef243f5400493c00Ad63";
	const seaport = "0x00000000006c3852cbEf3e08E8dF289169EdE581";

	const SEAPORTABI =
		require("../artifacts/contracts/Seaport.sol/Seaport.json").abi;
	const marketplaceContract = new ethers.Contract(seaport, SEAPORTABI, signer);

	const value = utils.parseEther("1")

	console.log(value)

	const tx = marketplaceContract
	  .connect(signer)
	  .fulfillOrder(order, toKey(0), {
	    value,
	    gasLimit: 200_000,
	  });

	const receipt = await (await tx).wait();
	console.log(tx)

};
main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});