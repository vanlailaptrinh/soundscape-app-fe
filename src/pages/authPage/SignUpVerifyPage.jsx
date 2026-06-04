import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useDispatch } from 'react-redux';

import { LogoMain } from "~/assets/image/icons";
import { setReduxLogin, setReduxUser } from "~/redux/reducer/authSlice";
import { registerVerify, profile } from "~/apis/authApi";
import './SignUpVerifyPage.sass';

const SignUpVerifyPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    // status: 'loading' | 'success' | 'error'
    const [status, setStatus] = useState('loading');
    const [errorMessage, setErrorMessage] = useState('');
    const hasCalledVerify = useRef(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        if (!token) {
            setErrorMessage("Invalid or missing verification token.");
            setStatus('error');
            return;
        }

        if (!hasCalledVerify.current) {
            hasCalledVerify.current = true;
            completeSignUp();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const completeSignUp = async () => {
        try {
            const data = await registerVerify(token);
            if (data && data.accessToken) {
                // Set auth header before calling profile
                const { updateAuthHeader } = await import('~/apis/api');
                updateAuthHeader(data.accessToken);

                try {
                    const userProfile = await profile();
                    dispatch(setReduxLogin(data.accessToken));
                    dispatch(setReduxUser(userProfile));
                } catch (profileError) {
                    // profile failed but verify succeeded -> still login
                    dispatch(setReduxLogin(data.accessToken));
                }

                setStatus('success');
                setTimeout(() => navigate("/"), 2500);
            } else {
                setStatus('success');
                setTimeout(() => navigate("/loginPage"), 2500);
            }
        } catch (error) {
            console.log("Error in catch:", error.response);
            setErrorMessage(error.response?.data?.message || "Verification failed. Please try again.");
            setStatus('error');
        }
    };

    return (
        <div className="sign-up-vertify-page">
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes popIn {
                    0% { transform: scale(0); opacity: 0; }
                    70% { transform: scale(1.15); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes checkDraw {
                    0% { stroke-dashoffset: 100; }
                    100% { stroke-dashoffset: 0; }
                }
                @keyframes fadeSlideUp {
                    0% { opacity: 0; transform: translateY(10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <div className="sign-up-vertify">
                <header className="sign-up-header">
                    <LogoMain height={32} />
                </header>

                <div className="verification" style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: '20px', padding: '40px 0'
                }}>

                    {/* ── LOADING ── */}
                    {status === 'loading' && (
                        <>
                            <div style={{
                                width: '72px', height: '72px',
                                border: '5px solid #2a2a2a',
                                borderTop: '5px solid #1ed760',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }} />
                            <div style={{ color: '#fff', fontSize: '18px', fontWeight: '600' }}>
                                Verifying your account...
                            </div>
                            <div style={{ color: '#b3b3b3', fontSize: '14px' }}>
                                Please wait a moment
                            </div>
                        </>
                    )}

                    {/* ── SUCCESS ── */}
                    {status === 'success' && (
                        <>
                            <div style={{ animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' }}>
                                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="40" cy="40" r="40" fill="#1ed760" />
                                    <polyline
                                        points="22,42 34,54 58,28"
                                        fill="none"
                                        stroke="white"
                                        strokeWidth="6"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeDasharray="100"
                                        strokeDashoffset="0"
                                        style={{ animation: 'checkDraw 0.4s ease 0.3s both' }}
                                    />
                                </svg>
                            </div>
                            <div style={{
                                color: '#fff', fontSize: '22px', fontWeight: '700',
                                animation: 'fadeSlideUp 0.4s ease 0.5s both'
                            }}>
                                Account Verified!
                            </div>
                            <div style={{
                                color: '#b3b3b3', fontSize: '14px', textAlign: 'center',
                                animation: 'fadeSlideUp 0.4s ease 0.65s both'
                            }}>
                                You are now logged in. Redirecting to home...
                            </div>
                        </>
                    )}

                    {/* ── ERROR ── */}
                    {status === 'error' && (
                        <>
                            <div style={{ animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' }}>
                                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="40" cy="40" r="40" fill="#e22134" />
                                    <line x1="26" y1="26" x2="54" y2="54" stroke="white" strokeWidth="6" strokeLinecap="round" />
                                    <line x1="54" y1="26" x2="26" y2="54" stroke="white" strokeWidth="6" strokeLinecap="round" />
                                </svg>
                            </div>
                            <div style={{ color: '#fff', fontSize: '20px', fontWeight: '700' }}>
                                Verification Failed
                            </div>
                            <div style={{ color: '#e22134', fontSize: '14px', textAlign: 'center', maxWidth: '280px' }}>
                                {errorMessage}
                            </div>
                            <button className="btn-complete" onClick={() => navigate('/loginPage')}>
                                Go to Login
                            </button>
                        </>
                    )}
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
