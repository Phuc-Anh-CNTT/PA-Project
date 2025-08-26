import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { StatusBadge } from "./StatusBadge";
import { Product } from "./ProductItem";
import { Phone, Calendar, AlertTriangle, Package, User, Clock } from "lucide-react";

interface ProductDetailProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetail({ product, isOpen, onClose }: ProductDetailProps) {
  if (!product) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}-${month}-${year}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-lg">Chi Tiết Bảo Hành</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-center">
            <StatusBadge status={product.status} />
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Package className="w-5 h-5 text-secondary mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Tên hàng nhận</p>
                <p className="font-medium">{product.productName}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <User className="w-5 h-5 text-secondary mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Tên khách hàng</p>
                <p className="font-medium">{product.customerName}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Phone className="w-5 h-5 text-secondary mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Số điện thoại</p>
                <p className="font-medium">{product.phoneNumber}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Mô tả lỗi lúc tiếp nhận</p>
                <p className="font-medium">{product.errorDescription}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-secondary mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Ngày nhận</p>
                  <p className="font-medium">{formatDate(product.receiveDate)}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Ngày hẹn trả</p>
                  <p className="font-medium">{formatDate(product.expectedReturnDate)}</p>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={onClose}
            className="w-full bg-secondary hover:bg-secondary/90 text-white"
          >
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}