import { useEffect, useState } from 'react';
import PlaylistPanel from './PlaylistPanel';
import AlbumPanel from '~/components/listSong/AlbumPanel';
import { useMenuOptions } from './hooks/useMenuOptions';
import './ContextMenu.sass';

const ContextMenu = ({ position, reduxData, onClose, onNotification }) => {
    const [playlistPanelPosition, setPlaylistPanelPosition] = useState(null);
    const [albumPanelPosition, setAlbumPanelPosition] = useState(null);

    // Hiển thị playlist panel
    const showPlaylistPanel = () => {
        const panelWidth = 200;
        const panelX = position.x + 200;
        const panelY = position.y;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const adjustedX = Math.min(panelX, windowWidth - panelWidth);
        const adjustedY = Math.min(panelY, windowHeight - 100);
        setAlbumPanelPosition(null); // tắt album nếu có
        setPlaylistPanelPosition({ x: adjustedX, y: adjustedY });
    };

    // Hiển thị album panel
    const showAlbumPanel = () => {
        const panelWidth = 200;
        const panelX = position.x + 200;
        const panelY = position.y;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const adjustedX = Math.min(panelX, windowWidth - panelWidth);
        const adjustedY = Math.min(panelY, windowHeight - 100);
        setPlaylistPanelPosition(null); // tắt playlist nếu có
        setAlbumPanelPosition({ x: adjustedX, y: adjustedY });
    };

    // Lấy menu option
    const baseMenuOptions = useMenuOptions(reduxData, onNotification);

    // Thêm hành động mở panel
    const menuOptions = baseMenuOptions.map((option) => ({
        ...option,
        action: option.isPlaylistAction ? showPlaylistPanel : option.isAlbumAction ? showAlbumPanel : option.action,
    }));

    // Khóa scroll khi menu mở
    useEffect(() => {
        const preventScroll = (e) => e.preventDefault();
        document.body.style.overflow = 'hidden';
        window.addEventListener('wheel', preventScroll, { passive: false });
        window.addEventListener('touchmove', preventScroll, { passive: false });

        return () => {
            document.body.style.overflow = 'auto';
            window.removeEventListener('wheel', preventScroll);
            window.removeEventListener('touchmove', preventScroll);
        };
    }, []);

    // Click item
    const handleMenuItemClick = (e, option) => {
        e.stopPropagation();
        if (!option.isPlaylistAction && !option.isAlbumAction) {
            option.action();
            onClose();
        }
    };

    // Hover
    const handleMenuItemHover = (option) => {
        if (option.isPlaylistAction && option.action) {
            option.action();
        } else if (option.isAlbumAction && option.action) {
            option.action();
        } else {
            setPlaylistPanelPosition(null);
            setAlbumPanelPosition(null);
        }
    };

    return (
        <>
            <div
                className="library-song-menu"
                role="menu"
                style={{ top: `${position.y}px`, left: `${position.x}px` }}
                onClick={onClose}
                onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onClose();
                }}>
                {menuOptions.map((option, index) => (
                    <div
                        key={index}
                        role="menuitem"
                        className="library-song-menu-item"
                        onClick={(e) => handleMenuItemClick(e, option)}
                        onMouseEnter={() => handleMenuItemHover(option)}>
                        {option.label}
                    </div>
                ))}
            </div>

            {playlistPanelPosition && (
                <PlaylistPanel position={playlistPanelPosition} onClose={onClose} onNotification={onNotification} />
            )}

            {albumPanelPosition && (
                <AlbumPanel position={albumPanelPosition} onClose={onClose} onNotification={onNotification} />
            )}
        </>
    );
};

export default ContextMenu;
