import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from 'react-redux';

import { LogoMain } from "~/assets/image/icons";
import { setReduxLogin, setReduxUser } from "~/redux/reducer/authSlice";
import { registerVerify, profile } from "~/apis/authApi";
import './SignUpVerifyPage.sass';

const SignUpVerifyPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [errorMessage, setErrorMessage] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const completeSignUp = async () => {
        if (!token) {
            setErrorMessage("Invalid or missing verification token.");
            return;
        }

        setIsVerifying(true);
        setErrorMessage('');

        try {
            const data = await registerVerify(token);
            if (data && data.accessToken) {
                dispatch(setReduxLogin(data.accessToken));
                const userProfile = await profile();
                dispatch(setReduxUser(userProfile));
                navigate("/");
            } else {
                // If it doesn't return accessToken, maybe just redirect to login
                navigate("/loginPage");
            }
        } catch (error) {
            console.log("Error in catch:", error.response);
            setErrorMessage(error.response?.data?.message || "Verification failed. Please try again.");
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="sign-up-vertify-page">
            <div className="sign-up-vertify">
                <header className="sign-up-header">
                    <LogoMain height={32} />
                </header>
                <div className="verification-successfully">
                    Ready to verify your account!
                </div>
                <div className="verification">
                    <div className="error-message">
                        {errorMessage && <span>{errorMessage}</span>}
                    </div>

                    <div>
                        <button className="btn-complete" onClick={completeSignUp} disabled={isVerifying}>
                            {isVerifying ? "Verifying..." : "Verify Account"}
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
