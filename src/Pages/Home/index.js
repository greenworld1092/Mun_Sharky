
import { useEffect } from "react";

import { Box, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { HomeHeaderText, LandingCaptionText, LandingHeaderText, OperateHeaderText, OperateCaptionText, ShareJoinText, ShareHeaderText, ShareCaptionText, BorderButton, ShareItemTitle, ShareItemHeader, ShareItemCaption, ShareButton } from "../../Components";
import Container from "../Container";

function SharedItem(props) {
    return <Box className="h-[270px] lg:w-[431px] lg:h-[340px] p-[32px] flex flex-col" sx={{
        border: "1px solid rgba(132, 106, 204, 0.5)",
        borderRadius: "12px",
        backgroundImage: props.bg,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
        backgroundSize: "cover",
        transition: "background .5s, box-shadow .5s",
        "&:hover": {
            border: "2px solid #5C6AE1",
            boxShadow: "6px 6px 0px #5C6AE1",
            borderRadius: "8px",
        }
    }}>
        <ShareItemTitle className="pb-[22px]">
            {props.title}
        </ShareItemTitle>
        <ShareItemHeader className="pb-[4px]">
            {props.header}
        </ShareItemHeader>
        <ShareItemCaption>
            {props.caption}
        </ShareItemCaption>
        {props.children}
    </Box>
}

export default function Home() {
    const isDesktop = useMediaQuery('(min-width:1024px)');
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [])

    const renderJoin = () => {
        return <>
            <ShareJoinText>
                Join Us
            </ShareJoinText>
            <ShareHeaderText className="mb-[6px]">
                Get your<br/>
                MUN Pass
            </ShareHeaderText>
            <ShareCaptionText className="mb-[27px]">
                Will be used as a powerful utility for it’s holders, providing <br/>
                lending option and more tools in the upcoming future, <br/>
                exclusively for our NFT holders
            </ShareCaptionText>
            <BorderButton className="w-fit !px-[20px] !py-[13px]">
                Get it on MagicEden
            </BorderButton>
        </>
    }

    const renderSharedItems = () => {
        return <>
            <SharedItem title="Mint" header="Free Airdrop" caption="At least 70% of the collection will be air-dropped for FREE for various NFT communities on Solana."
            bg="url(/images/home/ShaderItem1.svg)">
                <Box className="flex mt-auto mb-[8px]">
                    <ShareButton style={{whiteSpace : 'nowrap'}} onClick={() => navigate('/mint')}>Mint now (Soon)</ShareButton>
                </Box>
            </SharedItem>
            <SharedItem title="Token" header="Lend / Borrow" caption="Use our platform to borrow Sol or lend against your MUN & BonkZ NFT."
            bg="url(/images/home/ShaderItem3.svg)">
                <Box className="flex mt-auto mb-[8px]">
                    <ShareButton className="mr-[14px]" onClick={() => navigate('/lend')}>Lend</ShareButton>
                    <ShareButton onClick={() => navigate('/borrow')}>Borrow</ShareButton>
                </Box>
            </SharedItem>
            <SharedItem title="Rewards" header="Automatic Pool" caption="We are the first to launch an automatic lending pool protocol, meaning you can just set up the pool and earn passive Solana."
            bg="url(/images/home/ShaderItem2.svg)"/>
            <SharedItem title="Staking" header="More Utility" caption="We are actively working on more professional tools that will be offered for free for our NFT holders."
            bg="url(/images/home/ShaderItem2.svg)"/>
        </>
    }

    return <Container>
        <Box className="grid grid-cols-1 px-[40px] gap-[12px] lg:grid-cols-2 lg:px-0 lg:gap-[60px]">
            <img className="ml-auto" src="/images/home/MUN.png" alt="MUN" />
            <Box className="flex flex-col justify-center">
                <HomeHeaderText className="pb-[27px] text-center lg:text-left">
                    Building The <br/>
                    Future of NFT <br/>
                    Finance
                </HomeHeaderText>
                <LandingCaptionText className="text-center lg:text-left !text-[#9395AA]">
                    Bring you the first <br/>
                    automatic lending pool on <br/>
                    Solana, huge community <br/>
                    airdrop and more advanced <br/>
                    tools on the way <br/>
                </LandingCaptionText>
            </Box>
        </Box>
        <div className="mb-[40px] lg:mb-[100px]" />
        <Box sx={{background: "linear-gradient(267.58deg, #0B0E27 0%, #2D325B 175.24%);"}}>
            <Box className="py-[24px] lg:py-[100px] bg-no-repeat bg-right bg-contain" style={{backgroundImage: `url(/images/home/SolanaBlur.png)`}}>
                <Box className="flex justify-center lg:mb-[50px]">
                    <OperateHeaderText className="text-right mr-6">
                        We operate on
                    </OperateHeaderText>
                    <img className="my-auto max-w-[40%]" src="/images/home/SolanaText.png" alt="SolanaText" />
                </Box>
                <Box className="grid grid-cols-2 gap-[20px] lg:grid-cols-4 lg:gap-[140px] lg:mx-[20%]">
                    <OperateCaptionText>Low&nbsp;Gas&nbsp;Fees</OperateCaptionText>
                    <OperateCaptionText>Fast&nbsp;Transactions</OperateCaptionText>
                    <OperateCaptionText>Scalable</OperateCaptionText>
                    <OperateCaptionText>Trusted</OperateCaptionText>
                </Box>
            </Box>
        </Box>
        <div className="mb-[67px] lg:mb-[216px]" />
        {
            isDesktop ?
            <Box className="grid grid-cols-2 gap-[60px] 2xl:gap-[90px]">
                <Box className="ml-auto flex flex-col justify-center">
                    {renderJoin()}
                </Box>
                <img src="/images/home/FreeMint.png" alt="MUN" />
            </Box>
            :
            <Box className="px-[26px]">
                <Box className="flex justify-center">
                <img className="mb-[26px]" src="/images/home/FreeMint.png" alt="MUN" />
                </Box>
                {renderJoin()}
            </Box>
        }
        <div className="mb-[72px] lg:mb-[176px]" />
        {
            isDesktop ?
            <Box className="flex">
                <Box className="mx-auto grid grid-cols-2 gap-[30px]">
                    {renderSharedItems()}
                </Box>
            </Box>
            :
            <Box className="px-[26px] grid grid-cols-1 gap-[22px]">
                {renderSharedItems()}
            </Box>
        }
    </Container>;
}