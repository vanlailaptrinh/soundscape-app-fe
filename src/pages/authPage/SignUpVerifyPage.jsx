import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';

import { LogoMain } from "~/assets/image/icons";
import { setReduxLogin, setReduxUser } from "~/redux/reducer/authSlice";
import { registerVerify, profile } from "~/apis/authApi"
import './SignUpVerifyPage.sass';


const SignUpVerifyPage = () => {
    const [verifyCode, setVerifyCode] = useState('');

    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const email = useSelector(state => state.auth.reduxEmail);

    const completeSignUp = async () => {
        try {
            const data = await registerVerify(email, verifyCode);
            dispatch(setReduxLogin(data.accessToken));
            const userProfile = await profile();
            dispatch(setReduxUser(userProfile));
            navigate("/");
        } catch (error) {
            console.log("Error in catch:", error.response);
            setErrorMessage(error.response?.data?.message);
        }
    };

    return (
        <div className="sign-up-vertify-page">
            <div className="sign-up-vertify">
                <header className="sign-up-header">
                    <LogoMain height={32} />
                </header>
                <div className="verification-successfully">
                    Verification code sent successfully! Please verify your email.
                </div>
                <div className="verification">
                    <div className="verification-lable">
                        <label htmlFor="email-input" className="form-label">Verification code</label>
                    </div>
                    <input
                        id="verification-code" placeholder="123456" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)}
                    />

                    <div className="error-message">
                        {errorMessage && <span>{errorMessage}</span>}
                    </div>

                    <div>
                        <button className="btn-complete" onClick={completeSignUp}  >
                            Complete
                        </button>
                    </div>
                </div>
                <footer className="sign-up-footer">
                    <div className="have-account">
                        <div className="have-account-text">
                            Already have an account?
                        </div>
                        <div className="login-link">
                            <Link to="/loginPage">Log in here</Link>
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

export default SignUpVerifyPage;
