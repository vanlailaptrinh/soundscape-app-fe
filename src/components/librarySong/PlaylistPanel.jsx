import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { IconPlus, IconSearch } from '~/assets/image/icons';
import { addSongToPlaylist, createPlaylistWithSong, getMyPlaylists } from '~/apis/songApi';
import { normalizeString } from '~/util/stringUtil';
import { setReduxRefresh } from '~/redux/reducer/songNotWhitelistSlice';
import './PlaylistPanel.sass';

const PlaylistPanel = ({ position, onClose, onNotification, onMouseEnter, onMouseLeave }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const reduxLibrarySong = useSelector((state) => state.songNotWhite.reduxLibrarySong);
    const dispatch = useDispatch();

    const reduxRefresh = useSelector((state) => state.songNotWhite.reduxRefresh);
    const reduxIsLogin = useSelector((state) => state.auth.reduxIsLogin);
    const [playlists, setPlaylists] = useState([]);
    useEffect(() => {
        if (!reduxIsLogin) return;
        const loadPlaylists = async () => {
            try {
                const playlistData = await getMyPlaylists();
                setPlaylists(playlistData);
            } catch (err) {
                console.error('Failed to fetch playlists:', err);
            }
        };
        loadPlaylists();
    }, [reduxIsLogin, reduxRefresh]);

    const filteredPlaylists = useMemo(() => {
        if (!searchTerm.trim()) return playlists;
        const normalizedSearch = normalizeString(searchTerm);
        return playlists.filter((p) => normalizeString(p.name).includes(normalizedSearch));
    }, [playlists, searchTerm]);

    const handlePlaylistSelect = async (e, playlistId) => {
        e.stopPropagation();

        if (!Array.isArray(reduxLibrarySong) || reduxLibrarySong.length === 0) {
            onNotification('No songs selected');
            onClose();
            return;
        }

        try {
            for (const item of reduxLibrarySong) {
                if (item.type === 'playlist') {
                    const res = await addSongToPlaylist(playlistId, item.id);
                    onNotification(res);
                    dispatch(setReduxRefresh());
                }
            }
        } catch (err) {
            console.error('Failed to add to playlist:', err);
            onNotification('Failed to add song to playlist');
        }
        onClose();
    };

    const handleCreateNewPlaylist = async (e) => {
        e.stopPropagation();

        if (!Array.isArray(reduxLibrarySong) || reduxLibrarySong.length === 0) {
            onNotification('No songs selected');
            onClose();
            return;
        }

        try {
            for (const item of reduxLibrarySong) {
                if (item.type === 'playlist') {
                    await createPlaylistWithSong(item.id);
                    dispatch(setReduxRefresh());
                    onNotification('Create playlist success');
                }
            }
        } catch (err) {
            console.error('Failed to create playlist:', err);
            onNotification('Failed to create playlist');
        }
        onClose();
    };

    useEffect(() => {
        const playlistList = document.querySelector('.playlist-list');
        if (playlistList) {
            playlistList.focus();
        }
    }, []);

    return (
        <div
            className="playlist-panel"
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
                    <input type="text" placeholder="Find a playlist" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="new-playlist" onClick={handleCreateNewPlaylist}>
                    <IconPlus height={14} className="icon" />
                    <span>New Playlist</span>
                </div>
            </div>

            <div
                className="playlist-list"
                tabIndex={0}
                onWheel={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                        e.preventDefault();
                        const items = document.querySelectorAll('.playlist-item');
                        const current = document.activeElement;
                        const index = Array.from(items).indexOf(current);
                        const nextIndex = e.key === 'ArrowDown' ? index + 1 : index - 1;
                        if (items[nextIndex]) items[nextIndex].focus();
                    }
                }}>
                {filteredPlaylists.length > 0 ? (
                    filteredPlaylists.map((playlist) => (
                        <div key={playlist.id} role="menuitem" className="playlist-item" tabIndex={-1} onClick={(e) => handlePlaylistSelect(e, playlist.id)}>
                            {playlist.name}
                        </div>
                    ))
                ) : (
                    <div className="playlist-item">No playlists found</div>
                )}
            </div>
        </div>
    );
};

export default PlaylistPanel;
