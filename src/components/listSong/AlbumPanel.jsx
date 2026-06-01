import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { IconSearch } from '~/assets/image/icons';
import { addSongToAlbum, getMyAlbums } from '~/apis/songApi';
import { normalizeString } from '~/util/stringUtil';
import { setReduxRefresh } from '~/redux/reducer/songNotWhitelistSlice';
import './AlbumPanel.sass';

const AlbumPanel = ({ position, onClose, onNotification, onMouseEnter, onMouseLeave }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const reduxLibrarySong = useSelector((state) => state.songNotWhite.reduxLibrarySong);
    const reduxIsLogin = useSelector((state) => state.auth.reduxIsLogin);
    const reduxRefresh = useSelector((state) => state.songNotWhite.reduxRefresh);
    const dispatch = useDispatch();

    const [albums, setAlbums] = useState([]);

    // Fetch albums
    useEffect(() => {
        if (!reduxIsLogin) return;
        const loadAlbums = async () => {
            try {
                const albumData = await getMyAlbums();
                setAlbums(albumData);
            } catch (err) {
                console.error('Failed to fetch albums:', err);
            }
        };
        loadAlbums();
    }, [reduxIsLogin, reduxRefresh]);

    // Filter albums by search term
    const filteredAlbums = useMemo(() => {
        if (!searchTerm.trim()) return albums;
        const normalizedSearch = normalizeString(searchTerm);
        return albums.filter((a) => normalizeString(a.name).includes(normalizedSearch));
    }, [albums, searchTerm]);

    // Add song to selected album
    const handleAlbumSelect = async (e, albumId) => {
        e.stopPropagation();

        if (!Array.isArray(reduxLibrarySong) || reduxLibrarySong.length === 0) {
            onNotification('No songs selected');
            onClose();
            return;
        }

        try {
            for (const item of reduxLibrarySong) {
                if (item.type === 'addSongPlaylist') {
                    const res = await addSongToAlbum(albumId, item.id);
                    onNotification(res);
                    dispatch(setReduxRefresh());
                }
            }
        } catch (err) {
            onNotification('Failed to add song to album');
        }
        onClose();
    };

    // Auto-focus for keyboard navigation
    useEffect(() => {
        const albumList = document.querySelector('.album-list');
        if (albumList) albumList.focus();
    }, []);

    return (
        <div
            className="album-panel"
            role="menu"
            style={{ top: `${position.y}px`, left: `${position.x}px` }}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
            }}
            onWheel={(e) => e.stopPropagation()}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}>
            <div className="header">
                <div className="search">
                    <IconSearch height={14} className="icon" />
                    <input
                        type="text"
                        placeholder="Find an album"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div
                className="album-list"
                tabIndex={0}
                onWheel={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                        e.preventDefault();
                        const items = document.querySelectorAll('.album-item');
                        const current = document.activeElement;
                        const index = Array.from(items).indexOf(current);
                        const nextIndex = e.key === 'ArrowDown' ? index + 1 : index - 1;
                        if (items[nextIndex]) items[nextIndex].focus();
                    }
                }}>
                {filteredAlbums.length > 0 ? (
                    filteredAlbums.map((album) => (
                        <div
                            key={album.id}
                            role="menuitem"
                            className="album-item"
                            tabIndex={-1}
                            onClick={(e) => handleAlbumSelect(e, album.id)}>
                            {album.name}
                        </div>
                    ))
                ) : (
                    <div className="album-item">No albums found</div>
                )}
            </div>
        </div>
    );
};

export default AlbumPanel;
