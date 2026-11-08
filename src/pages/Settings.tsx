import { useState, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { addCategory, deleteCategory } from '../store/categoriesSlice';
import { updateProfile } from '../store/authSlice';
import { setTransactions } from '../store/transactionsSlice';

export default function Settings() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.currentUser);
  const categories = useAppSelector((s) => s.categories.items);
  const transactions = useAppSelector((s) => s.transactions.items);

  const userId = user?.id || '';
  const userCategories = categories.filter((c) => c.userId === userId);
  const userTx = transactions.filter((t) => t.userId === userId);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [catName, setCatName] = useState('');
  const [catColor, setCatColor] = useState('#6366f1');
  const [catType, setCatType] = useState<'expense' | 'income' | 'both'>('expense');
  const [msg, setMsg] = useState('');

  const handleProfile = (e: FormEvent) => {
    e.preventDefault();
    dispatch(updateProfile({ name, email }));
    setMsg('Profile updated');
    setTimeout(() => setMsg(''), 2000);
  };

  const handleAddCategory = (e: FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    dispatch(
      addCategory({
        userId,
        name: catName.trim(),
        color: catColor,
        type: catType,
        icon: '📌',
      })
    );
    setCatName('');
  };

  const handleDeleteCategory = (id: string) => {
    if (!confirm('Delete this category?')) return;
    dispatch(deleteCategory(id));
  };

  const exportCSV = () => {
    const headers = ['Title', 'Amount', 'Type', 'Category', 'Date', 'Notes'];
    const rows = userTx.map((t) => [
      t.title,
      t.amount,
      t.type,
      t.category,
      t.date,
      t.notes || '',
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').slice(1).filter(Boolean);
      const newTx = lines.map((line) => {
        const [title, amount, type, category, date, notes] = line.split(',');
        return {
          id: crypto.randomUUID(),
          userId,
          title: title?.trim() || 'Imported',
          amount: parseFloat(amount) || 0,
          type: (type?.trim() === 'income' ? 'income' : 'expense') as 'income' | 'expense',
          category: category?.trim() || 'Other',
          date: date?.trim() || new Date().toISOString().slice(0, 10),
          walletId: '',
          notes: notes?.trim() || '',
          createdAt: new Date().toISOString(),
        };
      });
      dispatch(setTransactions([...transactions, ...newTx]));
      setMsg(`Imported ${newTx.length} transactions`);
      setTimeout(() => setMsg(''), 3000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 mt-1">Manage profile, categories and data</p>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm">
          {msg}
        </div>
      )}

      {/* Profile */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Profile</h3>
        <form onSubmit={handleProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Categories</h3>
        <form onSubmit={handleAddCategory} className="flex flex-wrap gap-3 mb-4">
          <input
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            placeholder="Category name"
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
          />
          <input
            type="color"
            value={catColor}
            onChange={(e) => setCatColor(e.target.value)}
            className="w-12 h-10 border border-slate-300 rounded-lg"
          />
          <select
            value={catType}
            onChange={(e) => setCatType(e.target.value as typeof catType)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
            <option value="both">Both</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg"
          >
            Add
          </button>
        </form>
        <div className="flex flex-wrap gap-2">
          {userCategories.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border border-slate-200"
              style={{ borderColor: c.color }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: c.color }}
              />
              {c.icon} {c.name}
              <button
                onClick={() => handleDeleteCategory(c.id)}
                className="text-slate-400 hover:text-red-500 ml-1"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Import / Export */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Data Export / Import</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportCSV}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg"
          >
            Export CSV
          </button>
          <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg cursor-pointer">
            Import CSV
            <input type="file" accept=".csv" onChange={importCSV} className="hidden" />
          </label>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          CSV format: Title, Amount, Type, Category, Date, Notes
        </p>
      </div>
    </div>
  );
}
