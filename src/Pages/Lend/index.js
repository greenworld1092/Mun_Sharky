import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import {
    TOKEN_PROGRAM_ID,
    NATIVE_MINT,
} from "@solana/spl-token";


import IDL from '../../Utility/Idl/idl.json';
import { LAMPORTS_PER_SOL, Keypair, PublicKey} from "@solana/web3.js";

import { useState, useEffect, useContext } from "react";
import { Metaplex, keypairIdentity, walletAdapterIdentity } from "@metaplex-foundation/js";
import { Box, useMediaQuery, Checkbox } from "@mui/material";

import { BorderToggleButton, MintPriceValue, MintPriceText, SolanaItem, MunF21W600, LandingCaptionText, LandingHeaderText, CollectionButton, CollectionColorButton, CollectionCashText, CollectionTitleText, SolanaText } from "../../Components";
import { InterestButton } from "../../Components";
import Container from "../Container";
import { AmountInput } from "../../Components";
import { GetCollectionList, getCollectionStats, getNFTInfoByMintAddress } from "../../Api/magicEden";
import { deriveSCAccountPDA, deriveConfigurationAccountPDA, derivePoolAccountPDA, deriveTaxAccountPDA } from '../../Utility/ts/helper';

import DialogContext from "../../Contexts/dialogContext";

import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

import MunCollection from '../../Assets/images/BlackDiamond.gif';

const MUN_PROGRAM_ID = new anchor.web3.PublicKey(
    "Cdk2qqpHx4YMtsqiCwwLJpnWQARc4kJQofY1hduvRiiX"
);

const items = [
    {
        "collectionSymbol": "MUN-PASS",
        "name": "MUN-PASS",
        "image": "https://gateway.pinata.cloud/ipfs/QmVXcoTwhhLSME8LF3TXtkTyd2ezQDzDq9suRWy1ZUN431/Royal%20Crown.gif",
    },
    {
        "collectionSymbol": "mad_lads",
        "name": "Mad Lads",
        "image": "https://creator-hub-prod.s3.us-east-2.amazonaws.com/mad_lads_pfp_1682211343777.png",
    },
    {
        "collectionSymbol": "chadswtf",
        "name": "CHADS",
        "image": "https://shdw-drive.genesysgo.net/DULc8DgYywybLKKosZXbT5HBYHZiUbkkwNYy7QbirUc2/chads.png",
    },
]

let selectedCollection = [];

function DesktopCollectionItem({item, chooseAll}){
    const [selected, setSelected ] = useState(false);
    const [collectionDetail, setCollectionDetail] = useState(null);

    const itemSelected = () => {
        if(!selected)
            selectedCollection = [...selectedCollection, item.collectionSymbol];
        else
            selectedCollection = selectedCollection.filter(i => i != item.collectionSymbol);
        setSelected(!selected);
    }

    useEffect(() => {
        getCollectionStats(item.collectionSymbol).then((res) => {
            setCollectionDetail(res);
        }).catch((error) => {
            setCollectionDetail({symbol : 'unknown'});
            console.log(error);
        });

        window.scrollTo(0, 0);
    }, [])

    useEffect(() => {
        if(!chooseAll && selected){
            setSelected(false);
            selectedCollection = selectedCollection.filter(i => i != item.collectionSymbol);
        }
        if(chooseAll && !selected){
            setSelected(true);
            selectedCollection = [...selectedCollection, item.collectionSymbol];
        }
    }, [chooseAll])

    return <BootstrapTooltip title={
    <div style={{textAlign : 'left'}}>
        name : {item.name} <br/>
        symbol : {collectionDetail?.symbol} <br/>
        floor price : {collectionDetail?.floorPrice / LAMPORTS_PER_SOL} <br/>
        average price(24h) : {collectionDetail?.avgPrice24hr / LAMPORTS_PER_SOL} <br/>
        total volume : {collectionDetail?.volumeAll / LAMPORTS_PER_SOL}
    </div>} placement="bottom">
        <Box className={`flex py-[9px] px-[13px] items-center bg-[#1B1E3D] rounded-[6px] mr-[20px] cursor-pointer
    transition duration-300 hover:duration-300 hover:bg-[#111430]
    !box-border hover:box-content ${selected ? "border-[1px] border-[#5C84FF]" : "border-[1px] border-[#1B1E3D]"}`}
        onClick={() => itemSelected()}>
        <img src={item.image} alt="collection" style={{width: '50px', height: '50px', maxWidth : '50px'}}/>
        <MintPriceText className="flex ml-[14px] mr-[18px] cursor-pointer !w-[70px] break-all" style={{color : !selected ? '#6B6B6B' : '#5C84FF'}}>{item.name}</MintPriceText>
    </Box></BootstrapTooltip>
}

function MobileCollectionItem({item, chooseAll}){
    const [selected, setSelected ] = useState(false);
    const [collectionDetail, setCollectionDetail] = useState(null);

    const itemSelected = () => {
        if(!selected)
            selectedCollection = [...selectedCollection, item.collectionSymbol];
        else
            selectedCollection = selectedCollection.filter(i => i != item.collectionSymbol);
        setSelected(!selected);
    }

    useEffect(() => {
        getCollectionStats(item.collectionSymbol).then((res) => {
            setCollectionDetail(res);
        });
    })

    useEffect(() => {
        if(!chooseAll && selected){
            setSelected(false);
            selectedCollection = selectedCollection.filter(i => i != item.collectionSymbol);
        }
        if(chooseAll && !selected){
            setSelected(true);
            selectedCollection = [...selectedCollection, item.collectionSymbol];
        }
    }, [chooseAll])

    return <BootstrapTooltip title={
    <div style={{textAlign : 'left'}}>
        name : {item.name} <br/>
        symbol : {collectionDetail?.symbol} <br/>
        floor1 price : {collectionDetail?.floorPrice / LAMPORTS_PER_SOL} <br/>
        average price(24h) : {collectionDetail?.avgPrice24hr / LAMPORTS_PER_SOL} <br/>
        total volume : {collectionDetail?.volumeAll / LAMPORTS_PER_SOL}
    </div>} placement="bottom">
        <Box className={`flex py-[9px] px-[13px] mb-[10px] items-center bg-[#1B1E3D] rounded-[6px]
        ${selected ? "border-[1px] border-[#5C84FF]" : "border-[1px] border-[#1B1E3D]"}`}
        onClick={() => itemSelected()}>
        <img src={item.image} alt="collection" style={{width: '45px', height: '45px', maxWidth : '45px'}} />
        <MintPriceText className="flex ml-[14px] mr-[18px]" style={{color : '#6B6B6B'}}>{item.name}</MintPriceText>
    </Box>
    </BootstrapTooltip>
}

export default function Lend() {
    const isDesktop = useMediaQuery('(min-width:1024px)');

    const [collection, setCollection] = useState([]);
    const [chooseAll, setChooseAll] = useState(false);

    const diagCtx = useContext(DialogContext);

    const [duration, setDuration] = useState([true, true, true, true]);
    const [interest, setInterest] = useState(0);
    const [percentFloorPrice, setPercentFloorPrice] = useState("");
    const [depositAmount, setDepositAmount] = useState("");
    const [ownerPools, setOwnerPools] = useState([]);

    const { connection } = useConnection();
    const wallet = useWallet();
    const walletModal = useWalletModal();

    useEffect(() => {
        if(percentFloorPrice < 0)
            setPercentFloorPrice("");
        if(percentFloorPrice > 100)
            setPercentFloorPrice(100);
    }, [percentFloorPrice])

    /* useEffect(() => {
        setTimeout(() => getPools(), 500);
    }, []) */
    useEffect(() => {
        if(wallet?.connected && !wallet?.disconnecting && !wallet?.connecting){
            console.log("getting pools");
            getPools();
        }
        if(!wallet?.connected && !wallet?.disconnecting && !wallet?.connecting){
            console.log("formatting pools");
            setOwnerPools([]);
        }
    }, [wallet])

    const checkDuration = (include, sum) => {
        if(include == 30){
            if(sum >= include)   return true;
            return false;
        }
        if(include == 14){
            if(sum >= 30)    sum -= 30;
            if(sum >= include)   return true;
            return false;
        }
        if(include == 7){
            if(sum >= 30)    sum -= 30;
            if(sum >= 14)    sum -= 14;
            if(sum >= include)   return true;
            return false;
        }
        if(include == 1){
            if(sum >= 30)    sum -= 30;
            if(sum >= 14)    sum -= 14;
            if(sum >= 7)   sum -= 7;
            if(sum >= 1)    return true;
            return false;
        }
    }
    //here is use to initialize configuration
    const initialize = async () => {
        const provider = new anchor.AnchorProvider(connection, wallet, {});
        anchor.setProvider(provider);

        const program = new Program(
            IDL,
            MUN_PROGRAM_ID,
            provider
        );

        const [munSolVault] = await deriveSCAccountPDA(
            NATIVE_MINT,
            program.programId
        );

        const [munTaxVault] = await deriveTaxAccountPDA(
            NATIVE_MINT,
            program.programId
        )

        const [configurationPubKey] = await deriveConfigurationAccountPDA(
            NATIVE_MINT,
            program.programId
        );

        console.log(munSolVault.toBase58());
        console.log(configurationPubKey.toBase58());

        try {
            await program.methods
            .initialize()
            .accounts({
                signer: provider.wallet.publicKey,
                munSolMint: NATIVE_MINT,
                munSolVault: munSolVault,
                munTaxVault : munTaxVault,
                configuration: configurationPubKey,
                systemProgram: anchor.web3.SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            })
            .signers([])
            .rpc();
        } catch(e){
            console.log(e.message);
            return;
        }
        console.log("initiailize success");

        // check configuration
        const configuration = await program.account.configuration.fetch(
            configurationPubKey
        );
        console.log("munSolMint :", configuration.munSolMint.toBase58());
        console.log("munSolVault :", configuration.munSolVault.toBase58());
        console.log("orderId :", configuration.orderId.toNumber());
        console.log("poolId :", configuration.poolId.toNumber());
        console.log("nftTotalCount :", configuration.nftTotalCount.toNumber());
        console.log("nftSoldCount :", configuration.nftSoldCount.toNumber());
    }


    //here is used to get pools
    const getPools = async() => {
        if (!wallet.connected) {
            return;
        }
        diagCtx.showLoading("Getting your pools...");
        const provider = new anchor.AnchorProvider(connection, wallet, {});
        anchor.setProvider(provider);

        const program = new Program(
            IDL,
            MUN_PROGRAM_ID,
            provider
        );

        try {
            let pools = await program.account.lenderPool.all();
            let ownerPools = await pools.filter(function(item){
                return item.account.poolStatus == true && item.account.lender.toBase58() == provider.wallet.publicKey;
            });
            setOwnerPools(ownerPools);
        } catch(e){
            diagCtx.showError(e.message);
            diagCtx.hideLoading();
            return;
        }
        diagCtx.hideLoading();
        diagCtx.showSuccess("Updated your pools list.");
    }

    //here is used to create lending pool
    const startLending = async () => {
        if (!wallet.connected) {
            diagCtx.showError("You're not connected to wallet.");
            walletModal.setVisible(true);
            return;
        }

        if(!duration[0] && !duration[1] && !duration[2] && !duration[3]){
            diagCtx.showError("Please select loan duration.");
            return;
        }

        if(percentFloorPrice == ""){
            diagCtx.showError("Please input percent of floor price.");
            return;
        }

        if(depositAmount == ""){
            diagCtx.showError("Please input deposit amount.");
            return;
        }

        if(selectedCollection.length == 0){
            diagCtx.showError("Please select at least one collection.");
            return;
        }

        const walletSOL = await connection.getAccountInfo(wallet.publicKey);
        console.log(walletSOL.lamports);
        if(depositAmount * LAMPORTS_PER_SOL > walletSOL.lamports){
            diagCtx.showError("Not enough sol in your wallet.");
            return;
        }

        diagCtx.showLoading("Creating Pool...");

        const provider = new anchor.AnchorProvider(connection, wallet, {});
        anchor.setProvider(provider);

        const program = new Program(
            IDL,
            MUN_PROGRAM_ID,
            provider
        );

        /* const keypair = Keypair.generate();
        const metaplex = new Metaplex(connection);
        metaplex.use(keypairIdentity(keypair));

        const owner = new PublicKey("Ea5YwRT8KJmouwKdPnnhfKiDWboF4AP376coFDwj5Mpp");
        const allNFTs = await metaplex.nfts().findAllByOwner({owner});
        console.log(allNFTs);
        return; */

        const [munSolVault] = await deriveSCAccountPDA(
            NATIVE_MINT,
            program.programId
        );
        const [configurationPubKey] = await deriveConfigurationAccountPDA(
            NATIVE_MINT,
            program.programId
        );

        let configuration = await program.account.configuration.fetch(
            configurationPubKey
        );

        console.log(munSolVault.toBase58());
        console.log(configurationPubKey.toBase58());

        const [poolPubkey] = await derivePoolAccountPDA(
            configurationPubKey,
            configuration.poolId,
            program.programId
        );

        try {
            await program.methods
            .createPool(
                new anchor.BN(depositAmount * LAMPORTS_PER_SOL),
                new anchor.BN(0),
                new anchor.BN(interest),
                new anchor.BN(1 * duration[0] + 7 * duration[1] + 14 * duration[2] + 30 * duration[3]),
                new anchor.BN(percentFloorPrice),
                selectedCollection
            )
            .accounts({
                signer: provider.wallet.publicKey,
                configuration: configurationPubKey,
                munSolMint: NATIVE_MINT,
                munSolVault: munSolVault,
                userSolVault : provider.wallet.publicKey,
                pool: poolPubkey,
                systemProgram: anchor.web3.SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            })
            .signers([])
            .rpc();
        } catch(e){
            diagCtx.showError(e.message);
            diagCtx.hideLoading();
            return;
        }
        diagCtx.showSuccess("Successfully created your own pool.");
        diagCtx.hideLoading();

        getPools();
/*         const accounts = await connection.getProgramAccounts(program.programId);
        const accountPublicKeys = accounts.map(account => account.pubkey)
        console.log(accounts); */



        /* const provider = new anchor.AnchorProvider(connection, wallet);
        anchor.setProvider(provider);

        const program = new Program(
            MintMunNft,
            MUN_PROGRAM_ID,
            provider
        ); */

        /* const provider = new anchor.AnchorProvider(connection, wallet);
        anchor.setProvider(provider);
    
        const program = new Program(
          IDL,
          MUN_PROGRAM_ID,
          provider
        );
        console.log("Program Id: ", program.programId.toBase58());

        try {
            const tx = program.transaction.sendOneSol(
              "sent one sol",
              {
                accounts: {
                  systemProgram: anchor.web3.SystemProgram.programId,
                  from: provider.wallet.publicKey,
                  to: "2u9bS4iGUKVJ8ZfP4VkVBA7f27b8oNABNDrEZG74gc1b",
                },
              }
            );
      
            const signature = await wallet.sendTransaction(tx, connection);
            await connection.confirmTransaction(signature, "confirmed");
            console.log("Sending Success!");
            return true;
          } catch(err) {
            console.log(err);
            return false;
        } */
    }

    const closePools = async (pool_id) => {
        diagCtx.showLoading("Closing your pool...");
        const provider = new anchor.AnchorProvider(connection, wallet, {});
        anchor.setProvider(provider);

        const program = new Program(
            IDL,
            MUN_PROGRAM_ID,
            provider
        );

        diagCtx.showLoading("Closing your pool ( getting your Tier level... )");
        const metaplex = new Metaplex(connection);
        await wallet.connect();
        metaplex.use(walletAdapterIdentity(wallet));

        const owner = new PublicKey(wallet.publicKey);
        const allNFTs = await metaplex.nfts().findAllByOwner({owner});

        let tier_level = 1;
        for(var j = 0; j < allNFTs.length; j++){
            const mintAddress = new PublicKey(allNFTs[j].mintAddress);
//\\            const nftJson = await metaplex.nfts().findByMint({ mintAddress });

            const res = await getNFTInfoByMintAddress(allNFTs[j].mintAddress.toBase58());
            for(var i = 0; i < res.attributes.length; i++){
                console.log(i, res.attributes[i].trait_type, res.attributes[i].value);
                if(res.attributes[i].trait_type === 'Level' && res.attributes[i].value > tier_level)
                    tier_level = res.attributes[i].value;
            }
        }

        console.log("Tier Level", tier_level);

        console.log(allNFTs);

        diagCtx.showLoading("Closing your pool ( getting necessary variables...)");
        const [munSolVault] = await deriveSCAccountPDA(
            NATIVE_MINT,
            program.programId
        );

        const [munTaxVault] = await deriveTaxAccountPDA(
            NATIVE_MINT,
            program.programId
        )

        const [configurationPubKey] = await deriveConfigurationAccountPDA(
            NATIVE_MINT,
            program.programId
        );

        console.log(munSolVault.toBase58());
        console.log(configurationPubKey.toBase58());

        const [poolPubkey] = await derivePoolAccountPDA(
            configurationPubKey,
            pool_id,
            program.programId
        );

        console.log(poolPubkey);
        diagCtx.showLoading("Closing your pool ( sending transactions... )")
        try {
            await program.methods
            .cancelPool(
                pool_id,
                new anchor.BN(tier_level)
            )
            .accounts({
                signer: provider.wallet.publicKey,
                configuration: configurationPubKey,
                munSolMint: NATIVE_MINT,
                munSolVault: munSolVault,
                munTaxVault : munTaxVault,
                userSolVault : provider.wallet.publicKey,
                pool: poolPubkey,
                systemProgram: anchor.web3.SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .signers([])
            .rpc();
            /* await program.methods
            .cancelPool(
                new anchor.BN(10),
            )
            .accounts({
                configuration: configurationPubKey,
                pool : poolPubkey,
                munSolMint: NATIVE_MINT,
                munSolVault: munSolVault,
                userSolVault : provider.wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID
            })
            .signers([])
            .rpc(); */
        } catch(e){
            diagCtx.showError(e.message);
            diagCtx.hideLoading();
            return;
        }
        diagCtx.showSuccess("Successfully closed your own pool.");
        diagCtx.hideLoading();

        getPools();
    }

    const renderLendingWithNoNFT = () => {
        return <Box className={`rounded-[12px] md:px-[42px] px-[10px] md:py-[36px] py-[10px] bg-[#111430] grid gap-[20px] 2xl:gap-[60px]`}>
        <Box className="flex flex-row">
            <MintPriceValue className="my-auto break-all font-semibold">Choose&nbsp;Collections</MintPriceValue>
            <Checkbox 
            checked={chooseAll}
            onChange={(e) => setChooseAll(e.target.checked)}
            sx={{
                color: '#3E4162',
                '&.Mui-checked': {
                color: '#fff',
                },
            }}
            />
            <CollectionTitleText className="my-auto break-all">Choose all</CollectionTitleText>
        </Box>
        {
            isDesktop ? 
            <Box className="flex flex-row w-full overflow-auto">
                    {
                        items.map((item, index) => (
                            <DesktopCollectionItem key={index} item={item} chooseAll={chooseAll}/>
                        ))
                    }
            </Box> : <Box className="flex flex-col h-[300px] w-full overflow-auto">
                    {
                        items.map((item, index) => (
                            <MobileCollectionItem key={index} item={item} chooseAll={chooseAll}/>
                        ))
                    }
            </Box>
        }
        <Box className="grid grid-cols-1 sm:grid-cols-2 gap-[20px] pt-[10px]">
            <Box className=""></Box>
            <Box className="text-center text-[14px] md:text-[21px] text-white"><MintPriceValue>Potential Earnings</MintPriceValue></Box>
            <Box className="bg-[#1B1E3D] rounded-[6px] px-[10px] py-[10px] sm:px-[15px] sm:py-[15px] lg:px-[30px] lg:py-[20px] flex flex-row justify-center items-center">
                <AmountInput placeholder="Enter deposit amount..." className="flex-1 w-full"/>
                <img className="w-[1em] ml-auto my-auto h-[1em] flex" src="/images/cash.png" alt="Cash" />
            </Box>
            <Box className="bg-[#1B1E3D] rounded-[6px] px-[10px] py-[10px] sm:px-[15px] sm:py-[25px] lg:px-[30px] lg:py-[40px] grid grid-cols-3 gap-[10px] sm:gap-[40px]">
                <Box className="flex flex-col items-center">
                    <MintPriceText>1 week</MintPriceText>
                    <CollectionCashText className="mt-[8px]">+1.2 SOL</CollectionCashText>
                </Box>
                <Box className="flex flex-col items-center">
                    <MintPriceText>1 month</MintPriceText>
                    <CollectionCashText className="mt-[8px]">+4.5 SOL</CollectionCashText>
                </Box>
                <Box className="flex flex-col items-center">
                    <MintPriceText>1 year</MintPriceText>
                    <CollectionCashText className="mt-[8px]">+130 SOL</CollectionCashText>
                </Box>
            </Box>
        </Box>
        <Box className="flex justify-center sm:justify-end">
            <CollectionColorButton className="!font-GoodTime !w-fit">START&nbsp;LENDING</CollectionColorButton>
        </Box>
    </Box>
    }

    const renderLendingWithNFT = () => {
        return <Box className={`rounded-[12px] md:px-[42px] px-[20px] py-[20px] lg:py-[30px] 2xl:py-[40px] bg-[#111430] grid gap-[15px] 2xl:gap-[30px]`}>
        <Box className="flex flex-row">
            <MintPriceValue className="my-auto break-all font-semibold">&nbsp;Choose Collections&nbsp;&nbsp;&nbsp;&nbsp;</MintPriceValue>
            <Checkbox 
            checked={chooseAll}
            onChange={(e) => setChooseAll(e.target.checked)}
            sx={{
                color: '#3E4162',
                '&.Mui-checked': {
                color: '#fff',
                },
            }}
            />
            <CollectionTitleText className="my-auto break-all">Choose all</CollectionTitleText>
        </Box>
        {
            isDesktop ? 
            <Box className="flex flex-row w-full overflow-auto h-scroll pb-[10px]">
                    {
                        items.map((item, index) => (
                            <DesktopCollectionItem key={index} item={item} chooseAll={chooseAll}/>
                        ))
                    }
            </Box> : <Box className="flex flex-col h-[300px] w-full overflow-auto">
                    {
                        items.map((item, index) => (
                            <MobileCollectionItem key={index} item={item} chooseAll={chooseAll}/>
                        ))
                    }
            </Box>
        }
        <Box className="grid grid-cols-1 sm:grid-cols-2 gap-[30px] pt-[10px]">
            <Box className="bg-[#1B1E3D] rounded-[6px] px-[5px] sm:px-[10px] md:px-[30px] py-[15px] xl:py-[25px] flex flex-col">
                <Box className="text-[14px] md:text-[21px] text-white pl-[10px] md:pl-[0px]"><MintPriceValue>Interest</MintPriceValue></Box>
                <Box className="pt-[16px] grid grid-cols-4 gap-[3px] md:flex md:gap-[10px]">
                    <BootstrapTooltip title={<div className="text-center">200% APY (0.3% a day)</div>}><BorderToggleButton className={`text-center transition duration-300 hover:duration-300 ${interest == 0 ? "hover:bg-[#0f2c2250]" : "hover:bg-[#72727250]"}`} style={{borderColor : `${interest == 0 ? '#38D39C' : '#727272'}`, color : `${interest == 0 ? '#38D39C' : '#727272'}`}} onClick={() => {setInterest(0); setPercentFloorPrice(50);}}>Low</BorderToggleButton></BootstrapTooltip>
                    <BootstrapTooltip title={<div className="text-center">500% APY (0.5% a day)</div>}><BorderToggleButton className={`text-center transition duration-300 hover:duration-300 ${interest == 1 ? "hover:bg-[#291d0b50]" : "hover:bg-[#72727250]"}`} style={{borderColor : `${interest == 1 ? '#FFBE5C' : '#727272'}`, color : `${interest == 1 ? '#FFBE5C' : '#727272'}`}} onClick={() => {setInterest(1); setPercentFloorPrice(70);}}>Medium</BorderToggleButton></BootstrapTooltip>
                    <BootstrapTooltip title={<div className="text-center">1300% APY (0.7% a day)</div>}><BorderToggleButton className={`text-center transition duration-300 hover:duration-300 ${interest == 2 ? "hover:bg-[#531b1b50]" : "hover:bg-[#72727250]"}`} style={{borderColor : `${interest == 2 ? '#EB5757' : '#727272'}`, color : `${interest == 2 ? '#EB5757' : '#727272'}`}} onClick={() => {setInterest(2); setPercentFloorPrice(90);}}>High</BorderToggleButton></BootstrapTooltip>
                </Box>
                <Box className="text-[14px] md:text-[21px] text-white mt-[24px] pl-[10px] md:pl-[0px]"><MintPriceValue>Loans Duration</MintPriceValue></Box>
                <Box className="my-[16px] grid grid-cols-4 gap-[3px] md:flex md:gap-[10px]">
                    <BorderToggleButton className={`text-center transition duration-300 hover:duration-300 ${duration[0] ? "hover:bg-[#5C84FF50]" : "hover:bg-[#72727250]"}`} style={{borderColor : `${duration[0] == true ? '#5C84FF' : '#727272'}`, color : `${duration[0] == true ? '#5C84FF' : '#727272'}`}} onClick={() => setDuration([!duration[0], duration[1], duration[2], duration[3]])}>1&nbsp;day</BorderToggleButton>
                    <BorderToggleButton className={`text-center transition duration-300 hover:duration-300 ${duration[1] ? "hover:bg-[#5C84FF50]" : "hover:bg-[#72727250]"}`} style={{borderColor : `${duration[1] == true ? '#5C84FF' : '#727272'}`, color : `${duration[1] == true ? '#5C84FF' : '#727272'}`}} onClick={() => setDuration([duration[0], !duration[1], duration[2], duration[3]])}>7&nbsp;days</BorderToggleButton>
                    <BorderToggleButton className={`text-center transition duration-300 hover:duration-300 ${duration[2] ? "hover:bg-[#5C84FF50]" : "hover:bg-[#72727250]"}`} style={{borderColor : `${duration[2] == true ? '#5C84FF' : '#727272'}`, color : `${duration[2] == true ? '#5C84FF' : '#727272'}`}} onClick={() => setDuration([duration[0], duration[1], !duration[2], duration[3]])}>14&nbsp;days</BorderToggleButton>
                    <BorderToggleButton className={`text-center transition duration-300 hover:duration-300 ${duration[3] ? "hover:bg-[#5C84FF50]" : "hover:bg-[#72727250]"}`} style={{borderColor : `${duration[3] == true ? '#5C84FF' : '#727272'}`, color : `${duration[3] == true ? '#5C84FF' : '#727272'}`}} onClick={() => setDuration([duration[0], duration[1], duration[2], !duration[3]])}>30&nbsp;days</BorderToggleButton>
                </Box>
            </Box>
            <Box className="flex flex-col">
                <Box className="bg-[#1B1E3D] rounded-[6px] px-[10px] py-[15px] sm:px-[15px] lg:px-[30px] xl:py-[25px] flex flex-row items-center">
                    <AmountInput placeholder="Enter deposit amount..." className="pr-[10px] flex-1" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)}/>
                    <img className="w-[1em] my-auto h-[1em] flex" src="/images/cash.png" alt="Cash" />
                </Box>
                <Box className="text-center text-[14px] md:text-[21px] text-white my-[15px]"><MintPriceValue>Potential Earnings</MintPriceValue></Box>
                <Box className="bg-[#1B1E3D] rounded-[6px] px-[10px] py-[15px] sm:px-[15px] lg:px-[30px] xl:py-[25px] grid grid-cols-3 gap-[10px] sm:gap-[20px]">
                    <Box className="flex flex-col items-center">
                        <MintPriceText>1 week</MintPriceText>
                        <CollectionCashText className="mt-[8px]">+{parseFloat(depositAmount * Math.pow((1 + (interest == 0 ? 0.003 : (interest == 1 ? 0.005 : (interest == 2? 0.007 : 0)))), 7) - depositAmount).toFixed(1)}&nbsp;SOL</CollectionCashText>
                    </Box>
                    <Box className="flex flex-col items-center">
                        <MintPriceText>1 month</MintPriceText>
                        <CollectionCashText className="mt-[8px]">+{parseFloat(depositAmount * Math.pow((1 + (interest == 0 ? 0.003 : (interest == 1 ? 0.005 : (interest == 2? 0.007 : 0)))), 30) - depositAmount).toFixed(1)}&nbsp;SOL</CollectionCashText>
                    </Box>
                    <Box className="flex flex-col items-center">
                        <MintPriceText>1 year</MintPriceText>
                        <CollectionCashText className="mt-[8px]">+{parseFloat(depositAmount * Math.pow((1 + (interest == 0 ? 0.003 : (interest == 1 ? 0.005 : (interest == 2? 0.007 : 0)))), 365) - depositAmount).toFixed(1)}&nbsp;SOL</CollectionCashText>
                    </Box>
                </Box>
            </Box>
            <Box className="flex flex-col sm:flex-row sm:items-center gap-[30px] sm:gap-[0px]">
                <Box className="bg-[#1B1E3D] rounded-[6px] px-[10px] py-[15px] sm:px-[15px] lg:px-[30px] xl:py-[25px] grid grid-cols-2" gridTemplateColumns={'1fr 125px'}>
                    <AmountInput placeholder="Your offer..." className="pr-[10px]" style={{minWidth : 120}} value={percentFloorPrice} onChange={(e) => setPercentFloorPrice(e.target.value)}/>
                    <Box className="flex items-center"><LandingCaptionText style={{fontSize : '16px', fontWeight : 600}}>%&nbsp;of&nbsp;floor&nbsp;price</LandingCaptionText></Box>
                </Box>
                <Box className="flex flex-row items-center">
                <Checkbox defaultChecked sx={{
                    color: '#3E4162',
                    '&.Mui-checked': {
                    color: '#fff',
                    },
                }}
                />
                <CollectionTitleText className="my-auto w-max" style={{whiteSpace : 'nowrap'}}>Use recommended</CollectionTitleText>
                </Box>
            </Box>
            <Box className="flex justify-center sm:ml-auto sm:mt-auto">
                <CollectionColorButton className="!font-GoodTime !w-fit hidden" onClick={() => initialize  ()}>Initialize</CollectionColorButton>
                <CollectionColorButton className="!font-GoodTime !w-fit" onClick={() => startLending  ()}>START&nbsp;LENDING</CollectionColorButton>
            </Box>
        </Box>
    </Box>
    }

    return <Container>
        
        <Box className="mt-[30px] mx-[20px] lg:mt-[60px] lg:mx-[120px] xl:mx-[240px] 2xl:mx-[360px]">
            <Box className="flex flex-row">
                <Box className="pt-[13px] sm:pt-[15px] 2xl:pt-[30px] " style={{width : '7px', height : 'auto', marginRight : '20px'}}>
                    <Box className="w-[7px] bg-[#5C84FF] rounded-[8px] h-[60px] lg:h-[100px]"/>
                </Box>
                <Box className="flex flex-col">
                    <LandingHeaderText className="!font-GoodTime">
                        Lend SOL
                    </LandingHeaderText>
                    <LandingCaptionText className="mb-[20px] lg:mb-[30px] xl:mb-[45px] 2xl:mb-[60px]" style={{color : '#9395AA'}}>
                        Create your own lending pool and earn compounding interest. <br/>
                        our smart lending tool will lend your SOL to the right people and <br/>
                        take care of everything for you. <br/>
                    </LandingCaptionText>
                </Box>
            </Box>
            <Box className="mb-[26px]"/>
            {/* {renderLendingWithNoNFT()} */}
            {renderLendingWithNFT()}
            <Box className="mb-[20px] lg:mb-[30px] xl:mb-[45px] 2xl:mb-[60px]"/>
            {
                isDesktop ?
            <>
            {
                ownerPools.length !== 0 ? <>
            <MunF21W600 className="mb-[10px] sm:mb-[20px] md:px-[42px] px-[20px]">My Pools</MunF21W600>
            <LandingCaptionText className="mb-[20px] lg:mb-[30px] xl:mb-[45px] 2xl:mb-[60px] md:px-[42px] px-[20px]" style={{color : '#9395AA'}}>
                View your pools and withdraw funds. <br/>
                Mun tools takes 1% service fee when the pool is closed and <br/>
                Solana is withdrawn, no matter how long you used our service <br/>
            </LandingCaptionText>
            
                <Box className="hidden lg:grid px-[18px] gap-[20px] 2xl:gap-[30px]" gridTemplateColumns={'106px 120px 120px 10fr 10fr 10fr'}>
                    <CollectionTitleText style={{textAlign : 'center'}}>Collections</CollectionTitleText>
                    <CollectionTitleText style={{textAlign : 'center'}}>Sol&nbsp;Earned</CollectionTitleText>
                    <CollectionTitleText style={{textAlign : 'center'}}>Offer/Floor</CollectionTitleText>
                    <CollectionTitleText style={{textAlign : 'center', minWidth : '100px'}} >Interest</CollectionTitleText>
                    <CollectionTitleText style={{textAlign : 'center', minWidth : '130px'}}>Durations</CollectionTitleText>
                    <Box className="2xl:min-w-[200px]"></Box>
                </Box>
                <Box className="mb-[26px]" /></> : ""
            }

            {
                ownerPools.map((item, key) => {
                    return <Box key={key} className={`px-[18px] py-[18px] mb-[20px] bg-[#111430] rounded-[12px] grid gap-[20px] 2xl:gap-[30px]`} gridTemplateColumns={'106px 120px 120px 10fr 10fr 10fr'}
                    style={{minWidth : 'fit-content'}}>
                        <Box className="grid grid-cols-3 gap-[5px]">
                            {
                            item.account.collections.map((item, key) => {
                                return <img key={key} className="my-auto w-[53px]" src="https://gateway.pinata.cloud/ipfs/QmVXcoTwhhLSME8LF3TXtkTyd2ezQDzDq9suRWy1ZUN431/Royal%20Crown.gif" alt="SolanaText" />
                            })
                            }
                        </Box>
                        <SolanaItem value={Math.fround(item.account.earnedAmount / LAMPORTS_PER_SOL).toFixed(2)} className="flex flex-row items-center justify-center"/>
                        <Box className="flex justify-center">
                            <SolanaText className="my-auto break-all">&nbsp;{parseFloat(item.account.percentFloorPrice.toNumber().toFixed(1))}%</SolanaText>
                        </Box>
                        <Box className="flex justify-center items-center">
                            <InterestButton className={`${item.account.interestAmount.toNumber() == 0 ? "bg-[#38D39C] " : "bg-[#1B1E3D] !text-[#666880]"} w-[32px] h-[32px] flex justify-center items-center mr-[5px]`}>L</InterestButton>
                            <InterestButton className={`${item.account.interestAmount.toNumber() == 1 ? "bg-[#FFBE5C] " : "bg-[#1B1E3D] !text-[#666880]"} w-[32px] h-[32px] flex justify-center items-center mr-[5px]`}>M</InterestButton>
                            <InterestButton className={`${item.account.interestAmount.toNumber() == 2 ? "bg-[#EB5757] " : "bg-[#1B1E3D] !text-[#666880]"} w-[32px] h-[32px] flex justify-center items-center mr-[5px]`}>H</InterestButton>
                        </Box>
                        <Box className="flex justify-center items-center">
                            <InterestButton className={`${checkDuration(1, item.account.duration.toNumber()) ? "!text-[#5C84FF]" : "!text-[#666880]"} bg-[#1B1E3D] w-[32px] h-[32px] flex justify-center items-center mr-[5px] `}>1</InterestButton>
                            <InterestButton className={`${checkDuration(7, item.account.duration.toNumber()) ? "!text-[#5C84FF]" : "!text-[#666880]"} bg-[#1B1E3D] w-[32px] h-[32px] flex justify-center items-center mr-[5px] `}>7</InterestButton>
                            <InterestButton className={`${checkDuration(14, item.account.duration.toNumber()) ? "!text-[#5C84FF]" : "!text-[#666880]"} bg-[#1B1E3D] w-[32px] h-[32px] flex justify-center items-center mr-[5px]`}>14</InterestButton>
                            <InterestButton className={`${checkDuration(30, item.account.duration.toNumber()) ? "!text-[#5C84FF]" : "!text-[#666880]"} bg-[#1B1E3D] w-[32px] h-[32px] flex justify-center items-center mr-[5px]`}>30</InterestButton>
                        </Box>
                        <Box className="flex justify-center items-center">
                            <CollectionButton className="my-auto px-[5px]" style={{width : 'fit-content'}} onClick={() => closePools(item.account.poolId)}>Close&nbsp;Pool/Withdraw</CollectionButton>
                        </Box>
                    </Box>
                })
            }
            </> : ""
            }
        </Box>
    </Container>;
}

const BootstrapTooltip = styled(({ className, ...props }) => (
<Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
[`& .${tooltipClasses.arrow}`]: {
    color: '#666880',
},
[`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#1B1E3D',
    borderColor : '#666880',
    borderWidth : '1px'
},
}));