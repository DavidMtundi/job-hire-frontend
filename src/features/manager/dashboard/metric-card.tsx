import React from "react";
import { IconType } from "react-icons";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: IconType;
  iconColor: string;
  iconBg: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBg,
}) => {
  return (
    <div className="flex items-center gap-3 px-6 first:pl-0 last:pr-0">
      <div className={`${iconBg} p-2.5 rounded-lg shrink-0`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div className="flex flex-col">
        <p className="text-xs font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
};
