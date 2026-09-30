import { useEffect, useState } from "react";
import axios from "axios";


type CategoryTypeValue = 0 | 1; // 0 = Expense, 1 = Income

type Category = {
    id: string;
    name: string;
    categoryType: CategoryTypeValue;
    color: string | null;
};

function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // form state
    const [name, setName] = useState("");
    const [categoryType, setCategoryType] = useState<CategoryTypeValue>(0); // Expense
    const [color, setColor] = useState<string>("#22c55e"); // default green

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await axios.get<Category[]>(
                    `/api/Categories`
                );
                setCategories(response.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load categories");
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const formatType = (t: CategoryTypeValue) =>
        t === 0 ? "Expense" : "Income";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setError("Category name is required.");
            return;
        }

        try {
            setSaving(true);
            setError(null);

            await axios.post(`/api/Categories`, {
                name,
                categoryType,
                color,
            });

            // reload categories
            const response = await axios.get<Category[]>(
                `/api/Categories`
            );
            setCategories(response.data);

            // reset form (keep type & color)
            setName("");
        } catch (err) {
            console.error(err);
            setError("Failed to create category");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">
                        Categories
                    </h2>
                    <p className="text-xs text-slate-400">
                        Manage your expense and income categories
                    </p>
                </div>
            </header>

            {/* Add category form */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <h3 className="text-sm font-semibold text-slate-100 mb-3">
                    Add category
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
                            placeholder="e.g. Groceries, Salary, Rent"
                        />
                    </div>

                    {/* Type */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-400">Type</label>
                        <select
                            className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1"
                            value={categoryType}
                            onChange={(e) =>
                                setCategoryType(Number(e.target.value) as CategoryTypeValue)
                            }
                        >
                            <option value={0}>Expense</option>
                            <option value={1}>Income</option>
                        </select>
                    </div>

                    {/* Color */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-400">Color</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                className="w-10 h-8 rounded border border-slate-700 bg-slate-950"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                            />
                            <input
                                type="text"
                                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="md:col-span-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-700 text-slate-950 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
                        >
                            {saving ? "Saving..." : "Add category"}
                        </button>
                    </div>
                </form>
            </section>

            {/* Categories list */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                {loading && (
                    <p className="text-sm text-slate-400">Loading categories…</p>
                )}

                {!loading && categories.length === 0 && (
                    <p className="text-sm text-slate-500">
                        No categories yet. Add your first one above.
                    </p>
                )}

                {!loading && categories.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                            <tr className="border-b border-slate-800 text-slate-400">
                                <th className="text-left py-2 pr-4">Name</th>
                                <th className="text-left py-2 pr-4">Type</th>
                                <th className="text-left py-2 pr-4">Color</th>
                            </tr>
                            </thead>
                            <tbody>
                            {categories.map((c) => (
                                <tr
                                    key={c.id}
                                    className="border-b border-slate-800 last:border-b-0"
                                >
                                    <td className="py-2 pr-4 text-slate-100">
                                        {c.name}
                                    </td>
                                    <td className="py-2 pr-4 text-slate-300">
                                        {formatType(c.categoryType)}
                                    </td>
                                    <td className="py-2 pr-4">
                                        {c.color ? (
                                            <div className="flex items-center gap-2">
                          <span
                              className="w-4 h-4 rounded-full border border-slate-700"
                              style={{ backgroundColor: c.color }}
                          />
                                                <span className="text-xs font-mono text-slate-300">
                            {c.color}
                          </span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-500">
                          None
                        </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

export default CategoriesPage;
