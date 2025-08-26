import { CheckCircle, Clock, AlertTriangle } from "lucide-react";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "hoàn thành":
        return {
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          icon: CheckCircle
        };
      case "đang sửa chữa":
        return {
          bgColor: "bg-blue-100",
          textColor: "text-blue-800",
          icon: Clock
        };
      case "chờ linh kiện":
        return {
          bgColor: "bg-orange-100",
          textColor: "text-orange-800",
          icon: AlertTriangle
        };
      default:
        return {
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          icon: Clock
        };
    }
  };

  const { bgColor, textColor, icon: Icon } = getStatusStyle(status);

  return (
    <div className={`inline-flex items-center gap-2 ${bgColor} ${textColor} px-3 py-1 rounded-full`}>
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{status}</span>
    </div>
  );
}