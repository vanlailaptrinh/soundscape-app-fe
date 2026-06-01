import { useState, useEffect } from 'react';

// Hook kiểm tra xem popup có được hiển thị hôm nay chưa
export default function useDailyFeedback() {
    const [canShow, setCanShow] = useState(false);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const lastShown = localStorage.getItem('feedbackDate');
        if (lastShown !== today) {
            setCanShow(true); // chưa hiển thị hôm nay
        }
    }, []);

    const markShown = () => {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem('feedbackDate', today);
        setCanShow(false);
    };

    return { canShow, markShown };
}
