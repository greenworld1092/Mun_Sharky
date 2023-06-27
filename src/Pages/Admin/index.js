

import { useEffect, useState, useContext } from "react";

import { Box, IconButton, useMediaQuery, Switch } from "@mui/material";

import { MintPriceValue, ButtonText } from "../../Components";
import Container from "../Container";

import TextField from '@mui/material/TextField';

import DeleteIcon from '@mui/icons-material/Delete';

import { CollectionColorButton } from "../../Components";
import { AmountInput } from "../../Components";

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
import { LAMPORTS_PER_SOL, PublicKey, Keypair, Connection, clusterApiUrl } from "@solana/web3.js";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import DialogContext from "../../Contexts/dialogContext";

import IDL from '../../Utility/Idl/idl.json';

import { deriveSCAccountPDA, deriveConfigurationAccountPDA, derivePoolAccountPDA, deriveNFTAccountPDA, deriveOrderAccountPDA, deriveTaxAccountPDA } from '../../Utility/ts/helper';
import { isElementOfType } from "react-dom/test-utils";

const MUN_PROGRAM_ID = new anchor.web3.PublicKey(
    "Cdk2qqpHx4YMtsqiCwwLJpnWQARc4kJQofY1hduvRiiX"
);

const searchItems = [
    {img: "/images/mint/Token.png", name: "bonkz"},
    {img: "/images/mint/Token.png", name: "bonkz"},
    {img: "/images/mint/Token.png", name: "bonkz"},
    {img: "/images/mint/Token.png", name: "bonkz"},
    {img: "/images/mint/Token.png", name: "bonkz"},
    {img: "/images/mint/Token.png", name: "bonkz"},
    {img: "/images/mint/Token.png", name: "bonkz"},
]

const listedItems = [
    {img: "/images/mint/Token.png", name: "bonkz"},
    {img: "/images/mint/Token.png", name: "bonkz"},
    {img: "/images/mint/Token.png", name: "bonkz"},
    {img: "/images/mint/Token.png", name: "bonkz"},
    {img: "/images/mint/Token.png", name: "bonkz"},
    {img: "/images/mint/Token.png", name: "bonkz"},
]

const SearchItem = ({item}) => {
    return <Box className="bg-[#292C4E] rounded-[6px] p-[10px] flex">
        <img className="mr-[15px] my-auto !h-[60px] !w-[60px] rounded-[10px]" src={item.img} alt={item.name} />
        <ButtonText className="!text-[#6B6B6B] my-auto mr-auto">{item.name}</ButtonText>
    </Box>
}

const ListedItem = ({item}) => {
    return <Box className="bg-[#292C4E] rounded-[6px] p-[10px] flex">
        <img className="mr-[15px] my-auto !h-[60px] !w-[60px] rounded-[10px]" src={item.img} alt={item.name} />
        <ButtonText className="!text-[#6B6B6B] my-auto mr-auto">{item.name}</ButtonText>
        <IconButton className="!my-auto !text-[#EB5757]">
            <DeleteIcon/>
        </IconButton>
    </Box>
}

export default function Admin() {
    const isDesktop = useMediaQuery('(min-width:1024px)');

    const [lowInterest, setLowInterest] = useState(0.3);
    const [midInterest, setMidInterest] = useState(0.5);
    const [highInterest, setHighInterest] = useState(0.7);

    const [mintPrice, setMintPrice] = useState(1);
    const [mintOn, setMintOn] = useState(true);
    const [presaleAmount, setPresaleAmount] = useState(0);

    const [walletAddress, setWalletAddress] = useState("");

    const { connection } = useConnection();
    const wallet = useWallet();
    const walletModal = useWalletModal();

    const diagCtx = useContext(DialogContext);

    const initialize = async() => {
        // --- getting collection image ---
        diagCtx.showLoading("Initializing setting variables...");
        {
            const connection = new Connection(clusterApiUrl('devnet'));
            const metaplex = new Metaplex(connection)
            .use(walletAdapterIdentity(wallet))
            .use(bundlrStorage());

            const candyMachine = await metaplex
                .candyMachines()
                .findByAddress({ address: new PublicKey("87pqxjxmmktffuKyv9NA5k6XUmkmFbWavZDCwc7X3hmz") });
    
                setMintPrice(Math.fround(candyMachine.candyGuard.guards.solPayment.amount.basisPoints / LAMPORTS_PER_SOL));
        }
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
            
            setLowInterest(configuration.interestLow.toNumber() / 100);
            setMidInterest(configuration.interestMiddle.toNumber() / 100);
            setHighInterest(configuration.interestHigh.toNumber() / 100);

            if(configuration.mintOn.toNumber() === 1)
                setMintOn(true);
            else    setMintOn(false);

            setPresaleAmount(configuration.presaleAmount.toNumber());
            setWalletAddress(configuration.withdrawTaxVault.toBase58());

        } catch(e){
            diagCtx.showError(e.message);
            diagCtx.hideLoading();
            return;
        }
        diagCtx.showSuccess("Successfully get variables from configuration");
        diagCtx.hideLoading();
    }

    const withdrawTax = async () => {
        if (!wallet.connected) {
            diagCtx.showError("You're not connected to wallet.");
            walletModal.setVisible(true);
            return;
        }

        if(diagCtx.isAdmin === false){
            diagCtx.showError("You're not allowed to withdraw funds from tax vault.");
            walletModal.setVisible(true);
            return;
        }

        diagCtx.showLoading("Withdrawing tax...");

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

        const [munTaxVault] = await deriveTaxAccountPDA(
            NATIVE_MINT,
            program.programId
        )

        console.log("mun tax vault:", munTaxVault.toBase58());

        let configuration = await program.account.configuration.fetch(
            configurationPubKey
        );

        try {
            await program.methods
            .withdrawTax()
            .accounts({
                signer: provider.wallet.publicKey,
                configuration: configurationPubKey,
                munSolMint: NATIVE_MINT,
                munTaxVault: munTaxVault,
                userSolVault : provider.wallet.publicKey,
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
        diagCtx.showSuccess("Successfully withdraw from tax vault.");
        diagCtx.hideLoading();
    }

    const saveSettings = async() => {
        if (!wallet.connected) {
            diagCtx.showError("You're not connected to wallet.");
            walletModal.setVisible(true);
            return;
        }

        if(!(lowInterest >= 0 && lowInterest <= 1) || !(midInterest >= 0 && midInterest <= 1) || !(highInterest >= 0 && highInterest <= 1)){
            diagCtx.showError("Please input correct interest amount.");
            return;
        }

        if(!(presaleAmount >= 0 && presaleAmount <= 22222)){
            diagCtx.showError("Please input correct presale amount");
            return;
        }

        diagCtx.showLoading("Changing configuration settings...");

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

        let configuration = await program.account.configuration.fetch(
            configurationPubKey
        );

        console.log(munSolVault.toBase58());
        console.log(configurationPubKey.toBase58());

        console.log(configuration);

        const metaplex = new Metaplex(connection)
        .use(walletAdapterIdentity(wallet))
        .use(bundlrStorage());

        diagCtx.showLoading("Changing configuration settings (minting price)...");
        let candyMachine;
        try {
            candyMachine = await metaplex
            .candyMachines()
            .findByAddress({ address: new PublicKey("87pqxjxmmktffuKyv9NA5k6XUmkmFbWavZDCwc7X3hmz") });
    
            console.log(candyMachine.itemsMinted.toString(10), candyMachine.itemsAvailable.toString(10));

            await metaplex.candyMachines().update({
                candyMachine,
                guards: {
                  botTax: { lamports: sol(0.01), lastInstruction: false },
                  solPayment: { 
                    amount: sol(mintPrice),
                    destination: metaplex.identity().publicKey, 
                  },
                },
            });
        } catch(e){
            diagCtx.showError(e.message);
            diagCtx.hideLoading();
            return;
        }

        diagCtx.showLoading("Changing configuration settings (others)...");
        try {
            await program.methods
            .changeConfiguration(
                new anchor.BN(parseInt(lowInterest * 100)),
                new anchor.BN(parseInt(midInterest * 100)),
                new anchor.BN(parseInt(highInterest * 100)),
                new anchor.BN(mintOn === true ? 1 : 0),
                new anchor.BN(presaleAmount),
            )
            .accounts({
                signer: provider.wallet.publicKey,
                configuration: configurationPubKey,
                munSolMint: NATIVE_MINT,
            })
            .signers([])
            .rpc();
        } catch(e){
            diagCtx.showError(e.message);
            diagCtx.hideLoading();
            return;
        }
        diagCtx.showSuccess("Successfully changed configuration settings.");
        diagCtx.hideLoading();
    }

    useEffect(() => {
        if(wallet?.connected && !wallet?.disconnecting && !wallet?.connecting){
            console.log("initializing");
            initialize();
        }
    }, [wallet])

    return <Container>
        <Box className="mt-[30px] mx-[20px] lg:mt-[60px] lg:mx-[120px] xl:mx-[240px] 2xl:mx-[360px]">
            <Box className="grid grid-cols-2 gap-x-[40px] gap-y-[30px]">
                <MintPriceValue className="text-center">Add collection</MintPriceValue>
                <MintPriceValue className="text-center">Collections listed</MintPriceValue>
                <Box className="bg-[#1B1E3D] rounded-[10px] h-[420px] grid">
                    <TextField 
                        fullWidth
                        placeholder="Search ..."
                        sx={{
                            "& .MuiInputBase-root": {
                                borderRadius: "10px",
                                border: "1px solid #454545",
                                outline: 0,
                                color: "#888888"
                            },
                            "& .MuiOutlinedInput-notchedOutline": {
                                border: "0px !important"
                            }
                        }} />
                    <Box className="px-[40px] py-[20px] flex flex-col gap-[15px] h-full overflow-y-auto">
                        {searchItems.map((item, i) => {
                            return <SearchItem item={item} key={i} />
                        })}
                    </Box>
                </Box>
                <Box className="bg-[#1B1E3D] rounded-[10px] h-[420px] px-[40px] py-[15px] flex flex-col gap-[15px] overflow-y-auto">
                    {listedItems.map((item, i) => {
                        return <ListedItem item={item} key={i} />
                    })}
                </Box>
            </Box>
            <Box className="p-[90px]">
                <Box className="grid grid-cols-3 gap-[40px]">
                    <MintPriceValue className="text-center">set low daily interest</MintPriceValue>
                    <MintPriceValue className="text-center">set medium daily interest</MintPriceValue>
                    <MintPriceValue className="text-center">set high daily interest</MintPriceValue>
                    <AmountInput placeholder="Enter low interest amount..." className="p-[24px] w-[260px] text-center" value={lowInterest} onChange={(e) => setLowInterest(e.target.value)}/>
                    <AmountInput placeholder="Enter middle interest amount..." className="p-[24px] w-[260px] text-center" value={midInterest} onChange={(e) => setMidInterest(e.target.value)}/>
                    <AmountInput placeholder="Enter high interest amount..." className="p-[24px] w-[260px] text-center" value={highInterest} onChange={(e) => setHighInterest(e.target.value)}/>
                </Box>
                <Box className="pt-[80px] flex gap-[30px]">
                    <MintPriceValue className="my-auto w-[260px] text-center">change mint price</MintPriceValue>
                    <AmountInput placeholder="Enter mint price amount..." className="p-[24px] w-[260px] text-center" value={mintPrice} onChange={(e) => setMintPrice(e.target.value)}/>
                    <MintPriceValue className="my-auto">SOL</MintPriceValue>
                </Box>
                <Box className="pt-[80px] flex gap-[30px]">
                    <MintPriceValue className="my-auto w-[260px] text-center">mint off/on</MintPriceValue>
                    <Switch
                        checked={mintOn}
                        onChange={(e) => setMintOn(e.target.checked)} 
                        sx={{
                        "&.MuiSwitch-root": {
                            height: "32px",
                            padding: 0,
                            borderRadius: "16px"
                        },
                        "& .MuiButtonBase-root": {
                            height: "32px"
                        },
                        "& .MuiSwitch-thumb": {
                            color: "white"
                        },
                        "& .MuiSwitch-track": {
                            backgroundColor: "#1380e0 !important",
                            opacity: "1 !important"
                        },
                        "& .Mui-checked": {
                            "& .MuiSwitch-thumb": {
                                color: "#0c0f2a"
                            },
                        }
                    }}/>
                </Box>
                <Box className="pt-[80px] flex gap-[30px]">
                    <MintPriceValue className="my-auto w-[260px] text-center">mint limit</MintPriceValue>
                    <AmountInput placeholder="Enter presale amount..." className="p-[24px] w-[260px] text-center" value={presaleAmount} onChange={(e) => setPresaleAmount(parseInt(e.target.value))}/>
                    <MintPriceValue className="my-auto"> / 22,222</MintPriceValue>
                </Box>
                <Box className="pt-[80px] flex gap-[30px]">
                    <CollectionColorButton className="my-auto !w-[260px]" onClick={() => withdrawTax()}>Withdraw</CollectionColorButton>
                    <MintPriceValue className="my-auto w-[260px] text-center">Wallet:</MintPriceValue>
                    <MintPriceValue className="my-auto justify-center items-center"> {walletAddress} </MintPriceValue>
                </Box>
                <Box className="pt-[80px] flex justify-center items-center gap-[30px]">
                    <CollectionColorButton className="my-auto !w-[260px]" onClick={() => saveSettings()}>Save</CollectionColorButton>
                </Box>
            </Box>
        </Box>
    </Container>;
}