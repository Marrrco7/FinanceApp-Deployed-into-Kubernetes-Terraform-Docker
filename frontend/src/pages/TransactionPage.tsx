import { useEffect, useState } from "react";
import axios from "axios";
import { AnimatedPage } from "../components/AnimatedPage";


type TransactionTypeValue = 0 | 1 | 2; // 0 = Expense, 1 = Income, 2 = Transfer

type Transaction = {
    id: string;
    accountId: string;
    categoryId: string | null;
    amount: number;
    transactionType: TransactionTypeValue;
    date: string;
    description: string | null;
};

type Account = {
    id: string;
    name: string;
};

type Category = {
    id: string;
    name: string;
    categoryType: number;
};

function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const [loadingList, setLoadingList] = useState(true);
    const [loadingForm, setLoadingForm] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // form state
    const [accountId, setAccountId] = useState<string>("");
    const [categoryId, setCategoryId] = useState<string>("");
    const [amount, setAmount] = useState<string>("");
    const [transactionType, setTransactionType] =
        useState<TransactionTypeValue>(0);
    const [date, setDate] = useState<string>(() =>
        new Date().toISOString().slice(0, 10)
    );
    const [description, setDescription] = useState<string>("");

    // load transactions + accounts + categories
    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoadingList(true);
                setError(null);

                const [txRes, accRes, catRes] = await Promise.all([
                    axios.get<Transaction[]>(`/api/Transactions`),
                    axios.get<Account[]>(`/api/Accounts`),
                    axios.get<Category[]>(`/api/Categories`),
                ]);

                setTransactions(txRes.data);
                setAccounts(accRes.data);
                setCategories(catRes.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load data");
            } finally {
                setLoadingList(false);
            }
        };

        fetchAll();
    }, []);

    const formatDate = (value: string) =>
        new Date(value).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "2-digit",
        });

    const formatType = (t: TransactionTypeValue) =>
        t === 0 ? "Expense" : t === 1 ? "Income" : "Transfer";

    const findAccountName = (id: string) =>
        accounts.find((a) => a.id === id)?.name ?? id;

    const findCategoryName = (id: string | null) =>
        id
            ? categories.find((c) => c.id === id)?.name ?? id
            : "Uncategorized";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!accountId) {
            setError("Please select an account.");
            return;
        }

        const parsedAmount = Number(amount);
        if (!parsedAmount || parsedAmount <= 0) {
            setError("Amount must be a positive number.");
            return;
        }

        try {
            setLoadingForm(true);
            setError(null);

            await axios.post(`/api/Transactions`, {
                accountId,
                categoryId: categoryId || null,
                amount: parsedAmount,
                transactionType,
                // backend expects DateTime -> send ISO string with time
                date: new Date(date).toISOString(),
                description: description || null,
            });

            // reload list after creation
            const txRes = await axios.get<Transaction[]>(
                `/api/Transactions`
            );
            setTransactions(txRes.data);

            // reset form (keep date & account for convenience)
            setAmount("");
            setDescription("");
        } catch (err) {
            console.error(err);
            setError("Failed to create transaction");
        } finally {
            setLoadingForm(false);
        }
    };

    return (
        <AnimatedPage>
            {/* Header */}
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">
                        Transactions
                    </h2>
                    <p className="text-xs text-slate-400">
                        Add and view your transactions
                    </p>
                </div>
            </header>

            {/* Add transaction form */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <h3 className="text-sm font-semibold text-slate-100 mb-3">
                    Add transaction
                </h3>

                {error && (
                    <p className="text-xs text-red-400 mb-2">
                        {error}
                    </p>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm"
                >
                    {/* Account */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-400">Account</label>
                        <select
                            className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1"
                            value={accountId}
                            onChange={(e) => setAccountId(e.target.value)}
                        >
                            <option value="">Select account</option>
                            {accounts.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Category */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-400">Category</label>
                        <select
                            className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                        >
                            <option value="">Uncategorized</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Type */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-400">Type</label>
                        <select
                            className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1"
                            value={transactionType}
                            onChange={(e) =>
                                setTransactionType(Number(e.target.value) as TransactionTypeValue)
                            }
                        >
                            <option value={0}>Expense</option>
                            <option value={1}>Income</option>
                            <option value={2}>Transfer</option>
                        </select>
                    </div>

                    {/* Amount */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-400">Amount</label>
                        <input
                            type="number"
                            step="0.01"
                            className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

                    {/* Date */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-400">Date</label>
                        <input
                            type="date"
                            className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1 md:col-span-2">
                        <label className="text-xs text-slate-400">Description</label>
                        <input
                            type="text"
                            className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional"
                        />
                    </div>

                    {/* Submit button */}
                    <div className="flex items-end">
                        <button
                            type="submit"
                            disabled={loadingForm}
                            className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-700 text-slate-950 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
                        >
                            {loadingForm ? "Saving..." : "Add transaction"}
                        </button>
                    </div>
                </form>
            </section>

            {/* Transactions table */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                {loadingList && (
                    <p className="text-sm text-slate-400">Loading transactions…</p>
                )}

                {!loadingList && transactions.length === 0 && (
                    <p className="text-sm text-slate-500">
                        No transactions yet. Add one using the form above.
                    </p>
                )}

                {!loadingList && transactions.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                            <tr className="border-b border-slate-800 text-slate-400">
                                <th className="text-left py-2 pr-4">Date</th>
                                <th className="text-left py-2 pr-4">Type</th>
                                <th className="text-left py-2 pr-4">Amount</th>
                                <th className="text-left py-2 pr-4 hidden md:table-cell">
                                    Account
                                </th>
                                <th className="text-left py-2 pr-4 hidden md:table-cell">
                                    Category
                                </th>
                                <th className="text-left py-2 pr-4">Description</th>
                            </tr>
                            </thead>
                            <tbody>
                            {transactions.map((t) => (
                                <tr
                                    key={t.id}
                                    className="border-b border-slate-800 last:border-b-0"
                                >
                                    <td className="py-2 pr-4 text-slate-100">
                                        {formatDate(t.date)}
                                    </td>
                                    <td className="py-2 pr-4">
                                            <span
                                                className={
                                                    t.transactionType === 0
                                                        ? "text-rose-400"
                                                        : t.transactionType === 1
                                                            ? "text-emerald-400"
                                                            : "text-sky-400"
                                                }
                                            >
                                                {formatType(t.transactionType)}
                                            </span>
                                    </td>
                                    <td className="py-2 pr-4 font-mono text-slate-100">
                                        {t.amount.toFixed(2)} €
                                    </td>
                                    <td className="py-2 pr-4 text-xs text-slate-300 hidden md:table-cell">
                                        {findAccountName(t.accountId)}
                                    </td>
                                    <td className="py-2 pr-4 text-xs text-slate-300 hidden md:table-cell">
                                        {findCategoryName(t.categoryId)}
                                    </td>
                                    <td className="py-2 pr-4 text-slate-200">
                                        {t.description ?? (
                                            <span className="text-slate-500">–</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </AnimatedPage>
    );
}

export default TransactionsPage;
