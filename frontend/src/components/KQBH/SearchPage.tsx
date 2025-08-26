import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Search } from "lucide-react";

interface SearchPageProps {
  onSearch: (code: string) => void;
}

export function SearchPage({ onSearch }: SearchPageProps) {
  const [searchCode, setSearchCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCode.trim()) {
      onSearch(searchCode.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center bg-gradient-to-r from-primary to-secondary text-white rounded-t-lg">
          <CardTitle className="text-2xl">
            Tra Cứu Kết Quả Bảo Hành
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="search-code" className="text-sm font-medium text-gray-700">
                Mã tra cứu
              </label>
              <Input
                id="search-code"
                type="text"
                placeholder="Nhập mã tra cứu bảo hành..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="h-12 border-2 border-gray-200 focus:border-secondary transition-colors"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-secondary hover:bg-secondary/90 text-white"
              disabled={!searchCode.trim()}
            >
              <Search className="w-5 h-5 mr-2" />
              Tìm Kiếm
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}