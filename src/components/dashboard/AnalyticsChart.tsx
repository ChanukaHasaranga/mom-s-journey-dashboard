import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartData {
  name: string;
  users: number;
  sessions: number;
}

interface AnalyticsChartProps {
  data: ChartData[];
  title: string;
}

export function AnalyticsChart({ data, title }: AnalyticsChartProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <h3 className="font-display text-xl font-semibold text-foreground mb-6">
        {title}
      </h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(340, 45%, 65%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(340, 45%, 65%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(150, 25%, 65%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(150, 25%, 65%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(340, 20%, 90%)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(340, 10%, 45%)", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(340, 10%, 45%)", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(340, 20%, 90%)",
                borderRadius: "12px",
                boxShadow: "0 4px 20px -4px hsl(340, 30%, 70%, 0.15)",
              }}
              labelStyle={{ color: "hsl(340, 20%, 20%)", fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey="users"
              stroke="hsl(340, 45%, 65%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorUsers)"
              name="Active Users"
            />
            <Area
              type="monotone"
              dataKey="sessions"
              stroke="hsl(150, 25%, 65%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSessions)"
              name="Sessions"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-rose" />
          <span className="text-sm text-muted-foreground">Active Users</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-sage" />
          <span className="text-sm text-muted-foreground">Sessions</span>
        </div>
      </div>
    </div>
  );
}
