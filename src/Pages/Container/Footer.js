
import { Box, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { FooterCaption, FooterTitle } from "../../Components";

export default function Footer() {
    const isDesktop = useMediaQuery('(min-width:1024px)');
    const navigate = useNavigate();

    const renderNavigation = () => {
        return <>
            <FooterCaption onClick={() => navigate('/home')}>Home</FooterCaption>
            <FooterCaption onClick={() => navigate('/lend')}>Lend</FooterCaption>
            <FooterCaption onClick={() => navigate('/my-profile')}>Dashboard</FooterCaption>
            <FooterCaption onClick={() => navigate('/borrow')}>Borrow</FooterCaption>
        </>
    }

    const renderSocial = () => {
        return <>
            <FooterCaption className="flex">
                <img className="w-[18px] mr-[12px] lg:h-fit lg:mr-[18px] my-auto" src="/icons/telegram-filled.png" alt="Telegram" />Telegram
            </FooterCaption>
            <FooterCaption className="flex mt-[12px]">
                <img className="w-[18px] mr-[12px] lg:h-fit lg:mr-[18px] my-auto" src="/icons/twitter-filled.png" alt="Telegram" />Twitter
            </FooterCaption>
            <FooterCaption className="flex mt-[12px]">
                <img className="w-[18px] mr-[12px] lg:h-fit lg:mr-[18px] my-auto" src="/icons/discord-filled.png" alt="Telegram" />Discord
            </FooterCaption>
        </>
    }

    if (isDesktop) {
        return <Box className="px-[40px] pb-[40px]">
            <Box className="mb-[140px] flex">
                <img src="/logo.svg" alt="Logo" />
                <Box className="grid grid-cols-2 mt-[106px] w-[50%]">
                    <Box className="pl-[50%]">
                        <FooterTitle>Navigate</FooterTitle>
                        <Box className="mt-[24px] 2xl:mt-[36px] grid grid-cols-2">
                            {renderNavigation()}
                        </Box>
                    </Box>
                    <Box className="pl-[50%]">
                        <FooterTitle>Social</FooterTitle>
                        <Box className="mt-[24px] 2xl:mt-[36px]">
                            {renderSocial()}
                        </Box>
                    </Box>
                </Box>
            </Box>
            <Box className="flex">
                <FooterCaption className="ml-[38px] !cursor-default">© 2021 O9D, All rights reserved</FooterCaption>
                <FooterCaption className="ml-auto !cursor-default">Privacy Policy • Terms & Conditions</FooterCaption>
            </Box>
        </Box>;
    }
    else {
        return <Box className="pb-[32px]">
            <img className="w-[160px] px-[32px]" src="/logo.svg" alt="Logo" />
            <Box className="px-[32px]">
                <FooterTitle>Navigate</FooterTitle>
                <Box className="mt-[24px] grid grid-cols-2">
                    {renderNavigation()}
                </Box>
                <FooterTitle className="mt-[32px]">Social</FooterTitle>
                <Box className="mt-[24px]">
                    {renderSocial()}
                </Box>
                <FooterCaption className="mt-[32px]">© 2023 MUN, All rights reserved</FooterCaption>
            </Box>
        </Box>
    }
}
