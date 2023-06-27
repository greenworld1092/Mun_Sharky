
import { useMemo } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

import { Box } from '@mui/material';

import DialogProvider from "./Providers/dialogProvider";
import { SnackbarProvider } from 'notistack';

import Home from './Pages/Home';
import Mint from "./Pages/Mint";
import Profile from "./Pages/Profile";
import Lend from "./Pages/Lend";
import Borrow from "./Pages/Borrow";
import Admin from "./Pages/Admin";

 import { clusterApiUrl } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
    GlowWalletAdapter,
    LedgerWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter,
    //SolletExtensionWalletAdapter,
    SolletWalletAdapter,
    TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';


require('@solana/wallet-adapter-react-ui/styles.css');

export default function App() {
  const solNetwork = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(solNetwork), [solNetwork]);
  // initialise all the wallets you want to use
  const wallets = useMemo(
    () => [
        new PhantomWalletAdapter(),
        new GlowWalletAdapter(),
        new SlopeWalletAdapter(),
        new SolflareWalletAdapter({ solNetwork }),
        new TorusWalletAdapter(),
        new LedgerWalletAdapter(),
        new SolletWalletAdapter(),
    ],
    [solNetwork]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <SnackbarProvider maxSnack={3}>
            <DialogProvider>
              <HashRouter>
                <Box className="min-h-screen" onContextMenu={(e) => e.preventDefault()}
                  sx={{background: "linear-gradient(225.43deg, #5C6AE1 -191.21%, rgba(92, 106, 225, 0) 68.75%), #0B0E27;"}}>
                  <Routes>
                    <Route path="home" exact element={<Home />} />
                    <Route path="mint" exact element={<Mint />} />
                    <Route path="my-profile" exact element={<Profile />} />
                    <Route path="lend" exact element={<Lend />} />
                    <Route path="borrow" exact element={<Borrow />} />
                    <Route path="admin" exact element={<Admin />} />

                    <Route path="/" element={<Navigate to="/home" />} />
                  </Routes>
                </Box>
              </HashRouter>
            </DialogProvider>
          </SnackbarProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}