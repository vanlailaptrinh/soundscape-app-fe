import { useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { follow, unfollow, followedArtistApi, followedAlbumApi, deletePlaylist, deleteAlbum } from '~/apis/songApi';
import { IconClose, IconFollow, IconPlusCircle, IconTriangle } from '~/assets/image/icons';
import { setReduxRefresh } from '~/redux/reducer/songNotWhitelistSlice';

export const useMenuOptions = (reduxData, onNotification) => {
    const dispatch = useDispatch();
    const [followedArtists, setFollowedArtists] = useState(null);
    const [followedAlbums, setFollowedAlbums] = useState(null);

    const reduxLibrarySong = useSelector((state) => state.songNotWhite.reduxLibrarySong);

    const hasArtist = useMemo(() => reduxData?.some((item) => item.type === 'artist'), [reduxData]);
    const hasAlbum = useMemo(() => reduxData?.some((item) => item.type === 'album'), [reduxData]);

    useEffect(() => {
        const fetchFollowedData = async () => {
            try {
                const promises = [];

                if (hasArtist) {
                    promises.push(followedArtistApi().then((artists) => setFollowedArtists(artists || [])));
                } else {
                    setFollowedArtists([]);
                }

                if (hasAlbum) {
                    promises.push(followedAlbumApi().then((albums) => setFollowedAlbums(albums || [])));
                } else {
                    setFollowedAlbums([]);
                }

                await Promise.all(promises);
            } catch (error) {
                console.error('Failed to fetch followed data:', error);
                if (hasArtist) setFollowedArtists([]);
                if (hasAlbum) setFollowedAlbums([]);
            }
        };

        fetchFollowedData();
    }, [hasArtist, hasAlbum]);

    return useMemo(() => {
        if (!Array.isArray(reduxData) || reduxData.length === 0) {
            return [];
        }

        if ((hasArtist && followedArtists === null) || (hasAlbum && followedAlbums === null)) {
            return [];
        }

        const options = [];

        reduxData.forEach(({ type, id }) => {
            switch (type) {
                case 'playlist':
                    options.push({
                        label: (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <IconPlusCircle height={16} />
                                    Add To Playlist
                                </div>
                                <IconTriangle height={16} />
                            </div>
                        ),
                        action: null,
                        isPlaylistAction: true,
                    });
                    break;

                case 'addSongPlaylist':
                    options.push({
                        label: (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <IconPlusCircle height={16} />
                                    Add To Album
                                </div>
                                <IconTriangle height={16} />
                            </div>
                        ),
                        action: null,
                        isAlbumAction: true,
                    });
                    break;

                case 'delePlaylist':
                    options.push({
                        label: (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <IconClose height={16} />
                                    Delete Playlist
                                </div>
                            </div>
                        ),
                        action: async () => {
                            for (const item of reduxLibrarySong) {
                                if (item.type === 'delePlaylist') {
                                    try {
                                        const res = await deletePlaylist(item.id);
                                        dispatch(setReduxRefresh());
                                        onNotification(res?.message || 'Deleted playlist successfully');
                                    } catch (e) {
                                        onNotification('Failed to delete playlist or please login first');
                                    }
                                }
                            }
                        },
                        isPlaylistAction: false,
                    });
                    break;

                case 'deleAlbum':
                    options.push({
                        label: (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <IconClose height={16} />
                                    Delete Album
                                </div>
                            </div>
                        ),
                        action: async () => {
                            for (const item of reduxLibrarySong) {
                                if (item.type === 'deleAlbum') {
                                    try {
                                        const res = await deleteAlbum(item.id);
                                        dispatch(setReduxRefresh());
                                        onNotification(res || 'Deleted album successfully');
                                    } catch (e) {
                                        onNotification('Failed to delete album or please login first');
                                    }
                                }
                            }
                        },
                        isPlaylistAction: false,
                    });
                    break;

                // 👤 Follow/Unfollow Artist
                case 'artist':
                    const isFollowed = followedArtists.some((artist) => artist.id === id);
                    options.push({
                        label: (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {isFollowed ? (
                                        <>
                                            <IconClose height={16} />
                                            Unfollow Artist
                                        </>
                                    ) : (
                                        <>
                                            <IconFollow height={16} />
                                            Follow Artist
                                        </>
                                    )}
                                </div>
                            </div>
                        ),
                        action: async () => {
                            for (const item of reduxLibrarySong) {
                                if (item.type === 'artist') {
                                    try {
                                        const isArtistFollowed = followedArtists.some(
                                            (artist) => artist.id === item.id
                                        );
                                        const res = isArtistFollowed
                                            ? await unfollow(item.id, 'ARTIST')
                                            : await follow(item.id, 'ARTIST');

                                        dispatch(setReduxRefresh());
                                        onNotification(res);

                                        const updatedFollowed = await followedArtistApi();
                                        setFollowedArtists(updatedFollowed || []);
                                    } catch (e) {
                                        onNotification('Vui lòng đăng nhập để follow/unfollow nghệ sĩ');
                                    }
                                }
                            }
                        },
                        isPlaylistAction: false,
                    });
                    break;

                // 💽 Follow/Unfollow Album
                case 'album':
                    const isAlbumFollowed = followedAlbums.some((album) => album.id === id);
                    options.push({
                        label: (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {isAlbumFollowed ? (
                                        <>
                                            <IconClose height={16} />
                                            Unfollow Album
                                        </>
                                    ) : (
                                        <>
                                            <IconFollow height={16} />
                                            Follow Album
                                        </>
                                    )}
                                </div>
                            </div>
                        ),
                        action: async () => {
                            for (const item of reduxLibrarySong) {
                                if (item.type === 'album') {
                                    try {
                                        const isItemFollowed = followedAlbums.some((album) => album.id === item.id);
                                        const res = isItemFollowed
                                            ? await unfollow(item.id, 'ALBUM')
                                            : await follow(item.id, 'ALBUM');

                                        dispatch(setReduxRefresh());
                                        onNotification(res);

                                        const updatedFollowedAlbums = await followedAlbumApi();
                                        setFollowedAlbums(updatedFollowedAlbums || []);
                                    } catch (e) {
                                        onNotification('Vui lòng đăng nhập để follow/unfollow album');
                                    }
                                }
                            }
                        },
                        isPlaylistAction: false,
                    });
                    break;

                default:
                    break;
            }
        });

        return options;
    }, [reduxData, reduxLibrarySong, followedArtists, followedAlbums, hasArtist, hasAlbum, dispatch, onNotification]);
};

export default useMenuOptions;
