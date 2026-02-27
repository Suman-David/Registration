import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/api';

const Dashboard = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            navigate('/login');
        }
    };

    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav">
                <div className="nav-brand">MyApp</div>
                <button onClick={handleLogout} className="btn-logout">
                    Logout
                </button>
            </nav>
            
            <main className="dashboard-main">
                <div className="welcome-card">
                    <h1>Hello Welcome</h1>
                    <p>You have successfully logged in to your dashboard.</p>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
