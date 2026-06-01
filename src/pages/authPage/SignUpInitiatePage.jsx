import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';

import { registerInitiate } from "~/apis/authApi"
import { isValidEmail } from "~/util/validUtils";
import { LogoMain, IconGoogle } from "~/assets/image/icons";
import { setReduxEmail } from "~/redux/reducer/authSlice";
import './SignUpInitiatePage.sass';


const SignUpInitiatePage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();
    const dispatch = useDispatch();


    const hangdleNext = () => {
        if (!isValidEmail(email)) {
            setErrorMessage("This email is invalid. Make sure it's written like example@email.com");
            return;
        }
        registerInitiate(email, password)
            .then((res) => {
                dispatch(setReduxEmail(email));
                console.log(res)
                navigate("/signUpVerifyPage");
            })
            .catch((error) => {
                console.log("Error in catch:", error.response);
                setErrorMessage(error.response?.data?.message);
            });
    };
    return (
        <div className="sign-up-page">
            <div className="sign-up">
                <header className="sign-up-header">
                    <LogoMain height={32} />
                    <h1 className="sign-up-title">
                        Sign up to <br /> start listening
                    </h1>
                </header>

                <div className="sign-up-email">
                    <div className="email-label">
                        <label htmlFor="email-input" className="form-label">Email address</label>
                    </div>
                    <input
                        type="email"
                        id="email-input" placeholder="name@domain.com" value={email} onChange={(e) => setEmail(e.target.value)}
                    />
                    <div className="password-label">
                        <label htmlFor="password-input" className="form-label">Password</label>
                    </div>
                    <input
                        type="password"
                        id="password-input" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className="error-message">
                        {errorMessage && <span>{errorMessage}</span>}
                    </div>

                    <div>
                        <button className="btn-next" onClick={hangdleNext} >
                            Next
                        </button>
                    </div>
                </div>

                <div className="divider">or</div>

                <div className="social-login">
                    <div className="google-login">
                        <div className="icon-google" >
                            <IconGoogle />
                        </div>
                        <div className="signUpGoogle">Sign up with Google</div>
                    </div>
                </div>

                <div className="dividerFull">
                </div>


                <footer className="sign-up-footer">
                    <div className="have-account">
                        <div className="have-account-text">
                            Already have an account?
                        </div>
                        <div className="login-link">
                            <Link to="login">Log in here</Link>
                        </div>
                    </div>
                    <div className="policy">
                        This site is protected by reCAPTCHA and the Google <br />
                        Privacy Policy and Terms of Service apply.
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default SignUpInitiatePage;
