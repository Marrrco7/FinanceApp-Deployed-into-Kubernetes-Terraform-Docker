import { useEffect, useState } from "react";
import axios from "axios";
import { AnimatedPage } from "../components/AnimatedPage";


type AccountTypeValue = 0 | 1 | 2 | 3 | 4; // Cash, Bank, CreditCard, Savings, Investment

type Account = {
    id: string;
    name: string;
    accountType: AccountTypeValue;
    initialBalance: number;
};

function AccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // form state
    const [name, setName] = useState("");
    const [accountType, setAccountType] = useState<AccountTypeValue>(1); // default Bank
    const [initialBalance, setInitialBalance] = useState<string>("0");

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await axios.get<Account[]>(
                    `/api/Accounts`
                );
                setAccounts(response.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load accounts");
            } finally {
                setLoading(false);
            }
        };

        fetchAccounts();
    }, []);

    const formatType = (t: AccountTypeValue) => {
        switch (t) {
            case 0:
                return "Cash";
            case 1:
                return "Bank";
            case 2:
                return "Credit Card";
            case 3:
                return "Savings";
            case 4:
                return "Investment";
            default:
                return "Unknown";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setError("Account name is required.");
            return;
        }

        const parsedBalance = Number(initialBalance);
        if (Number.isNaN(parsedBalance)) {
            setError("Initial balance must be a number.");
            return;
        }

        try {
            setSaving(true);
            setError(null);

            await axios.post(`/api/Accounts`, {
                name,
                accountType,
                initialBalance: parsedBalance,
            });

            // reload accounts
            const response = await axios.get<Account[]>(
                `/api/Accounts`
            );
            setAccounts(response.data);

            // reset name & balance (keep type)
            setName("");
            setInitialBalance("0");
        } catch (err) {
            console.error(err);
            setError("Failed to create account");
        } finally {
            setSaving(false);
        }
    };

    return (
        <AnimatedPage>
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">
                        Accounts
                    </h2>
                    <p className="text-xs text-slate-400">
                        Manage your accounts (cash, bank, credit cards, etc.)
                    </p>
                </div>
            </header>

            {/* Add account form */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <h3 className="text-sm font-semibold text-slate-100 mb-3">
                    Add account
                </h3>

                {error && (
                    <p className="text-xs text-red-400 mb-2">{error}</p>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm"
                >
                    {/* Name */}
                    <div className="flex flex-col gap-1 md:col-span-2">
                        <label className="text-xs text-slate-400">Name</label>
                        <input
                            type="text"
                            className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Main Bank, Cash Wallet"
                        />
                    </div>

                    {/* Type */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-400">Type</label>
                        <select
                            className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1"
                            value={accountType}
                            onChange={(e) =>
                                setAccountType(Number(e.target.value) as AccountTypeValue)
                            }
                        >
                            <option value={0}>Cash</option>
                            <option value={1}>Bank</option>
                            <option value={2}>Credit Card</option>
                            <option value={3}>Savings</option>
                            <option value={4}>Investment</option>
                        </select>
                    </div>

                    {/* Initial balance */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-400">
                            Initial balance
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1"
                            value={initialBalance}
                            onChange={(e) => setInitialBalance(e.target.value)}
                        />
                    </div>

                    {/* Submit button */}
                    <div className="md:col-span-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-700 text-slate-950 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
                        >
                            {saving ? "Saving..." : "Add account"}
                        </button>
                    </div>
                </form>
            </section>

            {/* Accounts list */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                {loading && (
                    <p className="text-sm text-slate-400">Loading accounts…</p>
                )}

                {!loading && accounts.length === 0 && (
                    <p className="text-sm text-slate-500">
                        No accounts yet. Add your first account above.
                    </p>
                )}

                {!loading && accounts.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                            <tr className="border-b border-slate-800 text-slate-400">
                                <th className="text-left py-2 pr-4">Name</th>
                                <th className="text-left py-2 pr-4">Type</th>
                                <th className="text-left py-2 pr-4">Initial balance</th>
                            </tr>
                            </thead>
                            <tbody>
                            {accounts.map((a) => (
                                <tr
                                    key={a.id}
                                    className="border-b border-slate-800 last:border-b-0"
                                >
                                    <td className="py-2 pr-4 text-slate-100">
                                        {a.name}
                                    </td>
                                    <td className="py-2 pr-4 text-slate-300">
                                        {formatType(a.accountType)}
                                    </td>
                                    <td className="py-2 pr-4 font-mono text-slate-100">
                                        {a.initialBalance.toFixed(2)} €
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

export default AccountsPage;
