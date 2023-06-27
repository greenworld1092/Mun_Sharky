
import { useState, useEffect, useContext } from "react";

import { Box, useMediaQuery } from "@mui/material";

import styled from "styled-components";

import { SolanaText, LandingCaptionText, SolanaItem, MunF21W600, MunF16W600, MunF42W600, LandingHeaderText, ShareItemHeader, CollectionItemText, CollectionTitleText, CollectionNameText, CollectionButton, CollectionDurationText } from "../../Components";
import Container from "../Container";

import DialogContext from "../../Contexts/dialogContext";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import {
    TOKEN_PROGRAM_ID,
    NATIVE_MINT,
    getAssociatedTokenAddress,
    getOrCreateAssociatedTokenAccount
} from "@solana/spl-token";
import { PROGRAM_ID as METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import IDL from '../../Utility/Idl/idl.json';

import { deriveSCAccountPDA, deriveConfigurationAccountPDA, derivePoolAccountPDA, deriveNFTAccountPDA, deriveOrderAccountPDA, deriveTaxAccountPDA, sleep } from '../../Utility/ts/helper';
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

import { Metaplex, keypairIdentity, walletAdapterIdentity } from "@metaplex-foundation/js";
import { Connection, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";


import { getNFTInfoByMintAddress } from "../../Api/magicEden";

const MUN_PROGRAM_ID = new anchor.web3.PublicKey(
    "Cdk2qqpHx4YMtsqiCwwLJpnWQARc4kJQofY1hduvRiiX"
);


const OverviewTab = styled(ShareItemHeader)`
    background: #1B1E3D;
    border-color: #5C84FF;
    border-radius: 50px 50px 50px 50px;
    padding: 16px 35px;
    cursor: pointer;
    text-align : center;
    width : 200px;

    @media (max-width: 1024px) {
        padding: 8px 30px;
        font-size: 14px;
        line-height: 22px;
        width : 130px;
    }
`

const OfferTab = styled(ShareItemHeader)`
    background: #1B1E3D;
    border-color: #5C84FF;
    border-radius: 50px 50px 50px 50px;
    margin-left : -50px;
    padding: 16px 35px;
    cursor: pointer;
    text-align : center;
    width : 200px;

    @media (max-width: 1024px) {
        padding: 8px 30px;
        font-size: 14px;
        line-height: 22px;
        width : 130px;
        margin-left : -30px;
    }
`

const LoanTab = styled(ShareItemHeader)`
    background: #1B1E3D;
    border-radius: 50px 50px 50px 50px;
    border-color: #5C84FF;
    padding: 16px 35px;
    cursor: pointer;
    margin-left : -50px;
    text-align : center;
    width : 200px;

    @media (max-width: 1024px) {
        padding: 8px 15px;
        font-size: 14px;
        line-height: 22px;
        width : 130px;
        margin-left : -30px;
    }
`

const WaitingBadge = styled('div')`
    font-family: 'Poppins';
    font-style: normal;
    font-weight: 400;
    font-size: 8px;
    min-width : 60px !important;
    line-height: 14px;
    /* or 175% */

    text-align: center;

    color: #111430;

    background: #EB5757;
    border-radius: 40px;

    height: fit-content;
    margin-top: auto;
    margin-bottom: auto;
`

const LoanBadge = styled(WaitingBadge)`
    background: #38D39C;
`

const loanItems = [
    {img: "/images/mint/Token.png", name: "Essence", borrowed: 2.3, left: 76, duration: 96, repay: 2.3},
]

const offerItems = [
    {img: "/images/mint/Token.png", name: "Essence", offer: 1.1, interest: 0.05, APY: 260, status: 1},
    {img: "/images/mint/Token.png", name: "Essence", offer: 1.1, interest: 0.05, APY: 260, status: 2},
    {img: "/images/mint/Token.png", name: "Essence", offer: 1.1, interest: 0.05, APY: 260, status: 3},
]

function LoanItem({item, preRenderLoan}) {
    const isDesktop = useMediaQuery('(min-width:1024px)');

    const { connection } = useConnection();
    const wallet = useWallet();

    const [nftImageUrl, setNftImageUrl] = useState("");
    const [nftName, setNftName] = useState("");
    const [borrowAmount, setBorrowAmount] = useState(0);
    const [duration, setDuration] = useState(0);
    const [repayAmount, setRepayAmount] = useState(0);
    const [status, setStatus] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const diagCtx = useContext(DialogContext);

    const repay = async() => {
        diagCtx.showLoading("Repaying ...");
        const provider = new anchor.AnchorProvider(connection, wallet, {});
        anchor.setProvider(provider);

        diagCtx.showLoading("Repaying ( getting lender's Tier level... )");
        const metaplex = new Metaplex(connection);
        await wallet.connect();
        metaplex.use(walletAdapterIdentity(wallet));

        const owner = new PublicKey(item.account.lender);
        const allNFTs = await metaplex.nfts().findAllByOwner({
            owner
        });

        let tier_level = 1;
        for (var j = 0; j < allNFTs.length; j++) {
            const mintAddress = new PublicKey(allNFTs[j].mintAddress);
            const nftJson = await metaplex.nfts().findByMint({
                mintAddress
            });

            const res = await getNFTInfoByMintAddress(allNFTs[j].mintAddress.toBase58());
            for (var i = 0; i < res.attributes.length; i++) {
                console.log(i, res.attributes[i].trait_type, res.attributes[i].value);
                if (res.attributes[i].trait_type === 'Level' && res.attributes[i].value > tier_level)
                    tier_level = res.attributes[i].value;
            }
        }

        console.log("Tier Level", tier_level);

        diagCtx.showLoading("Repaying ( getting necessary variables...)");
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

        // order pda
        let configuration = await program.account.configuration.fetch(
            configurationPubKey
        );


        const nftMint = new PublicKey(item.account.nftMint);

        const tokenAccount = await getAssociatedTokenAddress(
            nftMint,
            provider.wallet.publicKey
        );

        const [programNFTVault] = await deriveNFTAccountPDA(
            nftMint,
            item.account.orderId,
            program.programId
        );

        console.log(programNFTVault.toBase58());

        const mintAddress = new PublicKey(
            nftMint.toBase58()
        )
        const nft = await metaplex.nfts().findByMint({ mintAddress });
        console.log(nft.edition.address.toBase58());

        const [poolPubkey] = await derivePoolAccountPDA(
            configurationPubKey,
            item.account.poolId,
            program.programId
        );

        console.log("poolPubkey :", poolPubkey.toBase58());


        const [orderPubKey] = await deriveOrderAccountPDA(
            configurationPubKey,
            item.account.orderId,
            program.programId
        );

        console.log("orderPubKey", orderPubKey.toBase58());

        diagCtx.showLoading("Repaying ( sending transactions... )")
        try {
            const tx = await program.methods
                .cancelOrder(
                    item.account.poolId,
                    item.account.orderId,
                    new anchor.BN(tier_level)
                )
                .accounts({
                    signer: provider.wallet.publicKey,
                    configuration: configurationPubKey,
                    munSolMint: NATIVE_MINT,
                    munSolVault: munSolVault,
                    munTaxVault: munTaxVault,
                    userSolVault: provider.wallet.publicKey,

                    nftVault: programNFTVault,
                    order: orderPubKey,
                    pool: poolPubkey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,

                    nftTokenAccount: tokenAccount,
                    nftMint: mintAddress,
                    nftEdition: new PublicKey(nft.edition.address),
                    metadataProgram: METADATA_PROGRAM_ID,
                })
                .signers([])
                .rpc();


            console.log("Your transaction signature", tx);
        } catch (e) {
            diagCtx.showError(e.message);
            diagCtx.hideLoading();
            return;
        }
        diagCtx.showSuccess("Repay success.");
        diagCtx.hideLoading();

        setStatus(0);
        preRenderLoan();
    }

    const initialize = async () => {
        await getNFTInfoByMintAddress(item.account.nftMint.toBase58()).then(async (res) => {
            setNftImageUrl(res.image);
            setNftName(res.collection);
            setBorrowAmount(Math.fround(item.account.requestAmount.toNumber() / LAMPORTS_PER_SOL).toFixed(2));
            setDuration(item.account.duration.toNumber());

            if(item.account.interest.toNumber() == 0)
                setRepayAmount(Math.fround(item.account.requestAmount.toNumber() / LAMPORTS_PER_SOL * (Math.pow(1 + 0.003, item.account.duration.toNumber()))).toFixed(2));
            if(item.account.interest.toNumber() == 1)
                setRepayAmount(Math.fround(item.account.requestAmount.toNumber() / LAMPORTS_PER_SOL * (Math.pow(1 + 0.005, item.account.duration.toNumber()))).toFixed(2));
            if(item.account.interest.toNumber() == 2)
                setRepayAmount(Math.fround(item.account.requestAmount.toNumber() / LAMPORTS_PER_SOL * (Math.pow(1 + 0.007, item.account.duration.toNumber()))).toFixed(2));
            //setRepayAmount(Math.fround(item.account.requestAmount.toNumber() / LAMPORTS_PER_SOL).toFixed(2));

            const slot = await connection.getSlot();
                const timestamp = await connection.getBlockTime(slot);
                setCurrentTime(timestamp);
            if(item.account.orderStatus === false){
                setStatus(0); //repayed
            }
            if(item.account.orderStatus === true){
                setStatus(1); //loans taken
            }
        });
    }

    useEffect(() => {
        initialize();
    }, [])

    if (isDesktop) {
        return <Box className="mb-[16px]">
            <Box className={`px-[26px] py-[18px] bg-[#111430] rounded-[12px] grid gap-[20px] 2xl:gap-[40px]`} gridTemplateColumns={'85px 110px 3fr 3fr 2fr auto'}>
                <Box className="w-[80px] h-[80px] bg-cover" style={{backgroundImage: `url(${nftImageUrl})`}} />
                <CollectionNameText className="my-auto break-all">{nftName}</CollectionNameText>
                <SolanaItem value={borrowAmount}/>
                <Box className="my-auto">
                    { status == 1 && <>
                    <CollectionDurationText className="text-center">{parseInt((item.account.loanStartTime.toNumber() + 3600 * 24 * item.account.duration.toNumber() - currentTime) / (3600 * 24))}&nbsp;Days&nbsp;and&nbsp;{parseInt(((item.account.loanStartTime.toNumber() + 3600 * 24 * item.account.duration.toNumber() - currentTime) % (3600 * 24)) / 3600)}&nbsp;Hours&nbsp;Left</CollectionDurationText>
                    <Box className="mt-[4px] h-[18px] rounded-[10px] bg-[#191E46]">
                        <Box className="rounded-[20px] h-full" sx={{background: "linear-gradient(0deg, #A8B5E0, #A8B5E0), linear-gradient(0deg, #A8B5E0, #A8B5E0), #A8B5E0;",
                    width : `${100 - parseInt(((currentTime - item.account.loanStartTime.toNumber()) / (item.account.duration.toNumber() * 3600 * 24)) * 100)}%`}} />
                    </Box></>
                    }
                    {
                      status == 0 && <>
                      <CollectionDurationText className="text-center">Repayed {parseInt((currentTime - item.account.paidBackAt.toNumber()) / (3600 * 24))} days ago</CollectionDurationText>
                      </>
                    }
                </Box>
                <SolanaItem value={repayAmount}/>
                { status == 1 &&
                <CollectionButton className="my-auto" onClick={() => repay()}>Repay</CollectionButton>
                }
                {
                    status == 0 &&
                    <div className="w-[125px] 2xl:w-[174px]"></div>
                }
            </Box>
        </Box>
    }
    else {
        return <Box className="mb-[12px]">
            <Box className={`px-[10px] pt-[10px] pb-[32px] bg-[#111430] rounded-[12px]`}>
                <Box className="flex mb-[30px]">
                    <Box className="w-[57px] h-[57px] bg-cover" style={{backgroundImage: `url(${item.img})`}} />
                    <CollectionNameText className="ml-[15px] my-auto break-all">{item.name}</CollectionNameText>
                    <CollectionButton className="ml-auto my-auto">Repay</CollectionButton>
                </Box>
                <Box className="px-[40px]">
                    <Box className="flex justify-center mb-[30px]">
                        <Box className="mr-[54px] flex flex-col items-center">
                            <CollectionTitleText className="mb-[4px]">Borrowed</CollectionTitleText>
                            <SolanaItem value={item.borrowed} className="flex mt-[7px]"/>
                        </Box>
                        <Box className=" flex flex-col items-center">
                            <CollectionTitleText className="mb-[4px]">Repay</CollectionTitleText>
                            <SolanaItem value={item.repay} className="flex mt-[7px]"/>
                        </Box>
                    </Box>
                    <CollectionDurationText className="text-center">3&nbsp;Days&nbsp;and&nbsp;4&nbsp;Hours&nbsp;Left</CollectionDurationText>
                    <Box className="mt-[4px] h-[18px] rounded-[10px] bg-[#191E46]">
                        <Box className="rounded-[20px] w-[60%] h-full" sx={{background: "linear-gradient(0deg, #A8B5E0, #A8B5E0), linear-gradient(0deg, #A8B5E0, #A8B5E0), #A8B5E0;"}} />
                    </Box>
                </Box>
            </Box>
        </Box>
    }
}

function OfferItem({item, preRenderOffer}) {
    const isDesktop = useMediaQuery('(min-width:1024px)');

    const { connection } = useConnection();
    const wallet = useWallet();

    const [nftImageUrl, setNftImageUrl] = useState("");
    const [nftName, setNftName] = useState("");
    const [loanAmount, setLoanAmount] = useState(0);
    const [interest, setInterest] = useState(0);
    const [interestApy, setInterestApy] = useState(0);
    const [status, setStatus] = useState(0);

    const [currentTime, setCurrentTime] = useState(0);

    const diagCtx = useContext(DialogContext);

    const repose = async() => {
        diagCtx.showLoading("Reposing ...");
        const provider = new anchor.AnchorProvider(connection, wallet, {});
        anchor.setProvider(provider);

        diagCtx.showLoading("Repaying ( getting lender's Tier level... )");
        const metaplex = new Metaplex(connection);
        
        await wallet.connect();
        metaplex.use(walletAdapterIdentity(wallet));

        diagCtx.showLoading("Repaying ( getting necessary variables...)");
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

        // order pda
        let configuration = await program.account.configuration.fetch(
            configurationPubKey
        );


        const nftMint = new PublicKey(item.account.nftMint);
        const [programNFTVault] = await deriveNFTAccountPDA(
            nftMint,
            item.account.orderId,
            program.programId
        );

        const userNFTAccount = await getAssociatedTokenAddress(
            nftMint,
            provider.wallet.publicKey
          );

        const borrower = new PublicKey(item.account.borrower);
        const borrowerNFTAccount = await getAssociatedTokenAddress(
            nftMint,
            borrower
          );

        console.log(programNFTVault.toBase58());

        const mintAddress = new PublicKey(
            nftMint.toBase58()
        )
        const nft = await metaplex.nfts().findByMint({ mintAddress });
        console.log(nft.edition.address.toBase58());

        const [poolPubkey] = await derivePoolAccountPDA(
            configurationPubKey,
            item.account.poolId,
            program.programId
        );

        console.log("poolPubkey :", poolPubkey.toBase58());


        const [orderPubKey] = await deriveOrderAccountPDA(
            configurationPubKey,
            item.account.orderId,
            program.programId
        );


        diagCtx.showLoading("Repaying ( sending transactions... )")
        try {
            const tx = await program.methods
                .repose(
                    item.account.poolId,
                    item.account.orderId
                )
                .accounts({
                    signer: provider.wallet.publicKey,
                    configuration: configurationPubKey,
                    munSolMint: NATIVE_MINT,
                    munSolVault: munSolVault,
                    userNftVault : userNFTAccount,
                    borrowerNftVault : borrowerNFTAccount,
                    nftMint: nftMint,
                    nftVault: programNFTVault,
                    order: orderPubKey,
                    pool: poolPubkey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,

                    nftTokenAccount: borrowerNFTAccount,
                    nftEdition: new PublicKey(nft.edition.address),
                    metadataProgram: METADATA_PROGRAM_ID,
                })
                .signers([])
                .rpc();


            console.log("Your transaction signature", tx);
        } catch (e) {
            diagCtx.showError(e.message);
            diagCtx.hideLoading();
            return;
        }
        diagCtx.showSuccess("Repay success.");
        diagCtx.hideLoading();

        setStatus(0);
        preRenderOffer();
    }

    const initialize = async () => {
        await getNFTInfoByMintAddress(item.account.nftMint.toBase58()).then(async (res) => {
            setNftImageUrl(res.image);
            setNftName(res.collection);
            setLoanAmount(Math.fround(item.account.requestAmount.toNumber() / LAMPORTS_PER_SOL).toFixed(2));
            if(item.account.interest.toNumber() == 0){
                //parseFloat(depositAmount * Math.pow((1 + (interest == 0 ? 0.003 : (interest == 1 ? 0.005 : (interest == 2? 0.007 : 0)))), 7) - depositAmount).toFixed(1)
                setInterest(Math.fround(item.account.requestAmount.toNumber() / LAMPORTS_PER_SOL * (Math.pow(1 + 0.003, item.account.duration.toNumber()) - 1)).toFixed(2));
                setInterestApy(200);
            }
            if(item.account.interest.toNumber() == 1){
                setInterest(Math.fround(item.account.requestAmount.toNumber() / LAMPORTS_PER_SOL * (Math.pow(1 + 0.005, item.account.duration.toNumber()) - 1)).toFixed(2));
                //100 + (100 * 0.3% * 7) = 100 + (100 * 0.003 * 7) = 100 + 0.21 = 100.21 USD
                setInterestApy(500);
            }
            if(item.account.interest.toNumber() == 2){
                setInterest(Math.fround(item.account.requestAmount.toNumber() / LAMPORTS_PER_SOL * (Math.pow(1 + 0.007, item.account.duration.toNumber()) - 1)).toFixed(2));
                setInterestApy(1300);
            }
            const slot = await connection.getSlot();
            const timestamp = await connection.getBlockTime(slot);
            setCurrentTime(timestamp);
            if(item.account.orderStatus === false){
                setStatus(0); //repayed
            }
            if(item.account.orderStatus === true){
                if(timestamp - item.account.loanStartTime.toNumber() > item.account.duration.toNumber() * 3600)
                    setStatus(1);
                else
                    setStatus(2); //loans taken
            }
        });
    }

    useEffect(() => {
        initialize();
    }, [])

    if (isDesktop) {
        return <Box className="mb-[16px]">
            <Box className={`px-[26px] py-[18px] bg-[#111430] rounded-[12px] grid gap-[20px] 2xl:gap-[40px]`} gridTemplateColumns={'80px 100px 2fr 2fr 1fr 1fr auto'}>
                <Box className="w-[80px] h-[80px] bg-cover" style={{backgroundImage: `url(${nftImageUrl})`}} />
                <CollectionNameText className="my-auto break-all">{nftName}</CollectionNameText>
                <SolanaItem value={loanAmount}/>
                <SolanaItem value={interest}/>
                <CollectionItemText className="my-auto !text-[#38D39C] text-center">{interestApy}&nbsp;%</CollectionItemText>
                {
                    status == 1 ?
                    <LoanBadge className="p-[2px]">Loan&nbsp;Token</LoanBadge>
                    : status == 2 ? <WaitingBadge className="p-[2px]">Loan&nbsp;Overdue</WaitingBadge>
                    : <LoanBadge className="p-[2px] !bg-[#9395AA]">Repayed</LoanBadge>
                }
                {
                    status == 1 ?
                    <Box className="my-auto w-[125px] 2xl:w-[174px]">
                        <CollectionDurationText className="text-center">{parseInt((item.account.loanStartTime.toNumber() + 3600 * 24 * item.account.duration.toNumber() - currentTime) / (3600 * 24))}&nbsp;Days&nbsp;and&nbsp;{parseInt(((item.account.loanStartTime.toNumber() + 3600 * 24 * item.account.duration.toNumber() - currentTime) % (3600 * 24)) / 3600)}&nbsp;Hours&nbsp;Left</CollectionDurationText>
                        <Box className="mt-[4px] h-[18px] rounded-[10px] bg-[#191E46]">
                            <Box className={`rounded-[20px] h-full`} sx={{background: "linear-gradient(0deg, #A8B5E0, #A8B5E0), linear-gradient(0deg, #A8B5E0, #A8B5E0), #A8B5E0;",
                        width : `${100 - parseInt(((currentTime - item.account.loanStartTime.toNumber()) / (item.account.duration.toNumber() * 3600 * 24)) * 100)}%`}} />
                        </Box>
                    </Box>
                    : status == 2 ? <CollectionButton className="my-auto" onClick={() => repose()}>Reposses&nbsp;Asset</CollectionButton>
                    : <CollectionItemText className="my-auto !text-[#9395AA] w-[125px] 2xl:w-[174px]">Repayed&nbsp;{parseInt((currentTime - item.account.paidBackAt.toNumber()) / (3600 * 24))}&nbsp;days&nbsp;ago</CollectionItemText>
                }
                
            </Box>
        </Box>
    }
    else {
        return <Box className="mb-[12px]">
            <Box className={`px-[10px] pt-[10px] pb-[32px] bg-[#111430] rounded-[12px]`}>
                <Box className="flex mb-[30px]">
                    <Box className="w-[57px] h-[57px] bg-cover" style={{backgroundImage: `url(${item.img})`}} />
                    <CollectionNameText className="ml-[15px] my-auto break-all mr-auto">{item.name}</CollectionNameText>
                    {
                        item.status == 1 ? <LoanBadge className="px-[20px] py-[7px] !text-[13px]">Loan&nbsp;Token</LoanBadge> : 
                        item.status == 2 ? <WaitingBadge className="px-[20px] py-[7px] !text-[13px]">Loan&nbsp;Overdue</WaitingBadge>
                        : <CollectionDurationText className="my-auto !text-[13px] px-[20px] py-[7px]">Repayed 4 days ago</CollectionDurationText>
                    }
                </Box>
                <Box className="grid grid-cols-3 gap-[4px] px-[15px]">
                    <CollectionTitleText className="text-center !text-[#9395AA]">{item.status == 3 ? "Your offer" : "Loan"}</CollectionTitleText>
                    <CollectionTitleText className="text-center !text-[#9395AA]">Interest</CollectionTitleText>
                    <CollectionTitleText className="text-center !text-[#9395AA]">APY</CollectionTitleText>
                    <SolanaItem value={item.offer} className="flex mt-[7px] justify-center"/>
                    <SolanaItem value={item.interest} className="flex mt-[7px] justify-center"/>
                    <SolanaText className="my-auto break-all mt-[7px] text-center">{item.APY} %</SolanaText>
                </Box>
                <Box className="flex justify-center">
                    <Box className="w-[203px]">
                    {
                        item.status == 1 ?
                        <Box>
                            <CollectionDurationText className="text-center mt-[30px] !text-[13px]">3 Days and 4 Hours Left</CollectionDurationText>
                            <Box className="mt-[5px] h-[18px] rounded-[10px] bg-[#191E46]">
                                <Box className="rounded-[20px] w-[60%] h-full" sx={{background: "linear-gradient(0deg, #A8B5E0, #A8B5E0), linear-gradient(0deg, #A8B5E0, #A8B5E0), #A8B5E0;"}} />
                            </Box>
                        </Box>
                        : item.status == 2 ? <Box className="flex justify-center mt-[30px]"><CollectionButton className="my-auto">Reposses Asset</CollectionButton></Box>
                        : ""
                    }
                    </Box>
                </Box>
            </Box>
        </Box>
    }
}

export default function Profile() {
    const [state, setState] = useState(0);
    const isDesktop = useMediaQuery('(min-width:1024px)');

    const diagCtx = useContext(DialogContext);

    const { connection } = useConnection();
    const wallet = useWallet();
    const walletModal = useWalletModal();
    
    //---------overview-------
    const [myPoolCount, setMyPoolCount] = useState(0);
    const [myPoolSize, setMyPoolSize] = useState(0);

    const [loansGranted, setLoansGranted] = useState(0);
    const [loansTaken, setLoansTaken] = useState(0);

    const [myTotalEarned, setMyTotalEarned] = useState(0);

    const [totalLiquidity, setTotalLiquidity] = useState(0);
    const [totalVolume, setTotalVolume] = useState(0);
    const [totalLoan, setTotalLoan] = useState(0);

    //--------offer------
    const [offerList, setOfferList] = useState([]);

    //--------loan------
    const [loanList, setLoanList] = useState([]);
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [])
    
    /* useEffect(() => {
        if(wallet?.connected && !wallet?.disconnecting && !wallet?.connecting){
            if(state === 0)
                preRenderOverview();
            if(state === 1)
                preRenderOffer();
            if(state === 2)
                preRenderLoan();
        }
        if (!wallet?.connected && !wallet?.disconnecting && !wallet?.connecting) {
        }
    }, [wallet]) */

    useEffect(() => {
        if(wallet?.connected && !wallet?.disconnecting && !wallet?.connecting){
            if(state === 0)
                preRenderOverview();
            if(state === 1)
                preRenderOffer();
            if(state === 2)
                preRenderLoan();
        }
        if (!wallet?.connected && !wallet?.disconnecting && !wallet?.connecting) {
        }
    }, [state])

    const preRenderLoan = async () => {
        diagCtx.showLoading("Setting loan variables...");
        const provider = new anchor.AnchorProvider(connection, wallet, {});
        anchor.setProvider(provider);

        const program = new Program(
            IDL,
            MUN_PROGRAM_ID,
            provider
        );

        try {
            let contracts = await program.account.order.all();
            let ownerContracts = await contracts.filter(function(item){
                return item.account.borrower.toBase58() == provider.wallet.publicKey;
            });
            setLoanList(ownerContracts);
        } catch(e){
            diagCtx.showError(e.message);
            diagCtx.hideLoading();
            return;
        }
        diagCtx.hideLoading();
        diagCtx.showSuccess("Updated your loan list.");
    }

    const renderLoan = () => {
        return <>
            {
                isDesktop ?
                <Box className="hidden lg:grid px-[26px] gap-[20px] 2xl:gap-[40px]" gridTemplateColumns={'85px 110px 3fr 3fr 2fr auto'}>
                    <CollectionItemText className="my-auto break-all text-center !text-[#9395AA]">Collection</CollectionItemText>
                    <Box />
                    <CollectionItemText className="my-auto break-all text-center !text-[#9395AA]">Borrowed</CollectionItemText>
                    <CollectionItemText className="my-auto break-all text-center !text-[#9395AA]">Duration</CollectionItemText>
                    <CollectionItemText className="my-auto break-all text-center !text-[#9395AA]">Repay</CollectionItemText>
                    <CollectionButton className="invisible">Repay</CollectionButton>
                </Box>
                :
                <ShareItemHeader>
                    Collections
                </ShareItemHeader>
            }
            <Box className="mb-[26px]" />
            {
                loanList.map((item, i) => {
                    return <LoanItem item={item} key={i} preRenderLoan={() => preRenderLoan()}/>
                })
            }
        </>
    }

    const preRenderOffer = async () => {
        diagCtx.showLoading("Setting offer variables...");
        const provider = new anchor.AnchorProvider(connection, wallet, {});
        anchor.setProvider(provider);

        const program = new Program(
            IDL,
            MUN_PROGRAM_ID,
            provider
        );

        try {
            let contracts = await program.account.order.all();
            let ownerContracts = await contracts.filter(function(item){
                return item.account.lender.toBase58() == provider.wallet.publicKey;
            });
            setOfferList(ownerContracts);
        } catch(e){
            diagCtx.showError(e.message);
            diagCtx.hideLoading();
            return;
        }
        diagCtx.hideLoading();
        diagCtx.showSuccess("Updated your offer list.");
    }

    const renderOffer = () => {
        return <>
            {
                isDesktop ?
                <Box className="hidden lg:grid px-[26px] gap-[20px] 2xl:gap-[40px]" gridTemplateColumns={'85px 100px 2fr 2fr 1fr 1fr auto'}>
                    <CollectionItemText className="my-auto break-all !text-[#9395AA] text-center">Collection</CollectionItemText>
                    <CollectionButton className="invisible break-all">Essence</CollectionButton>
                    <CollectionItemText className="my-auto !text-[#9395AA] text-center">Loan amount</CollectionItemText>
                    <CollectionItemText className="my-auto !text-[#9395AA] text-center">Interest</CollectionItemText>
                    <CollectionItemText className="my-auto !text-[#9395AA] text-center">APY</CollectionItemText>
                    <CollectionItemText className="my-auto break-all !text-[#9395AA] text-center" style={{whiteSpace : 'nowrap'}}>Status</CollectionItemText>
                    <CollectionButton className="invisible">Revoke</CollectionButton>
                </Box>
                :
                <ShareItemHeader>
                    Collections
                </ShareItemHeader>
            }
            <Box className="mb-[26px]" />
            {
                offerList.map((item, i) => {
                    return <OfferItem item={item} key={i} preRenderOffer={() => preRenderOffer()}/>
                })
            }
        </>
    }

    const preRenderOverview = async () => {
        diagCtx.showLoading("Setting overview variables...");
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
            setMyPoolCount(ownerPools.length);
            let myPoolSize = 0, myTotalEarned = 0;
            for(var i = 0; i < ownerPools.length; i++){
                myPoolSize += ownerPools[i].account.depositAmount.toNumber();
                myTotalEarned += ownerPools[i].account.earnedAmount.toNumber();
            }
            setMyPoolSize(Math.fround(myPoolSize / LAMPORTS_PER_SOL).toFixed(2));
            setMyTotalEarned(Math.fround(myTotalEarned / LAMPORTS_PER_SOL).toFixed(2));

            let contracts = await program.account.order.all();
            
            let sumLoanGranted = 0, sumLoanTaken = 0;
            for(var i = 0; i < contracts.length; i++){
                if(contracts[i].account.orderStatus === true && contracts[i].account.lender.toBase58() == provider.wallet.publicKey)
                    sumLoanGranted += contracts[i].account.requestAmount.toNumber();
                if(contracts[i].account.orderStatus === true && contracts[i].account.borrower.toBase58() == provider.wallet.publicKey)
                    sumLoanTaken += contracts[i].account.requestAmount.toNumber();
            }
            setLoansGranted(Math.fround(sumLoanGranted / LAMPORTS_PER_SOL).toFixed(2));
            setLoansTaken(Math.fround(sumLoanTaken / LAMPORTS_PER_SOL).toFixed(2));

            const [munSolVault] = await deriveSCAccountPDA(
                NATIVE_MINT,
                program.programId
            );

            let munSolVaultBalance = await connection.getBalance(new anchor.web3.PublicKey(munSolVault));
            let totalLoans = 0;
            setTotalLiquidity(Math.fround(munSolVaultBalance / LAMPORTS_PER_SOL).toFixed(2));

            for(var i = 0; i < contracts.length; i++){
                if(contracts[i].account.orderStatus === true){
                    totalLoans += contracts[i].account.requestAmount.toNumber();
                }
            }
            setTotalVolume(Math.fround((munSolVaultBalance + totalLoans) / LAMPORTS_PER_SOL).toFixed(2));
            setTotalLoan(Math.fround(totalLoans / LAMPORTS_PER_SOL).toFixed(2));
        } catch(e){
            diagCtx.showError(e.message);
            diagCtx.hideLoading();
            return;
        }
        diagCtx.hideLoading();
        diagCtx.showSuccess("Updated your pools list.");
    }

    const renderOverview = () => {
        return <>
            <Box className="lg:grid gap-[20px] 2xl:gap-[25px] grid-cols-1 sm:grid-cols-3" gridTemplateColumns={'1fr 1fr 1fr'}>
                <Box className="flex flex-col bg-[#1B1E3D] rounded-[12px] p-[35px] justify-center mb-[10px]">
                    <Box className="flex justify-center mb-[35px]">
                        <MunF21W600 className="!text-[#D3D5E3]">My Pools</MunF21W600>
                    </Box>
                    <Box className="flex justify-around">
                        <MunF21W600 className="!text-[#D3D5E3]">{myPoolSize} SOL</MunF21W600>
                        <MunF21W600 className="!text-[#D3D5E3]">{myPoolCount} Pools</MunF21W600>
                    </Box>
                </Box>
                <Box className="flex flex-col mb-[10px]">
                    <Box className="flex justify-around  bg-[#1B1E3D] rounded-[12px] p-[35px] mb-[10px]">
                        <MunF16W600 className="!text-[#D3D5E3]">Loans Granted</MunF16W600>
                        <SolanaItem value={loansGranted}/>
                    </Box>
                    <Box className="flex justify-around  bg-[#1B1E3D] rounded-[12px] p-[35px]">
                        <MunF16W600 className="!text-[#D3D5E3]">Loans Taken</MunF16W600>
                        <SolanaItem value={loansTaken}/>
                    </Box>
                </Box>
                <Box className="flex flex-col bg-[#1B1E3D] rounded-[12px] p-[35px] justify-center mb-[10px]">
                    <Box className="flex justify-center mb-[35px]">
                        <MunF21W600 className="!text-[#D3D5E3]">Total Solana Earned</MunF21W600>
                    </Box>
                    <Box className="flex justify-center items-center">
                        <img className="my-auto h-[34px] mr-[10px]" src="/images/sol.png" alt="SolanaText"/>
                        <MunF42W600 className="!text-[#D3D5E3] !text-[36px] sm:text-[42px]">{myTotalEarned}</MunF42W600>
                    </Box>
                </Box>
                <Box className="flex flex-col bg-[#1B1E3D] rounded-[12px] p-[35px] justify-center mb-[10px]">
                    <Box className="flex justify-center mb-[35px]">
                        <MunF21W600 className="!text-[#D3D5E3]">Total Liquidity</MunF21W600>
                    </Box>
                    <Box className="flex justify-center items-center">
                        <img className="my-auto h-[24px] 2xl:h-[34px] mr-[10px]" src="/images/sol.png" alt="SolanaText"/>
                        <MunF42W600 className="!text-[#D3D5E3]">{totalLiquidity}</MunF42W600>
                    </Box>
                </Box>
                <Box className="flex flex-col bg-[#1B1E3D] rounded-[12px] p-[35px] justify-center mb-[10px]">
                    <Box className="flex justify-center mb-[35px]">
                        <MunF21W600 className="!text-[#D3D5E3]">Total Volume</MunF21W600>
                    </Box>
                    <Box className="flex justify-center items-center">
                        <img className="my-auto h-[24px] 2xl:h-[34px] mr-[10px]" src="/images/sol.png" alt="SolanaText"/>
                        <MunF42W600 className="!text-[#D3D5E3]">{totalVolume}</MunF42W600>
                    </Box>
                </Box>
                <Box className="flex flex-col bg-[#1B1E3D] rounded-[12px] p-[35px] justify-center mb-[10px]">
                    <Box className="flex justify-center mb-[35px]">
                        <MunF21W600 className="!text-[#D3D5E3]">Total Loans</MunF21W600>
                    </Box>
                    <Box className="flex justify-center items-center">
                        <img className="my-auto h-[24px] 2xl:h-[34px] mr-[10px]" src="/images/sol.png" alt="SolanaText"/>
                        <MunF42W600 className="!text-[#D3D5E3]">{totalLoan}</MunF42W600>
                    </Box>
                </Box>
            </Box>
    </>
    }

    return <Container>
        <Box className="mt-[30px] mx-[20px] lg:mt-[60px] lg:mx-[120px] xl:mx-[240px] 2xl:mx-[360px]">
            <Box className="flex flex-row">
                <Box className="pt-[13px] sm:pt-[15px] 2xl:pt-[30px] " style={{width : '7px', height : 'auto', marginRight : '20px'}}>
                    <Box className="w-[7px] bg-[#5C84FF] rounded-[8px] h-[60px] lg:h-[100px]"/>
                </Box>
                <Box className="flex flex-col">
                    <LandingHeaderText className="!font-GoodTime">
                        DASHBOARD
                    </LandingHeaderText>
                    <LandingCaptionText className="mb-[40px] lg:mb-[60px] xl:mb-[80px] 2xl:mb-[100px]" style={{color : '#9395AA'}}>
                        Your dashboard is where you can preview and manage your loans as well<br/>
                        as checking your account stats.
                    </LandingCaptionText>
                </Box>
            </Box>
            <Box className="flex mb-[32px]">
                <OverviewTab className={`${state == 0 ? "border-[1px] z-[10]" : "z-[0]"}`} onClick={() => setState(0)}>Overview</OverviewTab>
                <OfferTab className={`${state == 1 ? "border-[1px] z-[10]" : "z-[0]"}`} onClick={() => setState(1)}>Offers</OfferTab>
                <LoanTab className={`${state == 2 ? "border-[1px] z-[10]" : "z-[0]"}`} onClick={() => setState(2)}>Loans</LoanTab>
            </Box>
            {
                state == 1 ? renderOffer() : (state == 2 ? renderLoan() : renderOverview())
            }
        </Box>
    </Container>;
}