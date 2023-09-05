const { SixDataChainConnector } = require("@sixnetwork/six-data-chain-sdk");
// const fs = require("fs");
const { GasPrice } = require("@cosmjs/stargate/build/fee");
const { v4 } = require("uuid");
const dotenv = require("dotenv");
dotenv.config();
// main functoion

export async function getAction({ schemaCode, tokenId, actionName, keplrAddress, signature }) {
  // read text from secret file arghument argv[3]
  // const secret = fs.readFileSync(secretPath, "utf8");
  console.log("using action...")
  console.log("action name = "+actionName)
  console.log("signature="+signature)
  const secret = process.env.REACT_APP_SECRET;
  const sixConnector = new SixDataChainConnector();
  let accountSigner;
  sixConnector.rpcUrl = "https://rpc2.fivenet.sixprotocol.net:443";
  // const accountSigner = await sixConnector.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
  accountSigner = await sixConnector.accounts.mnemonicKeyToAccount(secret);

  const address = (await accountSigner.getAccounts())[0].address;
  const rpcClient = await sixConnector.connectRPCClient(accountSigner, {
    gasPrice: GasPrice.fromString("1.25usix"),
  });

  console.log("-accountSigner-",accountSigner)

  let msgArray = [];
  const ref_id = v4();
  const action = {
    creator: address,
    nft_schema_code: schemaCode,
    tokenId: tokenId,
    action: actionName,
    ref_id: `${ref_id}`,
    parameters: [],
  };
  const msg = await rpcClient.nftmngrModule.msgPerformActionByAdmin(action);
  msgArray.push(msg);
  // console.log(msgArray)
  // console.log(msg)
  // const txResponse = await rpcClient.nftmngrModule.signAndBroadcast(msgArray, {
  //   fee: "auto",
  //   memo: `${ref_id}`,
  // });
  // console.log(txResponse);
}

// function actionIsBuy(){
//     const test = process.env.REACT_APP_TEST

//     console.log(test)

// }
