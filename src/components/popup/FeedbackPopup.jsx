import React, { useState, useEffect } from 'react';
import { sendFeedback } from '~/apis/songApi';
import './FeedbackPopup.sass';

export default function FeedbackPopup({ songId, source = 'none', forceShow = false, onClose }) {
    const [showPopup, setShowPopup] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const labels = [
        { value: 5, text: 'Rất hài lòng 😄' },
        { value: 4, text: 'Hài lòng 🙂' },
        { value: 3, text: 'Bình thường 😐' },
        { value: 2, text: 'Không hài lòng 🙁' },
        { value: 1, text: 'Rất không hài lòng 😞' },
    ];

    useEffect(() => {
        if (forceShow) setShowPopup(true);
    }, [forceShow]);

    const handleRating = async (value) => {
        if (!songId || loading) return;
        try {
            setLoading(true);
            await sendFeedback({ songId, rating: value, source });
            setSubmitted(true);
            setTimeout(() => {
                setSubmitted(false);
                setShowPopup(false);
                onClose?.();
            }, 1500);
        } catch (err) {
            console.error('Gửi feedback thất bại:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!showPopup) return null;

    return (
        <div className="feedback-popup-container" onClick={() => setShowPopup(false)}>
            <div
                className={`feedback-popup ${submitted ? 'thankyou-active' : ''}`}
                onClick={(e) => e.stopPropagation()}>
                {!submitted ? (
                    <>
                        <h3>Bạn thấy gợi ý nhạc thế nào?</h3>
                        <div className="rating-buttons">
                            {labels.map((item) => (
                                <button
                                    key={item.value}
                                    disabled={loading}
                                    onClick={() => handleRating(item.value)}
                                    className="rating-btn">
                                    {item.text}
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <p className="thankyou">Cảm ơn bạn đã đánh giá</p>
                )}
            </div>
        </div>
    );
}
