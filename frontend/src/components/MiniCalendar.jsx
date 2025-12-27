import { useState } from "react";

export default function MiniCalendar({ events = [] }) {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today);

    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const days = Array.from({ length: monthEnd.getDate() }, (_, i) => i + 1);

    const changeMonth = (offset) => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
    };

    const isEventDay = (day) =>
        events.some(e => new Date(e.date).toDateString() ===
            new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString()
        );

    return (
        <div className="p-4 rounded-2xl bg-white shadow-sm border">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-slate-800">
                    {currentMonth.toLocaleString("default", { month: "long" })}{" "}
                    {currentMonth.getFullYear()}
                </h3>

                <div className="flex gap-2">
                    <button onClick={() => changeMonth(-1)} className="px-2 rounded-md border">
                        ‹
                    </button>
                    <button onClick={() => changeMonth(1)} className="px-2 rounded-md border">
                        ›
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <span key={d}>{d}</span>)}
            </div>

            <div className="grid grid-cols-7 gap-1 mt-1">
                {days.map(day => (
                    <div key={day}
                        className={`h-8 flex items-center justify-center rounded-lg text-sm
            ${isEventDay(day)
                                ? "bg-indigo-100 text-indigo-700 font-medium"
                                : "text-slate-700 hover:bg-slate-100"
                            }`}
                    >
                        {day}
                    </div>
                ))}
            </div>
        </div>
    );
}