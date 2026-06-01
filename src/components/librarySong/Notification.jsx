import './Notification.sass';
import { useEffect, useState } from 'react';

const Notification = ({ notificationKey, message }) => {
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState('');

    useEffect(() => {
        if (message) {
            setData(message);
            setVisible(true);

            const timer = setTimeout(() => {
                setVisible(false); // Only hide, don't clear data immediately
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [message]);

    // Clear data after animation ends
    useEffect(() => {
        if (!visible && data) {
            const timer = setTimeout(() => setData(''), 500); // 500ms matches CSS transition
            return () => clearTimeout(timer);
        }
    }, [visible, data]);

    return (
        <div className={`notification ${visible ? 'show' : ''}`}>
            <p>{data}</p>
        </div>
    );
};

export default Notification;
