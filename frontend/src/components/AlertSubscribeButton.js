import React, { useState } from 'react';
import './AlertSubscribeButton.css';

const AlertSubscribeButton = ({ alertType, targetId, buttonText = "Subscribe" }) => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [isExpanded, setIsExpanded] = useState(false);

    const API_BASE = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : '/api';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        try {
            const response = await fetch(`${API_BASE}/alerts/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    alert_type: alertType,
                    target_id: targetId
                }),
            });

            if (response.ok) {
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error('Subscription error:', error);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return <div className="alert-btn-success">✅ Subscribed successfully!</div>;
    }

    if (!isExpanded) {
        return (
            <button className="alert-btn-toggle" onClick={() => setIsExpanded(true)}>
                {buttonText}
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="alert-btn-form">
            <input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="alert-btn-input"
            />
            <button type="submit" disabled={status === 'loading'} className="alert-btn-submit">
                {status === 'loading' ? '...' : 'Confirm'}
            </button>
            {status === 'error' && <span className="alert-btn-error">Error. Try again.</span>}
        </form>
    );
};

export default AlertSubscribeButton;
