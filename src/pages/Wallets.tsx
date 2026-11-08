import { useState, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
  addWallet,
  updateWallet,
  deleteWallet,
  transferBetweenWallets,
} from '../store/walletsSlice';

export default function Wallets() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.currentUser);
  const allWallets = useAppSelector((s) => s.wallets.items);
  const userId = user?.id || '';
  const wallets = allWallets.filter((w) => w.userId === userId);

  const [showForm, setShowForm] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    type: 'bank' as 'cash' | 'bank' | 'credit' | 'other',
    balance: '',
    color: '#3b82f6',
  });
  const [transfer, setTransfer] = useState({
    fromId: '',
    toId: '',
    amount: '',
  });

  const resetForm = () => {
    setForm({ name: '', type: 'bank', balance: '', color: '#3b82f6' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const balance = parseFloat(form.balance) || 0;
    if (editingId) {
      dispatch(
        updateWallet({
          id: editingId,
          name: form.name,
          type: form.type,
          color: form.color,
        })
      );
    } else {
      dispatch(
        addWallet({
          userId,
          name: form.name,
          type: form.type,
          balance,
          color: form.color,
        })
      );
    }
    resetForm();
  };

  const handleEdit = (w: (typeof wallets)[0]) => {
    setForm({
      name: w.name,
      type: w.type,
      balance: w.balance.toString(),
      color: w.color,
    });
    setEditingId(w.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this wallet?')) return;
    dispatch(deleteWallet(id));
  };

  const handleTransfer = (e: FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(transfer.amount);
    if (!transfer.fromId || !transfer.toId || isNaN(amount) || amount <= 0) return;
    if (transfer.fromId === transfer.toId) return;
    dispatch(
      transferBetweenWallets({
        fromId: transfer.fromId,
        toId: transfer.toId,
        amount,
      })
    );
    setTransfer({ fromId: '', toId: '', amount: '' });
    setShowTransfer(false);
  };

  const total = wallets.reduce((s, w) => s + w.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Wallets</h1>
          <p className="text-slate-500 mt-1">
            Total across wallets: ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTransfer(!showTransfer)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
          >
            Transfer
          </button>
          <button
            onClick={() => {
              if (showForm) resetForm();
              else setShowForm(true);
            }}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          >
            {showForm ? 'Cancel' : '+ Add Wallet'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Wallet' : 'New Wallet'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="My Bank"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as typeof form.type })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank Account</option>
                <option value="credit">Credit Card</option>
                <option value="other">Other</option>
              </select>
            </div>
            {!editingId && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Initial Balance
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.balance}
                  onChange={(e) => setForm({ ...form, balance: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="0.00"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Color</label>
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-full h-10 px-1 py-1 border border-slate-300 rounded-lg"
              />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg"
              >
                {editingId ? 'Update' : 'Add'} Wallet
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showTransfer && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-4">Transfer Between Wallets</h3>
          <form onSubmit={handleTransfer} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">From</label>
              <select
                required
                value={transfer.fromId}
                onChange={(e) => setTransfer({ ...transfer, fromId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Select</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} (${w.balance.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">To</label>
              <select
                required
                value={transfer.toId}
                onChange={(e) => setTransfer({ ...transfer, toId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Select</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
              <input
                required
                type="number"
                step="0.01"
                min="0.01"
                value={transfer.amount}
                onChange={(e) => setTransfer({ ...transfer, amount: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="sm:col-span-3">
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg"
              >
                Transfer
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {wallets.map((w) => (
          <div
            key={w.id}
            className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 relative overflow-hidden"
          >
            <div
              className="absolute top-0 left-0 w-1.5 h-full"
              style={{ backgroundColor: w.color }}
            />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-500 capitalize">{w.type}</p>
                <h3 className="text-lg font-semibold text-slate-800 mt-0.5">{w.name}</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(w)}
                  className="text-xs text-indigo-600 hover:text-indigo-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(w.id)}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800 mt-4">
              ${w.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        ))}
        {wallets.length === 0 && (
          <p className="text-slate-400 col-span-full text-center py-12">
            No wallets yet. Create one to get started.
          </p>
        )}
      </div>
    </div>
  );
}
