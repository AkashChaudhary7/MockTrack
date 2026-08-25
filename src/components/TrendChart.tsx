import React from "react";
import { PerformanceTrendChart } from "./PerformanceTrendChart";
import { MockAttempt } from "../types";

interface TrendChartProps {
  attempts: MockAttempt[];
  baselineScore: number;
  totalMarks: number;
}

export const TrendChart: React.FC<TrendChartProps> = (props) => {
  return <PerformanceTrendChart {...props} />;
};

