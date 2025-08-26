import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { AlertCircle } from "lucide-react";

interface NoResultsProps {
  onClose: () => void;
}

export function NoResults({ onClose }: NoResultsProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center bg-gradient-to-r from-primary to-secondary text-white rounded-t-lg">
          <CardTitle className="text-xl">
            Kết Quả Tra Cứu
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">
                Không tìm thấy kết quả
              </h3>
              <p className="text-gray-600">
                Không có kết quả trùng khớp với mã tra cứu bạn nhập.
              </p>
            </div>
            <Button
              onClick={onClose}
              className="w-full mt-6 bg-secondary hover:bg-secondary/90 text-white"
            >
              Đóng
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}