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

import {
	getItemETH,
	convertSignatureToEIP2098,
	getOfferOrConsiderationItem,
	toHex,
	toBN,
} from "../test/utils/encoding";
import { marketplaceFixture } from "../test/utils/fixtures/marketplace";

const hexRegex = /[A-Fa-fx]/g;

const main = async () => {
	// THIS KEY IS A DEFAULT KEY FROM GANACHE
	const priv_key =
		"0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d";
	const endpoint = "http://localhost:8545";

	const provider = new ethers.providers.JsonRpcProvider(endpoint);
	let signer = new ethers.Wallet(priv_key);
	signer = signer.connect(provider);
	const alice = "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1";

	// // Local deployment
	// const conduitController = "0x79f86fdb626533f6ed19722d7cc3784ed24876dd";
	// const seaport = "0xdf2d0269776aa20c6ab98ed750562144b509151d";

	const conduitController = "0x00000000F9490004C11Cef243f5400493c00Ad63";
	const seaport = "0x00000000006c3852cbEf3e08E8dF289169EdE581";

	// get NFT
	{
		const BAYC_ADDRESS = "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d";
		const baycWhale = "0x8ad272ac86c6c88683d9a60eb8ed57e6c304bb0c";
		const ERC721ABI = require("./ERC721ABI.json");
		const signer = provider.getSigner(baycWhale);
		const BAYC = new ethers.Contract(BAYC_ADDRESS, ERC721ABI, signer);
		await BAYC.transferFrom(baycWhale, alice, 5977);
		let bal = await BAYC.balanceOf(alice);
		console.log(bal);
	}

	const BAYC_ADDRESS = "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d";
	const ERC721ABI = require("./ERC721ABI.json");
	const BAYC = new ethers.Contract(BAYC_ADDRESS, ERC721ABI, signer);
	await BAYC.connect(signer).setApprovalForAll(seaport, true)

	let token = "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d";
	let identifierOrCriteria = toBN(5977)
	let startAmount = toBN(1)
	let endAmount = toBN(1)
	let offer: OfferItem[] = [
		getOfferOrConsiderationItem(
			2,
			token,
			identifierOrCriteria,
			startAmount,
			endAmount,
			// recipient
		),
	];

	const consideration = [
		getItemETH(utils.parseEther("1"), utils.parseEther("1"), alice),
	];

	const SEAPORTABI =
		require("../artifacts/contracts/Seaport.sol/Seaport.json").abi;
	const marketplaceContract = new ethers.Contract(seaport, SEAPORTABI, signer);
	const counter = await marketplaceContract.getCounter(alice);

	const salt = constants.HashZero;
	const startTime = 0;
	const endTime = toBN("0xff00000000000000000000000000");

	const orderParameters = {
		offerer: alice, // offerer.address,
		zone: constants.AddressZero,
		offer: offer,
		consideration,
		totalOriginalConsiderationItems: consideration.length,
		orderType: 0, // FULL_OPEN
		zoneHash: constants.HashZero,
		salt,
		conduitKey: constants.HashZero,
		startTime,
		endTime,
	};

	const orderComponents = {
		...orderParameters,
		counter,
	};

	// Required for EIP712 signing
	const domainData = {
		name: "Seaport",
		version: "1.1",
		chainId: 522,
		verifyingContract: marketplaceContract.address,
	};

	const { orderType } = require("../eip-712-types/order");

	const signature = await signer._signTypedData(
		domainData,
		orderType,
		orderComponents
	);

	const order = {
		parameters: orderParameters,
		signature: convertSignatureToEIP2098(signature),
		numerator: 1, // only used for advanced orders
		denominator: 1, // only used for advanced orders
		extraData: "0x", // only used for advanced orders
	};

	console.dir(order, { depth: null });
};

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});