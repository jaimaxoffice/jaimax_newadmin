import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {  PieChart as PieChartIcon, AlertCircle } from "lucide-react";
import { useGetMediaSourceAnalyticsQuery } from "./socialMediaApiSlice";
import Loader from "../../reusableComponents/Loader/Loader"
const COLOR_MAP = {
  Instagram: "#E1306C",
  Facebook: "#1877F2",
  Twitter: "#1DA1F2",
  LinkedIn: "#0077B5",
  "Friend/Family Referral": "#00C49F",
  Other: "#FFBB28",
};

const OPTIONS = [
  "Instagram",
  "Facebook",
  "Twitter",
  "LinkedIn",
  "Friend/Family Referral",
  "Other",
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0];
  return (
    <div className="bg-[#282f35]  rounded-lg px-3 py-2 shadow-xl">
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: data.payload.color }}
        />
        <p className="text-white text-sm font-medium">{data.name}</p>
      </div>
      <p className="text-gray-400 text-xs">
        Count:{" "}
        <span className="text-white font-semibold">
          {data.payload.realValue}
        </span>
      </p>
    </div>
  );
};

const RADIAN = Math.PI / 180;

// Custom label that only shows on larger screens
const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
}) => {
  const radius = outerRadius + 30;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Hide labels for very small slices

  return (
    <text
      x={x}
      y={y}
      fill="#999"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

function SocialMediaLegend({ data, totalCount }) {
  return (
    <div className="flex flex-wrap gap-2 mb-6 justify-center">
      {data.map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-1.5 sm:gap-2 rounded-full px-2.5 sm:px-3.5 py-1 sm:py-1.5 
            text-white text-xs sm:text-sm shadow-md transition-transform duration-200 
            hover:scale-105 cursor-default"
          style={{ backgroundColor: item.color }}
        >
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white/40 shrink-0" />
          <span className="font-semibold truncate max-w-[80px] sm:max-w-none">
            {item.name}
          </span>
          <span className="text-white/60 shrink-0">
            ({item.realValue})
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ReferralChart() {
  const { data, isLoading, isError } = useGetMediaSourceAnalyticsQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 sm:p-6">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader />
          <p className="text-gray-400">Loading referral data...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen p-4 sm:p-6">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
            <AlertCircle size={28} className="text-red-400" />
          </div>
          <p className="text-red-400 font-medium">
            Error loading referral data
          </p>
          <p className="text-gray-500 text-sm mt-1">Please try again later</p>
        </div>
      </div>
    );
  }

  const locations = data?.data?.allLocations || [];

  const referralCounts = locations.reduce((acc, item) => {
    const source = item.referralSource || "Other";
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  const chartData = OPTIONS.map((name) => ({
    name,
    value: referralCounts[name] || 0,
    realValue: referralCounts[name] || 0,
    color: COLOR_MAP[name],
  }));

  const totalCount = chartData.reduce((sum, item) => sum + item.realValue, 0);

  const topSource = chartData.reduce(
    (max, item) => (item.realValue > max.realValue ? item : max),
    chartData[0]
  );

  return (
    <div className="min-h-screen p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-[#b9fd5c]/10 flex items-center justify-center shrink-0">
          <PieChartIcon size={24} className="text-[#b9fd5c]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">
            Media Source Analytics
          </h1>
          <p className="text-sm text-gray-400">
            User referral source distribution
          </p>
        </div>
      </div>


      {/* Chart Card */}
      <div className="bg-[#282f35]  rounded-xl overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-[#303f50] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h2 className="text-white font-semibold">Referral Distribution</h2>
          <span className="text-gray-400 text-sm">
            Total:{" "}
            <span className="text-white font-semibold">{totalCount}</span>
          </span>
        </div>

        <div className="p-4 sm:p-5">
          {/* Legend */}
          <SocialMediaLegend data={chartData} totalCount={totalCount} />

          {/* Chart */}
          <div className="flex justify-center">
            {totalCount > 0 ? (
              <>
                {/* Mobile Chart */}
                <div className="w-full sm:hidden">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={3}
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-m-${index}`}
                            fill={entry.color}
                            stroke="#282f35"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Tablet Chart */}
                <div className="hidden sm:block lg:hidden w-full">
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={110}
                        paddingAngle={3}
                        label={renderCustomLabel}
                        labelLine={{ stroke: "#555", strokeWidth: 1 }}
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-t-${index}`}
                            fill={entry.color}
                            stroke="#282f35"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Desktop Chart */}
                <div className="hidden lg:block w-full">
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={140}
                        paddingAngle={3}
                        label={renderCustomLabel}
                        labelLine={{ stroke: "#555", strokeWidth: 1 }}
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-d-${index}`}
                            fill={entry.color}
                            stroke="#282f35"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-full bg-[#111827] flex items-center justify-center mb-3">
                  <PieChartIcon size={28} className="text-gray-600" />
                </div>
                <p className="text-gray-400 font-medium">No data available</p>
                <p className="text-gray-600 text-sm mt-1">
                  No referral sources found yet
                </p>
              </div>
            )}
          </div>

          {/* Mobile Source List */}
          <div className="sm:hidden mt-4 space-y-2">
            {chartData
              .filter((d) => d.realValue > 0)
              .sort((a, b) => b.realValue - a.realValue)
              .map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-[#111827] rounded-lg px-3 py-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-white text-sm">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-semibold">
                      {item.realValue}
                    </span>
                    <span className="text-gray-500 text-xs">
                      ({totalCount > 0
                        ? ((item.realValue / totalCount) * 100).toFixed(1)
                        : 0}
                      %)
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Footer Stats */}
        <div className="px-4 sm:px-5 py-4 border-t border-[#303f50]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
            <FooterStat
              label="Total Sources"
              value={chartData.filter((d) => d.realValue > 0).length}
            />
            <FooterStat label="Total Users" value={totalCount} />
            <FooterStat label="Top Source" value={topSource?.name || "N/A"} />
            <FooterStat label="Top Count" value={topSource?.realValue || 0} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, dotColor, isText = false }) {
  return (
    <div className="bg-[#282f35]  rounded-xl p-4 hover:border-[#b9fd5c]/30 transition-all">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: dotColor }}
        />
        <p className="text-gray-400 text-xs truncate">{label}</p>
      </div>
      <p className={`${isText ? "text-base" : "text-xl"} font-bold ${color} truncate`}>
        {value}
      </p>
    </div>
  );
}

function FooterStat({ label, value }) {
  return (
    <div>
      <p className="text-gray-400 text-[11px] mb-0.5">{label}</p>
      <p className="text-white text-xs sm:text-sm font-semibold truncate">
        {value}
      </p>
    </div>
  );
}