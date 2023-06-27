
import { useState, useRef, useContext, useEffect } from "react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import axios from 'axios';
import DialogContext from "../../Contexts/dialogContext";
import { Box, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { NavTextActive, NavText, ColorButton, MobileNavText } from "../../Components";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import "./WalletMultiButton.css";

import { location } from '../../Api/config';
import { getUserPFP } from "../../Api/fetch";

import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";

import IDL from '../../Utility/Idl/idl.json';
import {
    TOKEN_PROGRAM_ID,
    NATIVE_MINT,
} from "@solana/spl-token";
import { deriveSCAccountPDA, deriveConfigurationAccountPDA, derivePoolAccountPDA, deriveNFTAccountPDA, deriveOrderAccountPDA } from '../../Utility/ts/helper';

const MUN_PROGRAM_ID = new anchor.web3.PublicKey(
    "Cdk2qqpHx4YMtsqiCwwLJpnWQARc4kJQofY1hduvRiiX"
);

function NavItem({active, title, url}) {
    const navigate = useNavigate();
    const className = "ml-[40px] 2xl:ml-[60px] cursor-pointer";
    return active === true ?
        <Box className="flex flex-col justify-center items-center">
            <NavTextActive className={className} onClick={() => navigate(url)}>{title}</NavTextActive>
            <Box className="ml-[40px] 2xl:ml-[60px] mt-[7px] h-[7px] w-[7px] rounded-[7px] bg-[#5C84FF]"></Box>
        </Box>
    :
        <Box className="flex flex-col justify-center">
            <NavText className={className} onClick={() => navigate(url)}>{title}</NavText>
            <Box className="ml-[40px] 2xl:ml-[60px] mt-[7px] h-[7px] w-[7px] rounded-[7px] bg-[#5C84FF]" style={{opacity : 0}}></Box>
        </Box>
}

function MobileNavItem({active, title, url}) {
    const navigate = useNavigate();
    return active === true ?
        <MobileNavText className="cursor-pointer bg-[#222548]" onClick={() => navigate(url)}>{title}</MobileNavText>
    :
        <MobileNavText className="cursor-pointer" onClick={() => navigate(url)}>{title}</MobileNavText>
}

const routes_client = [
    {title: "Home", url: "/home"},
    {title: "Dashboard", url: "/my-profile"},
    {title: "Lend", url: "/lend"},
    {title: "Borrow", url: "/borrow"},
]

const routes_admin = [
    {title: "Home", url: "/home"},
    {title: "Dashboard", url: "/my-profile"},
    {title: "Lend", url: "/lend"},
    {title: "Borrow", url: "/borrow"},
    {title: "Admin", url: "/admin"},
]

export default function Header() {
    const isDesktop = useMediaQuery('(min-width:1024px)');
    const diagCtx = useContext(DialogContext);

    const hash = window.location.hash;
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [pfpUri, setPfpUri] = useState(null);
    const profileRef = useRef(null);
    const wallet = useWallet();
    const walletModal = useWalletModal();
    const { connection } = useConnection();

    const initialize = async () => {        
        const provider = new anchor.AnchorProvider(connection, wallet, {});
        anchor.setProvider(provider);

        const program = new Program(
            IDL,
            MUN_PROGRAM_ID,
            provider
        );

        try {
            const [configurationPubKey] = await deriveConfigurationAccountPDA(
                NATIVE_MINT,
                program.programId
            );

            console.log(configurationPubKey.toBase58());

            const configuration = await program.account.configuration.fetch(
                configurationPubKey
            );

            console.log(configuration.withdrawTaxVault.toBase58());
            console.log(provider.wallet.publicKey.toBase58());


            if(configuration.withdrawTaxVault.toBase58() === provider.wallet.publicKey.toBase58()){
                diagCtx.setIsAdmin(true);
            }
        } catch(e){
            diagCtx.showError(e.message);
            diagCtx.hideLoading();
            return;
        }
    }

    useEffect(() => {
        try {
            if(wallet?.connected && !wallet?.disconnecting && !wallet?.connecting){
                initialize();
                /* getUserPFP(wallet.publicKey).then((res) => {
                    setPfpUri(res.pfp_uri);
                }); */
            }
            if(!wallet?.connected && !wallet?.disconnecting && !wallet?.connecting){
                diagCtx.setIsAdmin(false);
                setPfpUri(null);
            }
        } catch(e){
            diagCtx.showError(e.message);
        }
    }, [wallet])

    const handleProfileClick = (e) => {
        e.stopPropagation();
        if (!wallet.connected) {
            diagCtx.showWarning("You have to connect wallet to change PFP");
            walletModal.setVisible(true);
            return;
        }
        profileRef.current.value = null;
        profileRef.current.click();
    }

    const handleUploadProfile = async (e) => {
        if (e.target.files.length === 0) return;
        const formData = new FormData();
        formData.append("file", e.target.files[0]);
        formData.append("fileName", e.target.files[0].name);
        formData.append("wallet_addr", wallet.publicKey);
//        formData.append("wallet_addr", wallet.publicKey);
        try {
          const res = await axios.post(
            `${location}/uploadPFP`,
            formData
          );
          setPfpUri(res.data.pfp_uri);
          diagCtx.showSuccess("Successfully updated your PFP");
        } catch (ex) {
          diagCtx.showError("Invalid wallet address or bad connection");
          console.log(ex);
        }
/*         _uploadProfile(id, e.target.files[0])
        .then((res) => {
            if (res.success === 1)
                refreshProfile();
        }) */
    }

    if (isDesktop) {
        return <Box className="px-[60px] pt-[24px] pb-[6px] xl:pb-[24px] flex items-center">
            <img src="/logo.svg" className="cursor-pointer" alt="Logo" onClick={() => navigate("/home")}/>
            {
                diagCtx.isAdmin === true ? routes_admin.map((item, i) => {
                    return <NavItem key={i} active={hash === `#${item.url}`} title={item.title} url={item.url} />
                }) : routes_client.map((item, i) => {
                    return <NavItem key={i} active={hash === `#${item.url}`} title={item.title} url={item.url} />
                })
            }
            <span className="mr-auto" />
            <Box className="flex flex-row mt-[-10px]">
                {
                    pfpUri != null ?
                <Box className="bg-cover cursor-pointer my-auto mr-[10px] w-[25px] h-[25px] lg:w-[30px] lg:h-[30px] 2xl:w-[40px] 2xl:h-[40px] rounded-full" style={{backgroundImage: `url(${pfpUri})`}}
                onClick={handleProfileClick}/> : ""
                }
                <input
                    type="file"
                    name="file"
                    accept="image/*"
                    ref={profileRef}
                    className="hidden"
                    onChange={handleUploadProfile}
                />
                <ColorButton className="flex items-center cursor-pointer mr-[10px] h-[25px] lg:h-[30px] 2xl:h-[40px]" onClick={() => navigate("/mint")}>Get Our NFT</ColorButton>
                <WalletMultiButton />
            </Box>
        </Box>;
    }
    else {
        return <>
            <Box className="py-[12px] px-[24px] flex">
                <img className="w-[64px]" src="/logo.png" alt="Logo" onClick={() => navigate("/home")}/>
                <span className="mr-auto" />
                <img className="my-auto h-fit cursor-pointer" src="/icons/menu.svg" alt="Menu" onClick={() => setOpen(!open)} />
            </Box>
            {open && <Box className="bg-[#1B1E3D] absolute w-full top-[79px] z-[20]">
            {
                diagCtx.isAdmin === true ? routes_admin.map((item, i) => {
                    return <MobileNavItem key={i} active={hash === `#${item.url}`} title={"Log in to the panel"} url={item.url} />
                }) : routes_client.map((item, i) => {
                    return <MobileNavItem key={i} active={hash === `#${item.url}`} title={"Log in to the panel"} url={item.url} />
                })
            }
            <Box className="h-[60px] flex justify-center">
                <WalletMultiButton />
            </Box>
            <Box className="h-[60px] flex justify-center">
                <ColorButton className="flex items-center w-fit my-auto !h-[35px]" onClick={() => navigate("/mint")}>Get Our NFT</ColorButton>
            </Box>
            </Box>}
        </>
    }
}