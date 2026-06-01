import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { cleanReduxLibrarySong } from '~/redux/reducer/songNotWhitelistSlice';
import Notification from '~/components/librarySong/Notification';
import ContextMenu from './ContextMenu';
import './LibrarySong.sass';

const LibrarySong = () => {
    const [menuPosition, setMenuPosition] = useState(null);
    const [notificationData, setNotificationData] = useState(null);
    const [notificationKey, setNotificationKey] = useState(0);

    const reduxLibrarySong = useSelector((state) => state.songNotWhite.reduxLibrarySong);
    const dispatch = useDispatch();

    // Handle body overflow when menu is open
    useEffect(() => {
        if (menuPosition) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [menuPosition]);

    // Close menu and clean redux
    const handleCloseMenu = () => {
        setMenuPosition(null);
        dispatch(cleanReduxLibrarySong());
    };

    // Handle context menu trigger
    useEffect(() => {
        const handleContextMenu = (e) => {
            e.preventDefault();

            // Check if reduxLibrarySong is an array and has valid items
            if (!Array.isArray(reduxLibrarySong) || reduxLibrarySong.length === 0) {
                console.log('No items selected, not opening menu');
                return;
            }
            if (menuPosition) {
                console.log('Menu already open, closing it');
                handleCloseMenu();
                return;
            }

            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const menuWidth = 200;
            const menuHeight = 100;
            const x = Math.min(e.clientX, windowWidth - menuWidth);
            const y = Math.min(e.clientY, windowHeight - menuHeight);

            // console.log('Opening context menu at:', { x, y }, 'for items:', reduxLibrarySong);
            setMenuPosition({ x, y });
        };

        const handleClick = (e) => {
            const isMenuClick = e.target.closest('.library-song-menu');
            const isPlaylistClick = e.target.closest('.playlist-selection-panel');
            if (!isMenuClick && !isPlaylistClick) {
                handleCloseMenu();
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('click', handleClick);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [menuPosition, reduxLibrarySong]);

    // Keyboard accessibility
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) {
                e.preventDefault();
                console.log('Keyboard context menu triggered');
                setMenuPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Handle notification display
    const showNotification = (message) => {
        setNotificationData(message);
        setNotificationKey((prev) => prev + 1);
    };

    return (
        <div className="library-song-container">
            <Notification key={notificationKey} message={notificationData} setNotificationData={setNotificationData} />
            {menuPosition && (
                <ContextMenu
                    position={menuPosition}
                    reduxData={reduxLibrarySong}
                    onClose={handleCloseMenu}
                    onNotification={showNotification}
                />
            )}
        </div>
    );
};

export default LibrarySong;
