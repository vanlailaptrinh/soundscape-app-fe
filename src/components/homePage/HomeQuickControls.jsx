import { useDispatch, useSelector } from 'react-redux';
import { IconRightSong } from '~/assets/image/icons';
import { setReduxIsPlaying } from '~/redux/reducer/songNotWhitelistSlice';
import { setReduxCurrentSongIndex } from '~/redux/reducer/songSlice';
import './HomeQuickControls.sass';

const HomeQuickControls = () => {
    const dispatch = useDispatch();
    const reduxListSong = useSelector((state) => state.song.reduxListSong);
    const reduxCurrentSongIndex = useSelector((state) => state.song.reduxCurrentSongIndex);

    const hasNextSong = reduxCurrentSongIndex >= 0 && reduxCurrentSongIndex < reduxListSong.length - 1;

    const handleNextSong = () => {
        if (!hasNextSong) return;
        dispatch(setReduxCurrentSongIndex('next'));
        dispatch(setReduxIsPlaying(true));
    };

    return (
        <button
            type="button"
            className="homeQuickNext"
            onClick={handleNextSong}
            disabled={!hasNextSong}
            title="Next song"
            aria-label="Next song">
            <IconRightSong height={18} />
        </button>
    );
};

export default HomeQuickControls;
