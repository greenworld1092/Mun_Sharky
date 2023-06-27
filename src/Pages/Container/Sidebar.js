
import { Box } from "@mui/material"

export default function Sidebar() {
    return <Box className="fixed bottom-[100px] right-[31px]">
        <a target="_blank" href="https://twitter.com/MunTools"><img src="/icons/twitter.png" alt="twitter" className="mb-[15px] cursor-pointer h-[25px] xl:h-[36px] 2xl:h-[48px]" /></a>
        <a target="_blank" href="https://discord.gg/mX3fPWjecm"><img src="/icons/discord.png" alt="twitter" className="mb-[15px] cursor-pointer h-[25px] xl:h-[36px] 2xl:h-[48px]" /></a>
    </Box>
}