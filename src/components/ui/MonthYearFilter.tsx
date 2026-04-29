'use client';

export interface MonthYearSelection {
  month: string;
  year: string;
}

const MONTH_OPTIONS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
] as const;

function buildYearOptions(): string[] {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 10 }, (_, index) => String(currentYear - index));
}

export default function MonthYearFilter({
  value,
  onChange,
  className = '',
}: {
  value: MonthYearSelection;
  onChange: (value: MonthYearSelection) => void;
  className?: string;
}) {
  const years = buildYearOptions();
  const currentYear = years[0];

  return (
    <div className={`flex flex-col gap-2 sm:flex-row sm:items-center ${className}`}>
      <select
        aria-label="Filter month"
        value={value.month}
        onChange={(event) => {
          const month = event.target.value;
          onChange({ month, year: month && !value.year ? currentYear : value.year });
        }}
        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
      >
        <option value="">All months</option>
        {MONTH_OPTIONS.map((month) => (
          <option key={month.value} value={month.value}>{month.label}</option>
        ))}
      </select>

      <select
        aria-label="Filter year"
        value={value.year}
        onChange={(event) => {
          const year = event.target.value;
          onChange({ month: year ? value.month : '', year });
        }}
        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
      >
        <option value="">All years</option>
        {years.map((year) => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>
    </div>
  );
}