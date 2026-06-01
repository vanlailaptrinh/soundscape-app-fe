import { NavLink, useLocation, Navigate } from 'react-router-dom';
import { useState, useCallback, useEffect } from 'react';

import Navigator from '~/components/navs/Navigation';
import UserList from '~/pages/adminPage/UserList';
import SongList from '~/pages/adminPage/SongList';
import UserDetail from '~/pages/adminPage/UserDetail';
import SongDetail from '~/pages/adminPage/SongDetail';
import SongListeningChart from '~/pages/adminPage/SongListeningChart';

import './AdminPage.sass';
import AppListeningStats from '~/pages/adminPage/AppListeningStats';

const pages = {
    UserList: UserList,
    SongList: SongList,
    AppListeningStats: AppListeningStats,
};

const AdminPage = () => {
    const location = useLocation();

    const [isRightActive, setIsRightActive] = useState(false);
    const [isMenuActive, setIsMenuActive] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedSong, setSelectedSong] = useState(null);
    const [chartSongId, setChartSongId] = useState(null);
    const [refreshFlag, setRefreshFlag] = useState(false);

    const openRightPanel = useCallback(() => setIsRightActive(true), []);
    const closeRightPanel = useCallback(() => {
        setIsRightActive(false);
        setSelectedUser(null);
        setSelectedSong(null);
    }, []);

    const handleOpenUserDetail = (userId) => {
        setChartSongId(null);
        setSelectedSong(null);
        setSelectedUser(userId);
        openRightPanel();
    };

    const handleOpenSongDetail = (songId) => {
        setChartSongId(null);
        setSelectedUser(null);
        setSelectedSong(songId);
        openRightPanel();
    };

    const handleOpenSongChart = (songId) => {
        setChartSongId(songId);
        setSelectedUser(null);
        setSelectedSong(null);
        setIsRightActive(false);
    };

    // Extract slug only from admin paths
    const slug = location.pathname.startsWith('/admin/')
        ? location.pathname.split('/admin/')[1]
        : location.pathname === '/admin'
          ? ''
          : null;

    // Reset states when slug changes
    useEffect(() => {
        setIsRightActive(false);
        setSelectedUser(null);
        setSelectedSong(null);
        setChartSongId(null);
    }, [slug]);

    // Redirect to UserList if accessing /admin without subpage
    if (slug === '') {
        return <Navigate to="/admin/UserList" replace />;
    }

    // If not on admin route, don't render
    if (slug === null) {
        return null;
    }

    const PageComponent = pages[slug] || (() => <div>404</div>);

    return (
        <>
            <Navigator />

            <div className="adminWrapper">
                <div className={`adminLeft ${isMenuActive ? 'menuActive' : ''}`}>
                    <div className="adminLogo">Admin</div>

                    {Object.keys(pages).map((key) => (
                        <NavLink key={key} to={`/admin/${key}`} className="adminNav">
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                        </NavLink>
                    ))}
                </div>

                <div className={`adminMiddle ${chartSongId ? 'hideMiddle' : ''} ${isRightActive ? 'rightActive' : ''}`}>
                    {!chartSongId && (
                        <PageComponent
                            openRightPanel={openRightPanel}
                            closeRightPanel={closeRightPanel}
                            onSelectUser={handleOpenUserDetail}
                            onSelectSong={handleOpenSongDetail}
                            openChart={handleOpenSongChart}
                            refreshFlag={refreshFlag}
                        />
                    )}
                </div>

                {chartSongId && (
                    <div className="adminMiddle chartMode">
                        <SongListeningChart songId={chartSongId} closeChart={() => setChartSongId(null)} />
                    </div>
                )}

                <div className={`adminRight ${isRightActive ? 'rightActive' : ''}`}>
                    {isRightActive && (
                        <>
                            <div className="rightPanelHeader">
                                <div className="rightPanelTitle">Chi tiết</div>
                                <div className="closeRightPanel" onClick={closeRightPanel}>
                                    ✕
                                </div>
                            </div>

                            <div className="rightPanelContent">
                                {selectedUser && (
                                    <UserDetail
                                        userId={selectedUser}
                                        closeRightPanel={closeRightPanel}
                                        setRefreshFlag={setRefreshFlag}
                                    />
                                )}

                                {selectedSong && (
                                    <SongDetail
                                        songId={selectedSong}
                                        closeRightPanel={closeRightPanel}
                                        setRefreshFlag={setRefreshFlag}
                                        openChart={handleOpenSongChart}
                                    />
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default AdminPage;
