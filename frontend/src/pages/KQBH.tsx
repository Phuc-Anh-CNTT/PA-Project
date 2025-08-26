import React, {useState} from "react";
import {Button} from "../components/ui/button";
import {Input} from "../components/ui/input";
import {Card, CardContent, CardHeader, CardTitle} from "../components/ui/card";
import {Package} from "lucide-react";
import { AlertCircle, FileText, Hash, Inbox, Clock, Search, CheckCircle, Phone, AlertTriangle, User} from "lucide-react";
import {StatusStepper} from "../components/KQBH/StatusStepper";
import {PhieuBHsdtModel, PhieuBHByIdModel} from "../phieu_bh";

const API_URL = import.meta.env.VITE_API_URL;

type PageState = "search" | "no-results" | "findbyid" | "findbyphonenb";

interface Ticket {
    id: string;
    sophieunhan: string;
    Name: string;
    phoneNumber: string;
    serial?: string | null;
    product: string;
    receiveDate?: string;
    expectedReturnDate?: string;
    actualReturnDate?: string | null;
    status?: string;
    description: string;
    kind: string;
    so_luong?: number; // dùng cho phone
}

export default function KQBH() {
    const [currentPage, setCurrentPage] = useState<PageState>("search");
    const [searchCode, setSearchCode] = useState("");
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const statusbh = "Chờ khách đến lấy";
    const formatDate = (dateString?: string | null) => {
        if (!dateString) return "—";
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getFullYear().toString().slice(-2)}`;
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchCode.trim()) return;

        try {
            const res = await fetch(`${API_URL}/api/v1/kqbh/get-kqbh-by-key`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({keyword: searchCode, limit: 50}),
            });
            if (!res.ok) throw new Error("Lỗi khi gọi API");
            const json = await res.json();

            if (json.data && json.data.length > 0) {
                if (json.kind === "id") {
                    setTickets(
                        json.data.map((d: any) => ({
                            id: d.id,
                            sophieunhan: d.so_phieu_nhan,
                            Name: d.ten_khach,
                            serial: d.serial,
                            product: d.product,
                            phoneNumber: d.sdt,
                            receiveDate: d.ngay_nhan,
                            expectedReturnDate: d.ngay_hen_tra,
                            actualReturnDate: d.ngay_tra,
                            status: d.status || undefined,
                            description: d.mo_ta_loi_luc_tiep_nhan || "",
                            kind: "id",
                        }))
                    );
                    setCurrentPage("findbyid"); // <-- Chuyển trang sang findbyid
                } else if (json.kind === "phone") {
                    setTickets(
                        json.data.map((d: any) => ({
                            id: d.id,
                            sophieunhan: d.so_phieu_nhan,
                            Name: d.ten_khach,
                            phoneNumber: d.sdt,
                            receiveDate: d.ngay_nhan,
                            expectedReturnDate: d.ngay_hen_tra,
                            actualReturnDate: d.ngay_tra,
                            so_luong: d.so_luong,
                            kind: "phone",
                            status: d.status || undefined,
                            description: "",
                        }))
                    );
                    setCurrentPage("findbyphonenb");
                }
            } else {
                setCurrentPage("no-results");
            }
        } catch (err) {
            console.error(err);
            setCurrentPage("no-results");
        }
    };

    const renderSearch = () => (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl border-0">
                <CardHeader className="text-center bg-gradient-to-r from-primary to-secondary text-white rounded-t-lg">
                    <CardTitle>Tra Cứu Kết Quả Bảo Hành</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={handleSearch} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="search-code" className="block font-medium text-gray-700">
                                Mã tra cứu
                            </label>
                            <Input
                                id="search-code"
                                type="text"
                                placeholder="Nhập mã tra cứu bảo hành..."
                                value={searchCode}
                                onChange={(e) => setSearchCode(e.target.value)}
                                className="h-12 border-2 border-gray-200 focus:border-secondary"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-12 bg-secondary hover:bg-secondary/90 text-white"
                            disabled={!searchCode.trim()}
                        >
                            <Search className="w-5 h-5 mr-2"/> Tìm Kiếm
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );

    const renderNoResults = () => (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl border-0">
                <CardHeader className="text-center bg-gradient-to-r from-primary to-secondary text-white rounded-t-lg">
                    <CardTitle>Kết Quả Tra Cứu</CardTitle>
                </CardHeader>
                <CardContent className="p-8 text-center">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-primary"/>
                        </div>
                        <h3 className="font-medium text-gray-900">Không tìm thấy kết quả</h3>
                        <p className="text-gray-600">Không có kết quả trùng khớp với mã tra cứu bạn nhập.</p>
                        <Button
                            onClick={() => {
                                setCurrentPage("search");
                                setSearchCode("");
                            }}
                            className="w-full mt-6 bg-secondary hover:bg-secondary/90 text-white"
                        >
                            Đóng
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const findbyid = () => (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                <Card className="shadow-md border-0">
                    <CardHeader className="bg-gradient-to-r from-primary to-secondary text-white">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentPage("search")}
                                className="text-white hover:bg-white/20"
                            >
                                ← Quay lại
                            </Button>
                            <CardTitle>
                                Kết Quả Tra Cứu ({tickets.length} sản phẩm)
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        {tickets.map((ticket) => (
                            <div
                                key={ticket.id}
                                className="overflow-visible rounded-lg shadow-sm hover:shadow-2xl transition-shadow duration-200 cursor-pointer"
                            >
                                <Card className="border-l-4 border-l-secondary">
                                    <CardContent className="p-4 space-y-3">
                                        {/* Hàng 1: Tên sản phẩm + Mô tả lỗi */}
                                        <div className="items-center">
                                            <div className="flex-1 flex items-center">
                                                <Package className="w-4 h-4 text-blue-500 mr-2"/>
                                                <h3 className="font-medium text-gray-900 text-xs">{ticket.product}</h3>
                                            </div>
                                            <div className="flex items-center">
                                                <AlertCircle className="w-4 h-4 text-red-500 mr-2"/>
                                                <p className="text-gray-600 mt-1">{ticket.description}</p>
                                            </div>
                                        </div>

                                        {/* Hàng 2: Serial + Số phiếu */}
                                        <div className="flex items-center justify-between text-gray-600 gap-16">
                                            <div className="flex items-center">
                                                <Hash className="w-4 h-4 text-gray-500 mr-2"/>
                                                <span className="font-medium">Serial:</span>
                                                <span className="ml-1">{ticket.serial}</span>
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <FileText className="w-4 h-4 text-gray-500 mr-2"/>
                                                <span className="font-medium">Số phiếu:</span>
                                                <span className="ml-1">{ticket.sophieunhan}</span>
                                            </div>
                                        </div>

                                        {/* Hàng 3: Tên khách hàng + Số điện thoại */}
                                        <div className="flex items-center gap-12 text-gray-600">
                                            <div className="flex items-center">
                                                <User className="w-4 h-4 text-gray-500 mr-2"/>
                                                <span>{ticket.Name}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Phone className="w-4 h-4 mr-2"/>
                                                <span>{ticket.phoneNumber}</span>
                                            </div>
                                        </div>

                                        {/* Hàng 4: Ngày nhận + Hẹn trả + Ngày trả */}
                                        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Inbox className="w-4 h-4 text-blue-500"/>
                                                <span className="font-medium">Ngày nhận:</span>
                                                <span>{formatDate(ticket.receiveDate)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-orange-500"/>
                                                <span className="font-medium">Ngày hẹn trả:</span>
                                                <span>{formatDate(ticket.expectedReturnDate)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-green-500"/>
                                                <span className="font-medium">Ngày trả:</span>
                                                <span>
                        {ticket.actualReturnDate
                            ? formatDate(ticket.actualReturnDate)
                            : "Chưa trả"}
                      </span>
                                            </div>
                                        </div>

                                        {/* Hàng 5: Status Stepper */}
                                        <div className="mt-4">
                                            <StatusStepper currentStatus={statusbh}/>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
    const renderTickets = () => (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 p-6">
            <div className="max-w-7xl mx-auto">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        setCurrentPage("search");
                        setSearchCode("");
                    }}
                    className="mb-4 text-white bg-secondary hover:bg-secondary/90"
                >
                    ← Quay lại
                </Button>
                <h2 className="text-xl font-bold mb-6">
                    {tickets[0]?.kind === "id" ? "Kết quả theo ID" : "Danh sách số phiếu"}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {tickets.map((ticket) => (
                        <Card key={ticket.id}
                              className="shadow-md hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500">
                            <CardContent className="p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-gray-700">
                                        <FileText className="w-4 h-4 text-blue-500 mr-2"/>
                                        <span className="font-medium">Số phiếu:</span>
                                        <span className="ml-1">{ticket.sophieunhan}</span>
                                    </div>
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-medium ${
                                            ticket.status === "Đã trả" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                                        }`}
                                    >
                    {ticket.status || "Chưa trả"}
                  </span>
                                </div>

                                <div className="flex items-center justify-between text-gray-700">
                                    <div className="flex items-center">
                                        <User className="w-4 h-4 text-gray-500 mr-2"/>
                                        <span>{ticket.Name}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Phone className="w-4 h-4 text-gray-500 mr-2"/>
                                        <span>{ticket.phoneNumber}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <Inbox className="w-4 h-4 text-blue-500"/>
                                        <span>{formatDate(ticket.receiveDate)}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4 text-orange-500"/>
                                        <span>{formatDate(ticket.expectedReturnDate)}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <CheckCircle className="w-4 h-4 text-green-500"/>
                                        <span>{formatDate(ticket.actualReturnDate)}</span>
                                    </div>
                                </div>

                                {ticket.kind === "id" && ticket.status && (
                                    <div className="mt-4">
                                        <StatusStepper currentStatus={ticket.status}/>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );

    if (currentPage === "search") return renderSearch();
    if (currentPage === "no-results") return renderNoResults();
    if (currentPage === "findbyid") return findbyid();
    if (currentPage === "findbyphonenb") return renderTickets();

    return null;
}