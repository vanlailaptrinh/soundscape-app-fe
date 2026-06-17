import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { createAiPlaylist, getApiErrorMessage } from '~/apis/songApi';
import './AiPlaylistPopup.sass';

const STORAGE_KEY = 'aiPlaylistPopupDate';

const getTodayKey = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const AiPlaylistPopup = () => {
    const isLogin = useSelector((state) => state.auth.reduxIsLogin);
    const [isOpen, setIsOpen] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isLogin) {
            setIsOpen(false);
            return;
        }

        const today = getTodayKey();
        const lastShown = localStorage.getItem(STORAGE_KEY);
        setIsOpen(lastShown !== today);
    }, [isLogin]);

    const markShownToday = () => {
        localStorage.setItem(STORAGE_KEY, getTodayKey());
    };

    const handleClose = () => {
        markShownToday();
        setIsOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const trimmedPrompt = prompt.trim();
        if (!trimmedPrompt || loading) return;

        try {
            setLoading(true);
            setError('');
            setMessage('');
            await createAiPlaylist(trimmedPrompt);
            markShownToday();
            setMessage('Đã tạo playlist theo gu hôm nay của bạn.');
            setTimeout(() => {
                setIsOpen(false);
            }, 1200);
        } catch (err) {
            setError(getApiErrorMessage(err, 'Không tạo được playlist. Vui lòng thử lại.'));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="aiPlaylistPopupOverlay" onClick={handleClose}>
            <form className="aiPlaylistPopup" onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
                <button type="button" className="aiPlaylistClose" onClick={handleClose} aria-label="Đóng">
                    ×
                </button>

                <h2>Bạn muốn nghe gì hôm nay?</h2>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Nhạc chill để code Java buổi tối"
                    rows={4}
                    autoFocus
                />

                {message && <p className="aiPlaylistMessage success">{message}</p>}
                {error && <p className="aiPlaylistMessage error">{error}</p>}

                <div className="aiPlaylistActions">
                    <button type="button" className="aiPlaylistSkip" onClick={handleClose}>
                        Để sau
                    </button>
                    <button type="submit" className="aiPlaylistSubmit" disabled={loading || !prompt.trim()}>
                        {loading ? 'Đang tạo...' : 'Tạo playlist'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AiPlaylistPopup;
