"use client";

import dynamic from "next/dynamic";
import React from "react";
import { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type Props = {
  totalPickups: number;
  totalReturns: number;
};

const UserOverviewChart = ({ totalPickups, totalReturns }: Props) => {
  const total = totalPickups + totalReturns;

  const chartOptions: ApexOptions = {
    series: [totalPickups, totalReturns],
    colors: ["#3B82F6", "#F59E0B"], // Blue, Amber
    labels: ["Pickups", "Returns"],
    legend: {
      show: false,
    },
    chart: {
      type: "donut",
      height: 270,
      background: 'transparent',
      sparkline: {
        enabled: true,
      },
    },
    stroke: {
      show: false,
      width: 0,
    },
    plotOptions: {
        pie: {
            donut: {
                size: '75%',
                labels: {
                    show: true,
                    total: {
                        show: true,
                        label: 'Operations',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#64748b',
                        formatter: () => total.toLocaleString()
                    },
                    value: {
                        fontSize: '22px',
                        fontWeight: 900,
                        color: '#334155'
                    }
                }
            }
        }
    },
    dataLabels: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
        },
      },
    ],
  };

  return (
    <Chart
      options={chartOptions}
      series={chartOptions.series}
      type="donut"
      height={270}
    />
  );
};

export default UserOverviewChart;
