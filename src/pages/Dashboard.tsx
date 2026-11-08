import { useMemo } from 'react';
import { useAppSelector } from '../hooks/redux';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { format, parseISO, startOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';

export default function Dashboard() {
  const user = useAppSelector((s) => s.auth.currentUser);
  const allTx = useAppSelector((s) => s.transactions.items);
  const categories = useAppSelector((s) => s.categories.items);
  const wallets = useAppSelector((s) => s.wallets.items);

  const userId = user?.id || '';
  const transactions = useMemo(
    () => allTx.filter((t) => t.userId === userId),
    [allTx, userId]
  );
  const userCategories = useMemo(
    () => categories.filter((c) => c.userId === userId),
    [categories, userId]
  );
  const userWallets = useMemo(
    () => wallets.filter((w) => w.userId === userId),
    [wallets, userId]
  );

  const totalIncome = useMemo(
    () => transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    [transactions]
  );
  const totalExpense = useMemo(
    () => transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [transactions]
  );
  const balance = totalIncome - totalExpense;
  const totalWalletBalance = userWallets.reduce((s, w) => s + w.balance, 0);

  // Pie data - expenses by category
  const pieData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
      color: userCategories.find((c) => c.name === name)?.color || '#64748b',
    }));
  }, [transactions, userCategories]);

  // Line data - last 6 months
  const lineData = useMemo(() => {
    const now = new Date();
    const months = eachMonthOfInterval({
      start: startOfMonth(subMonths(now, 5)),
      end: startOfMonth(now),
    });
    return months.map((month) => {
      const key = format(month, 'yyyy-MM');
      const label = format(month, 'MMM yy');
      let income = 0;
      let expense = 0;
      transactions.forEach((t) => {
        if (t.date.startsWith(key)) {
          if (t.type === 'income') income += t.amount;
          else expense += t.amount;
        }
      });
      return { month: label, income, expense };
    });
  }, [transactions]);

  const recent = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
        .slice(0, 5),
    [transactions]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Welcome back, {user?.name?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-slate-500 mt-1">Here's your financial overview</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 font-medium">Total Balance</p>
          <p className={`text-2xl font-bold mt-1 ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 font-medium">Income</p>
          <p className="text-2xl font-bold mt-1 text-emerald-600">
            ${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 font-medium">Expenses</p>
          <p className="text-2xl font-bold mt-1 text-red-600">
            ${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 font-medium">Wallets</p>
          <p className="text-2xl font-bold mt-1 text-indigo-600">
            ${totalWalletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Expenses by Category</h3>
          {pieData.length === 0 ? (
            <p className="text-slate-400 text-center py-12">No expense data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) =>
                    `${name} ${((percent || 0) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) =>
                    `$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) =>
                  `$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                }
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Income"
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Expense"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Transactions</h3>
        {recent.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No transactions yet. Add one from the Transactions page.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="pb-3 font-medium">Title</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((tx) => (
                  <tr key={tx.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-3 font-medium text-slate-800">{tx.title}</td>
                    <td className="py-3 text-slate-600">{tx.category}</td>
                    <td className="py-3 text-slate-500">
                      {format(parseISO(tx.date), 'MMM d, yyyy')}
                    </td>
                    <td
                      className={`py-3 text-right font-semibold ${
                        tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}$
                      {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
