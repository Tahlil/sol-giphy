import React, {useEffect, useState} from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';
import { Buffer } from 'buffer';
import twitterLogo from './assets/twitter-logo.svg';
import idl from './idl.json';
import './App.css';
import kp from './keypair.json';

window.Buffer = Buffer;
const {SystemProgram, Keypair} = web3;
const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = web3.Keypair.fromSecretKey(secret);

const programID = new PublicKey(idl.metadata.address);
const network = clusterApiUrl("devnet");

const opts = {
  preflightCommitment: "processed"
}



// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const TEST_GIPHS = [
  "https://media0.giphy.com/media/fSvqyvXn1M3btN8sDh/giphy.gif?cid=790b76119f81d3107a70341edf8996d711bcc376bd1dc86a&rid=giphy.gif&ct=g",
  "https://media1.giphy.com/media/AGPBj8UmV5YyI/giphy.gif?cid=ecf05e47wr158rzu6gcwxxasd17xoduuhu5fynsqhlwef3m5&rid=giphy.gif&ct=g",
  "https://media4.giphy.com/media/8UGGp7rQvfhe63HrFq/giphy.gif?cid=ecf05e47q1yh9i6p06p4l435vjqhbqvesjua12aatymzo9bw&rid=giphy.gif&ct=g"
]

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState(null);
  const [gifList, setGifList] = useState(null);
  const checkIfWalletIsConnected = async () =>{
    try {
      const {solana} = window;
      if(solana.isPhantom){
        console.log("Phantom wallet found.");
        const response = await solana.connect({
          onlyIfTrusted: true
        });
        console.log("Connected to pubic key:", response.publicKey.toString());
        setWalletAddress(response.publicKey.toString());
      }
      else{
        console.log("Phantom wallet not found");
      }
    } catch (error) {
      console.error(error);
    }
  }

  const connectWallet = async () => {
    const {solana} = window;
    if(solana) {
      const response = await solana.connect();
      console.log("Connected to pubic key:", response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  }

  const renderNotConnectedContainer = () => (
    <button
       className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
   
      Connect to Wallet
    </button>
  );

  const sendGIF = async() => {
    if(inputValue.length > 0){
     
      try{
        const provider = getProvider();
        const program = new Program(idl, programID, provider);
        await program.rpc.addGif(inputValue, {
           accounts: {
            baseAccount: baseAccount.publicKey,
            user: provider.wallet.publicKey
          }
        });
        console.log("Added new gif", inputValue);
        await getGifList();
        setInputValue("");
      }catch(err){
        console.error(err);
      }
    }
    else{
      console.log("Empty Input");
    }
  }
  
  const onInputChange = (event) => {
    const {value} = event.target;
    
    console.log(value);
    setInputValue(value);
  }

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(connection, window.solana, opts.preflightCommitment);
    return provider;
  }

  const createGifAccount = async() => {
    try{
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId
        },
        signers: [baseAccount]
      })
      console.log("Created a new base account: w/ address ", baseAccount.publicKey.toString());
      await getGifList();
    }
    catch(err){
      console.error("Error creating base account",err);
    }
  }
  
  const renderConnectedContainer = () => {
    console.log("GifList");
    console.log(gifList);
    if (gifList === null) {
        return <div className="connected-container">
         <button className="cta-button submit-gif-button" onClick={createGifAccount}>Do one time account creation</button>
        </div>
    }
    else{
    return (
      <div className="connected-container">
        <form 
        onSubmit={event => {
          event.preventDefault();
          sendGIF();
        }}  
        >
        <input type="text" placeholder="Enter GIF link" value={inputValue} onChange={onInputChange}/>
        <button type="submit" className="cta-button submit-gif-button">Submit</button>
        </form>
      <div className="gif-grid">
        {gifList.map((item,index) => (
        <div className="git-time" key={index}>
          <img alt="gif" src={item.gifLink} />
        </div>
        ))}
      </div>
      </div>
    );
    }
  }
   useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    }
    window.addEventListener('load', onload);
    return  () => window.removeEventListener('load', onLoad)
  }, {});

  const getGifList = async() => {
    try{
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
      console.log("Account:", account);
      setGifList(account.gifList);
    }
    catch(err){
      console.error(err);
    }
  }
  
  useEffect(() => {
    if(walletAddress){
      console.log("Fetching GIF List:");
      getGifList()
    }
  }, [walletAddress]);
  return (
    <div className="App">
      <div className={walletAddress ? "authed-container" : "container"}>
        <div className="header-container">
          <p className="header">🖼 GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
          </p>
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && renderConnectedContainer()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
