import { useState, useEffect, memo } from 'react';
import { rateSong, unrateSong, getUserRating, getRatingStats } from '~/apis/songApi';
import { useSelector } from 'react-redux';
import './RatingSection.sass';

const RatingSection = ({ currentSong }) => {
    const [userRating, setUserRating] = useState(null);
    const [avgRating, setAvgRating] = useState(0);
    const [totalRatings, setTotalRatings] = useState(0);
    const [ratingDistribution, setRatingDistribution] = useState({
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
    });
    const [hoverRating, setHoverRating] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchRatingData = async () => {
        if (!currentSong?.song?.id) return;
        try {
            const [uid, stats] = await Promise.all([
                getUserRating(currentSong.song.id),
                getRatingStats(currentSong.song.id),
            ]);

            setUserRating(uid);
            setAvgRating(stats.average || 0);
            setTotalRatings(stats.total || 0);
            setRatingDistribution({
                5: stats.distribution[5] || 0,
                4: stats.distribution[4] || 0,
                3: stats.distribution[3] || 0,
                2: stats.distribution[2] || 0,
                1: stats.distribution[1] || 0,
            });
        } catch (err) {
            console.error('Error fetching rating data:', err);
        }
    };

    useEffect(() => {
        fetchRatingData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentSong?.song?.id]);

    const handleRate = async (value) => {
        if (!currentSong?.song?.id) return;
        setLoading(true);
        try {
            await rateSong(currentSong.song.id, value);
            setUserRating(value);
            await fetchRatingData();
        } catch (err) {
            console.error('Error rating song:', err);
        }
        setLoading(false);
    };

    const handleUnrate = async () => {
        if (!currentSong?.song?.id) return;
        setLoading(true);
        try {
            await unrateSong(currentSong.song.id);
            setUserRating(null);
            await fetchRatingData();
        } catch (err) {
            console.error('Error unrating song:', err);
        }
        setLoading(false);
    };

    const getPercentage = (star) => {
        if (totalRatings === 0) return 0;
        return (ratingDistribution[star] / totalRatings) * 100;
    };

    const reduxIsRight = useSelector((state) => state.songNotWhite.reduxIsRight);
    const reduxExtendedFullRight = useSelector((state) => state.songNotWhite.reduxExtendedFullRight);

    const isFull = reduxExtendedFullRight;
    const isRight = reduxIsRight && !reduxExtendedFullRight;

    return (
        <div className={`ratingSection ${isRight ? 'rightActive' : ''} ${isFull ? 'extendedFull' : ''}`}>
            <div className="ratingContent">
                <div className="ratingOverview">
                    <div className="leftBlock">
                        <div className="bigAvg">{avgRating.toFixed(1)}</div>
                        <div className="starsRow">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={`smallStar ${avgRating >= star ? 'active' : avgRating >= star - 0.5 ? 'half' : ''}`}>
                                    ★
                                </span>
                            ))}
                        </div>
                        <div className="ratingCount">{totalRatings.toLocaleString()}</div>
                    </div>
                    <div className="barsBlock">
                        {[5, 4, 3, 2, 1].map((star) => (
                            <div key={star} className="barRow">
                                <span className="starNumber">{star}</span>
                                <div className="barOuter">
                                    <div className="barInner" style={{ width: `${getPercentage(star)}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="userRatingSection">
                    <div className="ratingHeader">
                        <span className="ratingTitle">Đánh giá của bạn</span>
                    </div>

                    <div className="starsContainer">
                        {[1, 2, 3, 4, 5].map((value) => (
                            <span
                                key={value}
                                className={`star ${(hoverRating || userRating) >= value ? 'active' : ''}`}
                                onMouseEnter={() => setHoverRating(value)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => !loading && handleRate(value)}>
                                ★
                            </span>
                        ))}
                    </div>

                    <div className="ratingActions">
                        {userRating ? (
                            <button className="unrateBtn" disabled={loading} onClick={handleUnrate}>
                                Bỏ đánh giá
                            </button>
                        ) : (
                            <span className="notRatedText">Chưa đánh giá</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(RatingSection);
