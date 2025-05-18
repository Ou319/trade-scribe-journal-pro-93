
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: number | string;
  valueClass?: string;
  formatValue?: (value: number) => string;
  icon?: React.ReactNode;
}

const StatsCard = ({
  label,
  value,
  valueClass,
  formatValue,
  icon,
}: StatsCardProps) => {
  const formattedValue = typeof value === 'number' && formatValue 
    ? formatValue(value) 
    : value;

  return (
    <div className="stats-card bg-card">
      <div className="flex items-center justify-between">
        <p className="stats-label">{label}</p>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <p className={cn("stats-value", valueClass)}>{formattedValue}</p>
    </div>
  );
};

export default StatsCard;
