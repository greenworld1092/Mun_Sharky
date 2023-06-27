
import { Box, useMediaQuery } from "@mui/material";

import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";

export default function Container(props) {
    const isDesktop = useMediaQuery('(min-width:768px)');
    const name = isDesktop ? "vector.png" : "vector-mobile.png";
    return <Box className="bg-no-repeat bg-contain" style={{backgroundImage: `url(/images/${name})`}}>
        <Header />
        {isDesktop && <Sidebar />}
        {props.children}
        <div className="mb-[22px] lg:mb-[240px]" />
        <Footer />
    </Box>;
}