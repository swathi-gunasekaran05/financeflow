import { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, MinusCircle, Users } from 'lucide-react';
import './AddTransaction.css';

const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];
const expenseCategories = ['Food', 'Transport', 'Housing', 'Entertainment', 'Health', 'Shopping', 'Education', 'Utilities', 'Other'];

const today = new Date().toISOString().split('T')[0];

export default function AddTransaction() {
    const { addTransaction } = useExpenses();
    const navigate = useNavigate();

    const [type, setType] = useState('expense');
    const [form, setForm] = useState({
        description: '',
        amount: '',
        category: '',
        date: today,
        note: '',
    });
    const [shared, setShared] = useState(false);
    const [splitForm, setSplitForm] = useState({
        friendName: '',
        whoPaid: 'me',
        people: 2,
    });

    const categories = type === 'income' ? incomeCategories : expenseCategories;

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSplitChange = (e) => {
        setSplitForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.description || !form.amount || !form.category) return;

        const amount = parseFloat(form.amount);
        const numPeople = parseInt(splitForm.people, 10);
        const perPerson = (amount / numPeople).toFixed(2);
        const friendName = splitForm.friendName.trim() || 'Friend';

        let finalNote = form.note;
        if (shared && !finalNote) {
            if (splitForm.whoPaid === 'me') {
                finalNote = `${friendName} owes me ₹${perPerson} (split ${numPeople} ways)`;
            } else {
                finalNote = `I owe ${friendName} ₹${perPerson} (split ${numPeople} ways)`;
            }
        }

        const transaction = {
            ...form,
            amount,
            note: finalNote,
            type,
            split: shared
                ? { shared: true, ...splitForm, people: numPeople }
                : { shared: false },
        };

        addTransaction(transaction);
        navigate('/');
    };

    // Split calculation helpers
    const totalAmount = parseFloat(form.amount) || 0;
    const numPeople = parseInt(splitForm.people, 10);
    const perPerson = totalAmount > 0 ? (totalAmount / numPeople).toFixed(2) : '0.00';
    const friendName = splitForm.friendName.trim() || 'Your friend';

    return (
        <div className="add-page">
            <div className="add-card glass-pane">
                <h1 className="add-title">New Transaction</h1>

                {/* Type Toggle */}
                <div className="type-toggle">
                    <button
                        className={`toggle-btn ${type === 'income' ? 'active income-active' : ''}`}
                        onClick={() => { setType('income'); setForm(f => ({ ...f, category: '' })); }}
                        type="button"
                    >
                        <PlusCircle size={18} />
                        Income
                    </button>
                    <button
                        className={`toggle-btn ${type === 'expense' ? 'active expense-active' : ''}`}
                        onClick={() => { setType('expense'); setForm(f => ({ ...f, category: '' })); }}
                        type="button"
                    >
                        <MinusCircle size={18} />
                        Expense
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="add-form">
                    {/* Amount */}
                    <div className="form-group amount-group">
                        <label htmlFor="amount">Amount (₹)</label>
                        <input
                            id="amount"
                            name="amount"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={form.amount}
                            onChange={handleChange}
                            required
                            className="amount-input"
                        />
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <input
                            id="description"
                            name="description"
                            type="text"
                            placeholder="What was this for?"
                            value={form.description}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Category & Date */}
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="category">Category</label>
                            <select id="category" name="category" value={form.category} onChange={handleChange} required>
                                <option value="">Select category</option>
                                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="date">Date</label>
                            <input
                                id="date"
                                name="date"
                                type="date"
                                value={form.date}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Note */}
                    <div className="form-group">
                        <label htmlFor="note">Note (optional)</label>
                        <input
                            id="note"
                            name="note"
                            type="text"
                            placeholder="Any additional notes..."
                            value={form.note}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Shared Toggle — only for expenses */}
                    {type === 'expense' && (
                        <div className="shared-toggle-wrap">
                            <button
                                type="button"
                                className={`shared-toggle ${shared ? 'shared-active' : ''}`}
                                onClick={() => setShared(!shared)}
                            >
                                <Users size={16} />
                                {shared ? 'Shared Expense: ON' : 'Split with Friend?'}
                            </button>
                        </div>
                    )}

                    {/* Split Form */}
                    {type === 'expense' && shared && (
                        <div className="split-section glass-pane">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="friendName">Friend's Name</label>
                                    <input
                                        id="friendName"
                                        name="friendName"
                                        type="text"
                                        placeholder="e.g., Raj"
                                        value={splitForm.friendName}
                                        onChange={handleSplitChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="whoPaid">Who Paid?</label>
                                    <select id="whoPaid" name="whoPaid" value={splitForm.whoPaid} onChange={handleSplitChange}>
                                        <option value="me">I Paid</option>
                                        <option value="friend">Friend Paid</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="people">Split Between (people)</label>
                                <select id="people" name="people" value={splitForm.people} onChange={handleSplitChange}>
                                    {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} people</option>)}
                                </select>
                            </div>

                            <p className="split-info">
                                Total ₹{form.amount || '0'} ÷ {numPeople} people
                                = <strong>₹{perPerson} each</strong>
                            </p>

                            {/* Who owes whom callout */}
                            {totalAmount > 0 && (
                                splitForm.whoPaid === 'me' ? (
                                    <div className="owe-callout owe-callout--receive">
                                        <span className="owe-callout__emoji">💸</span>
                                        <div className="owe-callout__body">
                                            <span className="owe-callout__label">
                                                {friendName} needs to pay you back
                                            </span>
                                            <span className="owe-callout__amount">+ ₹{perPerson}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="owe-callout owe-callout--pay">
                                        <span className="owe-callout__emoji">🤝</span>
                                        <div className="owe-callout__body">
                                            <span className="owe-callout__label">
                                                You need to pay {friendName}
                                            </span>
                                            <span className="owe-callout__amount">- ₹{perPerson}</span>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}

                    <button type="submit" className="submit-btn">
                        Add {type === 'income' ? 'Income' : 'Expense'}
                    </button>
                </form>
            </div>
        </div>
    );
}
