import React, { useState } from 'react';
import './SubscriptionForm.css';

const SubscriptionForm = () => {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isAlreadySubscribed, setIsAlreadySubscribed] = useState(false);
    const [apiError, setApiError] = useState('');

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || regex.test(email) === false) {
            setEmailError('Please enter a valid email.');
            return false;
        }
        setEmailError('');
        return true;
    };

const handleSubmit = (event) => {
    event.preventDefault();
    setIsSubscribed(false);
    setIsAlreadySubscribed(false);
    setApiError('');

    if (validateEmail(email)) {
        const apiBaseUrl = process.env.REACT_APP_API_URL;
        const subscribeEndpoint = `${apiBaseUrl}/subscribe`;

        fetch(subscribeEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        })
            .then((response) => {
                if (response.status === 409) {
                    setIsAlreadySubscribed(true);
                    throw new Error('Email is already subscribed');
                }
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(() => {
                setEmail('');
                setIsSubscribed(true);

                // ✅ Ensure gtag exists before calling it
                if (typeof window.gtag === 'function') {
                    window.gtag('event', 'subscription', {
                        'event_category': 'User Engagement',
                        'event_label': 'New Subscriber',
                        'value': 1
                    });
                } else {
                    console.warn("Google Analytics (gtag) is not available");
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                setApiError('Failed to subscribe. Please try again later.');
            });
    }
};


    return (
        <div className="subscription-container">
            <h1>Subscribe For Market Updates</h1>
            <h2>Get updates from Nate in your inbox</h2>
            <form className="subscription-form" onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setApiError('');
                    }}
                    className={`email-input ${emailError ? 'error' : ''}`}
                    required
                />
                {emailError && <div className="error-message">{emailError}</div>}
                {apiError && <div className="error-message">{apiError}</div>}
                <button type="submit" className="submit-button">Subscribe</button>
            </form>
            {isSubscribed && (
                <div className="success-message" aria-live="polite">
                    Subscription successful!
                </div>
            )}
            {isAlreadySubscribed && (
                <div className="already-subscribed-message" aria-live="polite">
                    Already Subscribed!
                </div>
            )}
        </div>
    );
};

export default SubscriptionForm;