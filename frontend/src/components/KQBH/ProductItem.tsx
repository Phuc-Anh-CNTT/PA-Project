import { Card, CardContent } from "../ui/card";
import { StatusBadge } from "./StatusBadge";
import { Phone, Calendar, AlertTriangle } from "lucide-react";

export interface Product {
  id: string;
  productName: string;
  customerName: string;
  phoneNumber: string;
  errorDescription: string;
  receiveDate: string;
  expectedReturnDate: string;
  status: string;
}

interface ProductItemProps {
  product: Product;
  onClick: (product: Product) => void;
}

export function ProductItem({ product, onClick }: ProductItemProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}-${month}-${year}`;
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-secondary"
      onClick={() => onClick(product)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{product.productName}</h3>
              <p className="text-sm text-gray-600">{product.customerName}</p>
            </div>
            <StatusBadge status={product.status} />
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-1" />
              {product.phoneNumber}
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(product.receiveDate)}
            </div>
          </div>

          <div className="flex items-start space-x-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
            <p className="text-gray-600 line-clamp-2">{product.errorDescription}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}