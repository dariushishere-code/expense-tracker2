import { useMemo } from 'react';
import { useAppSelector } from '../hooks/redux';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { format, startOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';

export default function Reports() {
  const user = useAppSelector((s) => s.auth.currentUser);
  const allTx = useAppSelector((s) => s.transactions.items);
  const categories = useAppSelector((s) => s.categories.items);

  const userId = user?.id || '';
  const transactions = useMemo(
    () => allTx.filter((t) => t.userId === userId),
    [allTx, userId]
  );
  const userCategories = useMemo(
    () => categories.filter((c) => c.userId === userId),
    [categories, userId]
  );

  const pieData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return Object.entries(map)
      .map(([name, value]) => ({
        name,
        value,
        color: userCategories.find((c) => c.name === name)?.color || '#64748b',
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, userCategories]);

  const incomePie = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'income')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
      color: userCategories.find((c) => c.name === name)?.color || '#22c55e',
    }));
  }, [transactions, userCategories]);

  const monthlyData = useMemo(() => {
    const now = new Date();
    const months = eachMonthOfInterval({
      start: startOfMonth(subMonths(now, 11)),
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
      return { month: label, income, expense, net: income - expense };
    });
  }, [transactions]);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
        <p className="text-slate-500 mt-1">Visual insights into your finances</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">Total Income</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            ${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            ${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">Net</p>
          <p
            className={`text-2xl font-bold mt-1 ${
              totalIncome - totalExpense >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            ${(totalIncome - totalExpense).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Expense Breakdown</h3>
          {pieData.length === 0 ? (
            <p className="text-slate-400 text-center py-16">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    `${name} (${((percent || 0) * 100).toFixed(0)}%)`
                  }
                >
                  {pieData.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) =>
                    `$${v.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Income Sources</h3>
          {incomePie.length === 0 ? (
            <p className="text-slate-400 text-center py-16">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={incomePie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    `${name} (${((percent || 0) * 100).toFixed(0)}%)`
                  }
                >
                  {incomePie.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) =>
                    `$${v.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">12-Month Trend</h3>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(v: number) =>
                `$${v.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
              }
            />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} name="Income" />
            <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} name="Expense" />
            <Line type="monotone" dataKey="net" stroke="#6366f1" strokeWidth={2} name="Net" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Monthly Comparison</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(v: number) =>
                `$${v.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
              }
            />
            <Legend />
            <Bar dataKey="income" fill="#22c55e" name="Income" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" fill="#ef4444" name="Expense" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
