"use client"

import "./client.css"
import { useState, useRef } from "react";
import { Components } from "@/glient/util";
import { Functions } from"@/geutral/util";
import { signInWithEmailAndPassword, signOut } from "@firebase/auth"
import { useGlobal } from "@/glient/global";
import { auth } from "@/glient/firebase";

export default function SignIn() {

    const { Switch, AlertBox, Dynamic } = Components;
    const { InputField } = Dynamic;

    const { login } = useGlobal();

    const userEmail = useRef("");
    const userPass = useRef("");
    const userName = useRef("");

    const [inputType, setInputType] = useState("password");
    const [result, debug] = useState(false);
    const [result2, debug2] = useState(false);
    const [dialogMessages, setDM] = useState({
        title: "",
        subtitle: "",
        description: ""
    })
    const [errMsg, setErrMsg] = useState("");

    function initiateSignInProgress(e) {
        e.preventDefault();

        signInWithEmailAndPassword(auth, userEmail.current, userPass.current).then((userCredential) => {
            const user = userCredential.user;
            const username = user.displayName;
            if (username === userName.current) {
                login.logIn(true);
                window.location.replace("/");
            } else {
                debug(true);
                setErrMsg("Invalid username");
                signOut(auth);
            }
        }).catch((error) => {
            if (error.code === "auth/invalid-login-credentials") { debug(true); setErrMsg("Email or password is incorrect!"); }
            else { debug(true); setErrMsg("Something went wrong, please try again later"); };
        })
    };

    function onFormUpdate(e, refValue) {
        e.preventDefault();
        refValue.current = e.target.value;
    };

    return (
        <>
            <h2 className="reg-t responsive">Sign In</h2>
            <form className="reg-form" onClick={(e) => e.stopPropagation()} onSubmit={initiateSignInProgress}>
                <div className="f-c">
                    <label className="field-label responsive">Username</label>
                    <InputField
                        name="user" type="text" required
                        onChange={{
                            binded: true,
                            expected_condition: [0],
                            run_test: (e) => 0,
                            actions: [(e) => onFormUpdate(e, userName)]
                        }}
                    />
                    <label className="field-label responsive">Email</label>
                    <InputField
                        name="email" type="email" required
                        onChange={{
                            binded: true,
                            expected_condition: [0],
                            run_test: (e) => 0,
                            actions: [(e) => onFormUpdate(e, userEmail)]
                        }}
                    />
                    <label className="field-label responsive">Password</label>
                    <InputField
                        name="password" type={inputType} required
                        onChange={{
                            binded: true,
                            expected_condition: [0],
                            run_test: (e) => 0,
                            actions: [(e) => onFormUpdate(e, userPass)]
                        }}
                    />
                    <div className="option-field responsive">
                        <div className="show-pass">
                            <Switch mode="action-on-off" action={() => setInputType("text")} altAction={() => setInputType("password")} />
                            <label className="field-label responsive">Show Password</label>
                        </div>
                        <span className="forget-password responsive" onClick={() => sendPasswordResetEmail(auth, prompt("Your email:")).then(() => {
                            debug2(true);
                            setDM((prevDM) => ({ ...prevDM, title: "Password reset email has been sent!", subtitle: "Please check your email inbox!", description: "" }))
                        }).catch(() => alert("Invalid Email"))}>Forgot your password? Reset it here</span>
                    </div>
                    <button className="submit-btn responsive" type="submit">Sign In</button>
                </div>
            </form>
            <AlertBox id="sign-in-alert-box" detect={result} messages={{
                title: "Sign in failed",
                subtitle: errMsg,
                action: "OK"
            }}
                action={() => { debug(false); Functions.jobDelay(() => setErrMsg(""), 500); }} />
            <AlertBox id="password-change-alert-box" detect={result2} messages={{
                title: dialogMessages.title,
                subtitle: dialogMessages.subtitle,
                description: dialogMessages.description,
                action: "OK"
            }}
                action={() => { debug2(false); }} />
        </>
    )
}