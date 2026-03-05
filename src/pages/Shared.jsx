import { useExpenses } from '../context/ExpenseContext';
import { Users, ArrowUpRight, ArrowDownRight, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import './Shared.css';

const currencyFmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function Shared() {
    const { transactions, sharedBalances } = useExpenses();

    const sharedTxns = transactions.filter(t => t.split?.shared);

    return (
        <div className="shared-page">
            <h1 className="page-title">Shared Expenses</h1>

            {/* Balances Summary */}
            <div className="balances-section">
                <h2 className="section-label">Friend Balances</h2>
                {Object.keys(sharedBalances).length === 0 ? (
                    <div className="empty-card glass-pane">
                        <Users size={40} strokeWidth={1} />
                        <p>No shared expenses yet. Add one with the "Split with Friend" option.</p>
                    </div>
                ) : (
                    <div className="balances-grid">
                        {Object.entries(sharedBalances).map(([friend, bal]) => {
                            const net = bal.oweMe - bal.iOwe;
                            return (
                                <div key={friend} className="balance-card glass-pane">
                                    <div className="friend-avatar">
                                        {friend.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="friend-info">
                                        <span className="friend-name">{friend}</span>
                                        <div className="friend-breakdown">
                                            {bal.oweMe > 0 && (
                                                <span className="owe-line positive">
                                                    <ArrowUpRight size={13} />
                                                    Owes you {currencyFmt(bal.oweMe)}
                                                </span>
                                            )}
                                            {bal.iOwe > 0 && (
                                                <span className="owe-line negative">
                                                    <ArrowDownRight size={13} />
                                                    You owe {currencyFmt(bal.iOwe)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="net-wrap">
                                        <span className={`net-badge ${net >= 0 ? 'net-positive' : 'net-negative'}`}>
                                            {net >= 0 ? '+' : ''}{currencyFmt(net)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Shared Transaction Log */}
            <div className="shared-log">
                <h2 className="section-label">Shared Transaction Log</h2>
                {sharedTxns.length === 0 ? (
                    <div className="empty-card glass-pane">
                        <CheckCircle size={36} strokeWidth={1} />
                        <p>No shared transactions found.</p>
                    </div>
                ) : (
                    <div className="log-list glass-pane">
                        {sharedTxns.map((t) => {
                            const perPerson = (t.amount / t.split.people).toFixed(2);
                            return (
                                <div key={t.id} className="log-item">
                                    <div className="log-icon tx-expense">
                                        <Users size={16} />
                                    </div>
                                    <div className="log-info">
                                        <span className="log-desc">{t.description}</span>
                                        <span className="log-meta">
                                            {format(new Date(t.date), 'dd MMM yyyy')} &middot; {t.split.friendName || 'Friend'} &middot;{' '}
                                            {t.split.whoPaid === 'me' ? 'You paid' : `${t.split.friendName || 'Friend'} paid`} &middot;{' '}
                                            split {t.split.people} ways
                                        </span>
                                    </div>
                                    <div className="log-amounts">
                                        <span className="log-total negative">-{currencyFmt(t.amount)}</span>
                                        <span className="log-per">₹{perPerson}/person</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
