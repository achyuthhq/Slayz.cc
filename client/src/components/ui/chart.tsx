import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "@/lib/utils"

type ChartProps = {
  type?: "bar" | "line" | "area";
  data?: any[];
  options?: {
    smooth?: boolean;
    fill?: boolean;
    fillOpacity?: number;
    xKey?: string;
    yKey?: string;
    grid?: {
      vertical?: boolean;
      horizontal?: boolean;
      strokeDasharray?: string;
      opacity?: number;
    };
  };
  className?: string;
}

export const Chart = React.forwardRef<
  HTMLDivElement,
  ChartProps
>(({ className, type = "bar", data = [], options = {}, ...props }, ref) => {
  const ChartComponent = type === "bar" 
    ? RechartsPrimitive.BarChart 
    : type === "line" 
    ? RechartsPrimitive.LineChart 
    : RechartsPrimitive.AreaChart;

  const dataKey = options.yKey || "count";
  const categoryKey = options.xKey || "timestamp";
  const gridOptions = options.grid || {};

  // Format dates for readability
  const formattedData = data.map((item: any) => {
    if (item[categoryKey] && typeof item[categoryKey] === 'string' && item[categoryKey].includes('T')) {
      // Handle ISO date strings
      const date = new Date(item[categoryKey]);
      return {
        ...item,
        [categoryKey]: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
    }
    return item;
  });

  return (
    <div
      ref={ref}
      className={cn(
        "flex justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground",
        "[&_.recharts-cartesian-grid_line]:stroke-white/10",
        "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-white/20",
        "[&_.recharts-dot]:stroke-background",
        "[&_.recharts-layer]:outline-none",
        "[&_.recharts-default-tooltip]:bg-background/80 [&_.recharts-default-tooltip]:border-border [&_.recharts-default-tooltip]:backdrop-blur-sm",
        "[&_.recharts-tooltip-wrapper]:!z-50",
        className
      )}
      {...props}
    >
      <RechartsPrimitive.ResponsiveContainer width="99%" height="99%">
        <ChartComponent data={formattedData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <RechartsPrimitive.XAxis 
            dataKey={categoryKey} 
            axisLine={{ stroke: '#444' }}
            tickLine={{ stroke: '#444' }}
          />
          <RechartsPrimitive.YAxis 
            axisLine={{ stroke: '#444' }}
            tickLine={{ stroke: '#444' }}
          />
          <RechartsPrimitive.CartesianGrid 
            strokeDasharray={gridOptions.strokeDasharray || "3 3"} 
            stroke="rgba(255,255,255,0.1)"
            vertical={gridOptions.vertical !== false}
            horizontal={gridOptions.horizontal !== false}
            opacity={gridOptions.opacity || 0.2}
          />
          <RechartsPrimitive.Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '4px',
              color: '#fff'
            }}
          />
          {type === "bar" && (
            <RechartsPrimitive.Bar 
              dataKey={dataKey} 
              fill="var(--theme-primary)" 
              radius={[4, 4, 0, 0]}
            />
          )}
          {type === "line" && (
            <RechartsPrimitive.Line 
              type={options.smooth ? "monotone" : "linear"} 
              dataKey={dataKey} 
              stroke="var(--theme-primary)" 
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 1, fill: "#111" }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          )}
          {type === "area" && (
            <RechartsPrimitive.Area 
              type={options.smooth ? "monotone" : "linear"} 
              dataKey={dataKey} 
              stroke="rgba(101, 118, 255, 0.8)" 
              fill="rgba(101, 118, 255, 0.2)"
              fillOpacity={options.fillOpacity || 0.2}
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 1, fill: "#111" }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          )}
        </ChartComponent>
      </RechartsPrimitive.ResponsiveContainer>
    </div>
  )
})
Chart.displayName = "Chart"

// Export basic Recharts primitives that might be needed
export const {
  Tooltip: ChartTooltip,
  Legend: ChartLegend,
} = RechartsPrimitive;