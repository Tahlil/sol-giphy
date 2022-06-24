import React, {useEffect} from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import { log } from 'util';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const checkIfWalletIsConnected = async () =>{
    try {
      const {solana} = window;
      if(solana.isPhantom){
        console.log("Phantom wallet found.");
        const response = await solana.connect({
          onlyIfTrusted: true
        });
        console.log("Connected to pubic key:", response.publicKey.toString());
      }
      else{
        console.log("Phantom wallet not found");
      }
    } catch (error) {
      console.error(error);
    }
  }
   useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    }
    window.addEventListener('load', onload);
    return  () => window.removeEventListener('load', onLoad)
  }, {})
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header">🖼 GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
          </p>
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
