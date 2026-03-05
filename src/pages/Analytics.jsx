import { useMemo } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { format, startOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import './Analytics.css';

const COLORS = ['#58a6ff', '#8a2be2', '#3fb950', '#f85149', '#d29922', '#79c0ff', '#ff7b72', '#56d364'];

const currencyFmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="chart-tooltip">
            <p className="tooltip-label">{label}</p>
            {payload.map((p) => (
                <p key={p.name} style={{ color: p.color }}>
                    {p.name}: {currencyFmt(p.value)}
                </p>
            ))}
        </div>
    );
};

export default function Analytics() {
    const { transactions, totalIncome, totalExpense } = useExpenses();

    // Monthly income/expense for last 6 months
    const monthlyData = useMemo(() => {
        const now = new Date();
        const months = eachMonthOfInterval({ start: subMonths(startOfMonth(now), 5), end: startOfMonth(now) });

        return months.map((month) => {
            const label = format(month, 'MMM yy');
            const monthTxns = transactions.filter((t) => {
                const td = new Date(t.date);
                return td.getMonth() === month.getMonth() && td.getFullYear() === month.getFullYear();
            });
            const income = monthTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
            const expense = monthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
            return { month: label, income, expense };
        });
    }, [transactions]);

    // Category breakdown (expenses)
    const categoryData = useMemo(() => {
        const map = {};
        transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                map[t.category] = (map[t.category] || 0) + t.amount;
            });
        return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, [transactions]);

    const savingsRate = totalIncome > 0 ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1) : '0.0';

    return (
        <div className="analytics-page">
            <h1 className="page-title">Analytics</h1>

            {/* Key Metrics */}
            <div className="metrics-row">
                <div className="metric-card glass-pane">
                    <span className="metric-label">Savings Rate</span>
                    <span className={`metric-value ${parseFloat(savingsRate) >= 0 ? 'positive' : 'negative'}`}>
                        {savingsRate}%
                    </span>
                </div>
                <div className="metric-card glass-pane">
                    <span className="metric-label">Transactions</span>
                    <span className="metric-value">{transactions.length}</span>
                </div>
                <div className="metric-card glass-pane">
                    <span className="metric-label">Avg. Expense</span>
                    <span className="metric-value negative">
                        {transactions.filter(t => t.type === 'expense').length > 0
                            ? currencyFmt(totalExpense / transactions.filter(t => t.type === 'expense').length)
                            : '₹0'}
                    </span>
                </div>
            </div>

            {/* Monthly Overview */}
            <div className="chart-card glass-pane">
                <h2 className="chart-title">Monthly Overview</h2>
                <p className="chart-subtitle">Income vs Expenses — last 6 months</p>
                <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3fb950" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#3fb950" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#f85149" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#f85149" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis dataKey="month" tick={{ fill: '#8b949e', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#8b949e', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="income" name="Income" stroke="#3fb950" strokeWidth={2} fill="url(#incomeGrad)" />
                        <Area type="monotone" dataKey="expense" name="Expense" stroke="#f85149" strokeWidth={2} fill="url(#expenseGrad)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Category Breakdown */}
            <div className="charts-grid">
                <div className="chart-card glass-pane">
                    <h2 className="chart-title">Expense by Category</h2>
                    {categoryData.length === 0 ? (
                        <div className="chart-empty">No expense data yet</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                                    dataKey="value" nameKey="name" paddingAngle={3}>
                                    {categoryData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v) => currencyFmt(v)} />
                                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.78rem', color: '#8b949e' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="chart-card glass-pane">
                    <h2 className="chart-title">Category Bars</h2>
                    {categoryData.length === 0 ? (
                        <div className="chart-empty">No expense data yet</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={categoryData.slice(0, 6)} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: '#8b949e', fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#8b949e', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                                <Tooltip formatter={(v) => currencyFmt(v)} />
                                <Bar dataKey="value" name="Amount" radius={[6, 6, 0, 0]}>
                                    {categoryData.slice(0, 6).map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}
