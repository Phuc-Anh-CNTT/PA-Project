import { FileText, Settings, CheckCircle, Clock, UserCheck } from "lucide-react";

interface StatusStepperProps {
  currentStatus: string;
}

const statusSteps = [
  { id: 1, name: "Đã tiếp nhận", icon: FileText },
  { id: 2, name: "Đang xử lý", icon: Settings },
  { id: 3, name: "Đã hoàn thành xử lý", icon: CheckCircle },
  { id: 4, name: "Chờ khách đến lấy", icon: Clock },
  { id: 5, name: "Đã trả khách", icon: UserCheck }
];

export function StatusStepper({ currentStatus }: StatusStepperProps) {
  const getCurrentStepIndex = (status: string): number => {
    const statusMap: { [key: string]: number } = {
      "Đã tiếp nhận": 1,
      "Đang xử lý": 2,
      "Đã hoàn thành xử lý": 3,
      "Chờ khách đến lấy": 4,
      "Đã trả khách": 5,
      "Đang sửa chữa": 2,
      "Chờ linh kiện": 2,
      "Hoàn thành": 5
    };
    return statusMap[status] || 1;
  };

  const currentStepIndex = getCurrentStepIndex(currentStatus);

  return (
    <div className="w-full flex items-start justify-between relative">
      {statusSteps.map((step, index) => {
        const isCompleted = step.id <= currentStepIndex;
        const IconComponent = step.icon;

        return (
          <div
            key={step.id}
            className="relative flex-1 flex flex-col items-center"
          >
            {/* Thanh nối bên trái */}
            {index > 0 && (
              <div
                className={`absolute top-6 left-0 w-1/2 h-0.5 ${
                  isCompleted ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            )}

            {/* Thanh nối bên phải */}
            {index < statusSteps.length - 1 && (
              <div
                className={`absolute top-6 right-0 w-1/2 h-0.5 ${
                  step.id < currentStepIndex ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            )}

            {/* Circle */}
            <div
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-300 ${
                isCompleted
                  ? "bg-green-500 border-green-500 text-white"
                  : "bg-white border-gray-300 text-gray-400"
              }`}
            >
              <IconComponent className="w-5 h-5" />
            </div>

            {/* Label */}
            <div className="mt-2 text-center max-w-24">
              <p
                className={`text-xs leading-tight ${
                  isCompleted ? "text-green-700 font-medium" : "text-gray-500"
                }`}
              >
                {step.name}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
