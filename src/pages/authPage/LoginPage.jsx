import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { login, profile } from '~/apis/authApi';
import GoogleLoginButton from '~/components/buttons/GoogleLoginButton';
import { isValidEmail } from '~/util/validUtils';
import { LogoMain } from '~/assets/image/icons';
import { setReduxLogin, setReduxUser } from '~/redux/reducer/authSlice';
import './LoginPage.sass';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const isLogin = useSelector((state) => state.auth.reduxIsLogin);

    useEffect(() => {
        if (isLogin) {
            navigate('/');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLogin]);

    const hangdleLogin = async () => {
        if (!isValidEmail(email)) {
            setErrorMessage("This email is invalid. Make sure it's written like example@email.com");
            return;
        }
        try {
            const res = await login(email, password);
            dispatch(setReduxLogin(res.accessToken));

            const userProfile = await profile();
            dispatch(setReduxUser(userProfile));

            navigate('/');
        } catch (error) {
            console.error('Error in login/profile:', error.response || error);
            setErrorMessage(error.response?.data?.message || 'Something went wrong. Please try again.');
        }
    };

    return (
        <div className="login-page">
            <div className="sign-up">
                <header className="sign-up-header">
                    <LogoMain height={32} />
                    <h5 className="sign-up-title">Log in to Spotify</h5>
                </header>

                <div className="sign-up-email">
                    <div className="email-label">
                        <label htmlFor="email-input" className="form-label">
                            Email address
                        </label>
                    </div>
                    <input
                        type="email"
                        id="email-input"
                        placeholder="name@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <div className="password-label">
                        <label htmlFor="password-input" className="form-label">
                            Password
                        </label>
                    </div>
                    <input
                        type="password"
                        id="password-input"
                        placeholder="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className="error-message">{errorMessage && <span>{errorMessage}</span>}</div>

                    <div>
                        <button className="btn-login" onClick={hangdleLogin}>
                            Login
                        </button>
                    </div>
                </div>

                <div className="divider">or</div>
                <GoogleLoginButton setErrorMessage={setErrorMessage} />
                <div className="dividerFull"></div>

                <footer className="sign-up-footer">
                    <div className="have-account">
                        <div className="have-account-text">Already have an account?</div>
                        <div className="login-link">
                            <Link to="/signUpInitiatePage">Sign up here</Link>
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

export default LoginPage;
