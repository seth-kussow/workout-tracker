import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatDisplayDate } from '../../lib/date';

const LINE_COLOR = '#3987e5'; // dataviz skill: sequential blue, validated 3:1+ against our dark card surface

export interface TrendPoint {
  date: string;
  value: number;
}

interface TrendChartProps {
  data: TrendPoint[];
  unit?: string;
}

export function TrendChart({ data, unit }: TrendChartProps) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-500">No entries yet.</p>;
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d: string) => formatDisplayDate(d).replace(/^\w+, /, '')}
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={{ stroke: '#334155' }}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={44}
            allowDecimals={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const point = payload[0].payload as TrendPoint;
              return (
                <div className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm shadow-lg">
                  <p className="text-slate-400">{formatDisplayDate(point.date)}</p>
                  <p className="font-medium text-slate-100">
                    {point.value}
                    {unit ? ` ${unit}` : ''}
                  </p>
                </div>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={LINE_COLOR}
            strokeWidth={2}
            dot={{ r: 3, fill: LINE_COLOR, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
