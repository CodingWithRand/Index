"use client"

import { useEffect, useState } from "react"
import { useGlobal } from "@/glient/global";
import Script from "next/script";
import Client from "@/glient/util"
import Neutral from "@/geutral/util";

const { UserPFP } = Client.Components

function NavBar(){

    const { authUser } = useGlobal();
    function MenuBtn(){
        const { device } = useGlobal();
        const [appearingComponent, setAppearance] = useState(<></>);
        let menu;     

        useEffect(() => {
            menu = document.querySelector("#navbar #menu");
            let isOpen = false;
            function menuBtn(e) {
                if(!isOpen) {
                    isOpen = true;
                    e.target.style.rotate = "180deg";
                    menu.style.display = "flex";
                    setTimeout(() => menu.style.opacity = 1, 500);
                } else {
                    isOpen = false;
                    e.target.style.rotate = "0deg";
                    menu.style.opacity = 0;
                    setTimeout(() => menu.style.display = "none", 500)
                };
            }

            if(device.device === "xs"){
                menu.style.display = "none"
                menu.style.opacity = 0
                setAppearance(<div id="menu-btn">Menu <Client.Components.Dynamic.Image width={15} height={15} dir="icon/" name="sort-down.png" alt="triangle-icon" onClick={menuBtn}/></div>)
            }
            else{
                setAppearance(<></>)
                menu.style.display = "flex"
                menu.style.opacity = 1
            }
        }, [device.device])

        return appearingComponent
    }
    
    return(
        <nav id="navbar">
            <MenuBtn />
            <ul id="menu">
                <li><a>About me</a></li>
                <li><a>My Projects</a></li>
                <li><a>Lounge</a></li>
                <li><a>Contact</a></li>
            </ul>
            <ul>
                <Client.Components.ThemeChanger />
                {   authUser.isAuthUser ? 
                    <>
                        <li style={{ cursor: "pointer" }} onClick={() => window.location.replace('/settings')}><UserPFP /></li>
                    </>
                    :
                    <>
                        <li><a href="/registration?page=login">Login</a></li>
                        <li><a href="/registration?page=register">Register</a></li>
                    </>
                }
                
            </ul>
        </nav>
    )
}
function Header(){
    return(
        <header id="banner">
            <div id="logo">
            <div style={{display: "flex", justifyContent: "center", alignItems: "center", width: "100vw", flexDirection: "row", columnGap: "5em"}}>
                <svg width="200" height="200" id="dice">
                    <rect width="200" height="200" rx="20" ry="20" fill="lightgray"></rect>
                    <circle cx="50" cy="50" r="20" fill="black" className="d four five six" style={{display: "none"}}></circle>
                    <circle cx="150" cy="150" r="20" fill="black" className="d four five six" style={{display: "none"}}></circle>
                    <circle cx="100" cy="100" r="20" fill="black" className="d one three five"></circle>
                    <circle cx="50" cy="100" r="20" fill="black" className="d six" style={{display: "none"}}></circle>
                    <circle cx="150" cy="100" r="20" fill="black" className="d six" style={{display: "none"}}></circle>
                    <circle cx="50" cy="150" r="20" fill="black" className="d two three four five six" style={{display: "none"}}></circle>
                    <circle cx="150" cy="50" r="20" fill="black" className="d two three four five six" style={{display: "none"}}></circle>
                </svg>
                <span id="logo-text">
                    CWR
                    <div className="fade"></div>
                </span>
            </div>   
            <div className="line"></div>
            <h2 className="subtitle">Present</h2> 
            </div>
            <div className="caption">My Programming Portfolio</div>
            <Script async src="vanilla-js/frontend/index.js" type="application/javascript" />
        </header>
    )
}

export function Intro(){
    const { authUser } = useGlobal();
    return(
        <Client.Components.SuspenseComponent condition={authUser.isAuthUser !== undefined} cover loadingComponent={<Neutral.Components.LoadingPage />}>
            <NavBar />
            <Header />
        </Client.Components.SuspenseComponent>
    )
}