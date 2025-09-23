import React, { memo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartDataPoint, TimeSeriesDataPoint, MultiSeriesDataPoint } from '@/lib/types/dashboard';

interface BaseChartProps {
  data: any[];
  width?: number | string;
  height?: number | string;
  className?: string;
}

interface LineChartComponentProps extends BaseChartProps {
  data: TimeSeriesDataPoint[];
  dataKey: string;
  xAxisKey?: string;
  color?: string;
}

export const CustomLineChart: React.FC<LineChartComponentProps> = memo(({
  data,
  dataKey,
  xAxisKey = 'date',
  color = '#8884d8',
  width = '100%',
  height = 300,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width={width} height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={xAxisKey}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            labelFormatter={(value) => new Date(value).toLocaleDateString()}
            formatter={(value: number) => [value.toLocaleString(), 'Value']}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

interface AreaChartComponentProps extends BaseChartProps {
  data: TimeSeriesDataPoint[];
  dataKey: string;
  xAxisKey?: string;
  color?: string;
}

export const CustomAreaChart: React.FC<AreaChartComponentProps> = ({
  data,
  dataKey,
  xAxisKey = 'date',
  color = '#8884d8',
  width = '100%',
  height = 300,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width={width} height={height}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={xAxisKey}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            labelFormatter={(value) => new Date(value).toLocaleDateString()}
            formatter={(value: number) => [value.toLocaleString(), 'Value']}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            fill={color}
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

interface BarChartComponentProps extends BaseChartProps {
  data: ChartDataPoint[];
  dataKey: string;
  nameKey?: string;
  color?: string;
}

export const CustomBarChart: React.FC<BarChartComponentProps> = ({
  data,
  dataKey,
  nameKey = 'name',
  color = '#8884d8',
  width = '100%',
  height = 300,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width={width} height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={nameKey}
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Count']} />
          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface PieChartComponentProps extends BaseChartProps {
  data: ChartDataPoint[];
  dataKey: string;
  nameKey?: string;
  colors?: string[];
}

export const CustomPieChart: React.FC<PieChartComponentProps> = ({
  data,
  dataKey,
  nameKey = 'name',
  colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'],
  width = '100%',
  height = 300,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width={width} height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey={dataKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Value']} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

interface MultiLineChartProps extends BaseChartProps {
  data: MultiSeriesDataPoint[];
  lines: {
    dataKey: string;
    name: string;
    color: string;
  }[];
  xAxisKey?: string;
}

export const CustomMultiLineChart: React.FC<MultiLineChartProps> = ({
  data,
  lines,
  xAxisKey = 'date',
  width = '100%',
  height = 300,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width={width} height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={xAxisKey}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            labelFormatter={(value) => new Date(value).toLocaleDateString()}
            formatter={(value: number, name: string) => [value.toLocaleString(), name]}
          />
          <Legend />
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color}
              strokeWidth={2}
              name={line.name}
              dot={{ fill: line.color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Loading and Error Components
export const ChartLoading: React.FC<{ height?: number }> = ({ height = 300 }) => (
  <div
    className="w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center"
    style={{ height }}
  >
    <div className="text-gray-500">Loading chart...</div>
  </div>
);

export const ChartError: React.FC<{ error: string; height?: number }> = ({ error, height = 300 }) => (
  <div
    className="w-full bg-red-50 border border-red-200 rounded-lg flex items-center justify-center"
    style={{ height }}
  >
    <div className="text-red-600 text-center">
      <div className="font-semibold">Chart Error</div>
      <div className="text-sm">{error}</div>
    </div>
  </div>
);
