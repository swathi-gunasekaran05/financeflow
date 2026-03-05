import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, History, BarChart2, Users } from 'lucide-react';
import './Navbar.css';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/add', icon: PlusCircle, label: 'Add' },
    { to: '/history', icon: History, label: 'History' },
    { to: '/analytics', icon: BarChart2, label: 'Analytics' },
    { to: '/shared', icon: Users, label: 'Shared' },
];

export default function Navbar() {
    return (
        <nav className="floating-nav glass-pane">
            {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <Icon size={20} />
                    <span>{label}</span>
                </NavLink>
            ))}
        </nav>
    );
}
