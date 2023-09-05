const { SixDataChainConnector } = require("@sixnetwork/six-data-chain-sdk");
// const fs = require("fs");
const { GasPrice } = require("@cosmjs/stargate/build/fee");

const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// main functoion
// arguments:
// 1. schema file path
// 2. secret file path

export async function createSchema({ schemaPath }) {
  // read text from secret file arghument argv[3]
  // const secret = fs.readFileSync(secretPath, "utf8");
  // console.log(schemaPath)
  console.log("creating schema....");
  const secret = process.env.REACT_APP_SECRET;
  const sixConnector = new SixDataChainConnector();
  let accountSigner;
  sixConnector.rpcUrl = "https://rpc2.fivenet.sixprotocol.net:443";
  // const accountSigner = await sixConnector.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
  accountSigner = await sixConnector.accounts.mnemonicKeyToAccount(secret);
  
  function convertStringToJSON(string) {
    return JSON.parse(string);
  }
  
  const schema = convertStringToJSON(schemaPath);
  console.log(schema);
  

  const address = (await accountSigner.getAccounts())[0].address;
  const rpcClient = await sixConnector.connectRPCClient(accountSigner, {
    gasPrice: GasPrice.fromString("1.25usix"),
  });

  let msgArray = [];

  let encodeBase64Schema = Buffer.from(JSON.stringify(schema)).toString(
    "base64"
  );

  console.log("encoding schema...");
  console.log(encodeBase64Schema);

  // let encodeBase64Schema = Buffer.from(
  //     JSON.stringify(schema)
  // ).toString("base64");
  const msgCreateNFTSchema = {
    creator: address,
    nftSchemaBase64: encodeBase64Schema,
  };

  const msg = await rpcClient.nftmngrModule.msgCreateNFTSchema(
    msgCreateNFTSchema
  );
  console.log("address: " + address);

  msgArray.push(msg);
  console.log(msgArray);

  console.log("still work1");

  const txResponse = await rpcClient.nftmngrModule.signAndBroadcast(msgArray, {
    fee: "auto",
  });
  if (txResponse.code) {
    console.log(txResponse.rawLog);
  }

  console.log("created schema successful");
  console.log(
    `gasUsed: ${txResponse.gasUsed}\ngasWanted:${txResponse.gasWanted}\n`
  );
}

// run main function
// main(
//     {
//         schemaPath: "./concert_ticket/schema.json",
//         secretPath: "./.secret",
//     }
// );

// export function createSchema () {
//     const secret = process.env.REACT_APP_SECRET;
//     console.log(secret)
// }


