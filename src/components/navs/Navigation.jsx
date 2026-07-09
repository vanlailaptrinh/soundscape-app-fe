import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect, useRef } from 'react';

import NoAvatar from '~/assets/image/noAvatar.png';
import {
    setReduxIsHomeActiveTrue,
    setReduxIsBrowseActiveTrue,
    setReduxIsNotificationActive,
} from '~/redux/reducer/uiSlice';
import { setReduxIsRight, setReduxExtendedFullRight } from '~/redux/reducer/songNotWhitelistSlice';
import { setReduxLogout } from '~/redux/reducer/authSlice';
import {
    LogoMain,
    IconHouseFull,
    IconHomeEmpty,
    IconSearch,
    IconBrowseFull,
    IconBrowseEmpty,
    IconClose,
    IconInstall,
    IconNotificationEmpty,
    IconNotificationFull,
    IconFriends,
} from '~/assets/image/icons';
import { logout } from '~/apis/authApi';
import ThemeToggle from '~/components/theme/ThemeToggle';
import './Navigation.sass';

const Navigation = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const searchInputRef = useRef(null);

    const isHomeActive = useSelector((state) => state.ui.reduxIsHomeActive);
    const isBrowseActive = useSelector((state) => state.ui.reduxIsBrowseActive);
    const isNotificationActive = useSelector((state) => state.ui.reduxIsNotificationActive);

    const reduxUser = useSelector((state) => state.auth.reduxUser);
    const isLogin = useSelector((state) => state.auth.reduxIsLogin);

    const [searchValue, setSearchValue] = useState('');
    const [displayIconClose, setDisplayIconClose] = useState(false);
    const [settings, setSetTings] = useState(false);
    const [lastSearchParams, setLastSearchParams] = useState(null);
    const [isFirstSearch, setIsFirstSearch] = useState(true);

    // Reset khi đổi trang (trừ trang search)
    useEffect(() => {
        if (!location.pathname.startsWith('/search/')) {
            setSearchValue('');
            setDisplayIconClose(false);
            setIsFirstSearch(true);
            if (searchInputRef.current) searchInputRef.current.blur();
        }
    }, [location.pathname]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchValue(value);
        setDisplayIconClose(value.length > 0);
    };

    // Đóng input search
    const handleClose = () => {
        setSearchValue('');
        setDisplayIconClose(false);
        setIsFirstSearch(true);
        if (searchInputRef.current) searchInputRef.current.blur();
    };

    // Logout
    const handleLogout = () => {
        setSetTings(false);
        logout()
            .then(() => {
                dispatch(setReduxLogout());
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const hasRole = (role) => reduxUser?.roles?.includes(role);

    // ENTER TO SEARCH (đã thêm preventDefault – Cách 2)
    const handleSearchSubmit = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Ngăn reload hoặc form submit mặc định
            if (searchValue.trim() === '') return;
            const newSearchParams = encodeURIComponent(searchValue.trim());

            if (newSearchParams === lastSearchParams) return;

            const shouldReplace = !isFirstSearch;

            navigate(`/search/${newSearchParams}`, {
                replace: shouldReplace,
            });

            dispatch(setReduxExtendedFullRight(false));

            setLastSearchParams(newSearchParams);
            setIsFirstSearch(false);

            if (searchInputRef.current) searchInputRef.current.blur();
        }
    };

    const handleLogo = () => {
        dispatch(setReduxIsRight(false));
        dispatch(setReduxExtendedFullRight(false));
    };

    return (
        <div className="navigation">
            {isLogin ? (
                <>
                    <div className="navigation-left">
                        <Link to="/" className="logo" onClick={handleLogo}>
                            <LogoMain height={32} />
                        </Link>
                    </div>

                    <div className="navigation-right">
                        <div className="isHomeActive" onClick={() => dispatch(setReduxIsHomeActiveTrue())}>
                            {isHomeActive ? <IconHouseFull /> : <IconHomeEmpty />}
                        </div>

                        <div className="search">
                            <div className="icon-search">
                                <IconSearch />
                            </div>

                            <div className="input-search">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="What do you want to play?"
                                    value={searchValue}
                                    onChange={handleSearchChange}
                                    onKeyDown={handleSearchSubmit}
                                />
                                <div
                                    className="closeIcon"
                                    style={{ opacity: displayIconClose ? 1 : 0 }}
                                    onClick={handleClose}>
                                    <IconClose />
                                </div>
                            </div>

                            <div className="browser" onClick={() => dispatch(setReduxIsBrowseActiveTrue())}>
                                {isBrowseActive ? <IconBrowseFull /> : <IconBrowseEmpty />}
                            </div>
                        </div>

                        <div className="explore-premium">
                            <span>Explore Premium</span>
                        </div>

                        <div className="install-app">
                            <div className="icon-install">
                                <IconInstall />
                            </div>
                            <div>
                                <span>Install App</span>
                            </div>
                        </div>

                        <div
                            className="icon-notification"
                            onClick={() => dispatch(setReduxIsNotificationActive(!isNotificationActive))}>
                            {isNotificationActive ? <IconNotificationFull /> : <IconNotificationEmpty />}
                        </div>

                        <ThemeToggle />

                        <div className="icon-friends">
                            <IconFriends />
                        </div>

                        <div className="profile" onClick={() => setSetTings((pre) => !pre)}>
                            {reduxUser?.urlAvatar ? (
                                <img src={reduxUser.urlAvatar} alt="Profile" />
                            ) : (
                                <img src={NoAvatar} alt="No Avatar" />
                            )}
                        </div>
                    </div>

                    {settings && (
                        <div className="settings">
                            <div
                                className="setting"
                                onClick={() => {
                                    setSetTings(false);
                                    navigate('/profile');
                                }}>
                                Profile
                            </div>

                            {hasRole('ARTIST') && (
                                <div
                                    className="setting"
                                    onClick={() => {
                                        setSetTings(false);
                                        navigate('/your-music');
                                    }}>
                                    Your Music
                                </div>
                            )}

                            {hasRole('ADMIN') && (
                                <div
                                    className="setting"
                                    onClick={() => {
                                        setSetTings(false);
                                        navigate('/admin');
                                    }}>
                                    Admin Dashboard
                                </div>
                            )}

                            <div className="setting" onClick={handleLogout}>
                                Log out
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <>
                    <div className="navigation-left">
                        <Link to="/" className="logo">
                            <LogoMain height={32} />
                        </Link>

                        <div className="isHomeActive" onClick={() => dispatch(setReduxIsHomeActiveTrue())}>
                            {isHomeActive ? <IconHouseFull /> : <IconHomeEmpty />}
                        </div>

                        <div className="search">
                            <div className="icon-search">
                                <IconSearch />
                            </div>

                            <div className="input-search">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="What do you want to play?"
                                    value={searchValue}
                                    onChange={handleSearchChange}
                                    onKeyDown={handleSearchSubmit} // <-- ENTER SEARCH
                                />

                                <div
                                    className="closeIcon"
                                    style={{ opacity: displayIconClose ? 1 : 0 }}
                                    onClick={handleClose}>
                                    <IconClose />
                                </div>
                            </div>

                            <div className="browser" onClick={() => dispatch(setReduxIsBrowseActiveTrue())}>
                                {isBrowseActive ? <IconBrowseFull /> : <IconBrowseEmpty />}
                            </div>
                        </div>
                    </div>

                    <div className="navigation-right">
                        <Link className="link" to="#">
                            <div className="premium">Premium</div>
                        </Link>
                        <Link className="link" to="#">
                            <div className="support">Support</div>
                        </Link>
                        <Link className="link" to="#">
                            <div className="download">Download</div>
                        </Link>

                        <div className="install-app">
                            <div className="icon-install">
                                <IconInstall />
                            </div>
                            <div>
                                <span>Install App</span>
                            </div>
                        </div>

                        <ThemeToggle />

                        <Link className="link" to="/signUpInitiatePage">
                            <div className="sign-up">Sign up</div>
                        </Link>

                        <Link className="link" to="/loginPage">
                            <div className="login">Log in</div>
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
};

export default Navigation;
