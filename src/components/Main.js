import React, { useState, useEffect } from "react";
import Web3 from "web3";
import MyNFT from "../artifacts/contracts/MyNFT.sol/MyNFT.json";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Secp256k1Wallet } from "@cosmjs/amino";
import {
  SigningStargateClient,
  StargateClient,
  GasPrice,
} from "@cosmjs/stargate";
import { SixDataChainConnector } from "@sixnetwork/six-data-chain-sdk";
import { encode } from "uint8-to-base64";
// import { coins } from "@cosmjs/proto-csigning";
import { DirectSecp256k1Wallet, makeSignDoc, makeAuthInfoBytes } from '@cosmjs/proto-signing'
import { toast } from "react-toastify";
import { Button } from "react-bootstrap";
import { getAction } from "../javascript/call_action";
const { v4 } = require("uuid");

function App() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [keplrAccount, setKeplrAccount] = useState(); //6x
  const [keplrAddress, setKeplrAddress] = useState();
  const [message, setMessage] = useState();
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState(null);
  const [memo, setMemo] = useState("");
  const [arrayJson, setArrayJson] = useState([]);
  const [jsonTx, setJsonTx] = useState("");
  const [signature, setSignature] = useState();
  const ref_id = v4();
  const sixConnector = new SixDataChainConnector();
  let accountSigner;
  sixConnector.rpcUrl = "https://rpc2.fivenet.sixprotocol.net:443";

  const dataChainInfo = {
    chainId: process.env.REACT_APP_CHAIN_ID,
    chainName: process.env.REACT_APP_CHAIN_NAME,
    addressPrefix: "6x",
    rpc: process.env.REACT_APP_RPC,
    rest: process.env.REACT_APP_REST_API,
    denom: "usix",
    stakeCurrency: {
      coinDenom: "SIX",
      coinMinimalDenom: "usix",
      coinDecimals: 6,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "6x",
      bech32PrefixAccPub: "6xpub",
      bech32PrefixValAddr: "6xvaloper",
      bech32PrefixValPub: "6xvaloperpub",
      bech32PrefixConsAddr: "6xvalcons",
      bech32PrefixConsPub: "6xvalconspub",
    },
    currencies: [
      {
        coinDenom: "SIX",
        coinMinimalDenom: "usix",
        coinDecimals: 6,
        coinGeckoId: "six-network",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "SIX",
        coinMinimalDenom: "usix",
        coinDecimals: 6,
        coinGeckoId: "six-network",
      },
    ],
    coinType: 118,
    gasPriceStep: {
      low: 1.25,
      average: 1.45,
      high: 1.65,
    },
    features: ["stargate", "cosmwasm", "ibc-transfer", "no-legacy-stdTx"],
  };

  // here

  
  // const signingInstructions = async () => {
  //   const client = await StargateClient.connect(dataChainInfo.rpc);
  //   const accountOnChain = await client.getAccount(keplrAccount);
  //   console.log(accountOnChain);
  //   const msgSend = {
  //     fromAddress: keplrAccount,
  //     toAddress: recipientAddress,
  //     amount: coins(amount, "six"),
  //   };
  //   const msg = {
  //     typeUrl: "/cosmos.bank.v1beta1.MsgSend",
  //     value: msgSend,
  //   };
  //   const gasLimit = 200000;
  //   const fee = {
  //     amount: coins(amount, "six"),
  //     gas: gasLimit.toString(),
  //   };

  //   console.log({
  //     accountNumber: accountOnChain.accountNumber,
  //     sequence: accountOnChain.sequence,
  //     chainId: await client.getChainId(),
  //     msgs: [msg],
  //     fee: fee,
  //     memo: memo,
  //   });

  //   return {
  //     accountNumber: accountOnChain.accountNumber,
  //     sequence: accountOnChain.sequence,
  //     chainId: await client.getChainId(),
  //     msgs: [msg],
  //     fee: fee,
  //     memo: memo,
  //   };
  // };

  const signers = [
  {
    pubkey: 'your_public_key_1',
    sequence: 0, // Replace with the actual sequence number
  },
  {
    pubkey: 'your_public_key_2',
    sequence: 1, 
  },
];


  const handleCreateTransaction = async () => {
    if (keplrAccount) {
      const client = await StargateClient.connect(dataChainInfo.rpc);
      const accountOnChain = await client.getAccount(keplrAccount);
      const accNumber = accountOnChain.accountNumber //accountNumber

      const offlineSigner = window.getOfflineSignerOnlyAmino(
        dataChainInfo.chainId
      );

      // const wallet = new DirectSecp256k1Wallet();
      //   console.log("=offline signer=",offlineSigner)
      // const signedData = await wallet.signDirect(accNumber, makeSignDoc("", makeAuthInfoBytes() , dataChainInfo.chainId, 0));
      
      let msgArray = [];
      const {
        accountNumber = "0",
        sequence = "0",
        chainId = "fivenet",
        msgs = {
          creator: keplrAccount,
          nft_schema_code: "chachak.membership.v0.03",
          tokenId: "1",
          action: "add_point",
          ref_id: `${ref_id}`,
          parameters: [],
        },
        fee = {
          amount: [],
          gas: "0",
        },
        memo = "",
      } = {};
      console.log(accountNumber);
      // const client = await StargateClient.connect(dataChainInfo.rpc);
      console.log("-offlineSigner-", offlineSigner)
      const rpcClient = await sixConnector.connectRPCClient(offlineSigner, {
        gasPrice: GasPrice.fromString("1.25usix"),
      });
      const msg = await rpcClient.nftmngrModule.msgPerformActionByAdmin(msgs);
      console.log("=msg=", msg);
      msgArray.push(msg);
      console.log(msgArray)
      try {
        const txResponse = await rpcClient.nftmngrModule.signAndBroadcast(
          msgArray,
          {
            fee: "auto",
            memo: `${ref_id}`,
          }
        );
        console.log(txResponse);
      } catch (error) {
        console.error(error);
      }

      // offlineSigner.getAccounts().then(async (accounts) => {
      //   const rpcEndpoint = dataChainInfo.rpc;
      //   const signerData = {
      //     accountNumber: accountNumber,
      //     sequence: sequence,
      //     chainId: chainId,
      //   };

      //   SigningStargateClient.connectWithSigner(
      //     rpcEndpoint,
      //     offlineSigner
      //   ).then((client) => {
      //     client
      //       .signAndBroadcast(accounts[0].address, msg, fee, memo, "")
      //       .then(async (signed) => {
      //         console.log("-signed-", signed)
      //         // const bodyBytes = encode(signed.bodyBytes);
      //         // const signatures = encode(signed.signatures[0]);
      //         // const combined = {
      //         //   bodyBytes: bodyBytes,
      //         //   signatures: signatures,
      //         // };
      //         // const dataSigningIns = {
      //         //   sequence: sequence,
      //         //   fee: fee,
      //         //   fromAddress: keplrAccount,
      //         // };
      //         // setArrayJson([...arrayJson, combined]);
      //         // // keplrAddress.signingins(dataSigningIns);
      //         // setJsonTx(combined);
      //         // console.log(combined);
      //         // setSignature(combined.signatures)
      //       });
      //   }).catch((err) => console.log("err",err));
      // });
    } else {
      toast.error("Please Connect to Keplr Wallet");
    }
  };

  //done
  const signatureSixprotocol = async (priv) => {
    try {
      console.log("it's work");
      console.log(priv);
      const wallet2 = priv;
      // console.log(wallet2)
      const sixAccount = await wallet2.getAccounts();
      const sign = await wallet2.signAmino(sixAccount[0].address, {
        chain_id: "fivenet",
        account_number: "0",
        sequence: "0",
        fee: {
          amount: [],
          gas: "0",
        },
        msgs: [
          {
            creator: keplrAccount,
            schemaCode: "chachak.membership.v0.03",
            tokenId: "1",
            actionName: "is_buy",
            ref_id: `${ref_id}`,
            parameters: [],
          },
        ],
        memo: "",
      });
      console.log("test");
      const signerStr = JSON.stringify(sign);
      const signature_six_protocol = Buffer.from(signerStr, "utf8").toString(
        "base64"
      );
      // console.log(signature_six_protocol);
      console.log(priv);
      return {
        signature_six_protocol,
      };
    } catch (err) {
      setMessage(err.message);
    }
  };

  const log = () => {
    console.log(keplrAddress);
  };

  const initializeWeb3 = async () => {
    try {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        await connectToWallet();
      } else {
        console.error("No wallet detected.");
      }
    } catch (error) {
      console.error("Error initializing Web3:", error);
    }
  };

  const connectToWallet = async () => {
    try {
      await window.ethereum.enable(); // Request access to accounts
      const accounts = await web3.eth.getAccounts();
      setAccounts(accounts);
    } catch (error) {
      console.error("Error connecting to wallet:", error);
    }
  };

  const handleClick = async () => {
    if (!web3) {
      console.error("Web3 is not initialized yet.");
      return;
    }

    try {
      if (accounts.length === 0) {
        console.error("No connected accounts.");
        return;
      }

      const sender = accounts[0]; // Use the connected account

      const contractAddress = "0xD0CA8572F6729Ad0CFB7D9820e3522eFE74aC611";
      const contract = new web3.eth.Contract(MyNFT.abi, contractAddress);

      const result = await contract.methods
        .safeMint(sender)
        .send({ from: sender });

      console.log("Transaction Hash:", result.transactionHash);
      console.log("Transaction Receipt:", result);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const connectKeplr = async () => {
    try {
      if (!window.getOfflineSignerOnlyAmino || !window.keplr) {
        const error = "Please install keplr extension";
        window.alert(error);
      } else {
        if (window.keplr.experimentalSuggestChain) {
          try {
            await window.keplr.experimentalSuggestChain(dataChainInfo);
          } catch (error) {
            const chainError = "Failed to suggest the chain";
            window.alert(chainError);
          }
        } else {
          const versionError =
            "Please use the recent version of keplr extension";
          window.alert(versionError);
        }
      }

      if (window.keplr) {
        await window.keplr.enable(dataChainInfo.chainId);

        const offlineSigner = window.getOfflineSignerOnlyAmino(
          dataChainInfo.chainId
        );
        const wasmChainClient = await SigningCosmWasmClient.connectWithSigner(
          dataChainInfo.rpc,
          offlineSigner
        );

        const [account] = await offlineSigner.getAccounts();

        const balance = await wasmChainClient.getBalance(
          account.address,
          dataChainInfo.denom
        );
        // const convert =
        //   Number(balance.amount) /
        //   10 ** dataChainInfo.stakeCurrency.coinDecimals;

        // This part seems related to props. Make sure props are properly passed.
        // props.setBalance(convert);
        // props.connect(true);
        // const fee = {
        //   gas: "200000",
        // };

        // const signAndBroadcast = await wasmChainClient.signAndBroadcast(
        //   account.address,
        //   fee
        // );
        setKeplrAddress(account);
        setKeplrAccount(account.address);
        console.log(account.address);
        console.log(balance);
        // console.log(signAndBroadcast)
        // const test = await SigningCosmWasmClient.signAndBroadcast(account.address);
        // console.log(test);
        // console.log(wasmChainClient);
      } else {
        return null;
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    initializeWeb3();
  }, []);

  useEffect(() => {
    console.log(signature);
    console.log(keplrAccount);
  }, [jsonTx]);

  return (
    <div>
      <div>
        {accounts.length > 0 ? (
          <p>Connected Account: {accounts[0]}</p>
        ) : (
          <button onClick={connectToWallet}>Connect Wallet</button>
        )}
      </div>
      <div>
        <button onClick={handleClick} disabled={accounts.length === 0}>
          Mint NFT
        </button>
      </div>
      <div>
        {keplrAccount && keplrAccount.length > 0 ? (
          <p>Connected Account: {keplrAccount}</p>
        ) : (
          <button onClick={connectKeplr}>Connect keplr</button>
        )}
      </div>
      <div>
        <button onClick={() => signatureSixprotocol(keplrAccount)}>log</button>
      </div>
      <div>
        <button onClick={log}>log acc</button>
      </div>
      <button onClick={handleCreateTransaction}>sign</button>
      <div className="mb-2">
        <Button
          onClick={() =>
            getAction({
              schemaCode: "chachak.membership.v0.03",
              tokenId: "1",
              actionName: "is_buy",
              keplrAddress: keplrAccount,
              signature: signature,
            })
          }
          variant="success"
          disabled={!keplrAccount}
          className="me-2"
        >
          buy
        </Button>
        <Button
          onClick={() =>
            getAction({
              schemaCode: "chachak.membership.v0.03",
              tokenId: "1",
              actionName: "add_point",
              // keplrAddress: keplrAccount,
            })
          }
          variant="success"
          disabled={!keplrAccount}
          className="me-2"
        >
          add point
        </Button>
        <Button
          onClick={() =>
            getAction({
              schemaCode: "chachak.membership.v0.03",
              tokenId: "1",
              actionName: "use_point_to_get_free_drink",
            })
          }
          variant="success"
          disabled={!keplrAccount}
          className="me-2"
        >
          Use 10 points to get 1 free drink!
        </Button>
        <Button
          onClick={() =>
            getAction({
              schemaCode: "chachak.membership.v0.03",
              tokenId: "1",
              actionName: "is_get_free_drink",
            })
          }
          variant="success"
          disabled={!keplrAccount}
          className="me-2"
        >
          Get free drink!
        </Button>
      </div>
    </div>
  );
}

export default App;
