import { useApp } from '../context/AppContext';

export default function Notifications() {
    const { notifications } = useApp();

    const iconMap = { success: 'check-circle', danger: 'times-circle', warning: 'exclamation-triangle', info: 'info-circle' };

    return (
        <div style={{ position: 'fixed', top: 'calc(var(--navbar-h) + 1rem)', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
            {notifications.map(n => (
                <div key={n.id} className={`notification notification-${n.type}`}>
                    <i className={`fas fa-${iconMap[n.type] || 'info-circle'}`}></i>
                    {n.message}
                </div>
            ))}
        </div>
    );
}
