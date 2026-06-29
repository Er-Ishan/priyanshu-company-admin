"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

type ChartData = {
  categories?: string[];
  series?: {
    name: string;
    data: number[];
  }[];
};

interface Props {
  chartData?: ChartData;
}

const SalesStaticChart = ({ chartData }: Props) => {
  // 🛡️ SAFETY CHECK (this fixes the crash)
  if (
    !chartData ||
    !chartData.series ||
    chartData.series.length === 0
  ) {
    return (
      <div className="h-[280px] flex items-center justify-center text-neutral-400">
        No sales data available
      </div>
    );
  }

  const chartOptions: ApexOptions = {
    chart: {
      id: "sales-chart",
      toolbar: { show: false },
      background: 'transparent',
    },
    colors: ["#3B82F6"], // Primary Sky Blue
    xaxis: {
      categories: chartData.categories ?? [],
      labels: {
          style: {
              colors: '#64748b',
              fontSize: '10px',
              fontWeight: 600
          }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    grid: {
        borderColor: '#e2e8f033',
        strokeDashArray: 4,
        padding: {
            left: 0,
            right: 0
        }
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    fill: {
        type: 'gradient',
        gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.4,
            opacityTo: 0.1,
            stops: [0, 90, 100]
        }
    },
    dataLabels: {
      enabled: false,
    },
    yaxis: {
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '10px',
          fontWeight: 600
        },
        formatter: (val) => `£${val}`
      },
    },
    tooltip: {
        theme: 'dark'
    }
  };

  return (
    <ApexChart
      type="area"
      options={chartOptions}
      series={chartData.series}
      height={280}
    />
  );
};

export default SalesStaticChart;
