import { useExpenses } from '../context/ExpenseContext';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Trash2, HandCoins, Landmark, Coins } from 'lucide-react';
import { format } from 'date-fns';
import './Dashboard.css';

const currencyFmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function Dashboard() {
    const {
        transactions,
        totalIncome,
        totalAmountSpent,
        amountIHave,
        totalOweMe,
        totalIOwe,
        finalSettledBalance,
        deleteTransaction
    } = useExpenses();

    const recent = transactions.slice(0, 5);

    // Progress bar shows how much of income is physically gone from wallet
    const spendingPercent = totalIncome > 0 ? Math.min((totalAmountSpent / totalIncome) * 100, 100) : 0;

    return (
        <div className="dashboard">
            {/* Summary Cards */}
            <div className="summary-grid">
                {/* Main Balance Card */}
                <div className="summary-card balance glass-pane">
                    <div className="summary-header">
                        <div className="summary-icon">
                            <Wallet size={22} />
                        </div>
                        <div className="extra-stat">
                            <span className="extra-label">Total Volume</span>
                            <span className="extra-value">{currencyFmt(totalIncome)}</span>
                        </div>
                    </div>
                    <div className="summary-info">
                        <span className="summary-label">Amount I Have Now (Cash)</span>
                        <span className={`summary-value ${amountIHave >= 0 ? 'positive' : 'negative'}`}>
                            {currencyFmt(amountIHave)}
                        </span>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${spendingPercent}%` }} />
                    </div>
                    <span className="progress-label">{spendingPercent.toFixed(0)}% of income has left wallet</span>
                </div>

                {/* Sub Stats Row 1 */}
                <div className="summary-card income glass-pane">
                    <div className="summary-icon income-icon">
                        <TrendingUp size={20} />
                    </div>
                    <div className="summary-info">
                        <span className="summary-label">Friends Owe Me</span>
                        <span className="summary-value positive small-val">{currencyFmt(totalOweMe)}</span>
                    </div>
                </div>

                <div className="summary-card expense glass-pane">
                    <div className="summary-icon expense-icon">
                        <TrendingDown size={20} />
                    </div>
                    <div className="summary-info">
                        <span className="summary-label">I Owe Friends</span>
                        <span className="summary-value orange small-val">{currencyFmt(totalIOwe)}</span>
                    </div>
                </div>

                {/* Final Settled Card */}
                <div className="summary-card net-info-card glass-pane full-row">
                    <div className="summary-header">
                        <div className="summary-icon final-icon">
                            <Landmark size={22} />
                        </div>
                        <div className="split-math">
                            <span>{currencyFmt(amountIHave)}</span>
                            <span className="math-op">+</span>
                            <span className="positive">{currencyFmt(totalOweMe)}</span>
                            <span className="math-op">-</span>
                            <span className="orange">{currencyFmt(totalIOwe)}</span>
                        </div>
                    </div>
                    <div className="summary-info">
                        <span className="summary-label">Actual Balance after split</span>
                        <span className={`summary-value ${finalSettledBalance >= 0 ? 'positive' : 'negative'}`}>
                            {currencyFmt(finalSettledBalance)}
                        </span>
                    </div>
                </div>

                {/* Totals Row */}
                <div className="summary-card mini-card glass-pane">
                    <div className="summary-info">
                        <span className="summary-label">Total Outflow</span>
                        <span className="summary-value negative mini-val">{currencyFmt(totalAmountSpent)}</span>
                    </div>
                </div>
                <div className="summary-card mini-card glass-pane">
                    <div className="summary-info">
                        <span className="summary-label">Income</span>
                        <span className="summary-value positive mini-val">{currencyFmt(totalIncome)}</span>
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="recent-section glass-pane">
                <div className="section-header">
                    <h2>Recent Transactions</h2>
                    <span className="badge">{transactions.length} total</span>
                </div>
                {recent.length === 0 ? (
                    <div className="empty-state">
                        <Wallet size={40} strokeWidth={1} />
                        <p>No transactions yet</p>
                    </div>
                ) : (
                    <ul className="transaction-list">
                        {recent.map((t) => {
                            const isShared = t.split?.shared;
                            const friendPaid = isShared && t.split.whoPaid === 'friend';

                            return (
                                <li key={t.id} className="transaction-item">
                                    <div className={`tx-icon ${t.type === 'income' ? 'tx-income' : 'tx-expense'}`}>
                                        {t.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                                    </div>
                                    <div className="tx-info">
                                        <span className="tx-desc">{t.description}</span>
                                        <span className="tx-meta">
                                            {t.category} &middot; {format(new Date(t.date), 'dd MMM yyyy')}
                                            {isShared && (
                                                <span className={`tx-badge ${friendPaid ? 'tx-badge--friend' : ''}`}>
                                                    {friendPaid ? `Friend Paid` : 'Shared'}
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                    <div className="tx-right">
                                        <span className={`tx-amount ${t.type === 'income' ? 'positive' : 'negative'}`}>
                                            {t.type === 'income' ? '+' : '-'}{currencyFmt(t.amount)}
                                        </span>
                                        {isShared && (
                                            <span className="tx-total-hint">
                                                {friendPaid ? 'You owe share' : 'Friend owes share'}
                                            </span>
                                        )}
                                        <button className="delete-btn" onClick={() => deleteTransaction(t.id)} aria-label="Delete">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}
