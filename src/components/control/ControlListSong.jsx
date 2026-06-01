import { useMemo } from 'react';
import { IconClockCircle, IconList, IconMoreCircle, IconPause, IconPlay, IconPlusCircle } from '~/assets/image/icons';
import { useDispatch, useSelector } from 'react-redux';
import { setReduxIsPlaying, setReduxIsRight } from '~/redux/reducer/songNotWhitelistSlice';
import './ControlListSong.sass';

const ControlListSong = ({ onPlayListSong, listSong }) => {
    const dispatch = useDispatch();
    const reduxCurrentSongIndex = useSelector((state) => state.song.reduxCurrentSongIndex);
    const reduxListSong = useSelector((state) => state.song.reduxListSong);
    const isPlaying = useSelector((state) => state.songNotWhite.reduxIsPlaying);

    // Use useMemo to recalculate when dependencies change
    const isCurrentListPlaying = useMemo(() => {
        if (!listSong || listSong.length === 0) return false;
        if (reduxCurrentSongIndex === null || reduxCurrentSongIndex === -1) return false;
        if (!reduxListSong || !reduxListSong[reduxCurrentSongIndex]) return false;

        const currentSongId = reduxListSong[reduxCurrentSongIndex]?.song?.id;
        return listSong.some((song) => song.id === currentSongId);
    }, [listSong, reduxCurrentSongIndex, reduxListSong]);

    const handleTogglePlay = (e) => {
        if (listSong && listSong.length > 0) {
            if (isPlaying && isCurrentListPlaying) {
                // Pause if currently playing this list
                dispatch(setReduxIsPlaying(false));
            } else {
                // Play from current index or first song
                if (reduxCurrentSongIndex === null || reduxCurrentSongIndex === -1 || !isCurrentListPlaying) {
                    onPlayListSong(e, listSong[0].id);
                } else {
                    onPlayListSong(e, reduxCurrentSongIndex);
                }

                dispatch(setReduxIsPlaying(true));
                dispatch(setReduxIsRight(true));
            }
        }
    };

    // Show pause icon only if playing AND current list is active
    const shouldShowPause = isPlaying && isCurrentListPlaying;

    return (
        <div className="controlListSong">
            <div className="controls">
                <div className="left">
                    <button className="playButton" onClick={(e) => handleTogglePlay(e)}>
                        {shouldShowPause ? <IconPause /> : <IconPlay />}
                    </button>
                    <button className="plusCircle">
                        <IconPlusCircle />
                    </button>
                    <button className="clockCircle">
                        <IconClockCircle />
                    </button>
                    <button className="moreCircle">
                        <IconMoreCircle />
                    </button>
                </div>
                <div className="right">
                    <span>List</span>
                    <button className="list">
                        <IconList />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ControlListSong;
