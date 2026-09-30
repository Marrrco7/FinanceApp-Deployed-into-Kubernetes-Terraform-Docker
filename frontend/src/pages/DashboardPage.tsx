import { useEffect, useState } from "react";
import axios from "axios";
import AnimatedNumber from "../components/AnimatedNumber";
import { AnimatedPage } from "../components/AnimatedPage";
import { SpendingGauge } from "../components/SpendingGauge";

type CategorySummary = {
    categoryId: string | null;
    categoryName: string;
    totalExpenses: number;
};

type MonthlySummaryResponse = {
    year: number;
    month: number;
    totalIncome: number;
    totalExpenses: number;
    net: number;
    categories: CategorySummary[];
};


function DashboardPage() {
    const [summary, setSummary] = useState<MonthlySummaryResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await axios.get<MonthlySummaryResponse>(
                    `/api/Dashboard/summary`,
                    {
                        params: { year, month },
                    }
                );

                setSummary(response.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load summary from backend");
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, [year, month]);

    const monthName = new Date(year, month - 1).toLocaleString("default", {
        month: "long",
    });

    const income = summary?.totalIncome ?? 0;
    const expenses = summary?.totalExpenses ?? 0;

    return (
        <AnimatedPage>
            {/* Top bar (page header) */}
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">Dashboard</h2>
                    <p className="text-xs text-slate-400">
                        Overview of your income and expenses
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <select
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1"
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                    >
                        {Array.from({ length: 12 }).map((_, i) => (
                            <option key={i} value={i + 1}>
                                {new Date(2000, i).toLocaleString("default", {
                                    month: "short",
                                })}
                            </option>
                        ))}
                    </select>
                    <input
                        type="number"
                        className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                    />
                </div>
            </header>

            {/* Hero gauge section */}
            <SpendingGauge
                income={income}
                expenses={expenses}
                monthLabel={`${monthName} ${year}`}
            />

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SummaryCard
                    label="Income"
                    value={income}
                    variant="success"
                    loading={loading}
                />
                <SummaryCard
                    label="Expenses"
                    value={expenses}
                    variant="danger"
                    loading={loading}
                />
                <SummaryCard
                    label="Net"
                    value={summary?.net ?? 0}
                    variant="neutral"
                    loading={loading}
                />
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Category breakdown */}
                <section className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-slate-100">
                            Spending by category
                        </h3>
                        <span className="text-xs text-slate-500">
                            {monthName} {year}
                        </span>
                    </div>

                    {loading && <SkeletonLines count={5} />}

                    {!loading && summary && summary.categories.length === 0 && (
                        <p className="text-sm text-slate-500">
                            No expenses recorded for this period.
                        </p>
                    )}

                    {!loading && summary && summary.categories.length > 0 && (
                        <ul className="space-y-2 text-sm">
                            {summary.categories.map((cat) => (
                                <li
                                    key={cat.categoryId ?? cat.categoryName}
                                    className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl px-3 py-2"
                                >
                                    <span>{cat.categoryName}</span>
                                    <span className="font-mono text-slate-100">
                                        {cat.totalExpenses.toFixed(2)} €
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* Status / info */}
                <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                    <h3 className="text-sm font-semibold text-slate-100 mb-3">
                        Status
                    </h3>
                    {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
                    {!error && (
                        <p className="text-xs text-slate-400">
                            This dashboard is powered by your .NET API endpoint{" "}
                            <code className="bg-slate-800 px-1 rounded text-[10px]">
                                /api/Dashboard/summary
                            </code>
                            .
                        </p>
                    )}
                    <p className="text-xs text-slate-500 mt-2">
                        Next: connect a bank or import more data to unlock deeper insights.
                    </p>
                </section>
            </div>
        </AnimatedPage>
    );
}

type SummaryCardProps = {
    label: string;
    value: number;
    variant: "success" | "danger" | "neutral";
    loading?: boolean;
};

function SummaryCard({ label, value, variant, loading }: SummaryCardProps) {
    const color =
        variant === "success"
            ? "text-emerald-400"
            : variant === "danger"
                ? "text-rose-400"
                : "text-sky-400";

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-slate-500">
                {label}
            </span>
            {loading ? (
                <div className="h-6 w-24 bg-slate-800 rounded animate-pulse" />
            ) : (
                <AnimatedNumber
                    value={value}
                    suffix=" €"
                    className={`text-2xl font-semibold ${color}`}
                />
            )}
        </div>
    );
}

function SkeletonLines({ count }: { count: number }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="h-8 w-full bg-slate-800 rounded-xl animate-pulse"
                />
            ))}
        </div>
    );
}

export default DashboardPage;
