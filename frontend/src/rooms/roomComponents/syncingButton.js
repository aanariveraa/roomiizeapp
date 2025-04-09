// SyncButton.js
import React from "react";
import Lottie from "lottie-react";
//import syncingAnimation from "../../public/icons/syncingAnimation.json"; 
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const SyncButton = ({ isSyncing, onClick }) => {
  return (
    <button onClick={onClick} className="control-button">
      {isSyncing ? (
        <Lottie 
          path="/icons/syncingAnimation.json"
          loop
          autoplay
          style={{ width: 32, height: 32 }}
        />
      ) : (
        <>
          <img src="/icons/saved.svg" alt="Save"/>
          
        </>
      )}
    </button>
  );
};

export default SyncButton;
