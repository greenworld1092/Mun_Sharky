
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import { Program, utils } from "@project-serum/anchor";
import {
    TOKEN_PROGRAM_ID,
    NATIVE_MINT,
    getAssociatedTokenAddress,
    createApproveInstruction,
    getAccount,
    createRevokeInstruction
} from "@solana/spl-token";


import IDL from '../../Utility/Idl/idl.json';
import { Metaplex, keypairIdentity, walletAdapterIdentity, bundlrStorage } from "@metaplex-foundation/js";
import { PROGRAM_ID as METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";

import { Connection, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";

import { useState, useEffect, useContext } from "react";

import { Box, useMediaQuery } from "@mui/material";
import { Popover } from 'react-tiny-popover'
import { LAMPORTS_PER_SOL, Transaction, sendAndConfirmTransaction, PUBLIC_KEY_LENGTH, TransactionInstruction} from "@solana/web3.js";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import DialogContext from "../../Contexts/dialogContext";
import { CollectionNameText, SolanaItem, SolanaText, InterestMobileText, InterestButton, InterestText, CollectionItemText, LandingCaptionText, LandingHeaderText, ShareItemHeader, CollectionButton, CollectionColorButton, CollectionCashText, MintPriceValue, CollectionTitleText } from "../../Components";
import { getNFTInfoByMintAddress } from "../../Api/magicEden";
import Container from "../Container";

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { GetCollectionList, getCollectionStats } from "../../Api/magicEden";
import { deriveSCAccountPDA, deriveConfigurationAccountPDA, derivePoolAccountPDA, deriveNFTAccountPDA, deriveOrderAccountPDA } from '../../Utility/ts/helper';

const MUN_PROGRAM_ID = new anchor.web3.PublicKey(
    "Cdk2qqpHx4YMtsqiCwwLJpnWQARc4kJQofY1hduvRiiX"
);

const options = ['Highest Offer', 'Longest duration', 'Shortest duration', 'Lowest interest'];

const items = [
    { img: "/images/mint/Token.png", name: "Essence", floorPrice: 2.3, bestOffer: 1.1, interest: 0.09, Duration: 21 },
    { img: "/images/mint/Token.png", name: "Essence", floorPrice: 2.3, bestOffer: 1.1, interest: 0.09, Duration: 21 }
]

const InfoNotify = ({ content }) => {
    const [isPopover, setPopover] = useState(false);

    return <Popover
        isOpen={isPopover}
        positions={['bottom', 'left']} // if you'd like, you can limit the positions
        padding={10} // adjust padding here!
        reposition={false} // prevents automatic readjustment of content position that keeps your popover content within its parent's bounds
        onClickOutside={() => setPopover(false)} // handle click events outside of the popover/target here!
        content={({ position, nudgedLeft, nudgedTop }) => ( // you can also provide a render function that injects some useful stuff!
            <Box className="bg-[#24284A] py-[7px] px-[15px] text-[13px] text-[#BFC4F2] border border-[#51578C] rounded-[4px]">
                {content}
            </Box>
        )}
    >
        <ErrorOutlineIcon fontSize="small" onClick={() => setPopover(true)} />
    </Popover>
}

function BorrowItem({ collectionSymbol, nftList, getCollectionOffers }) {
    const isDesktop = useMediaQuery('(min-width:1024px)');
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(options[0]);
    const [isDropdown, setDropDown] = useState(false);

    const [collectionImageUrl, setCollectionImageUrl] = useState("");
    const [floorPrice, setFloorPrice] = useState(0);
    const [offerList, setOfferList] = useState([]);
    const [selectedOffer, setSelectedOffer] = useState(0);
    const [selectedNFT, setSelectedNFT] = useState(0);

    const diagCtx = useContext(DialogContext);

    const classes = open ? "rounded-t-[12px]" : "rounded-[12px]";

    const { connection } = useConnection();
    const wallet = useWallet();

    const sortOffers = async (item) => {
        let tmpOfferList;
        if(item === options[0])
            offerList.sort((a, b) => b.account.percentFloorPrice.toNumber() - a.account.percentFloorPrice.toNumber());
        if(item === options[2]) // Lognest duration
            offerList.sort((a, b) => a.account.duration.toNumber() - b.account.duration.toNumber());
        if(item === options[1]) // Shortest duration
            offerList.sort((a, b) => b.account.duration.toNumber() - a.account.duration.toNumber());
        if(item === options[3]) // Lowest interest
            offerList.sort((a, b) => a.account.interestAmount.toNumber() -  b.account.interestAmount.toNumber());
//        console.log(tmpOfferList)
        setOfferList(offerList);
        setValue(item)
    }

    const initialize = async() => {
        // --- getting collection image ---
        wallet.connect();

        const metaplex = new Metaplex(connection);
        await wallet.connect();
        metaplex.use(walletAdapterIdentity(wallet));

        /* const mintAddress = new PublicKey(nftList[0][1]);
        const nft = await metaplex.nfts().findByMint({ mintAddress }); */
//        const imageUrl = nft.json.image;
        const imageUrl = "https://gateway.pinata.cloud/ipfs/QmVXcoTwhhLSME8LF3TXtkTyd2ezQDzDq9suRWy1ZUN431/Royal%20Crown.gif";
        setCollectionImageUrl(imageUrl);

        // --- getting offer list---
        if (!wallet.connected) {
            return;
        }
        const provider = new anchor.AnchorProvider(connection, wallet, {});
        anchor.setProvider(provider);

        const program = new Program(
            IDL,
            MUN_PROGRAM_ID,
            provider
        );

        try {
            console.log("getting offers");
            let pools = await program.account.lenderPool.all();
            let ownerPools = await pools.filter(function(item){
                return item.account.collections.includes(collectionSymbol) && item.account.poolStatus === true;
            });
            setOfferList(ownerPools);
        } catch(e){
            return;
        }
    }
    useEffect(() => {
        if(wallet?.connected && !wallet?.disconnecting && !wallet?.connecting){
            initialize();
        }
        if (!wallet?.connected && !wallet?.disconnecting && !wallet?.connecting) {
            setOfferList([]);
        }

        if(collectionSymbol !== "MUN-PASS"){
            getCollectionStats(collectionSymbol).then((res) => {
                setFloorPrice(res.floorPrice / LAMPORTS_PER_SOL);
            }).catch((error) => {
            });
        }
        else{
            setFloorPrice(1.5);
        }
    }, [wallet])

    const startBorrow = async () => {
//        diagCtx.showLoading("Creating contracts(initialize)...");
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
          
        const [configurationPubKey] = await deriveConfigurationAccountPDA(
            NATIVE_MINT,
            program.programId
          );

          // order pda
          let configuration = await program.account.configuration.fetch(
            configurationPubKey
        );

          const [programNFTVault] = await deriveNFTAccountPDA(
            nftList[selectedNFT][0],
            configuration.orderId,
            program.programId
          );

          const [poolPubkey] = await derivePoolAccountPDA(
            configurationPubKey,
            offerList[selectedOffer].account.poolId,
            program.programId
        );

        const metaplex = new Metaplex(connection);
        metaplex.use(walletAdapterIdentity(wallet));

        const tokenAccount = await getAssociatedTokenAddress(
            nftList[selectedNFT][0],
            provider.wallet.publicKey
        );
        
        const [delegatedAuthPda] = await anchor.web3.PublicKey.findProgramAddress(
            [Buffer.from("authority")],
            program.programId
        )
        console.log("delegated authority pda: ", delegatedAuthPda.toBase58())

        console.log("nft address : ", nftList[selectedNFT][0].toBase58());
        const mintAddress = new PublicKey(
            nftList[selectedNFT][0].toBase58()
        )
        const nft = await metaplex.nfts().findByMint({ mintAddress });
        console.log(nft.edition.address.toBase58());

        console.log("poolPubkey :", poolPubkey.toBase58());

          
            const [orderPubKey] = await deriveOrderAccountPDA(
                configurationPubKey,
                configuration.orderId,
                program.programId
            );

            const userNFTAccount = await getAssociatedTokenAddress(
                nftList[selectedNFT][0],
                provider.wallet.publicKey
              );
            
            
            console.log("nftMintKey : ", nftList[selectedNFT][0].toBase58())
            console.log("userNftAccount : ", userNFTAccount.toBase58());

            diagCtx.showLoading("Creating contracts(transaction)...");

            try{
                const tx = await program.methods
                .createOrder(
                    offerList[selectedOffer].account.poolId,
                    new anchor.BN((floorPrice * (offerList[selectedOffer].account.percentFloorPrice.toNumber()) * 1.0 / 100 * LAMPORTS_PER_SOL)),
                    new anchor.BN(offerList[selectedOffer].account.interestAmount.toNumber()),
                    new anchor.BN(offerList[selectedOffer].account.duration.toNumber()),
                )
                .accounts({
                    signer: provider.wallet.publicKey,
                    configuration: configurationPubKey,
                    munSolMint: NATIVE_MINT,
                    munSolVault: munSolVault,
                    userSolVault : provider.wallet.publicKey,
                    userNftVault: userNFTAccount,
                    nftVault: programNFTVault,
                    order: orderPubKey,
                    pool : poolPubkey,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,

                    nftTokenAccount: tokenAccount,
                    nftMint: mintAddress,
                    nftEdition: new PublicKey(nft.edition.address),
                    programAuthority : delegatedAuthPda,
                    metadataProgram: METADATA_PROGRAM_ID,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    tokenProgram: TOKEN_PROGRAM_ID,
                })
                .signers([])
                .rpc();
            } catch(e){
                diagCtx.showError(e.message);
                diagCtx.hideLoading();
                return;
            }

            diagCtx.showSuccess("Successfully created loan contracts.");
            diagCtx.hideLoading();

            getCollectionOffers();
        /* const metaplex = new Metaplex(connection);
        metaplex.use(walletAdapterIdentity(wallet)); */


        /* const mintAddress = new PublicKey(
            "Ay1U9DWphDgc7hq58Yj1yHabt91zTzvV2YJbAWkPNbaK"
        );
        
        const nft = await metaplex.nfts().findByMint({ mintAddress });
    
        console.log("minted nft", nft.json); */

        /* const owner = new PublicKey(wallet.publicKey);
        const allNFTs = await metaplex.nfts().findAllByOwner({ owner });
        console.log(allNFTs); */
        return;
    }

    if (isDesktop) {
        return <Box className="mb-[16px]">
            <Box className={`px-[26px] py-[18px] bg-[#111430] ${classes} grid gap-[5px] 2xl:gap-[10px]`} gridTemplateColumns={'80px 96px 30fr 20fr 40fr 40fr 20fr'} style={{ minWidth: 'fit-content' }}>
                <Box className="w-[80px] h-[80px] bg-cover" style={{ backgroundImage: `url(${collectionImageUrl})` }} />
                <CollectionNameText className="my-auto break-all text-center">{collectionSymbol}</CollectionNameText>
                <SolanaItem value={floorPrice.toFixed(2)} style={{ minWidth: '80px' }} />
                <SolanaItem value={0} style={{ minWidth: '70px' }} />
                <Box className="flex justify-center items-center">
                    <InterestButton className="bg-[#1B1E3D] w-[32px] h-[32px] flex items-center justify-center mr-[5px] !text-[#666880]">L</InterestButton>
                    <InterestButton className="bg-[#FFBE5C] w-[32px] h-[32px] flex items-center justify-center mr-[5px]">M</InterestButton>
                    <InterestButton className="bg-[#EB5757] w-[32px] h-[32px] flex items-center justify-center mr-[5px]">H</InterestButton>
                </Box>
                <Box className="flex justify-center items-center">
                    <InterestButton className="bg-[#1B1E3D] w-[32px] h-[32px] flex items-center justify-center mr-[5px] !text-[#5C84FF]">1</InterestButton>
                    <InterestButton className="bg-[#1B1E3D] w-[32px] h-[32px] flex items-center justify-center mr-[5px] !text-[#5C84FF]">7</InterestButton>
                    <InterestButton className="bg-[#1B1E3D] w-[32px] h-[32px] flex items-center justify-center mr-[5px] !text-[#666880]">14</InterestButton>
                    <InterestButton className="bg-[#1B1E3D] w-[32px] h-[32px] flex items-center justify-center mr-[5px] !text-[#666880]">30</InterestButton>
                </Box>
                <CollectionButton className="my-auto" onClick={() => setOpen(!open)}>Borrow</CollectionButton>
            </Box>
            {(open &&
                <Box className="pt-[40px] pb-[30px] px-[25px] bg-[#1B1E3D] rounded-b-[12px] grid gap-x-[20px] 2xl:gap-x-[60px] gap-y-[20px]" gridTemplateColumns={'1fr 2fr'}>
                    <CollectionNameText className="mr-[36px] pl-[25px] ">Choose NFT</CollectionNameText>
                    <Box className="flex flex-row justify-between cursor-pointer relative">
                        <CollectionNameText className="mr-[36px] pl-[25px] ">Choose Offer</CollectionNameText>
                        <Box className="right-[0px] top-[-12px] absolute bg-[#1B1E3D] py-[10px] pl-[22px] pr-[10px] text-[14px] text-[#666880] border border-[#666880] rounded-[12px] flex flex-col"
                            onClick={() => setDropDown(!isDropdown)}>
                            <Box className="flex items-center">
                                {value}
                                {!isDropdown ? <KeyboardArrowDownIcon fontSize="small" /> : <KeyboardArrowUpIcon fontSize="small" />}
                            </Box>
                            <Box className="flex flex-col">
                                {
                                    isDropdown &&
                                    options.map((item, key) => {
                                        if (item != value)
                                            return <Box className="text-[#666880] py-[10px]" key={key} onClick={() => sortOffers(item)}>{item}</Box>
                                    })
                                }
                            </Box>
                        </Box>
                    </Box>
                    <Box className="grid grid-cols-3 2xl:grid-cols-5">
                        {
                            nftList.map((nft, key) => {
                                return <Box className={`cursor-pointer w-auto h-auto bg-cover rounded-[6px] m-[5px] bg-center ${key === selectedNFT ? "border-[2px] border-[#5C84FF]" : "" }`}
                                style={{ backgroundImage: `url(${nft[2]})`, aspectRatio: 1 }} key={key} onClick={() => setSelectedNFT(key)}/>
                            })
                        }
                    </Box>
                    <Box className="flex flex-col max-h-[300px] overflow-auto">
                        {
                            offerList.map((offer, key) => {
                                if(offer.account.depositAmount / LAMPORTS_PER_SOL < floorPrice * (offer.account.percentFloorPrice.toNumber()) * 1.0 / 100)
                                    return <></>;
                                return <Box className={`grid px-[13px] py-[13px] bg-[#111430] rounded-[12px] gap-[10px] sm:gap-[25px] mb-[10px]
                                ${key === selectedOffer ? "border-[2px] border-[#5C84FF]" : "" }`} gridTemplateColumns={'1fr 2fr 2fr 1fr'} key={key}
                                onClick={() => setSelectedOffer(key)}>
                                    <Box className="flex">
                                        <img className="mr-[5px] my-auto !h-[60px] !w-[60px] rounded-[10px]" src={collectionImageUrl} alt="Cash" />
                                        <CollectionCashText className="my-auto cursor-pointer" style={{ color: '#494D73' }}>
                                            <InfoNotify content={`Pool owner : ${offer.account.lender.toBase58()}`} />
                                        </CollectionCashText>
                                    </Box>
                                    <Box className="flex items-center justify-center">
                                        <InterestText color={`${offer.account.interestAmount == 0 ? '#38D39C' : offer.account.interestAmount == 1 ? '#FFBE5C' : '#EB5757'}`}
                                        value={offer.account.interestAmount == 0 ? 0.3 : offer.account.interestAmount == 1 ? 0.5 : 0.7} />
                                        <CollectionCashText className="ml-[5px] my-auto cursor-pointer" style={{ color: '#494D73' }}>
                                            <InfoNotify content={`Total Interest is ${offer.account.interestAmount == 0 ? 0.3 : offer.account.interestAmount == 1 ? 0.5 : 0.7}% or ${Math.fround(floorPrice * (offer.account.percentFloorPrice.toNumber()) * 1.0 / 100 * (Math.pow(1 + (offer.account.interestAmount == 0 ? 0.003 : offer.account.interestAmount == 1 ? 0.005 : 0.007), offer.account.duration.toNumber()) - 1)).toFixed(2)} SOL`} />
                                        </CollectionCashText>
                                    </Box>
                                    <Box className="flex items-center justify-center">
                                        <div className="bg-[#1B1E3D] border-none flex items-center justify-center py-[9px] px-[5px] w-full font-normal text-[14px] border rounded-[6px] !h-[32px] text-[#5C84FF]" style={{ whiteSpace: 'nowrap' }}>{offer.account.duration.toNumber()} days</div>
                                        <CollectionCashText className="ml-[5px] my-auto cursor-pointer" style={{ color: '#494D73' }}>
                                            <InfoNotify content={`You will have ${offer.account.duration.toNumber()} days to repay the loan`} />
                                        </CollectionCashText>
                                    </Box>
                                    <SolanaItem value={(floorPrice * (offer.account.percentFloorPrice.toNumber()) * 1.0 / 100).toFixed(2)} style={{ minWidth: '80px' }} />
                                </Box>
                            })
                        }
                    </Box>
                    <Box />
                    <Box className="ml-auto mt-auto">
                        <CollectionColorButton className="!font-GoodTime !w-fit" onClick={() => startBorrow()}>BORROW</CollectionColorButton>
                    </Box>
                </Box>
            )}
        </Box>
    }
    else {
        return <Box className="mb-[12px]">
            <Box className={`px-[10px] pt-[10px] pb-[32px] bg-[#111430] ${classes}`}>
                <Box className="flex mb-[30px]">
                    <Box className="w-[57px] h-[57px] bg-cover" style={{ backgroundImage: `url(${collectionImageUrl})` }} />
                    <CollectionNameText className="ml-[15px] my-auto break-all">{collectionSymbol}</CollectionNameText>
                    <CollectionButton className="ml-auto my-auto" onClick={() => setOpen(!open)}>Borrow</CollectionButton>
                </Box>
                <Box className="grid grid-cols-2">
                    <Box className="grid grid-cols-1 gap-[15px]">
                        <CollectionTitleText className="text-center !text-[#9395AA]">Floor Price</CollectionTitleText>
                        <SolanaItem value={0} />
                        <CollectionTitleText className="text-center !text-[#9395AA]">Interest</CollectionTitleText>
                        <Box className="flex justify-center items-center">
                            <InterestButton className="bg-[#1B1E3D] w-[32px] h-[32px] flex items-center justify-center mr-[5px] !text-[#666880]">L</InterestButton>
                            <InterestButton className="bg-[#FFBE5C] w-[32px] h-[32px] flex items-center justify-center mr-[5px]">M</InterestButton>
                            <InterestButton className="bg-[#EB5757] w-[32px] h-[32px] flex items-center justify-center mr-[5px]">H</InterestButton>
                        </Box>
                    </Box>
                    <Box className="grid grid-cols-1 gap-[15px]">
                        <CollectionTitleText className="text-center !text-[#9395AA]">Best Offer</CollectionTitleText>
                        <SolanaItem value={0} style={{ minWidth: '80px' }} />
                        <CollectionTitleText className="text-center !text-[#9395AA]">Duration</CollectionTitleText>
                        <Box className="flex justify-center items-center">
                            <InterestButton className="bg-[#1B1E3D] w-[32px] h-[32px] flex items-center justify-center mr-[5px] !text-[#5C84FF]">1</InterestButton>
                            <InterestButton className="bg-[#1B1E3D] w-[32px] h-[32px] flex items-center justify-center mr-[5px] !text-[#5C84FF]">7</InterestButton>
                            <InterestButton className="bg-[#1B1E3D] w-[32px] h-[32px] flex items-center justify-center mr-[5px] !text-[#666880]">14</InterestButton>
                            <InterestButton className="bg-[#1B1E3D] w-[32px] h-[32px] flex items-center justify-center mr-[5px] !text-[#666880]">30</InterestButton>
                        </Box>
                    </Box>
                </Box>
            </Box>
            {(open &&
                <Box className="pt-[40px] pb-[30px] px-[10px] bg-[#1B1E3D] rounded-b-[12px] grid">
                    <CollectionNameText className="mr-[36px] pl-[10px] mb-[20px]">Choose NFT</CollectionNameText>
                    <Box className="flex flex-wrap  mb-[20px]">
                        <Box className="w-[60px] h-[60px] bg-cover rounded-[6px] m-[5px]" style={{ backgroundImage: `url(${collectionImageUrl})` }} />
                        <Box className="w-[60px] h-[60px] bg-cover rounded-[6px] m-[5px]" style={{ backgroundImage: `url(${collectionImageUrl})` }} />
                        <Box className="w-[60px] h-[60px] bg-cover rounded-[6px] m-[5px]" style={{ backgroundImage: `url(${collectionImageUrl})` }} />
                        <Box className="w-[60px] h-[60px] bg-cover rounded-[6px] m-[5px]" style={{ backgroundImage: `url(${collectionImageUrl})` }} />
                        <Box className="w-[60px] h-[60px] bg-cover rounded-[6px] m-[5px]" style={{ backgroundImage: `url(${collectionImageUrl})` }} />
                        <Box className="w-[60px] h-[60px] bg-cover rounded-[6px] m-[5px]" style={{ backgroundImage: `url(${collectionImageUrl})` }} />
                    </Box>
                    <Box className="flex flex-row justify-between cursor-pointer relative">
                        <CollectionNameText className="mr-[36px] pl-[10px]  mb-[20px]">Choose Offer</CollectionNameText>
                        <Box className="right-[0px] top-[-6px] absolute bg-[#1B1E3D] py-[5px] pl-[10px] pr-[5px] text-[12px] text-[#666880] border border-[#666880] rounded-[12px] flex flex-col"
                            onClick={() => setDropDown(!isDropdown)}>
                            <Box className="flex items-center">
                                {value}
                                {!isDropdown ? <KeyboardArrowDownIcon fontSize="small" /> : <KeyboardArrowUpIcon fontSize="small" />}
                            </Box>
                            <Box className="flex flex-col">
                                {
                                    isDropdown &&
                                    options.map((item, key) => {
                                        if (item != value)
                                            return <Box className="text-[#666880] py-[10px]" key={key} onClick={() => setValue(item)}>{item}</Box>
                                    })
                                }
                            </Box>
                        </Box>
                    </Box>
                    <Box className="flex flex-wrap px-[13px] py-[13px] bg-[#111430] rounded-[12px] justify-between">
                        <Box className="flex">
                            <img className="mr-[5px] my-auto !h-[36px] !w-[36px] rounded-[10px]" src="/images/mint/Token.png" alt="Cash" />
                            <CollectionCashText className="my-auto cursor-pointer" style={{ color: '#494D73' }}>
                                <InfoNotify content={"Pool owner : user543556"} />
                            </CollectionCashText>
                        </Box>
                        <Box className="flex items-center justify-center">
                            <InterestMobileText color="#FFBE5C" value={2.6} />
                            <CollectionCashText className="ml-[5px] my-auto cursor-pointer" style={{ color: '#494D73' }}>
                                <InfoNotify content={"Total Interest is 2.6% or 0.029 SOL"} />
                            </CollectionCashText>
                        </Box>
                        <Box className="flex items-center justify-center">
                            <div className="bg-[#1B1E3D] border-none flex items-center justify-center py-[9px] px-[5px] w-full font-normal text-[14px] border rounded-[6px] !h-[32px] text-[#5C84FF]" style={{ whiteSpace: 'nowrap' }}>7 days</div>
                            <CollectionCashText className="ml-[5px] my-auto cursor-pointer" style={{ color: '#494D73' }}>
                                <InfoNotify content={"You will have 1 day to repay the loan"} />
                            </CollectionCashText>
                        </Box>
                        <SolanaItem value={0} style={{ minWidth: '80px' }} />
                    </Box>
                    <Box className="flex justify-center sm:justify-end mt-[30px]">
                        <CollectionColorButton className="!font-GoodTime !w-fit">BORROW</CollectionColorButton>
                    </Box>
                </Box>
            )}
        </Box>
    }
}

export default function Borrow() {
    const isDesktop = useMediaQuery('(min-width:1024px)');
    const { connection } = useConnection();
    const diagCtx = useContext(DialogContext);

    const wallet = useWallet();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

//    console.log("updated", diagCtx.collection);
        
    /* diagCtx.collection.map((collection, key) => {
        console.log(collection, key);
    }) */

    const getCollectionOffers = async () => {
        if (!wallet.connected) {
            return;
        }
        diagCtx.showLoading("Getting offers and NFT lists on  your wallet...");
        const metaplex = new Metaplex(connection);
        metaplex.use(walletAdapterIdentity(wallet));

        const owner = new PublicKey(metaplex.identity().publicKey);
        //const owner = new PublicKey("2u9bS4iGUKVJ8ZfP4VkVBA7f27b8oNABNDrEZG74gc1b");
        const allNFTs = await metaplex.nfts().findAllByOwner({ owner });

        console.log(allNFTs);
        diagCtx.setCollection({});
        try {
            allNFTs.map(async (nft) => {
                const mintAddress = new PublicKey(nft.mintAddress);
                const nftJson = await metaplex.nfts().load({ metadata : nft });
                console.log("metadata :", nftJson);
                /* const nftJson = await metaplex.nfts().findByMint({ mintAddress });
                console.log(nftJson); */
                await getNFTInfoByMintAddress(nft.mintAddress.toBase58()).then((res) => {
                    diagCtx.setCollection(collection => ({
                        ...collection,
                        [res.collection]: [
                            ...(collection[res.collection] || []),
                            [nft.mintAddress, nft.collection?.address.toBase58(), nftJson.json?.image]
            //                [nft.mintAddress, nft.collection?.address.toBase58(), res.image]
                        ]
                    }))
                    // console.log(res);
                });
            })
        } catch(e){
            diagCtx.showError(e.message);
            diagCtx.hideLoading();
            return;
        }

        diagCtx.showSuccess("Offer list updated.");
        diagCtx.hideLoading();
    }

    useEffect(() => {
        if (wallet?.connected && !wallet?.disconnecting && !wallet?.connecting) {
            console.log("getting collection offers");
            getCollectionOffers();
        }
        if (!wallet?.connected && !wallet?.disconnecting && !wallet?.connecting) {
            console.log("formatting collection offers");
            diagCtx.setCollection({});
            getCollectionOffers([]);
        }
    }, [wallet])

    return <Container>
        <Box className="mt-[30px] mx-[20px] lg:mt-[60px] lg:mx-[120px] xl:mx-[240px] 2xl:mx-[360px]">
            <Box className="flex flex-row">
                <Box className="pt-[13px] sm:pt-[15px] 2xl:pt-[30px] " style={{ width: '7px', height: 'auto', marginRight: '20px' }}>
                    <Box className="w-[7px] bg-[#5C84FF] rounded-[8px] h-[40px] lg:h-[80px]" />
                </Box>
                <Box className="flex flex-col">
                    <LandingHeaderText className="!font-GoodTime">
                        Borrow SOL
                    </LandingHeaderText>
                    <LandingCaptionText className="mb-[40px] lg:mb-[60px] xl:mb-[80px] 2xl:mb-[100px]" style={{ color: '#9395AA' }}>
                        Use your NFTs as collateral to instantly loan SOL. <br />
                        Your NFT will be locked in your wallet until the loans is repaid, If you fail to <br />
                        repay your loan on time, you may lose ownership of the NFT you<br />
                        borrowed against.
                    </LandingCaptionText>
                </Box>
            </Box>
            {
                isDesktop &&
                <Box className="hidden lg:grid px-[26px] gap-[5px] 2xl:gap-[10px]" gridTemplateColumns={'80px 96px 30fr 20fr 40fr 40fr 20fr'}>
                    <CollectionItemText className="my-auto text-center !text-[#9395AA]">Collection</CollectionItemText>
                    <CollectionNameText className="my-auto break-all !text-[#9395AA]"></CollectionNameText>
                    <CollectionItemText className="my-auto break-all text-center !text-[#9395AA]" style={{ whiteSpace: 'nowrap' }}>Floor Price</CollectionItemText>
                    <CollectionItemText className="my-auto break-all text-center !text-[#9395AA]" style={{ whiteSpace: 'nowrap' }}>Best Offer</CollectionItemText>
                    <CollectionItemText className="my-auto break-all text-center !text-[#9395AA]">Interest</CollectionItemText>
                    <CollectionItemText className="my-auto break-all text-center !text-[#9395AA]">Duration</CollectionItemText>
                    <CollectionButton className="invisible">Lend</CollectionButton>
                </Box>
            }
            <Box className="mb-[26px]" />
            {
//                Object.keys(diagCtx.collection).map(diagCtxKey => console.log(diagCtx.collection[diagCtxKey]))   
                Object.keys(diagCtx.collection).map((diagCtxKey, key) => {
                    return <BorrowItem collectionSymbol={diagCtxKey} nftList={diagCtx.collection[diagCtxKey]} key={key} getCollectionOffers={() => getCollectionOffers()}/>
                })
            }
            {/* {
                diagCtx.collections?.map((collection, i) => {
                    return <BorrowItem item={collection} key={i} />
                })
            } */}
        </Box>
    </Container>;
}