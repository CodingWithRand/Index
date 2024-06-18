"use client"

import { useEffect, useState, useRef } from "react";
import { useGlobal } from "./global";
import { storage, auth } from "./firebase";
import { getDownloadURL, ref } from "@firebase/storage";
import Neutral from "@/geutral/util";
import "@/gss/util.css";
import "@/gss/theme.css";
import "@/gss/responsive.css";

function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function useDelayedEffect(callback, dependencies, delay) {
    const savedCallback = useRef();
  
    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);
  
    useEffect(() => {
      function tick() {
        if (savedCallback.current) {
          savedCallback.current();
        }
      }
  
      const timerId = setTimeout(tick, delay);
  
      return () => clearTimeout(timerId);
    }, [...dependencies, delay]);
}
  
function Image(props){
    const { theme } = useGlobal();
    const [imgSrc, setImgSrc] = useState("");
    const [isBinding, bind] = useState(false);
    
    useEffect(() => {
        if(isBinding) return;
        if(!props.constant) setImgSrc(`/imgs/backend-images/theme/${props.dir || ""}${(() => {
                if(theme.theme === "default-os" && props.name !== "mode.png"){
                    if(window.matchMedia('(prefers-color-scheme: dark)').matches) return "dark";
                    else return "light";
                }else return theme.theme
            })()}-${props.name}`);
        else setImgSrc(`/imgs/backend-images/${props.dir || ""}${props.name}`);
    }, [theme.theme, isBinding]);

    Hooks.useDelayedEffect(() => {
        if(!isBinding) return;
        const targetElement = document.querySelector(`#${props.to}[binding-status]`);
      
        if (targetElement) {
          const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
              if (mutation.type === 'attributes' && mutation.attributeName === 'binding-status') {
                if(targetElement.getAttribute('binding-status') === "true"){
                    bind(true);
                    setImgSrc(`/imgs/backend-images/binded/${props.dir || ""}binded-${props.name}`);
                }
                else if(targetElement.getAttribute('binding-status') === "false"){
                    bind(false);
                    setImgSrc(`/imgs/backend-images/theme/${props.dir || ""}${(() => {
                        if(theme.theme === "default-os" && props.name !== "mode.png"){
                            if(window.matchMedia('(prefers-color-scheme: dark)').matches) return "dark";
                            else return "light";
                        }else return theme.theme
                    })()}-${props.name}`);
                }
              }
            }
          });
      
          observer.observe(targetElement, { attributes: true });

          return () => observer.disconnect();

        }
      }, [], 100);
    
    return(
        <img
            alt={props.alt}
            src={imgSrc}
            className={props.cls || undefined}
            width={props.width || undefined}
            height={props.height || undefined}
            style={props.style}
            onClick={props.onClick || undefined}
            title={props.title || undefined}
        />
    )
};

function AlertBox(props){
    const [timer, setTimer] = useState(props.auto === true ? 3 : "");

    useEffect(() => {
        if(props.auto){
            if(props.detect) Neutral.Functions.jobDelay(() => {
                if(timer > 0) setTimer(prevT => {return prevT - 1});
                else{ setTimer(0); props.action(); }
            }, 1000);
        }
    }, [props.detect, timer])

    useDelayedEffect(() => {
        if(props.detect) document.getElementById(props.id).showModal();
        else document.getElementById(props.id).close();
    }, [props.detect], 500);

    return (
        <dialog id={props.id} className={`alert-box responsive ${props.themed ? "theme" : ""} ctn bg-color border-color`}>
            <div className="dialog-nester responsive">
                {(() => {
                    if(props.children) return props.children;
                    else return(
                        <>
                            <h2 className={`dialog-title ${props.themed ? "theme" : ""} text-color responsive`}>{props.messages.title}</h2>
                            <label className={`dialog-subtitle responsive ${props.themed ? "theme" : ""} text-color`}>{props.messages.subtitle || ""}</label>
                            <div className={`dialog-description responsive ${props.themed ? "theme" : ""} text-color`}>{props.messages.description || ""}</div>
                            <button className="dialog-btn responsive" onClick={props.action}>{`${props.messages.action} ${timer}`}</button>
                        </>
                    )
                })()}
            </div>
        </dialog>
    );
};

function Switch(props){
    const [switchState, turn] = useState(false);
    
    const [switchStateClass, setSSC] = useState("is-off");
    const [delayStateClass, setDSC] = useState("is-off");

    useEffect(() => {
        switch(props.mode){
            case "action-on":
                if(switchState) props.action();
                break;
            case "action-off":
                if(!switchState) props.action();
                break;
            case "action-on-off":
                if(!props.altAction) throw new Error("altAction prop is missing")
                else{
                    if(switchState) props.action();
                    else props.altAction();
                };
                break;
            default:
                throw new Error("Unknown mode") ;
        };
        
    }, [switchState]);

    return(
        <div id={props.id} className={`switch-area responsive ${props.cls || ""} ${delayStateClass}`} onClick={() => { 
            setSSC(prevState => {return prevState === "is-off" ? "is-on" : "is-off";});
            Neutral.Functions.jobDelay(() => setDSC(prevState => {return prevState === "is-off" ? "is-on" : "is-off";}), 200);
            turn(prevState => {return prevState === false ? true : false});
        }}>
            <div className={`button responsive ${switchStateClass}`}></div>
        </div>
    );
};

function Section(props){
    switch(props.style){
        case "pallete":
            return( 
                <div className={`pallete ${props.themed ? "theme" : ""} ctn bg-color intense`}>
                    <h1 className={`setting-section-title responsive ${props.themed ? "theme" : ""} text-color`}>{props.title}</h1>
                    <p className={`setting-section-description responsive ${props.themed ? "theme" : ""} text-color`}>{props.description || ""}</p>
                    {props.children}
                </div>
            );
        default:
            return <></>;
    };
};

function InputField(props){

    const [errText, setErrText] = useState("");

    useEffect(() => {
        if(!props.errDetector) return;
        if(errText !== "") {
            document.querySelector(`.${props.detectorCls}.err-detector`).classList.add("err-warn");
            document.querySelector(`.${props.detectorCls}.err-detector`).classList.remove("border-color");
        } else {
            document.querySelector(`.${props.detectorCls}.err-detector`).classList.remove("err-warn");
            document.querySelector(`.${props.detectorCls}.err-detector`).classList.add("border-color");
        };
    }, [errText]);

    return( 
        <div className="input-field">
            <input id={props.id || undefined} name={props.name || undefined} required={props.required} className={`${props.themed ? "theme" : ""} border-color component text-color bg-color inverse ${props.errDetector ? "err-detector" : ""} ${props.detectorCls || ""} responsive`} type={props.type || "text"} placeholder={props.placeholder || ""} onChange={(e) => {
                e.preventDefault();
                if(!props.onChange.binded) return;
                props.onChange.expected_condition.forEach((i, c) => {
                    (async () => {
                        let condition;
                        try {
                            const res = await props.onChange.run_test(e);
                            condition = res;
                        } catch {
                            condition = props.onChange.run_test(e);
                        };
                        if(condition === c){ 
                            if(props.errDetector) setErrText(props.warningMsg[i]);
                            props.onChange.actions[i](e);
                        };
                    })()
                })
                
            }}/>
            <label className="field-warning responsive" title={props.warningMsgDescription}>{errText}</label>
        </div>
    );
};

function InputGroupField(props){
    const [inputFields, updateInputFields] = useState(Array.from({ length: props.fieldNumber }, (_, i) => (
        <div key={i} className="sub input-field">
            <input id={props.id && props.id[i]} name={props.name && props.name[i]} required={props.required && props.required[i]} className={`${props.themed ? "theme" : ""} border-color component text-color bg-color inverse ${props.errDetector[i] ? "err-detector" : ""} ${props.detectorCls[i] || ""} responsive`} type={props.type[i] || "text"} placeholder={props.placeholder[i] || ""} onChange={(e) => {
                e.preventDefault();
                if(!props.onChange[i].binded) return;
                props.onChange[i].expected_condition.forEach((j, c) => {
                    if(props.onChange[i].run_test(e) === c){ 
                        if(props.errDetector[i]) setErrText((prevErrTexts) => ({
                            ...prevErrTexts,
                            [props.detectorCls[i]]: props.warningMsg[i][j]
                        }));
                        props.onChange[i].actions[j](e);
                    }
                })
                
            }}/>
            <label className={`field-warning ${props.detectorCls[i]} responsive`} title={props.warningMsgDescription && props.warningMsgDescription[i]}></label>
        </div>
    )));
    const [errText, setErrText] = useState((() => 
        props.detectorCls.reduce((obj, key) => {
            obj[key] = "";
            return obj;
        }, {})
    )());

    useEffect(() => {
        if(!props.errDetector || !document.querySelector(`.${props.detectorCls}.err-detector`)) return;
        props.detectorCls.forEach((dc) => {
            if(errText[dc] !== "") {
                document.querySelector(`.${dc}.err-detector`).classList.add("err-warn");
                document.querySelector(`.${dc}.err-detector`).classList.remove("border-color");
                document.querySelector(`.${dc}.field-warning`).innerHTML = errText[dc];
            } else {
                document.querySelector(`.${dc}.err-detector`).classList.remove("err-warn");
                document.querySelector(`.${dc}.err-detector`).classList.add("border-color");
                document.querySelector(`.${dc}.field-warning`).innerHTML = "";
            };
        });
    }, [errText]);

    useEffect(() => {
        updateInputFields((prevInputFields) => {
            const updatingInputFields = [...prevInputFields];
            return updatingInputFields.map((_, i) => (
                <div key={i} className="sub input-field">
                    <input name={props.name && props.name[i]} required={props.required && props.required[i]} className={`${props.themed ? "theme" : ""} border-color component text-color bg-color inverse ${props.errDetector[i] ? "err-detector" : ""} ${props.detectorCls[i] || ""} responsive`} type={props.type[i]} placeholder={props.placeholder[i] || ""} onChange={(e) => {
                        e.preventDefault();
                        if(!props.onChange[i].binded) return;
                        props.onChange[i].expected_condition.forEach((j, c) => {
                            if(props.onChange[i].run_test(e) === c){ 
                                if(props.errDetector[i]) setErrText((prevErrTexts) => ({
                                    ...prevErrTexts,
                                    [props.detectorCls[i]]: props.warningMsg[i][j]
                                }));
                                props.onChange[i].actions[j](e);
                            }
                        })
                        
                    }}/>
                    <label className={`field-warning ${props.detectorCls[i]} responsive`} title={props.warningMsgDescription && props.warningMsgDescription[i]}></label>
                </div>
            ))
        })
    }, (() => {
        let dependencies = [];
        props.unstaticAttributes.forEach((attribute) => {
            switch(attribute){
                case "type":
                    dependencies.push(props.type);
                    break;
            }
        })
        return dependencies;
    })())

    return <div className="input-fields">{inputFields}</div>
}

function ThemeChanger(){
    const { theme } = useGlobal();

    useEffect(() => {
        switch(theme.theme){
            case 'light':
                document.documentElement.classList.remove("dark");
                break;
            case 'dark':
                document.documentElement.classList.add("dark");
                break;
            case 'default-os':
                const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if(isDark) document.documentElement.classList.add("dark");
                else document.documentElement.classList.remove("dark");
                break;
        }
    }, [theme.theme])

    function changeTheme(e){
        e.preventDefault();
        switch(theme.theme){
            case 'light':
                theme.setTheme('dark');
                break;
            case 'dark':
                theme.setTheme('default-os');
                break;
            case 'default-os':
                theme.setTheme('light');
                break;
        };
    };
    
    return (
        <button id='theme' className='setup-btn mx-4' onClick={changeTheme}>
            <Client.Components.Dynamic.Image dir="icon/" name="mode.png" alt='theme-changer-btn-icon' cls="setup-btn-icon-shadow theme custom" />
        </button>
    )
}

function SuspenseComponent(props){
    const [ onMountComponent, setOnMountComponent ] = useState(props.loadingComponent || Neutral.Components.LoadingPage);
    useEffect(() => {
        if(props.condition){
            setOnMountComponent(null);
            document.documentElement.removeAttribute("style");
        }
        else if(props.timer) setTimeout(() => {
            setOnMountComponent(null)
            document.documentElement.removeAttribute("style");
        }, props.timer);
    }, [props.condition]);

    return <>
        {(onMountComponent && !props.cover) || props.children}
        {props.cover && onMountComponent}
    </>
}

function UserPFP(){
    const { authUser } = useGlobal();
    const [ pfpImg, setPfpImg ] = useState();

    useEffect(() => {
        if(authUser.isAuthUser && authUser.isAuthUser.photoURL) (async () => {
            const userProfileImageRef = ref(storage, `userProfileImage/${auth.currentUser.uid}/profile.png`);
            const imgUrl = await getDownloadURL(userProfileImageRef);
            setPfpImg(<img alt="user-profile-icon" src={imgUrl} className="rounded-full" width={50} height={50}/>)
        })()
        else setPfpImg(<Client.Components.Dynamic.Image alt="programmer-profile-icon" dir="icon/" width={50} height={50} name="programmer.png" cls="rounded-full" />)
    }, [authUser.isAuthUser])

    return pfpImg
}

function Media(props){
    const { authUser } = useGlobal();
    const [ mediaSrc, setMediaSrc ] = useState();
    const mediaRef = useRef(null)
    useEffect(() => {
        if(props.firebase) (async () => {
            const mediaSrcRef = ref(storage, `public/${props.mediaSrc}`);
            const mediaSrcUrl = await getDownloadURL(mediaSrcRef);
            setMediaSrc(mediaSrcUrl);
            switch(props.mediaType){
                case "video": mediaRef.current.load(); break;
            }
        })()
    }, [authUser.isAuthUser])

    switch(props.mediaType){
        case "video": 
            return (
                <video
                    ref={mediaRef} 
                    className={props.cls || undefined} 
                    style={props.style || undefined} 
                    autoPlay={props.autoPlay || undefined} 
                    muted={props.muted || undefined}
                    loop={props.loop || undefined}
                >
                    <source src={mediaSrc} type="video/mp4" />
                </video>
            )
        default: return <></>
    }
}

function CWRFooter(){
    const [ iconSize, setIconSize ] = useState(0);

    useEffect(() => {
        const handleIconSizeAlter = () => {
            if(window.innerWidth < 400) setIconSize(12);
            else setIconSize(20);
        }
        handleIconSizeAlter();
        window.addEventListener("resize", handleIconSizeAlter);
        return () => window.removeEventListener("resize", handleIconSizeAlter);
    }, []);

    return(
        <footer className="footer">
            <div className="credit-card">
            <h1>Powered by</h1>
            <ul>
                <li><Image dir="icon/" name="vercel.png" constant alt="vercel-logo" width={iconSize} height={iconSize}/>&nbsp;<a href="https://vercel.com" target="_blank">Vercel</a></li>
                <li><Image dir="icon/" name="fb.png" constant alt="firebase-logo" width={iconSize} height={iconSize}/>&nbsp;<a href="https://firebase.google.com" target="_blank">Firebase</a></li>
                <li><Image dir="icon/" name="github.svg" constant alt="github-logo" width={iconSize} height={iconSize}/>&nbsp;<a href="https://github.com" target="_blank">GitHub</a></li>
                <li><Image dir="icon/" name="render.png" alt="render-logo" width={iconSize} height={iconSize}/>&nbsp;<a href="https://render.com" target="_blank">Render</a></li>
            </ul>
            </div>
            <div className="credit-card">
            <h1>Created using</h1>
            <ul>
                <li><Image dir="icon/" name="react.png" constant alt="react-logo" width={iconSize} height={iconSize}/>&nbsp;<a href="https://react.dev" target="_blank">React</a></li>
                <li><Image dir="icon/" name="nextjs-icon-background.svg" alt="next-logo" width={iconSize} height={iconSize}/>&nbsp;<a href="https://nextjs.org" target="_blank">Next.js</a></li>
                <li><Image dir="icon/" name="express.svg" alt="express-logo" width={iconSize} height={iconSize}/>&nbsp;<a href="https://expressjs.com/" target="_blank">Express</a></li>
                <li><Image dir="icon/" name="node.png" constant alt="node-logo" width={iconSize} height={iconSize}/>&nbsp;<a href="https://nodejs.org" target="_blank">Node.js</a></li>
                <li><Image dir="icon/" name="tw.png" constant alt="tw-logo" width={iconSize} height={iconSize}/>&nbsp;<a href="https://tailwindcss.com/" target="_blank">Tailwind CSS</a></li>
            </ul>
            </div>
            <div className="credit-card">
            <h1>Medias from</h1>
            <ul>
                <li><Image dir="icon/" name="flaticon.png" constant alt="flaticon-logo" width={iconSize} height={iconSize}/>&nbsp;<a href="https://flaticon.com" target="_blank">Flaticon</a></li>
                <li><Image dir="icon/" name="iconduck.png" constant alt="iconduck-logo" width={iconSize} height={iconSize}/>&nbsp;<a href="https://iconduck.com" target="_blank">Iconduck</a></li>
                <li><Image dir="icon/" name="brand-freepik.svg" alt="freepik-logo" width={iconSize} height={iconSize}/>&nbsp;<a href="https://www.freepik.com/" target="_blank">Freepik</a></li>
                <li><Image dir="icon/" name="microsoft-designer.png" constant alt="microsoft-designer-logo" width={iconSize} height={iconSize}/>&nbsp;<a href="https://designer.microsoft.com/" target="_blank">Microsoft Designer (AI Generated)</a></li>
                <li><a href="/medias-src">View media sources list</a></li>
            </ul>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-full light-theme-content-article-fade pt-6 sm:pt-12 dark:h-3/4 dark:dark-theme-footer-gradient"></div>
        </footer>
    )
}

function AuthenticateGate({ children, authenticatedAction, unauthenticatedAction, isolateAction }) {
    const { LoadingPage } = Neutral.Components;
    const { login, authUser } = useGlobal();
    const [ showingComponent, setShowingComponent ] = useState(LoadingPage)
    useDelayedEffect(() => isolateAction && isolateAction(), [], 500)
    useDelayedEffect(() => {
        if(login.isLoggedIn === true && authUser.isAuthUser !== null && authUser.isAuthUser.emailVerified){
            authenticatedAction && authenticatedAction();
        }else{
            unauthenticatedAction && unauthenticatedAction();
        }
        setShowingComponent(children);
    }, [login.isLoggedIn, authUser.isAuthUser], 500)
    return showingComponent
}

function PreventCrossSiteComponent({ children }){
    const [ component, setComponent ] = useState();
    useEffect(() => {
        if(window === window.parent) setComponent(children);
        else setComponent(<></>);
    }, []);
    return component
}


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
                setAppearance(<div id="menu-btn">Menu <Image width={15} height={15} dir="icon/" name="sort-down.png" alt="triangle-icon" onClick={menuBtn}/></div>)
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
                <li><a href="#about-me">About me</a></li>
                <li><a href="/my-projects">My Projects</a></li>
                <li><a>Lounge</a></li>
                <li><a>Contact</a></li>
            </ul>
            <ul>
                <ThemeChanger />
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

function CorousselElements({ total, bgImgsSrc, autoScroll, elems, wrappersStyle }) {
    let imgs = [];
    for (let i = 0; i < total; i++) imgs.push(
        <div className="c-elem w-screen h-screen" style={{ ...autoScroll, ...wrappersStyle[i], backgroundImage: `url(${bgImgsSrc + `/wallpaper-${i + 1}.jpg`})`, backgroundPositionX: "center", backgroundRepeat: "no-repeat", backgroundSize: "cover" }}>
            {elems[i]}
        </div>
    );
    return imgs;
}

function CorousselPage({ maxPages, btnFunc, tabsOpacity }) {
    let tabs = [];
    for (let i = 0; i < maxPages; i++) tabs.push(<div className='tab' id={`p-${i + 1}`} onClick={() => btnFunc(i + 1)} style={{ opacity: tabsOpacity[i] }}></div>);
    return tabs;
};

function Coroussel({ totalPages, corousselElements, corousselWrappersStyle }) {

    const [inUsed, setInUsed] = useState({
        rightArrow: false,
        leftArrow: false
    });
    const [page, setPage] = useState(1);
    const [tabsOpaque, setTabsOpaque] = useState((() => {
        let initial_opacity = [];
        for (let i = 0; i < totalPages; i++) initial_opacity.push(0.5);
        return initial_opacity;
    })());
    const rs = () => setPage((prevState) => prevState + 1);
    const ls = () => setPage((prevState) => prevState - 1);

    useEffect(() => {
        const autoScroll = setInterval(() => {
            if (!(page === totalPages)) rs();
            else for (let currentPage = page; currentPage > 1; currentPage--) ls();
        }, 5000);
        return () => clearInterval(autoScroll);
    }, [page])

    useEffect(() => {
        if (page <= 1) {
            setInUsed({
                rightArrow: false,
                leftArrow: true
            });
        } else if (page === totalPages) {
            setInUsed({
                rightArrow: true,
                leftArrow: false
            });
        } else {
            setInUsed({
                rightArrow: false,
                leftArrow: false
            });
        };
    }, [page]);

    useEffect(() => {
        setTabsOpaque(tabsOpaque.map((value, index, array) => {
            if (index === page - 1) return 1;
            else return 0.5;
        }))
    }, [page]);

    return (
        <div className='coroussel'>
            <div className='_elems'>
                <CorousselElements 
                    total={totalPages}
                    bgImgsSrc='/imgs/backend-images/coroussel'
                    autoScroll={{ transform: `translateX(${(page - 1) * -100}%)` }} 
                    elems={corousselElements}
                    wrappersStyle={corousselWrappersStyle}
                />
            </div>
            <div className='ctrl-btn'>
                <div className='arrows'>
                    <button id='lft' onClick={ls} disabled={inUsed.leftArrow} style={{ opacity: inUsed.leftArrow ? 0.5 : 1 }}>
                        <img src="/imgs/backend-images/icon/left-arrow.png" alt='Left next arrow' height='50' width='50' />
                    </button>
                    <button id='rght' onClick={rs} disabled={inUsed.rightArrow} style={{ opacity: inUsed.rightArrow ? 0.5 : 1 }}>
                        <img src="/imgs/backend-images/icon/right-arrow.png" alt='Right next arrow' height='50' width='50' />
                    </button>
                </div>
                <div className='page-selector'>
                    <CorousselPage maxPages={totalPages} btnFunc={setPage} tabsOpacity={tabsOpaque} />
                </div>
            </div>
        </div>
    );
}


const Components = {
    Dynamic: {
        InputField,
        InputGroupField,
        Image,
        AlertBox,
        Section,
        Coroussel,
        AuthenticateGate
    },
    ThemeChanger,
    Switch,
    SuspenseComponent,
    UserPFP,
    Media,
    CWRFooter,
    PreventCrossSiteComponent,
    NavBar,
};

const Hooks = {
    useDelayedEffect
}

const Functions = {
    isElementInViewport,
}

const Client = {
    Components, Hooks, Functions
}

export default Client;