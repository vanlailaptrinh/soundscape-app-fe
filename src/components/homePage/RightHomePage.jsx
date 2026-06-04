import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import NoAvatar from '~/assets/image/noAvatar.png';
import { isVideo } from '~/util/fileUtil';
import { IconRightArrowBox, IconWiden } from '~/assets/image/icons';
import { setReduxIsRight, setReduxExtendedFullRight, setReduxRefresh } from '~/redux/reducer/songNotWhitelistSlice';
import CommentsSection from '~/components/comment/CommentsSection';
import { follow, unfollow, followedArtistApi, getApiErrorMessage } from '~/apis/songApi';
import './RightHomePage.sass';
import RatingSection from '~/components/rating/RatingSection';

const RightHomePage = () => {
    const dispatch = useDispatch();

    const reduxIsRight = useSelector((state) => state.songNotWhite.reduxIsRight);
    const reduxExtendedFullRight = useSelector((state) => state.songNotWhite.reduxExtendedFullRight);
    const reduxListSong = useSelector((state) => state.song.reduxListSong);
    const reduxCurrentSongIndex = useSelector((state) => state.song.reduxCurrentSongIndex);
    const reduxIsPlaying = useSelector((state) => state.songNotWhite.reduxIsPlaying);
    const reduxCurrentTime = useSelector((state) => state.songNotWhite.reduxCurrentTime);

    const mediaRef = useRef(null);
    const lastSyncTimeRef = useRef(0);

    const [followedArtists, setFollowedArtists] = useState([]);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        const fetchFollowedArtists = async () => {
            try {
                const data = await followedArtistApi();
                setFollowedArtists(data || []);
            } catch (e) {
                console.error('Failed to load followed artists:', e);
                setFollowedArtists([]);
            }
        };
        fetchFollowedArtists();
    }, []);

    const currentSong = useMemo(() => {
        if (reduxListSong.length > 0 && reduxCurrentSongIndex >= 0 && reduxCurrentSongIndex < reduxListSong.length) {
            console.log(reduxListSong);
            return reduxListSong[reduxCurrentSongIndex];
        }
        return null;
    }, [reduxListSong, reduxCurrentSongIndex]);

    const nextSong = useMemo(() => {
        if (reduxListSong.length > 0 && reduxCurrentSongIndex + 1 < reduxListSong.length) {
            return reduxListSong[reduxCurrentSongIndex + 1];
        }
        return null;
    }, [reduxListSong, reduxCurrentSongIndex]);

    const isCurrentVideo = useMemo(() => {
        return currentSong?.song?.mediaUrl && isVideo(currentSong.song.mediaUrl);
    }, [currentSong?.song?.mediaUrl]);

    const handleCloseRightPanel = useCallback(() => {
        if (reduxExtendedFullRight) {
            dispatch(setReduxExtendedFullRight(false));
        } else {
            dispatch(setReduxIsRight(false));
        }
    }, [dispatch, reduxExtendedFullRight]);

    const extendRightFullPanel = useCallback(() => {
        dispatch(setReduxExtendedFullRight(!reduxExtendedFullRight));
    }, [dispatch, reduxExtendedFullRight]);

    useEffect(() => {
        if (mediaRef.current?.src && !isNaN(reduxCurrentTime)) {
            const diff = Math.abs(mediaRef.current.currentTime - reduxCurrentTime);
            const lastSyncDiff = Math.abs(lastSyncTimeRef.current - reduxCurrentTime);
            if (diff > 1 && lastSyncDiff > 1) {
                mediaRef.current.currentTime = reduxCurrentTime;
                lastSyncTimeRef.current = reduxCurrentTime;
            }
        }
    }, [reduxCurrentTime]);

    // Reload khi đổi bài
    useEffect(() => {
        if (mediaRef.current && currentSong?.song?.id) {
            mediaRef.current.load();
            lastSyncTimeRef.current = 0;
        }
    }, [currentSong?.song?.id]);

    // Play / pause khi thay đổi trạng thái
    useEffect(() => {
        if (mediaRef.current?.src) {
            if (reduxIsPlaying) {
                mediaRef.current.play().catch((err) => {
                    console.error('Right panel play error:', err);
                });
            } else {
                mediaRef.current.pause();
            }
        }
    }, [reduxIsPlaying, currentSong?.song?.id]);

    const artistName = currentSong?.artist?.name || currentSong?.song?.artist || 'Unknown Artist';
    const nextArtistName = nextSong?.artist?.name || nextSong?.song?.artist || 'Unknown Artist';

    const isFollowing = useMemo(() => {
        if (!currentSong?.artist?.id || !Array.isArray(followedArtists)) return false;
        return followedArtists.some((artist) => artist.id === currentSong.artist.id);
    }, [currentSong, followedArtists]);

    const handleFollowToggle = async () => {
        try {
            if (!currentSong?.artist?.id) return;
            if (isFollowing) {
                await unfollow(currentSong.artist.id, 'ARTIST');
                setNotification('Unfollowed artist');
            } else {
                await follow(currentSong.artist.id, 'ARTIST');
                setNotification('Followed artist');
            }

            dispatch(setReduxRefresh());

            const updatedFollowed = await followedArtistApi();
            setFollowedArtists(updatedFollowed || []);
        } catch (e) {
            setNotification(getApiErrorMessage(e, 'Vui lòng đăng nhập để follow/unfollow nghệ sĩ'));
        }
    };

    return (
        <div
            className={`rightHomePage ${
                reduxIsRight && !reduxExtendedFullRight ? 'rightActive' : ''
            } ${reduxExtendedFullRight ? 'extendedFull' : ''}`}>
            {!currentSong ? (
                <div className="noSongPlaying">Chưa có bài đang nghe</div>
            ) : (
                <div className="currentSongContainer">
                    <div className="mediaContainer">
                        <div className="headerSong">
                            <div className="left">
                                <button onClick={handleCloseRightPanel} className="closeButton">
                                    <IconRightArrowBox />
                                </button>
                                <div className="imageTitle">
                                    {currentSong.artist?.name || currentSong.song?.artist || 'Chưa thuộc album'}
                                </div>
                            </div>
                            <div className="right">
                                <button className="viewFullButton" onClick={extendRightFullPanel}>
                                    <IconWiden height={16} />
                                </button>
                            </div>
                        </div>

                        {isCurrentVideo ? (
                            <video
                                ref={mediaRef}
                                src={currentSong.song.mediaUrl}
                                controls={false}
                                muted
                                playsInline
                                className="mediaElement"
                            />
                        ) : (
                            <>
                                <img
                                    src={currentSong.song.imageUrl || NoAvatar}
                                    alt={currentSong.song.title || 'Song cover'}
                                    className="songImage mediaElement"
                                />
                                <audio
                                    ref={mediaRef}
                                    src={currentSong.song.mediaUrl}
                                    controls={false}
                                    muted
                                    preload="metadata"
                                />
                            </>
                        )}
                    </div>

                    <div
                        className="songTitleContainer"
                        style={{
                            display: reduxIsRight && !reduxExtendedFullRight ? 'none' : 'block',
                        }}>
                        {currentSong?.song?.title || 'Chưa có tiêu đề'}
                    </div>

                    <div className="songInfo">
                        <div className={`songInfoContainer ${isCurrentVideo ? 'video' : 'audio'}`}>
                            <div className="artistContainer">
                                <img
                                    className="artistAvatar"
                                    src={currentSong.artist?.urlAvatar || NoAvatar}
                                    alt={`${artistName} avatar`}
                                />
                                <div className="artistInfo">
                                    <div className="artistName">{currentSong.artist?.username || 'No name'}</div>
                                    <div className="artistActions">
                                        <div className="monthlyListeners">
                                            {currentSong.artist?.monthlyListeners
                                                ? `${currentSong.artist?.monthlyListeners} Monthly Listeners`
                                                : 'No statistics yet'}
                                        </div>
                                        <button className="followButton" onClick={handleFollowToggle}>
                                            {isFollowing ? 'Unfollow' : 'Follow'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="nextSongContainer">
                            <div className="nextSongHeader">
                                <div className="nextSongLabel">Next in queue</div>
                                <button className="openQueueButton">Open Queue</button>
                            </div>

                            {nextSong ? (
                                <div className="nextSongContent">
                                    <img
                                        src={nextSong?.song?.imageUrl || NoAvatar}
                                        alt={nextSong?.song?.title || 'Next song cover'}
                                        className="nextSongCover"
                                    />
                                    <div className="nextSongDetails">
                                        <div className="nextSongTitle">
                                            {nextSong?.song?.title || 'Chưa có tiêu đề'}
                                        </div>
                                        <div className="nextSongArtist">{nextArtistName}</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="nextSongContent">
                                    <div className="noNextSong">No upcoming songs</div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="description">
                        <div className="titleDescription">Description</div>
                        <div className="textDescription">
                            {currentSong.description
                                ? currentSong.description
                                : 'No description available for this song.'}
                        </div>
                    </div>

                    <RatingSection currentSong={currentSong} />
                    <CommentsSection currentSong={currentSong} />
                    {notification && <div className="notificationToast">{notification}</div>}
                </div>
            )}
        </div>
    );
};

export default RightHomePage;
