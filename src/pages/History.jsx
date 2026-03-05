import { useState, useMemo } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { Search, Filter, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format } from 'date-fns';
import './History.css';

const currencyFmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const allCategories = ['All', 'Salary', 'Freelance', 'Investment', 'Gift', 'Food', 'Transport', 'Housing',
    'Entertainment', 'Health', 'Shopping', 'Education', 'Utilities', 'Other'];

export default function History() {
    const { transactions, deleteTransaction } = useExpenses();
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('All');

    const filtered = useMemo(() => {
        return transactions.filter((t) => {
            const matchSearch = t.description.toLowerCase().includes(search.toLowerCase());
            const matchType = typeFilter === 'all' || t.type === typeFilter;
            const matchCat = categoryFilter === 'All' || t.category === categoryFilter;
            return matchSearch && matchType && matchCat;
        });
    }, [transactions, search, typeFilter, categoryFilter]);

    const grouped = useMemo(() => {
        return filtered.reduce((acc, t) => {
            const key = format(new Date(t.date), 'MMMM yyyy');
            if (!acc[key]) acc[key] = [];
            acc[key].push(t);
            return acc;
        }, {});
    }, [filtered]);

    return (
        <div className="history-page">
            <h1 className="page-title">Transaction History</h1>

            {/* Filters */}
            <div className="filters-bar glass-pane">
                <div className="search-wrap">
                    <Search size={16} className="search-icon" />
                    <input
                        id="search-transactions"
                        type="text"
                        placeholder="Search transactions..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="filter-group">
                    <Filter size={14} />
                    <select
                        id="type-filter"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Types</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>

                    <select
                        id="category-filter"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="filter-select"
                    >
                        {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            {/* Results */}
            {filtered.length === 0 ? (
                <div className="empty-state glass-pane">
                    <Search size={40} strokeWidth={1} />
                    <p>No transactions found</p>
                </div>
            ) : (
                Object.entries(grouped).map(([month, txns]) => (
                    <div key={month} className="month-group">
                        <div className="month-header">
                            <span className="month-label">{month}</span>
                            <span className="month-total">
                                {txns.length} transactions
                            </span>
                        </div>
                        <div className="tx-list glass-pane">
                            {txns.map((t) => {
                                const isShared = t.split?.shared;
                                const friendPaid = isShared && t.split.whoPaid === 'friend';
                                const myShare = isShared ? (t.amount / t.split.people) : t.amount;

                                return (
                                    <div key={t.id} className="tx-row">
                                        <div className={`tx-icon ${t.type === 'income' ? 'tx-income' : 'tx-expense'}`}>
                                            {t.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                                        </div>
                                        <div className="tx-info">
                                            <span className="tx-desc">{t.description}</span>
                                            <span className="tx-meta">
                                                {t.category} &middot; {format(new Date(t.date), 'dd MMM yyyy')}
                                                {isShared && (
                                                    <span className={`tx-badge ${friendPaid ? 'tx-badge--friend' : ''}`}>
                                                        {friendPaid ? 'Friend Paid' : 'Shared'}
                                                    </span>
                                                )}
                                                {t.note && <span className="tx-note">· {t.note}</span>}
                                            </span>
                                        </div>
                                        <div className="tx-right">
                                            <span className={`tx-amount ${t.type === 'income' ? 'positive' : 'negative'}`}>
                                                {t.type === 'income' ? '+' : '-'}{currencyFmt(t.type === 'expense' && isShared ? myShare : t.amount)}
                                            </span>
                                            {isShared && (
                                                <span className="tx-total-hint">Total: {currencyFmt(t.amount)}</span>
                                            )}
                                            <button className="delete-btn" onClick={() => deleteTransaction(t.id)} aria-label="Delete">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
