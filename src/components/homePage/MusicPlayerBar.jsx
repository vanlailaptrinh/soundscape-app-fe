import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    IconLeftSong,
    IconRightSong,
    IconPlay,
    IconPause,
    IconForward,
    IconBackward,
    IconVolumeHigh,
    IconVolumeOff,
    IconFullScreen,
    IconExitFullScreen,
} from '~/assets/image/icons';
import { setReduxIsPlaying, setReduxCurrentTime } from '~/redux/reducer/songNotWhitelistSlice';
import { setReduxCurrentSongIndex } from '~/redux/reducer/songSlice';
import { listenSong, calDurationSong } from '~/apis/songApi';
import { isVideo } from '~/util/fileUtil';
import NoAvatar from '~/assets/image/noAvatar.png';
import './MusicPlayerBar.sass';

const MusicPlayerBar = () => {
    const [progress, setProgress] = useState(0);
    const reduxVolume = useSelector((state) => state.song.reduxVolume);
    const [volume, setVolume] = useState(reduxVolume || 0.5);
    const [isMuted, setIsMuted] = useState(false);

    const mediaRef = useRef(null);
    const isDraggingRef = useRef(false);
    const prevSongIdRef = useRef(null);

    const reduxListSong = useSelector((state) => state.song.reduxListSong);
    const reduxCurrentSongIndex = useSelector((state) => state.song.reduxCurrentSongIndex);
    const reduxIsPlaying = useSelector((state) => state.songNotWhite.reduxIsPlaying);
    const dispatch = useDispatch();

    const [currentSong, setCurrentSongState] = useState(null);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [isMediaReady, setIsMediaReady] = useState(false);

    // Ghi nhận tương tác người dùng đầu tiên (cho phép autoplay)
    useEffect(() => {
        const handleUserInteraction = () => setHasInteracted(true);
        window.addEventListener('click', handleUserInteraction, { once: true });
        return () => window.removeEventListener('click', handleUserInteraction);
    }, []);

    // Cập nhật tiến trình bài hát
    const handleTimeUpdate = (e) => {
        if (isDraggingRef.current) return;
        const currentTime = e.target.currentTime;
        const duration = e.target.duration;
        if (duration > 0) {
            const newProgress = (currentTime / duration) * 100;
            setProgress(newProgress);
            if (Math.floor(currentTime) !== Math.floor(prevSongIdRef.current?.lastTime || 0)) {
                dispatch(setReduxCurrentTime(currentTime));
                if (prevSongIdRef.current) prevSongIdRef.current.lastTime = currentTime;
            }
        }
    };

    const handleTogglePlay = () => {
        if (!mediaRef.current || !mediaRef.current.src) return;
        dispatch(setReduxIsPlaying(!reduxIsPlaying));
    };

    // 🔹 Nút tua 15 giây
    const handleForward15 = () => {
        if (mediaRef.current && mediaRef.current.duration) {
            mediaRef.current.currentTime = Math.min(mediaRef.current.currentTime + 15, mediaRef.current.duration);
            dispatch(setReduxCurrentTime(mediaRef.current.currentTime));
        }
    };

    // 🔹 Nút lùi 15 giây
    const handleBackward15 = () => {
        if (mediaRef.current) {
            mediaRef.current.currentTime = Math.max(mediaRef.current.currentTime - 15, 0);
            dispatch(setReduxCurrentTime(mediaRef.current.currentTime));
        }
    };

    // Khi đổi bài hát
    useEffect(() => {
        if (reduxListSong.length > 0 && reduxCurrentSongIndex >= 0 && reduxCurrentSongIndex < reduxListSong.length) {
            const newSong = reduxListSong[reduxCurrentSongIndex];
            setCurrentSongState(newSong);

            if (newSong?.song?.id && newSong.song.id !== prevSongIdRef.current?.songId) {
                listenSong(newSong.song.id).catch((err) => {
                    console.error('Error listening song:', err);
                });
                prevSongIdRef.current = { songId: newSong.song.id, lastTime: 0 };
            }
        } else {
            setCurrentSongState(null);
            prevSongIdRef.current = null;
        }
    }, [reduxListSong, reduxCurrentSongIndex]);

    // 🔹 Phát / dừng nhạc
    useEffect(() => {
        if (!mediaRef.current || !mediaRef.current.src) return;
        const playPromise = reduxIsPlaying ? mediaRef.current.play() : Promise.resolve(mediaRef.current.pause());
        playPromise?.catch((err) => {
            if (err.name !== 'AbortError') console.error('Play/pause error:', err);
        });
    }, [reduxIsPlaying]);

    // 🔹 Khi đổi bài hát — tự động phát nếu có tương tác
    useEffect(() => {
        setIsMediaReady(false); // Reset trạng thái media ready

        if (mediaRef.current && currentSong?.song?.id) {
            // Reset progress và set volume
            setProgress(0);
            mediaRef.current.volume = isMuted ? 0 : volume;
            mediaRef.current.currentTime = 0;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentSong?.song?.id]);

    // 🔹 Tự động phát khi media sẵn sàng
    useEffect(() => {
        if (isMediaReady && hasInteracted && currentSong?.song?.id) {
            const playPromise = mediaRef.current?.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        dispatch(setReduxIsPlaying(true));
                    })
                    .catch((err) => {
                        console.warn('Không thể tự động phát:', err.message);
                        dispatch(setReduxIsPlaying(false));
                    });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMediaReady, hasInteracted, currentSong?.song?.id]);

    // 🔹 Cập nhật volume hoặc mute mà KHÔNG load lại bài hát
    useEffect(() => {
        if (mediaRef.current) {
            mediaRef.current.volume = isMuted ? 0 : volume;
            mediaRef.current.muted = isMuted;
        }
    }, [volume, isMuted]);

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (newVolume === 0) setIsMuted(true);
        else setIsMuted(false);
    };

    // 🔹 Nút bật/tắt tiếng
    const toggleMute = () => {
        setIsMuted((prev) => !prev);
    };

    // Seek thanh tiến trình - ĐÃ SỬA BUG
    const handleSeekStart = () => {
        isDraggingRef.current = true;
    };

    const handleSeek = (e) => {
        setProgress(parseFloat(e.target.value));
    };

    const handleSeekEnd = (e) => {
        const newProgress = parseFloat(e.target.value);
        isDraggingRef.current = false; // Set false NGAY LẬP TỨC

        if (mediaRef.current?.duration) {
            const newTime = (newProgress / 100) * mediaRef.current.duration;
            mediaRef.current.currentTime = newTime;
            setProgress(newProgress); // Cập nhật progress ngay
            dispatch(setReduxCurrentTime(newTime));
        }
    };

    // Ghi nhận thời lượng nghe
    const trackListeningDuration = useCallback((songId) => {
        if (!songId) return;
        calDurationSong(songId).catch((err) => console.error('Error tracking duration:', err));
    }, []);

    useEffect(() => {
        return () => {
            if (currentSong?.song?.id) trackListeningDuration(currentSong.song.id);
        };
    }, [currentSong?.song?.id, trackListeningDuration]);

    // Trước khi thoát trang
    useEffect(() => {
        const currentSongId = currentSong?.song?.id;
        const handleBeforeUnload = () => {
            if (currentSongId) {
                const url = `/api/songs/${currentSongId}/duration`;
                const data = JSON.stringify({ songId: currentSongId });
                if (navigator.sendBeacon) navigator.sendBeacon(url, data);
                else
                    calDurationSong(currentSongId).catch((err) =>
                        console.error('Error tracking duration on unload:', err)
                    );
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [currentSong?.song?.id]);

    const handlePrev = () => {
        if (currentSong?.song?.id) trackListeningDuration(currentSong.song.id);
        dispatch(setReduxCurrentSongIndex('prev'));
    };

    const handleNext = () => {
        if (currentSong?.song?.id) trackListeningDuration(currentSong.song.id);
        dispatch(setReduxCurrentSongIndex('next'));
    };

    const handleEnded = () => {
        setProgress(100);
        dispatch(setReduxIsPlaying(false));
        handleNext();
    };

    useEffect(() => {
        const media = mediaRef.current;
        if (!media) return;

        const handleSeekAfterEnded = () => {
            if (media.currentTime < media.duration) dispatch(setReduxIsPlaying(true));
        };

        media.addEventListener('seeked', handleSeekAfterEnded);
        return () => media.removeEventListener('seeked', handleSeekAfterEnded);
    }, [dispatch]);

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const [isFullScreen, setIsFullScreen] = useState(false);

    useEffect(() => {
        const handleChange = () => setIsFullScreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleChange);
        return () => document.removeEventListener('fullscreenchange', handleChange);
    }, []);

    return (
        <div className="musicPlayerBar">
            <div className="left">
                <div className="currentSongImage">
                    <img src={currentSong?.song?.imageUrl || NoAvatar} alt={currentSong?.song?.title || 'No song'} />
                </div>
                <div className="currentSongInfo">
                    <div className="title">{currentSong?.song?.title || 'No song selected'}</div>
                    <div className="artist">
                        {currentSong?.song?.artist || currentSong?.artist?.username || 'No nameF'}
                    </div>
                </div>
            </div>

            <div className="center">
                <div className="listenMusic">
                    {currentSong?.song?.mediaUrl ? (
                        isVideo(currentSong.song.mediaUrl) ? (
                            <video
                                ref={mediaRef}
                                src={currentSong.song.mediaUrl}
                                onTimeUpdate={handleTimeUpdate}
                                onEnded={handleEnded}
                                onCanPlayThrough={() => setIsMediaReady(true)}
                                onError={(e) => {
                                    console.error('Video load error:', e.target.error);
                                    dispatch(setReduxIsPlaying(false));
                                    setIsMediaReady(false);
                                }}
                                controls={false}
                                preload="metadata"
                            />
                        ) : (
                            <audio
                                ref={mediaRef}
                                src={currentSong.song.mediaUrl}
                                onTimeUpdate={handleTimeUpdate}
                                onEnded={handleEnded}
                                onCanPlayThrough={() => setIsMediaReady(true)}
                                onError={(e) => {
                                    console.error('Audio load error:', e.target.error);
                                    dispatch(setReduxIsPlaying(false));
                                    setIsMediaReady(false);
                                }}
                                controls={false}
                                preload="metadata"
                                onLoadedMetadata={(e) => {
                                    const dur = e.target.duration;
                                    if (dur > 0) setProgress((e.target.currentTime / dur) * 100);
                                }}
                            />
                        )
                    ) : null}
                </div>

                <div className="controls">
                    <div className="topControl">
                        <button className="iconControll" onClick={handleBackward15} disabled={!currentSong}>
                            <IconBackward height={16} />
                        </button>
                        <button className="iconControll" onClick={handlePrev} disabled={!currentSong}>
                            <IconLeftSong />
                        </button>
                        <button onClick={handleTogglePlay} disabled={!currentSong}>
                            <div className="iconControll playPause">
                                {reduxIsPlaying ? <IconPause /> : <IconPlay />}
                            </div>
                        </button>
                        <button className="iconControll" onClick={handleNext} disabled={!currentSong}>
                            <IconRightSong />
                        </button>
                        <button className="iconControll" onClick={handleForward15} disabled={!currentSong}>
                            <IconForward height={16} />
                        </button>
                    </div>

                    <div className="bottomControll">
                        <div className="currenTimeSong">{formatTime(mediaRef.current?.currentTime)}</div>
                        <div className="progress">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="0.1"
                                value={progress}
                                style={{ '--progress': `${progress}%` }}
                                onMouseDown={handleSeekStart}
                                onTouchStart={handleSeekStart}
                                onChange={handleSeek}
                                onMouseUp={handleSeekEnd}
                                onTouchEnd={handleSeekEnd}
                                disabled={!currentSong}
                            />
                        </div>
                        <div className="duration">{formatTime(mediaRef.current?.duration)}</div>
                    </div>
                </div>
            </div>

            <div className="right">
                <div className="volume">
                    <button className="iconControll" onClick={toggleMute}>
                        {isMuted || volume === 0 ? <IconVolumeOff height={16} /> : <IconVolumeHigh height={16} />}
                    </button>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        style={{ '--progress': `${(isMuted ? 0 : volume) * 100}%` }}
                    />
                </div>
                <div className="fullscreen">
                    <button
                        className="iconControll"
                        onClick={() => {
                            if (!document.fullscreenElement) {
                                document.documentElement.requestFullscreen?.();
                            } else {
                                document.exitFullscreen?.();
                            }
                        }}>
                        {isFullScreen ? <IconExitFullScreen height={16} /> : <IconFullScreen height={16} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MusicPlayerBar;
