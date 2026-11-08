import { useState, useMemo, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { addReminder, updateReminder, deleteReminder } from '../store/remindersSlice';
import { format, parseISO, isBefore, addDays, addMonths } from 'date-fns';

export default function Reminders() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.currentUser);
  const allReminders = useAppSelector((s) => s.reminders.items);
  const categories = useAppSelector((s) => s.categories.items);
  const wallets = useAppSelector((s) => s.wallets.items);

  const userId = user?.id || '';
  const reminders = allReminders.filter((r) => r.userId === userId);
  const userCategories = categories.filter((c) => c.userId === userId);
  const userWallets = wallets.filter((w) => w.userId === userId);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: '',
    frequency: 'monthly' as 'weekly' | 'monthly',
    nextDate: new Date().toISOString().slice(0, 10),
    walletId: '',
  });

  const dueSoon = useMemo(() => {
    const today = new Date();
    const weekLater = addDays(today, 7);
    return reminders.filter(
      (r) => r.isActive && isBefore(parseISO(r.nextDate), weekLater)
    );
  }, [reminders]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!form.title || isNaN(amount) || !form.category || !form.walletId) return;

    dispatch(
      addReminder({
        userId,
        title: form.title,
        amount,
        category: form.category,
        frequency: form.frequency,
        nextDate: form.nextDate,
        walletId: form.walletId,
        isActive: true,
      })
    );
    setForm({
      title: '',
      amount: '',
      category: '',
      frequency: 'monthly',
      nextDate: new Date().toISOString().slice(0, 10),
      walletId: '',
    });
    setShowForm(false);
  };

  const handleToggle = (id: string, isActive: boolean) => {
    dispatch(updateReminder({ id, isActive: !isActive }));
  };

  const handleMarkPaid = (r: (typeof reminders)[0]) => {
    const next =
      r.frequency === 'weekly'
        ? format(addDays(parseISO(r.nextDate), 7), 'yyyy-MM-dd')
        : format(addMonths(parseISO(r.nextDate), 1), 'yyyy-MM-dd');
    dispatch(updateReminder({ id: r.id, nextDate: next }));
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this reminder?')) return;
    dispatch(deleteReminder(id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reminders</h1>
          <p className="text-slate-500 mt-1">Track recurring expenses</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add Reminder'}
        </button>
      </div>

      {dueSoon.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="font-semibold text-amber-800 mb-2">Due soon</h3>
          <ul className="space-y-1">
            {dueSoon.map((r) => (
              <li key={r.id} className="text-sm text-amber-700">
                <strong>{r.title}</strong> — ${r.amount.toFixed(2)} on{' '}
                {format(parseISO(r.nextDate), 'MMM d, yyyy')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-4">New Reminder</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Rent payment"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
              <input
                required
                type="number"
                step="0.01"
                min="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Select</option>
                {userCategories
                  .filter((c) => c.type === 'expense' || c.type === 'both')
                  .map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
              <select
                value={form.frequency}
                onChange={(e) =>
                  setForm({ ...form, frequency: e.target.value as 'weekly' | 'monthly' })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Next Date</label>
              <input
                required
                type="date"
                value={form.nextDate}
                onChange={(e) => setForm({ ...form, nextDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Wallet</label>
              <select
                required
                value={form.walletId}
                onChange={(e) => setForm({ ...form, walletId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Select</option>
                {userWallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg"
              >
                Add Reminder
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {reminders.length === 0 ? (
          <p className="text-slate-400 text-center py-12">No reminders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-slate-500">
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Frequency</th>
                  <th className="px-4 py-3 font-medium">Next Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reminders.map((r) => (
                  <tr key={r.id} className="border-t border-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{r.title}</td>
                    <td className="px-4 py-3 text-slate-600">
                      ${r.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-slate-500 capitalize">{r.frequency}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {format(parseISO(r.nextDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          r.isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {r.isActive ? 'Active' : 'Paused'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => handleMarkPaid(r)}
                        className="text-xs text-emerald-600 hover:text-emerald-800 font-medium"
                      >
                        Paid
                      </button>
                      <button
                        onClick={() => handleToggle(r.id, r.isActive)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        {r.isActive ? 'Pause' : 'Resume'}
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
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
