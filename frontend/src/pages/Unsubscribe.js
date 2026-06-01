import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Unsubscribe.css';

const Unsubscribe = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('loading'); // loading, success, error

    const API_BASE = process.env.REACT_APP_API_BASE || (window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : '/api');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            return;
        }

        const processUnsubscribe = async () => {
            try {
                const response = await fetch(`${API_BASE}/alerts/unsubscribe?token=${token}`);
                if (response.ok) {
                    setStatus('success');
                } else {
                    setStatus('error');
                }
            } catch (err) {
                setStatus('error');
            }
        };

        processUnsubscribe();
    }, [token, API_BASE]);

    return (
        <div className="unsubscribe-page">
            <Header />
            <div className="unsubscribe-container">
                <div className="unsubscribe-card">
                    {status === 'loading' && (
                        <>
                            <h2>Processing...</h2>
                            <p>Please wait while we update your preferences.</p>
                        </>
                    )}
                    {status === 'success' && (
                        <>
                            <h2>✅ Unsubscribed Successfully</h2>
                            <p>You have been removed from our alert system and will no longer receive automated emails from us.</p>
                            <Link to="/" className="home-link">Return to Home</Link>
                        </>
                    )}
                    {status === 'error' && (
                        <>
                            <h2>❌ Unsubscribe Failed</h2>
                            <p>We could not process your request. The link may have expired or is invalid.</p>
                            <p>If you continue to receive emails, please <Link to="/contact">contact us</Link> directly.</p>
                        </>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Unsubscribe;
