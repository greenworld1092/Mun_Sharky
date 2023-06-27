import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as ipfsClient from "ipfs-http-client";
import * as anchor from "@project-serum/anchor";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Program } from "@project-serum/anchor";
import { ASSOCIATED_PROGRAM_ID } from '@project-serum/anchor/dist/cjs/utils/token';
import * as bs58 from "bs58";
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  guestIdentity,
  walletAdapterIdentity,
  toBigNumber,
  mockStorage,
  toDateTime,
  getSignerHistogram,
  sol,
  candyMachineModule
} from "@metaplex-foundation/js";

import {
  TOKEN_PROGRAM_ID,
  NATIVE_MINT,
} from "@solana/spl-token";

import IDL from '../../Utility/Idl/idl.json';

import { deriveSCAccountPDA, deriveConfigurationAccountPDA, derivePoolAccountPDA, deriveNFTAccountPDA, deriveOrderAccountPDA } from '../../Utility/ts/helper';

import MintMunNft from '../../Utility/Idl/idl.json';
import { LAMPORTS_PER_SOL, PublicKey, Keypair, Connection, clusterApiUrl } from "@solana/web3.js";
import { useAnchorWallet } from "@solana/wallet-adapter-react";

import { useState, useEffect, useContext } from "react";
import { Box } from "@mui/material";

import { LandingCaptionText, MintHeaderText, SolanaItem, LandingHeaderText, MintPriceText, MintPriceValue, MintTotalValue, ShareItemHeader, MUNInput, AmountButton, ColorButton } from "../../Components";
import Container from "../Container";
import Teaser from '../../Assets/videos/Teaser.mp4';

import DialogContext from "../../Contexts/dialogContext";
import { Metadata, MetadataProgram } from '@metaplex-foundation/mpl-token-metadata';

const MAX_NAME_LENGTH = 32;
const MAX_URI_LENGTH = 200;
const MAX_SYMBOL_LENGTH = 10;
const MAX_CREATOR_LEN = 32 + 1 + 1;

const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

const MUN_PROGRAM_ID = new anchor.web3.PublicKey(
    "Cdk2qqpHx4YMtsqiCwwLJpnWQARc4kJQofY1hduvRiiX"
);

//candy machine id : 9i9e1h2H8cNm3qDkeAqjzkANDc4yDWmqSWVDPqg44swn
//private key : 4FrHtgpbWMjwgpG61pQT3EsSdJDNso3gj1coWSkf94hTNcxF4yqFQUbYhXgqsqdTG2HpcbpRj41EHsY3sCrycbj2
const NFT_SYMBOL = "mun-nft";

async function delay(delayMs) {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
}

export default function Mint() {
    const diagCtx = useContext(DialogContext);
    const [amount, setAmount] = useState("1");
    const [price, setPrice] = useState(0.5);
    const [mintedCount, setMintedCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    // const wallet = useAnchorWallet();

    useEffect(() => {
        if (amount === "")
            setAmount(0)
        else{
            setAmount(parseInt(amount));
            if(parseInt(amount) > 5)
              setAmount(5);
        }
    }, [amount])
    
    useEffect(() => {
        window.scrollTo(0, 0);
        diagCtx.showLoading("Initializing...")
        setTimeout(() => initialize(), 500);
    }, []);

    const initialize = async () => {
      const connection = new Connection(clusterApiUrl('devnet'));
      const metaplex = new Metaplex(connection)
      .use(walletAdapterIdentity(wallet))
      .use(bundlrStorage());

      const candyMachine = await metaplex
        .candyMachines()
        .findByAddress({ address: new PublicKey("87pqxjxmmktffuKyv9NA5k6XUmkmFbWavZDCwc7X3hmz") });
 

        setMintedCount(candyMachine.itemsMinted.toString(10));
        setTotalCount(candyMachine.itemsAvailable.toString(10));
        setPrice(candyMachine.candyGuard.guards.solPayment.amount.basisPoints / LAMPORTS_PER_SOL);
//        console.log(candyMachine.itemsMinted.toString(10), candyMachine.itemsAvailable.toString(10));
        diagCtx.hideLoading();
    }

    const handlePlus = () => {
      const intAmount = parseInt(amount);
      setAmount(intAmount < 5 ? intAmount + 1 : 0);
    }

    const handleMinus = () => {
        const intAmount = parseInt(amount);
        setAmount(intAmount > 0 ? intAmount - 1 : 0);
    }

//    const { connection } = useConnection();
    const wallet = useWallet();
    const walletModal = useWalletModal();

    const fetchHashTable = async () => {
      if (!wallet.connected) {
        diagCtx.showError("You're not connected to wallet.");
        walletModal.setVisible(true);
        return;
      }

      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      const metaplex = new Metaplex(connection)
      .use(walletAdapterIdentity(wallet))
      .use(bundlrStorage());

      const creator = new PublicKey(
        "9Ys7aYTMaPeUJZSwpEhbSHoh9RqTcVdLvvEaD6tjSrB3"
      );
      
      diagCtx.showLoading(`Getting minted NFTs ...`);
      const nfts = await metaplex.nfts().findAllByCreator({ creator });
//      const nft = await metaplex.nfts().findByMint({mintAddress});
      diagCtx.showLoading(`Updating minted NFTs ...`);
//      console.log(nfts);
      
      const txs = [];
      const nameArray = ["MunBasic", "Icy", "SubZero", "FreeEnergy", "Golden", "BloodMun", "RoseGold", "White", "Pearl", "BlackOnyx", "BlackDiamond", "RoyalDiamond", "RoyalCrown"];

      /* txs.push(
        await metaplex.nfts().builders().update({
          name : "UpdatedName",
          nftOrSft : nft,
          },{commitment:'finalized'})
      ); */
      try{
        for (let i = 0; i < nfts.length; i++ ) { // Add 3 NFTs (the size of our collection)
          diagCtx.showLoading(`Updating minted NFTs ${(i+1)} / ${nfts.length}`);
          if(nfts[i].uri.includes("mun") === true)
            continue;
          var a = nfts[i].uri.charAt(nfts[i].uri.length - 2);
          var b = nfts[i].uri.charAt(nfts[i].uri.length - 1);
          if(a >= '0' && a <= '9') a -= '0';
          else  a = 0;
          b -= '0';
          var c = a * 10 + b;

          console.log(nameArray[c], `https://gateway.pinata.cloud/ipfs/QmNf9vheAtedTcpY9xnKa25eWaUfH7ajpuFsBjfieFdPkB/mun${c}`);

          const mintAddress = new PublicKey(
            nfts[i].mintAddress
          )
          const nft = await metaplex.nfts().findByMint({mintAddress})
          txs.push(
            await metaplex.nfts().builders().update({
              name : nameArray[c],
              nftOrSft : nft,
              uri : `https://gateway.pinata.cloud/ipfs/QmNf9vheAtedTcpY9xnKa25eWaUfH7ajpuFsBjfieFdPkB/mun${c}`
              },{commitment:'finalized'})
          );
        }
      } catch(e){
        diagCtx.showError(e.message);
        diagCtx.hideLoading();
        return;
      }
/*       const { response } = await metaplex.candyMachines().insertItems({
          candyMachine,
          items: items,
        },{commitment:'finalized'}); */

      try{
        const block = await metaplex.connection.getLatestBlockhash();
        const txns = txs.map((builder) => {
          const builderTx = builder.setFeePayer(metaplex.identity());
  
          const dropSigners = [metaplex.identity(), ...builderTx.getSigners()];
          const { keypairs } = getSignerHistogram(dropSigners);
          const tx = builderTx.toTransaction({
            blockhash: block.blockhash,
            lastValidBlockHeight: block.lastValidBlockHeight,
          });
  
          if (keypairs.length > 0) {
            tx.partialSign(...keypairs);
          }
          return tx;
        });
  
        // make the connected wallet sign all transactions
        const signedTx = await metaplex.identity().signAllTransactions(txns);
  
        // send the signed transactions in batches
        const batchSize = 200; // sends 200 raw tx in parallel
        const batches = [];
        for (let i = 0; i < signedTx.length; i += batchSize) {
          batches.push(signedTx.slice(i, i + batchSize));
        }
        let signatures = [];
        for (const txs of batches) {
          const signature = await Promise.all(
            txs.map((tx) => metaplex.connection.sendRawTransaction(tx.serialize())),
          );
          signatures.push(signature);
        }
  
        // wait for confirmations in parallel batches
        let confirmations = [];
        for (let i = 0; i < signatures.length; i += 1) {
          await delay(1000); // add delay to avoid rate limiting
          const sigs = signatures[i];
          const confirmationBatch = await Promise.all(
            sigs.map((sig) => {
              return metaplex.rpc().confirmTransaction(sig, {
                blockhash: block.blockhash,
                lastValidBlockHeight: block.lastValidBlockHeight,
              });
            }),
          );
          confirmations.push(...confirmationBatch);
        }
  
        if (confirmations.length === 0) {
          diagCtx.showError("Transaction failed");
          diagCtx.hideLoading();
          throw new Error("Transaction failed");
        }

        signatures.flatMap((sig) => sig).map((signature) => ({ signature }));
      } catch(e){
        diagCtx.showError("Transaction Failed");
        diagCtx.hideLoading();
        return;
      }
  
        diagCtx.showSuccess("Update Success!");
        diagCtx.hideLoading();
        

//      metaplex.nfts().findAllByUpdateAuthority
    }

    const updateNFT = async () => {
      if (!wallet.connected) {
        diagCtx.showError("You're not connected to wallet.");
        walletModal.setVisible(true);
        return;
      }

      if(amount === 0 || amount === ""){
          diagCtx.showError("Choose amount must be greater than 0.");
          return;
      }
      diagCtx.showLoading(`Updating minted NFTs ...`);

      const connection = new Connection(clusterApiUrl('devnet'));
      const metaplex = new Metaplex(connection)
      .use(walletAdapterIdentity(wallet))
      .use(bundlrStorage());

      let candyMachine;
      try {
        candyMachine = await metaplex
          .candyMachines()
          .findByAddress({ address: new PublicKey("87pqxjxmmktffuKyv9NA5k6XUmkmFbWavZDCwc7X3hmz") });
  
          console.log(candyMachine.itemsMinted.toString(10), candyMachine.itemsAvailable.toString(10));
      } catch(e){
        diagCtx.showError(e.message);
        diagCtx.hideLoading();
        return;
      }
      
      const txs = [];
      const nameArray = ["MunBasic", "Icy", "SubZero", "FreeEnergy", "Golden", "BloodMun", "RoseGold", "White", "Pearl", "BlackOnyx", "BlackDiamond", "RoyalDiamond", "RoyalCrown"];

      for (let i = 0; i < 15; i ++){
        console.log(candyMachine.items[i]);
      }
      for (let i = 0; i < 15; i++ ) { // Add 3 NFTs (the size of our collection)
        const items = [];
        if(candyMachine.items[i].minted === true){
          var a = candyMachine.items[i].uri.charAt(candyMachine.items[i].uri.length - 2);
          var b = candyMachine.items[i].uri.charAt(candyMachine.items[i].uri.length - 1);
          if(a >= '0' && a <= '9') a -= '0';
          else  a = 0;
          b -= '0';
          var c = a * 10 + b;
          console.log(candyMachine.items[i].uri, a, b, c);
          items.push({
              name: nameArray[c],
              uri: `https://gateway.pinata.cloud/ipfs/QmNf9vheAtedTcpY9xnKa25eWaUfH7ajpuFsBjfieFdPkB/mun${c}`
          })

          
          txs.push(
            await metaplex.candyMachines().builders().insertItems({
              candyMachine,
              index : i,
              items: items,
              },{commitment:'finalized'})
          );
        }
      }
/*       const { response } = await metaplex.candyMachines().insertItems({
          candyMachine,
          items: items,
        },{commitment:'finalized'}); */

        const block = await metaplex.connection.getLatestBlockhash();
          const txns = txs.map((builder) => {
            const builderTx = builder.setFeePayer(metaplex.identity());
    
            const dropSigners = [metaplex.identity(), ...builderTx.getSigners()];
            const { keypairs } = getSignerHistogram(dropSigners);
            const tx = builderTx.toTransaction({
              blockhash: block.blockhash,
              lastValidBlockHeight: block.lastValidBlockHeight,
            });
    
            if (keypairs.length > 0) {
              tx.partialSign(...keypairs);
            }
            return tx;
          });
    
          // make the connected wallet sign all transactions
          const signedTx = await metaplex.identity().signAllTransactions(txns);
    
          // send the signed transactions in batches
          const batchSize = 200; // sends 200 raw tx in parallel
          const batches = [];
          for (let i = 0; i < signedTx.length; i += batchSize) {
            batches.push(signedTx.slice(i, i + batchSize));
          }
          let signatures = [];
          for (const txs of batches) {
            const signature = await Promise.all(
              txs.map((tx) => metaplex.connection.sendRawTransaction(tx.serialize())),
            );
            signatures.push(signature);
          }
    
          // wait for confirmations in parallel batches
          let confirmations = [];
          for (let i = 0; i < signatures.length; i += 1) {
            await delay(1000); // add delay to avoid rate limiting
            const sigs = signatures[i];
            const confirmationBatch = await Promise.all(
              sigs.map((sig) => {
                return metaplex.rpc().confirmTransaction(sig, {
                  blockhash: block.blockhash,
                  lastValidBlockHeight: block.lastValidBlockHeight,
                });
              }),
            );
            confirmations.push(...confirmationBatch);
          }
    
          if (confirmations.length === 0) {
            throw new Error("Transaction failed");
          }
    
          diagCtx.showSuccess("Update Success!");
          diagCtx.hideLoading();
          return signatures.flatMap((sig) => sig).map((signature) => ({ signature }));
//      candyMachine.items[0].name; // "My NFT #1"
       
      /* const mintAddress = new PublicKey(
        "BSNDYYrzhsGr6zgqsQxHKmiWGfkTzAeCNzYy19i4GqCf"
      );
    
      const nft = await metaplex.nfts().findByMint({ mintAddress });

      const txs = [];
      await metaplex
      .nfts()
      .update({
        nftOrSft: nft,
        name: "My Updated Name111 "
      });
      
      console.log("nft updated"); */
    }
    const createCandyMachine = async () => {
      const connection = new Connection(clusterApiUrl('devnet'));
      const metaplex = new Metaplex(connection)
      .use(walletAdapterIdentity(wallet))
      .use(bundlrStorage());

      const { nft: collectionNft } = await metaplex.nfts().create({
        name: "MUN-PASS",
        symbol : "MUN-PASS",
        uri: "https://gateway.pinata.cloud/ipfs/QmecHc52z16uQBEfEgz9btWV9Zpz4uhWVTiniHZfj3AKnp/teaser0",
        sellerFeeBasisPoints: 0,
        isCollection: true,
        updateAuthority: wallet,
      }, { commitment: "finalized" });

      console.log(`✅ - Minted Collection NFT: ${collectionNft.address.toString()}`);
      console.log(`     https://explorer.solana.com/address/${collectionNft.address.toString()}?cluster=devnet`);

      const candyMachineSettings =
        {
            itemsAvailable: toBigNumber(15), // Collection Size: 3
            sellerFeeBasisPoints: 1000, // 10% Royalties on Collection
            symbol: "MUN-PASS",
            maxEditionSupply: toBigNumber(0), // 0 reproductions of each NFT allowed
            isMutable: true,
            creators: [
                { address: wallet.publicKey, share: 100 },
            ],
            collection: {
                address: new PublicKey(collectionNft.address), // Can replace with your own NFT or upload a new one
                updateAuthority: metaplex.identity(),
            },
            guards: {
              botTax: { lamports: sol(0.001), lastInstruction: false },
              solPayment: {
                amount: sol(0.05),
                destination: metaplex.identity().publicKey,
              },
              startDate: { date: toDateTime("2022-10-18T16:00:00Z") },
              mintLimit: {
                id: 1,
                limit: 5,
              },
            },
        };

      const { candyMachine } = await metaplex.candyMachines().create(candyMachineSettings, { commitment: "finalized" });


      console.log(`✅ - Created Candy Machine: ${candyMachine.address.toString()}`);
      console.log(`     https://explorer.solana.com/address/${candyMachine.address.toString()}?cluster=devnet`);


      const txs = [];
      for (let i = 0; i < 3; i++ ) { // Add 3 NFTs (the size of our collection)
        const items = [];
        for(let j = 0; j < 5; j++){
          items.push({
              name: `Teaser`,
              uri: `https://gateway.pinata.cloud/ipfs/QmecHc52z16uQBEfEgz9btWV9Zpz4uhWVTiniHZfj3AKnp/teaser${(i * 5 + j)%13}`
          })
        }
        txs.push(
          await metaplex.candyMachines().builders().insertItems({
            candyMachine,
            index : i * 5,
            items: items,
            },{commitment:'finalized'})
        );
      }
/*       const { response } = await metaplex.candyMachines().insertItems({
          candyMachine,
          items: items,
        },{commitment:'finalized'}); */

        const block = await metaplex.connection.getLatestBlockhash();
          const txns = txs.map((builder) => {
            const builderTx = builder.setFeePayer(metaplex.identity());
    
            const dropSigners = [metaplex.identity(), ...builderTx.getSigners()];
            const { keypairs } = getSignerHistogram(dropSigners);
            const tx = builderTx.toTransaction({
              blockhash: block.blockhash,
              lastValidBlockHeight: block.lastValidBlockHeight,
            });
    
            if (keypairs.length > 0) {
              tx.partialSign(...keypairs);
            }
            return tx;
          });
    
          // make the connected wallet sign all transactions
          const signedTx = await metaplex.identity().signAllTransactions(txns);
    
          // send the signed transactions in batches
          const batchSize = 200; // sends 200 raw tx in parallel
          const batches = [];
          for (let i = 0; i < signedTx.length; i += batchSize) {
            batches.push(signedTx.slice(i, i + batchSize));
          }
          let signatures = [];
          for (const txs of batches) {
            const signature = await Promise.all(
              txs.map((tx) => metaplex.connection.sendRawTransaction(tx.serialize())),
            );
            signatures.push(signature);
          }
    
          // wait for confirmations in parallel batches
          let confirmations = [];
          for (let i = 0; i < signatures.length; i += 1) {
            await delay(1000); // add delay to avoid rate limiting
            const sigs = signatures[i];
            const confirmationBatch = await Promise.all(
              sigs.map((sig) => {
                return metaplex.rpc().confirmTransaction(sig, {
                  blockhash: block.blockhash,
                  lastValidBlockHeight: block.lastValidBlockHeight,
                });
              }),
            );
            confirmations.push(...confirmationBatch);
          }
    
          if (confirmations.length === 0) {
            throw new Error("Transaction failed");
          }
    
          console.log(`✅ - Items added to Candy Machine: ${candyMachine.address.toString()}`);
          return signatures.flatMap((sig) => sig).map((signature) => ({ signature }));
    }
  
    const insertItemAndMint = async () => {
      if (!wallet.connected) {
        diagCtx.showError("You're not connected to wallet.");
        walletModal.setVisible(true);
        return;
      }

      if(amount === 0 || amount === ""){
          diagCtx.showError("Choose amount must be greater than 0.");
          return;
      }
      diagCtx.showLoading(`Minting ${amount} NFTs to your wallet...`);

      const connection = new Connection(clusterApiUrl('devnet'));
      const metaplex = new Metaplex(connection)
      .use(walletAdapterIdentity(wallet))
      .use(bundlrStorage());

      let candyMachine;
      try {
        candyMachine = await metaplex
          .candyMachines()
          .findByAddress({ address: new PublicKey("87pqxjxmmktffuKyv9NA5k6XUmkmFbWavZDCwc7X3hmz") });
  
          console.log(candyMachine.itemsMinted.toString(10), candyMachine.itemsAvailable.toString(10));
      } catch(e){
        diagCtx.showError(e.message);
        diagCtx.hideLoading();
        return;
      }

      try {
        const provider = new anchor.AnchorProvider(connection, wallet, {});
        anchor.setProvider(provider);

        const program = new Program(
            IDL,
            MUN_PROGRAM_ID,
            provider
        );
        const [configurationPubKey] = await deriveConfigurationAccountPDA(
            NATIVE_MINT,
            program.programId
        );

        console.log(configurationPubKey.toBase58());

        const configuration = await program.account.configuration.fetch(
            configurationPubKey
        );

        if(configuration.mintOn.toNumber() === 0){
          diagCtx.showWarning("Minting Off from Admin");
          diagCtx.hideLoading();
          return;
        }
        if(configuration.presaleAmount.toNumber() <= parseInt(candyMachine.itemsMinted.toString(10))){
          diagCtx.showWarning("Presale Amount Reached. Please wait until Admin start new sale round.");
          diagCtx.hideLoading();
          return;
        }
      } catch(e){
          diagCtx.showError(e.message);
          diagCtx.hideLoading();
          return;
      }

      if (
        parseInt(candyMachine.itemsMinted.toString(10)) >=
          parseInt(candyMachine.itemsAvailable.toString(10))
      ) {
        diagCtx.showError("Not enough items available");
        diagCtx.hideLoading();
        return;
      }

      // calculate the PDA where the amount of already minted 
      const mitLimitCounter = metaplex.candyMachines().pdas().mintLimitCounter({
        id: 1,                                // use value from your config
        user: metaplex.identity().publicKey,
        candyMachine: candyMachine.address,
        candyGuard: candyMachine.candyGuard.address,
      });
      //Read Data from chain
      const mintedAmountBuffer = await metaplex.connection.getAccountInfo(mitLimitCounter, "processed");
      const mintedAmount = mintedAmountBuffer.data.readUintLE(0, 1);
      console.log("mintedAmount :", mintedAmount);

      if (mintedAmount >= 5) {
        diagCtx.showError("mintLimit: mintLimit reached!");
        diagCtx.hideLoading();
        return;
      }

      try {
       
        const txs = [];

        for(var i = 0; i < amount; i++){
          txs.push(
            await metaplex.candyMachines().builders().mint({
              candyMachine,
              collectionUpdateAuthority: candyMachine.authorityAddress,
              })
          );
        }

          const block = await metaplex.connection.getLatestBlockhash();
          const txns = txs.map((builder) => {
            const builderTx = builder.setFeePayer(metaplex.identity());
    
            const dropSigners = [metaplex.identity(), ...builderTx.getSigners()];
            const { keypairs } = getSignerHistogram(dropSigners);
            const tx = builderTx.toTransaction({
              blockhash: block.blockhash,
              lastValidBlockHeight: block.lastValidBlockHeight,
            });
    
            if (keypairs.length > 0) {
              tx.partialSign(...keypairs);
            }
            return tx;
          });
    
          // make the connected wallet sign all transactions
          const signedTx = await metaplex.identity().signAllTransactions(txns);
    
          // send the signed transactions in batches
          const batchSize = 200; // sends 200 raw tx in parallel
          const batches = [];
          for (let i = 0; i < signedTx.length; i += batchSize) {
            batches.push(signedTx.slice(i, i + batchSize));
          }
          let signatures = [];
          for (const txs of batches) {
            const signature = await Promise.all(
              txs.map((tx) => metaplex.connection.sendRawTransaction(tx.serialize())),
            );
            signatures.push(signature);
          }
    
          // wait for confirmations in parallel batches
          let confirmations = [];
          for (let i = 0; i < signatures.length; i += 1) {
            await delay(1000); // add delay to avoid rate limiting
            const sigs = signatures[i];
            const confirmationBatch = await Promise.all(
              sigs.map((sig) => {
                return metaplex.rpc().confirmTransaction(sig, {
                  blockhash: block.blockhash,
                  lastValidBlockHeight: block.lastValidBlockHeight,
                });
              }),
            );
            confirmations.push(...confirmationBatch);
          }
    
          if (confirmations.length === 0) {
            throw new Error("Transaction failed");
          }
    
          signatures.flatMap((sig) => sig).map((signature) => ({ signature }));
        } catch(e){
          diagCtx.showError(e.message);
          diagCtx.hideLoading();
          return;
        }
          diagCtx.showSuccess("Mint Success!");
          diagCtx.hideLoading();

          initialize();
    }
  
    return <Container>
        <Box className="mt-[30px] mx-[20px] lg:mt-[45px] 2xl:mt-[60px] lg:mx-[120px] xl:mx-[240px] 2xl:mx-[360px]">
            <Box className="flex flex-row">
                <Box className="pt-[13px] sm:pt-[15px] 2xl:pt-[30px] " style={{width : '7px', height : 'auto', marginRight : '20px'}}>
                    <Box className="w-[7px] bg-[#5C84FF] rounded-[8px] h-[60px] lg:h-[100px]"/>
                </Box>
                <Box className="flex flex-col">
                    <LandingHeaderText className="!font-GoodTime">
                        Mint
                    </LandingHeaderText>
                    <LandingCaptionText className="mb-[40px] lg:mb-[100px]" style={{color : '#9395AA'}}>
                        Join MUN by getting our NFT! <br/>
                        Please make sure you are visiting mun.tools
                    </LandingCaptionText>
                </Box>
            </Box>
            <Box className="bg-[#0B0E27] rounded-[12px] py-[10px] sm:py-[50px] text-center">
                <MintHeaderText>
                    {mintedCount} / {totalCount} Minted
                </MintHeaderText>
                <Box className="mt-[15px] xl:mt-[30px] mx-[26px] rounded-[10px] lg:mx-[180px] h-[20px] xl:h-[40px] lg:rounded-[20px] bg-[#191E46]">
                     <Box className="rounded-[20px] w-[60%] h-full" sx={{background: "linear-gradient(0deg, #A8B5E0, #A8B5E0), linear-gradient(0deg, #A8B5E0, #A8B5E0), #A8B5E0;"}} />
                </Box>
                <Box className="mx-[72px] mt-[20px] xl:mt-[40px] flex justify-center">
                    <video className={`object-cover w-[180px] lg:w-[240px] xl:w-[360px] rounded-[20px]`} loop autoPlay muted>
                      <source
                        src={Teaser}
                        type="video/mp4"
                        className={`object-cover w-full h-full rounded`}
                      />
                    </video>
                </Box>
                <Box className="mt-[20px] xl:mt-[40px] mb-[16px] lg:mb-[24px] xl:mb-[32px] flex justify-center">
                    <MintPriceText className="my-auto mr-[14px]">Mint Price</MintPriceText>
                    <SolanaItem value={price}/>
                </Box>
                <Box className="mb-[16px] lg:mb-[24px] xl:mb-[32px] flex justify-center">
                    <MintPriceText className="my-auto mr-[32px]">Choose Amount</MintPriceText>
                    <MUNInput value={amount} onChange={(e) => setAmount(e.target.value)} />
                    <AmountButton className="ml-[11px] my-auto" onClick={handleMinus}>-</AmountButton>
                    <AmountButton className="ml-[11px] my-auto" onClick={handlePlus}>+</AmountButton>
                </Box>
                <MintTotalValue className="mb-[16px] lg:mb-[24px] xl:mb-[32px]">
                    Total: <span className="text-[#38D39C]">{(Math.round(amount * price * 100) / 100).toFixed(2)}</span> SOL
                </MintTotalValue>
                <Box className="flex justify-center">
                    <ColorButton className="w-fit hidden" onClick={() => createCandyMachine()}>
                        Create mun collection & candy machine & insert items
                    </ColorButton>
                    <ColorButton className="w-fit" onClick={() => insertItemAndMint()}>
                        Mint Now{/* InsertItem and Mint(CandyMachine) */}
                    </ColorButton>
                    <ColorButton className="w-fit hidden" onClick={() => updateNFT()}>
                        Reveal Now
                    </ColorButton>
                    {
                      diagCtx.isAdmin &&
                      <ColorButton className="w-fit" onClick={() => fetchHashTable()}>
                          Update Now
                      </ColorButton>
                    }
                </Box>
            </Box>
        </Box>
    </Container>;
}