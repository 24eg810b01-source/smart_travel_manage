import React, { useState } from 'react';
import { Expense, ExpenseCategory, Trip, User } from '../../types/travel';
import { 
  CreditCard, 
  Plus, 
  DollarSign, 
  Download, 
  PieChart, 
  TrendingUp, 
  CheckCircle2, 
  Users, 
  Receipt,
  FileSpreadsheet,
  Trash2,
  Filter
} from 'lucide-react';

interface ExpenseTrackerViewProps {
  expenses: Expense[];
  trips: Trip[];
  currentUser: User;
  onCreateExpense: (expense: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (expenseId: string) => void;
}

export const ExpenseTrackerView: React.FC<ExpenseTrackerViewProps> = ({
  expenses,
  trips,
  currentUser,
  onCreateExpense,
  onDeleteExpense,
}) => {
  const [selectedTripId, setSelectedTripId] = useState<string>('ALL');
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'JPY' | 'INR'>('USD');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | ExpenseCategory>('ALL');
  const [isAddingExpense, setIsAddingExpense] = useState(false);

  // Currency exchange rates relative to USD
  const currencyRates: Record<string, { rate: number; symbol: string }> = {
    USD: { rate: 1, symbol: '$' },
    EUR: { rate: 0.92, symbol: '€' },
    GBP: { rate: 0.79, symbol: '£' },
    JPY: { rate: 154.2, symbol: '¥' },
    INR: { rate: 84.5, symbol: '₹' },
  };

  const currentRate = currencyRates[selectedCurrency].rate;
  const currentSymbol = currencyRates[selectedCurrency].symbol;

  const formatAmount = (usdAmount: number) => {
    const converted = usdAmount * currentRate;
    if (selectedCurrency === 'JPY') {
      return `${currentSymbol}${Math.round(converted).toLocaleString()}`;
    }
    return `${currentSymbol}${converted.toFixed(2)}`;
  };

  // Filtered expenses
  const filteredExpenses = expenses.filter(e => {
    const matchesTrip = selectedTripId === 'ALL' || e.tripId === selectedTripId;
    const matchesCategory = selectedCategory === 'ALL' || e.category === selectedCategory;
    return matchesTrip && matchesCategory;
  });

  // Calculate totals
  const totalSpentUsd = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

  // Selected trip budget
  const selectedTrip = trips.find(t => t.id === selectedTripId);
  const totalBudgetUsd = selectedTripId === 'ALL'
    ? trips.reduce((acc, t) => acc + (t.totalBudget || 0), 0)
    : (selectedTrip?.totalBudget || 0);

  const budgetUsagePercent = totalBudgetUsd > 0 ? Math.min(100, Math.round((totalSpentUsd / totalBudgetUsd) * 100)) : 0;
  const remainingBudgetUsd = Math.max(0, totalBudgetUsd - totalSpentUsd);

  // Category breakdown
  const categoryTotals: Record<string, number> = {};
  filteredExpenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  // New Expense form state
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState<ExpenseCategory>('Dining');
  const [newTripTargetId, setNewTripTargetId] = useState(trips[0]?.id || '');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newPaidBy, setNewPaidBy] = useState(currentUser.name);
  const [newReceipt, setNewReceipt] = useState('');
  const [newStatus, setNewStatus] = useState<'PAID' | 'PENDING' | 'REIMBURSED'>('PAID');
  const [newNotes, setNewNotes] = useState('');

  const handleCreateExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onCreateExpense({
      tripId: newTripTargetId,
      userId: currentUser.id,
      title: newTitle.trim(),
      category: newCategory,
      amount: parseFloat(newAmount) || 0,
      currency: 'USD',
      date: newDate,
      paidBy: newPaidBy,
      splitWith: [newPaidBy],
      receiptRef: newReceipt.trim() || `REC-${Math.floor(1000 + Math.random() * 9000)}`,
      status: newStatus,
      notes: newNotes.trim(),
    });

    setIsAddingExpense(false);
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['Date', 'Title', 'Category', 'Amount (USD)', 'Currency', 'Paid By', 'Status', 'Receipt Ref'];
    const rows = filteredExpenses.map(e => [
      e.date,
      `"${e.title.replace(/"/g, '""')}"`,
      e.category,
      e.amount,
      e.currency,
      `"${e.paidBy}"`,
      e.status,
      e.receiptRef || '',
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'smart-travel-expenses.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Expense Tracking & Travel Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Budget adherence, multi-currency conversion, receipts, and co-traveler cost sharing
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Currency Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(['USD', 'EUR', 'GBP', 'JPY', 'INR'] as const).map((curr) => (
              <button
                key={curr}
                onClick={() => setSelectedCurrency(curr)}
                className={`px-2 py-1 text-xs font-mono font-medium rounded transition-colors cursor-pointer ${
                  selectedCurrency === curr
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors cursor-pointer"
            title="Export CSV report"
          >
            <Download className="w-3.5 h-3.5 text-sky-600" />
            Export CSV
          </button>

          <button
            onClick={() => setIsAddingExpense(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Log Expense
          </button>
        </div>
      </div>

      {/* Top Budget Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Spent */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Recorded Spend</span>
            <CreditCard className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {formatAmount(totalSpentUsd)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Across {filteredExpenses.length} transaction entries
          </div>
        </div>

        {/* Total Budget */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Allocated Travel Budget</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {formatAmount(totalBudgetUsd)}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">{budgetUsagePercent}%</span>
            <span>of planned allocation</span>
          </div>
        </div>

        {/* Remaining */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Remaining Buffer</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {formatAmount(remainingBudgetUsd)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Healthy margin for unexpected transit/leisure
          </div>
        </div>

      </div>

      {/* Filter Strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500">Trip:</label>
          <select
            value={selectedTripId}
            onChange={(e) => setSelectedTripId(e.target.value)}
            className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="ALL">All Trips Consolidated</option>
            {trips.map(t => (
              <option key={t.id} value={t.id}>{t.title} ({t.destinationName})</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          {(['ALL', 'Flights', 'Lodging', 'Dining', 'Transit', 'Activities'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as any)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Category Spending Breakdown Bars */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Category Distribution
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {['Flights', 'Lodging', 'Transit', 'Dining', 'Activities', 'Shopping'].map((cat) => {
            const amount = categoryTotals[cat] || 0;
            const pct = totalSpentUsd > 0 ? Math.round((amount / totalSpentUsd) * 100) : 0;
            return (
              <div key={cat} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[11px] font-medium text-slate-500">{cat}</div>
                <div className="text-sm font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                  {formatAmount(amount)}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{pct}% of spend</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expense Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Expense Transaction Ledger</h3>
            <p className="text-xs text-slate-500">Stored in MySQL table `expenses` with foreign key relations</p>
          </div>
          <span className="text-xs text-slate-400 font-mono tabular-nums">
            Showing {filteredExpenses.length} entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Receipt Ref</th>
                <th className="py-3 px-4">Paid By</th>
                <th className="py-3 px-4 text-right">Amount ({selectedCurrency})</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono tabular-nums text-slate-600">
                    {exp.date}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">
                    {exp.category}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{exp.title}</div>
                    {exp.notes && <div className="text-[11px] text-slate-500">{exp.notes}</div>}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                    {exp.receiptRef || '-'}
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {exp.paidBy}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                    {formatAmount(exp.amount)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      exp.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                      exp.status === 'SPLIT' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {exp.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Delete transaction record '${exp.title}'?`)) {
                          onDeleteExpense(exp.id);
                        }
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Log Travel Expense</h3>

            <form onSubmit={handleCreateExpenseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Trip Association *</label>
                <select
                  value={newTripTargetId}
                  onChange={(e) => setNewTripTargetId(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white"
                >
                  {trips.map(t => (
                    <option key={t.id} value={t.id}>{t.title} ({t.destinationName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Expense Title / Vendor *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kyoto Station Ramen Tasting"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="Flights">Flights</option>
                    <option value="Lodging">Lodging</option>
                    <option value="Dining">Dining</option>
                    <option value="Transit">Transit</option>
                    <option value="Activities">Activities</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Misc">Misc</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Amount ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full text-xs font-mono border border-slate-200 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full text-xs font-mono border border-slate-200 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Paid By</label>
                  <input
                    type="text"
                    value={newPaidBy}
                    onChange={(e) => setNewPaidBy(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Receipt Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. REC-7890"
                    value={newReceipt}
                    onChange={(e) => setNewReceipt(e.target.value)}
                    className="w-full text-xs font-mono border border-slate-200 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="PAID">PAID</option>
                    <option value="PENDING">PENDING</option>
                    <option value="REIMBURSED">REIMBURSED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  placeholder="Shared cost split, payment method..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingExpense(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
