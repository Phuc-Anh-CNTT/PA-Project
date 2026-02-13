// @ts-ignore
import React, {useState, useEffect} from "react";
import {Button} from "../components/ui/button";
import {Input} from "../components/ui/input";
import {Card, CardContent, CardHeader, CardTitle} from "../components/ui/card";
import {CircleCheckBig, Package} from "lucide-react";
import {
    Facebook,
    Youtube,
    Zap,
    CheckSquare,
    CornerDownRight,
    AlertCircle,
    FileText,
    Hash,
    Inbox,
    Clock,
    Search,
    CheckCircle,
    MapPin,
    Phone,
    Mail,
    Calendar,
    AlertTriangle,
    User
} from "lucide-react";
import {StatusStepper} from "../components/KQBH/StatusStepper";

import Ndyduc from "../ndyduc";
// @ts-ignore
import headerLogo from "../assets/images/banner-bao-hanh.jpg"

// @ts-ignore
import headerLogo2 from "../assets/images/banner-bao-hanh2.jpg"
// @ts-ignore
import abcImg from '../assets/images/abc.png';
// @ts-ignore
import baohanh1 from '../assets/images/bao-hanh-1.png';
// @ts-ignore
import logo1 from '../assets/images/dathongbao.png';
// @ts-ignore
import footerLogo from "../assets/images/footer.png";
import '../styles/kqbh.css'
import {ImageWithFallback} from "../components/figma/ImageWithFallback";
import ActionButtons from "../components/KQBH/ActionButtons";

// @ts-ignore
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
    status?: string | "Đã trả";
    description: string;
    kind: string;
    so_luong?: number; // dùng cho phone
}

export default function KQBH() {
    const [currentPage, setCurrentPage] = useState<PageState>("search");
    const [searchCode, setSearchCode] = useState("");
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [phoneTickets, setPhoneTickets] = useState<Ticket[]>([]);
    const [pageStack, setPageStack] = useState<PageState[]>([]);
    // "empty" for no results, "network" for network error
    const [noResultType, setNoResultType] = useState<"empty" | "network">("empty");

    const goToPage = (page: PageState) => {
        setPageStack(prev => [...prev, currentPage]);
        setCurrentPage(page);
    }

    const goBack = () => {
        setPageStack(prev => {
            if (prev.length === 0) return prev;
            let nextStack = [...prev];
            let last = nextStack.pop();
            // Pop until we find a page different from the currentPage, or stack is empty
            while (last === currentPage && nextStack.length > 0) {
                last = nextStack.pop();
            }
            // If after popping, last is still the same as currentPage, or undefined, just return empty stack
            if (!last || last === currentPage) {
                setSearchCode("");
                return [];
            }

            setSearchCode("");
            setCurrentPage(last);

            // Ensure findbyphonenb does not appear twice, and restore phoneTickets if needed
            if (last === "findbyphonenb") {
                setTickets(phoneTickets);
            }

            // Remove any trailing duplicates of last page (e.g. findbyphonenb x2)
            while (nextStack.length > 0 && nextStack[nextStack.length - 1] === last) {
                nextStack.pop();
            }

            return nextStack;
        });
    };

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return "—";
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear().toString();
        return `${day}-${month}-${year}`;
    };

    const handleSearch = async (e: React.FormEvent | null, keyword?: string) => {
        if (e) e.preventDefault();
        const searchValue = keyword ?? searchCode;
        if (!searchValue.trim()) return;

        try {
            const res = await fetch(`${API_URL}/api/v1/kqbh/get-kqbh-by-key`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({keyword: searchValue, limit: 50}),
            });
            if (!res.ok) throw new Error("Lỗi khi gọi API");
            const json = await res.json();

            if (json.data && json.data.length > 0) {
                if (json.kind === "id") {
                    setTickets(
                        json.data.map((d: any) => ({
                            id: d.id,
                            sophieunhan: d.phieu_nhan,
                            Name: d.khach,
                            serial: d.serial || "",
                            product: d.product,
                            phoneNumber: d.phone,
                            receiveDate: d.taken_date,
                            expectedReturnDate: d.primised_date,
                            actualReturnDate: d.done_date,
                            status: d.status,
                            description: d.description || "",
                            kind: "id",
                        }))
                    );
                    setNoResultType("empty");
                    console.log(json.data[0].description);
                    goToPage("findbyid")
                } else if (json.kind === "phone") {
                    let data = json.data.map((d: any) => ({
                        id: d.id,
                        sophieunhan: d.phieu_nhan,
                        Name: d.khach,
                        phoneNumber: d.phone,
                        receiveDate: d.taken_date,
                        expectedReturnDate: d.primised_date,
                        actualReturnDate: d.done_date,
                        so_luong: d.so_luong,
                        kind: "phone",
                        status: d.status || "Đã trả",
                        description: "",
                    }))
                    setTickets(data);
                    setPhoneTickets(data);
                    setNoResultType("empty");
                    goToPage("findbyphonenb");
                }
            } else {
                setNoResultType("empty");
                setCurrentPage("no-results");
            }
        } catch (err) {
            console.error(err);
            if (err instanceof TypeError) {
                setNoResultType("network"); // network error
            } else {
                setNoResultType("empty"); // lỗi khác hoặc server trả []
            }
            setCurrentPage("no-results");
        }
    };

    function TicketList({tickets}) {
        const [chunkSize, setChunkSize] = useState(20); // mặc định desktop

        useEffect(() => {
            const updateChunkSize = () => {
                if (window.innerWidth < 900) {
                    // small screen
                    setChunkSize(5);
                } else {
                    // larger screen
                    setChunkSize(20);
                }
            };

            updateChunkSize(); // chạy lần đầu
            window.addEventListener("resize", updateChunkSize);
            return () => window.removeEventListener("resize", updateChunkSize);
        }, []);

        return (
            <div>
                {tickets.map((ticket, index) => (
                    (index + 1) === tickets.length && tickets.length >= chunkSize && (
                        <div
                            key={`footer-${index}`}
                            className="w-auto bg-gradient-to-r from-blue-800 to-red-500 rounded-xl flex items-center gap-10 py-4 my-6 px-4"
                        >
                            <Button
                                variant="ghost"
                                onClick={goBack}
                                className="w-[100px] h-[30px] text-xl !text-white bg-blue-500 !hover:bg-blue-300 !hover:text-white"
                            >
                                ← Quay lại
                            </Button>
                        </div>
                    )
                ))}
            </div>
        );
    }

    const renderSearch = () => (
        <div
            className="h-[700px] w-full box-border bg-gradient-to-br from-blue-200 to-red-200 items-center justify-center p-2">

            <div
                className="max-h-[300px] w-full flex flex-col items-start justify-center overflow-hidden bg-none text-white font-sans">
                <div className="relative z-10">
                    <ActionButtons/>
                </div>
            </div>
            <div className="h-[300px] w-full box-border bg-gradient-to-br flex items-center justify-center p-2">
                <Card className="h-auto w-fit shadow-xl border-0 flex flex-col items-center ">
                    <CardHeader
                        className="h-full w-full text-center bg-gradient-to-r from-blue-800 to-red-600 text-white rounded-t-lg pl-10 pr-10">
                        <CardTitle
                            className="h-full text-3xl font-bold tracking-wide text-white"
                            style={{fontFamily: "Times New Roman, Times, serif"}}
                        >
                            Tra Cứu Bảo Hành Phúc Anh
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-16 py-8 w-auto">
                        <form onSubmit={handleSearch} className="space-y-6 w-full mb-8">
                            <div className="w-full space-y-2">
                                <label htmlFor="search-code" className="block font-medium text-gray-700">
                                    Tra cứu
                                </label>
                                <Input id="search-code" type="text"
                                       placeholder="Nhập số phiếu nhận bảo hành hoặc số điện thoại"
                                       value={searchCode}
                                       onChange={(e) => setSearchCode(e.target.value)}
                                       className="appearance-none box-border w-full min-w-[350px] h-12 border-2 border-gray-200 focus:border-secondary !text-xl leading-normal"
                                />
                            </div>
                            <button type="submit"
                                    className="flex items-center justify-center gap-2 text-2xl appearance-none box-border w-full h-12 bg-red-300 hover:bg-blue-900 text-white rounded-xl leading-normal">
                                <Search className="w-5 h-5 mr-2"/> Tìm Kiếm
                            </button>
                        </form>
                    </CardContent>
                </Card>

            </div>
        </div>
    );

    const renderNoResults = () => (
        <div className="h-[400px] bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center ">
            <Card className="w-full max-w-md shadow-xl border-0">
                <CardHeader className="text-center bg-gradient-to-r from-blue-800 to-red-500 text-white rounded-t-lg">
                    <CardTitle className="text-3xl font-bold tracking-wide text-white"
                               style={{fontFamily: "Times New Roman, Times, serif"}}
                    >
                        Kết Quả Tra Cứu
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 text-center">
                    <div className="flex flex-col items-center space-y-4">
                        {noResultType === "network" ?
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-primary"/>
                            </div>
                            :
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <CircleCheckBig className="w-6 h-6 text-primary"/>
                            </div>
                        }
                        <h3 className="font-medium text-gray-900">
                            {noResultType === "network"
                                ? "Không thể kết nối đến máy chủ"
                                : "Không tìm thấy kết quả"}
                        </h3>
                        <p className="text-gray-600">
                            {noResultType === "network"
                                ? "Không thể kết nối đến máy chủ. Vui lòng thử lại sau."
                                : "Bạn không có phiếu nào đang xử lý"}
                        </p>
                        <Button
                            onClick={() => {
                                setCurrentPage("search");
                                setSearchCode("");
                            }}
                            className="w-full mt-6 bg-blue-800 hover:bg-red-300 text-white !text-xl"
                        >
                            Đóng
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const findbyid = () => (
        <div className="h-auto bg-gradient-to-br from-blue-200 to-red-200 p-4">
            <div className="max-w-[65vw] mx-auto  bg-gray-50  rounded-2xl">
                <CardHeader
                    className="bg-gradient-to-r from-blue-800 to-red-500 py-3 text-white  rounded-2xl sticky top-2 z-20">
                    <div className="flex items-center space-x-4 mb-2">
                        <Button variant="ghost" size="sm" onClick={goBack}
                                className="text-white bg-red-300 !hover:bg-blue-200 text-xl"
                        >
                            ← Quay lại
                        </Button>
                        <CardTitle className="flex items-center bg-white rounded-xl py-1.5 text-black px-6">
                            Kết Quả Tra Cứu cho số phiếu
                            <FileText className="w-5 h-5 text-gray-500 mr-2 ml-2"/>
                            {tickets[0].sophieunhan} có {tickets.length} sản phẩm
                        </CardTitle>
                    </div>
                    <CardTitle
                        className="h-auto flex flex-col sm:flex-row gap-2 px-6 py-1 bg-white rounded-xl overflow-hidden">
                        <div className="h-full flex flex-1 items-center overflow-hidden">
                            <User className="w-6 h-6 flex-shrink-0 text-gray-500 mr-2"/>
                            <div className=" flex items-center relative flex-1 overflow-hidden">
                                <div className="flex items-center whitespace-nowrap">
                                        <span
                                            className="h-[25px] flex text-black items-center mr-8 truncate">{tickets[0].Name}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 min-w-[120px]">
                            <Phone className="w-6 h-6 flex-shrink-0 text-gray-500 mr-2"/>
                            <span className="text-black truncate">{tickets[0].phoneNumber}</span>
                        </div>
                    </CardTitle>

                </CardHeader>
                <Card className="shadow-md border-0 overflow-hidden rounded-2xl">
                    <CardContent className="p-6 space-y-4 bg-gray-50">
                        {tickets.map((ticket, i) => (
                            <div key={ticket.id}
                                 className="overflow-visible rounded-lg shadow-sm hover:shadow-2xl transition-shadow duration-200 cursor-pointer"
                            >
                                <Card className="border-l-4 border-l-secondary">
                                    <CardContent className="p-4 space-y-3">
                                        {/* Hàng 1: Tên sản phẩm + Mô tả lỗi */}
                                        <div className="flex flex-col space-y-2 min-w-0">
                                            {/* Tên sản phẩm với icon */}
                                            <div className="flex flex-col space-y-2 min-w-0">
                                                {/* Tên sản phẩm với icon */}
                                                <div className="flex items-center space-x-1 flex-1 min-w-0">
                                                    <Package className="w-6 h-6 text-blue-500 flex-shrink-0"/>
                                                    <span
                                                        className="font-bold text-2xl text-gray-900 truncate overflow-hidden whitespace-nowrap flex-1">
                                                      {i + 1}. {ticket.product}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Hàng 2: Serial + Số phiếu */}
                                        <div className="w-full grid grid-cols-1 sm:grid-cols-2 text-gray-600">
                                            <div className="flex-1 flex items-center">
                                                <Hash className="w-6 h-6 text-gray-500 mr-2"/>
                                                <span className="font-medium">Serial:</span>
                                                <span className="ml-1">{ticket.serial}</span>
                                            </div>
                                            {/* Mô tả lỗi */}
                                            <div className="flex flex-1 items-center space-x-2">
                                                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0"/>
                                                <span className="text-gray-600 whitespace-pre-line break-words">
                                                    {ticket.description}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Hàng 3: Ngày nhận + Hẹn trả + Ngày trả */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xm text-gray-600 ">
                                            <div className="flex items-center gap-2">
                                                <Inbox className="w-5 h-5 text-blue-500"/>
                                                <span className="font-medium">Ngày nhận:</span>
                                                <span>{formatDate(ticket.receiveDate)}</span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Clock className="w-5 h-5 text-orange-500"/>
                                                <span className="font-medium">Ngày hẹn trả:</span>
                                                <span>{formatDate(ticket.expectedReturnDate)}</span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="w-5 h-5 text-green-500"/>
                                                <span className="font-medium">Ngày trả:</span>
                                                <span>
                                                  {ticket.actualReturnDate
                                                      ? formatDate(ticket.actualReturnDate)
                                                      : "Chưa trả"}
                                                </span>
                                            </div>
                                        </div>
                                        {/* Hàng 4: Status Stepper */}
                                        <div className="!mt-10">
                                            <StatusStepper currentStatus={ticket.status}/>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </CardContent>
                    {/*{tickets.length > 3 && (*/}
                    {/*    <CardHeader className="bg-gradient-to-r from-blue-800 to-red-500 pb-3 text-white  rounded-2xl">*/}
                    {/*        <div className="flex items-center space-x-4">*/}
                    {/*            <Button variant="ghost" size="sm" onClick={goBack}*/}
                    {/*                    className="text-white bg-red-300 !hover:bg-blue-200 text-xl"*/}
                    {/*            >*/}
                    {/*                ← Quay lại*/}
                    {/*            </Button>*/}
                    {/*        </div>*/}
                    {/*    </CardHeader>*/}
                    {/*)}*/}
                </Card>
            </div>
        </div>
    );

    const findbysdt = () => (
        <div className="min-h-[500px] w-full h-auto bg-gradient-to-br from-blue-200 to-red-200 p-6">
            <div className="w-full p-8 mx-auto">
                <div
                    className="w-auto bg-gradient-to-r from-blue-800 to-red-500 rounded-xl flex items-center gap-6 py-4 mb-6 px-4 sticky top-6 z-20">
                    <Button variant="ghost" onClick={goBack}
                            className="w-[100px] h-[30px] text-xl !text-white bg-blue-500 !hover:bg-blue-300 !hover:text-white">
                        ← Quay lại
                    </Button>
                    <span className="flex items-center gap-2 py-1 px-6 rounded-xl bg-white">
                        <span className="h-full flex items-center text-3xl text-black font-playfair font-semibold">
                      {tickets[0]?.kind === "id" ? "Kết quả theo ID" : "Danh sách số phiếu cho"}
                    </span>
                    <div className="flex items-center text-black">
                        <Phone className="w-5 h-5 text-black mr-2"/>
                        <span>{tickets[0].phoneNumber}</span>
                    </div>
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {tickets.map((ticket) => (
                        <Card key={ticket.id}
                              className="shadow-md hover:shadow-2xl transition-shadow cursor-pointer border-l-4 border-l-blue-500"
                              onClick={() => {
                                  goToPage("findbyid");
                                  handleSearch(null, ticket.sophieunhan);
                              }}>
                            <CardContent className="p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-gray-700">
                                        <FileText className="w-5 h-5 text-blue-500 mr-2"/>
                                        <span className="font-medium">Số phiếu:</span>
                                        <span className="ml-1">{ticket.sophieunhan}</span>
                                    </div>
                                    {(() => {
                                        const statusMap: Record<string, string> = {
                                            "Completed": "Hoàn thành",
                                            "Processing": "Đang xử lý",
                                            "Received": "Đã tiếp nhận",
                                            "Taking": "Đợi kháchlấy",
                                            "Done": "Hoàn tất",
                                        };
                                        const statusColors: Record<string, string> = {
                                            "Done": "bg-green-100 text-green-700",
                                            "Taking": "bg-yellow-100 text-yellow-700",
                                            "Completed": "bg-blue-100 text-blue-700",
                                            "Processing": "bg-purple-100 text-purple-700",
                                            "Received": "bg-gray-100 text-gray-700",
                                        };
                                        return (
                                            <span className={`px-4 py-1 rounded-xl text-xm font-medium 
                                            ${statusColors[ticket.status] || "bg-gray-100 text-gray-700"}`}>
                                              {statusMap[ticket.status] || ticket.status}
                                            </span>
                                        );
                                    })()}
                                </div>

                                <div className="flex items-center justify-between text-gray-700 gap-3">
                                    <div className="flex items-center overflow-hidden">
                                        <User className="w-6 h-6 text-gray-500 mr-2 flex-shrink-0"/>
                                        <div className="relative flex-1 overflow-hidden">
                                            <div className="flex whitespace-nowrap animate-marquee">
                                                <span className="mr-8">{ticket.Name}</span>
                                                <span className="mr-8">{ticket.Name}</span> {/* lặp để chạy liên tục */}
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                <div className="grid grid-cols-3 gap-2 text-gray-600 text-[clamp(12px,2vw,14px)]">
                                    <div className="w-full flex items-center gap-1 overflow-hidden">
                                        <Inbox className="w-5 h-5 text-blue-500 flex-shrink-0"/>
                                        <span className="">{formatDate(ticket.receiveDate)}</span>
                                    </div>
                                    <div className="w-full flex items-center gap-1 overflow-hidden">
                                        <Clock className="w-5 h-5 text-orange-500 flex-shrink-0"/>
                                        <span className="">{formatDate(ticket.expectedReturnDate)}</span>
                                    </div>
                                    <div className="w-full flex items-center gap-1 overflow-hidden">
                                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0"/>
                                        <span className="">{formatDate(ticket.actualReturnDate)}</span>
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
                {/*<TicketList tickets={tickets}/>*/}
            </div>
        </div>
    );

    const renderPage = () => {
        if (currentPage === "search") return renderSearch();
        if (currentPage === "no-results") return renderNoResults();
        if (currentPage === "findbyid") return findbyid();
        if (currentPage === "findbyphonenb") return findbysdt();
        return null;
    };

    return (

        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-red-50">
            <header className="w-full max-w-screen-2xl mx-auto">
                <img
                    src={headerLogo2}
                    alt="Header Logo"
                    className="w-full h-auto object-cover"
                />
            </header>

            <main className="flex-1">{renderPage()}</main>
            <div className="bg2">
                <div className="container ">
                    <div className="vc_row wpb_row vc_row-fluid">
                        <div className="wpb_column vc_column_container vc_col-sm-12">
                            <div className="vc_column-inner">
                                <div className="wpb_wrapper">
                                    <div className="vc_empty_space">
                                        <span className="vc_empty_space_inner"></span>
                                    </div>
                                    <div className="sec-title m-top4 h-[45px] mr-[30px]">
                                        <div className="col-lg-12 col-md-12 col-xs-12 text-center">
                                            <h2 className="font-bold font30 font-black text-uppercase">Danh sách các
                                                điểm tiếp nhận bảo hành</h2>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="vc_row wpb_row vc_row-fluid address ">
                        <div className="wpb_column vc_column_container vc_col-sm-4">
                            <div className="vc_column-inner">
                                <div className="wpb_wrapper">
                                    <div className="m-bottom4 fea-col-box flex items-center  active odd">
                                        <div className="icon-boxed wide80 !min-w-[80px] !min-h-[80px] !text-[2rem] flex justify-center items-center box-round">
                                            01
                                        </div>
                                        <div className="left-padd2">
                                            <h2 className="font-thin m-bottom1">☎️ (024) 3968 9966 (Máy lẻ 1)</h2>
                                            <p>🗺️ Số 15 Xã Đàn - phường Kim Liên - Hà Nội</p>
                                        </div>
                                    </div>
                                    <div className="m-bottom4 fea-col-box flex items-center ">
                                        <div className="!bg-blue-300 !text-[2rem] flex justify-center items-center icon-boxed wide80 !min-w-[80px] !min-h-[80px] box-round">
                                            02
                                        </div>
                                        <div className="left-padd2">
                                            <h2 className="font-thin m-bottom1">☎️ (024) 3968 9966 (Máy lẻ 2)</h2>
                                            <p>🗺️ Số 152-154 Trần Duy Hưng - phường Yên Hoà - Hà Nội</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="wpb_column vc_column_container vc_col-sm-4">
                            <div className="vc_column-inner">
                                <div className="wpb_wrapper">
                                    <div className="m-bottom4 fea-col-box flex items-center  odd ">
                                        <div className="!bg-blue-300 !text-[2rem] flex justify-center items-center icon-boxed wide80 !min-w-[80px] !min-h-[80px] box-round">
                                            03
                                        </div>
                                        <div className="left-padd2">
                                            <h2 className="font-thin m-bottom1">☎️ (024) 3968 9966 (Máy lẻ 3)</h2>
                                            <p>🗺️ Số 134 Thái Hà - phường Đống Đa - Hà Nội</p>
                                        </div>
                                    </div>
                                    <div className="m-bottom4 fea-col-box flex items-center  active odd ">
                                        <div className="!text-[2rem] flex justify-center items-center icon-boxed wide80 !min-w-[80px] !min-h-[80px] box-round">
                                            04
                                        </div>
                                        <div className="left-padd2">
                                            <h2 className="font-thin m-bottom1">☎️ (024) 3968 9966 (Máy lẻ 4)</h2>
                                            <p>🗺️ Số 89 Lê Duẩn - phường Cửa Nam - Hà Nội</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="wpb_column vc_column_container vc_col-sm-4">
                            <div className="vc_column-inner">
                                <div className="wpb_wrapper">
                                    <div className="m-bottom4 fea-col-box flex items-center  active ">
                                        <div className="!text-[2rem] flex justify-center items-center icon-boxed wide80 !min-w-[80px] !min-h-[80px] box-round">
                                            05
                                        </div>
                                        <div className="left-padd2">
                                            <h2 className="font-thin m-bottom1">☎️ (024) 3968 9966 (Máy lẻ 5)</h2>
                                            <p>🗺️ 141-143 Phạm Văn Đồng, phường Phú Diễn - Hà Nội</p>
                                        </div>
                                    </div>

                                    <div className="m-bottom4 fea-col-box flex items-center ">
                                        <div className="!text-[2rem] flex justify-center items-center icon-boxed wide80 !min-w-[80px] !min-h-[80px] box-round !bg-blue-300">
                                            📞
                                        </div>
                                        <div className="left-padd2">
                                            <h2 className="font-thin m-bottom1 red">HOTLINE: 1900 2173</h2>
                                            <p>Hoặc liên hệ trung tâm bảo hành qua số hotline để được hỗ trợ nhanh
                                                nhất</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            <div className="vc_row wpb_row vc_row-fluid">
                <div className="wpb_column vc_column_container vc_col-sm-12">
                    <div className="vc_column-inner">
                        <div className="wpb_wrapper">
                            <div className="section-lg ">
                                <div className="container">
                                    <div className="col-md-6 col-sm-6 m-bottom3">
                                        <img
                                            src={abcImg}
                                            alt="abc"
                                            className="w-[548px] h-[314px]"
                                        />
                                    </div>
                                    <div className="col-md-6 col-sm-6 partner">
                                        <h2 className="font-black font-bold font30 m-bottom3 uppercase">
                                            Tra cứu địa điểm bảo hành theo hãng
                                        </h2>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                                            {[
                                                {
                                                    href: "https://www.phucanh.vn/chinh-sach-bao-hanh-acer.html",
                                                    src: "https://phucanhcdn.com/media/brand/acer.png",
                                                    alt: "Acer"
                                                },
                                                {
                                                    href: "https://www.phucanh.vn/chinh-sach-bao-hanh-aoc.html",
                                                    src: "https://phucanhcdn.com/media/brand/aoc.png",
                                                    alt: "AOC"
                                                },
                                                {
                                                    href: "https://www.phucanh.vn/chinh-sach-bao-hanh-apple.html",
                                                    src: "https://phucanhcdn.com/media/brand/apple.png",
                                                    alt: "Apple"
                                                },
                                                {
                                                    href: "https://www.phucanh.vn/chinh-sach-bao-hanh-asus.html",
                                                    src: "https://phucanhcdn.com/media/brand/asus.png",
                                                    alt: "Asus"
                                                },
                                                {
                                                    href: "https://www.phucanh.vn/chinh-sach-bao-hanh-brother.html",
                                                    src: "https://phucanhcdn.com/media/brand/brother.png",
                                                    alt: "Brother"
                                                },
                                                {
                                                    href: "https://www.phucanh.vn/chinh-sach-bao-hanh-canon.html",
                                                    src: "https://phucanhcdn.com/media/brand/canon.png",
                                                    alt: "Canon"
                                                },
                                                {
                                                    href: "https://www.phucanh.vn/chinh-sach-bao-hanh-dell.html",
                                                    src: "https://phucanhcdn.com/media/brand/dell.png",
                                                    alt: "Dell"
                                                },
                                                {
                                                    href: "https://www.phucanh.vn/chinh-sach-bao-hanh-epson.html",
                                                    src: "https://phucanhcdn.com/media/brand/epson.png",
                                                    alt: "Epson"
                                                },
                                                {
                                                    href: "https://www.phucanh.vn/chinh-sach-bao-hanh-fuji-xerox.html",
                                                    src: "https://phucanhcdn.com/media/brand/fujixerox.png",
                                                    alt: "Fuji Xerox"
                                                },
                                                {
                                                    href: "https://www.phucanh.vn/chinh-sach-bao-hanh-hp.html",
                                                    src: "https://phucanhcdn.com/media/brand/hp.png",
                                                    alt: "HP"
                                                },
                                                {
                                                    href: "https://www.phucanh.vn/chinh-sach-bao-hanh-lenovo.html",
                                                    src: "https://phucanhcdn.com/media/brand/lenovo.png",
                                                    alt: "Lenovo"
                                                },
                                                {
                                                    href: "https://www.phucanh.vn/chinh-sach-bao-hanh-lg.html",
                                                    src: "https://phucanhcdn.com/media/brand/lg.png",
                                                    alt: "LG"
                                                },
                                                {
                                                    href: "https://www.phucanh.vn/chinh-sach-bao-hanh-linksys.html",
                                                    src: "https://phucanhcdn.com/media/brand/linksys.png",
                                                    alt: "Linksys"
                                                },
                                                {
                                                    href: "https://www.phucanh.vn/chinh-sach-bao-hanh-samsung.html",
                                                    src: "https://phucanhcdn.com/media/brand/samsung.png",
                                                    alt: "Samsung"
                                                },
                                                {
                                                    href: "https://www.phucanh.vn/chinh-sach-bao-hanh-sony.html",
                                                    src: "https://phucanhcdn.com/media/brand/sony.png",
                                                    alt: "Sony"
                                                },
                                                {
                                                    href: "https://www.phucanh.vn/chinh-sach-bao-hanh-tp-link.html",
                                                    src: "https://phucanhcdn.com/media/brand/tplink.png",
                                                    alt: "TP-Link"
                                                }
                                            ].map((item, idx) => (
                                                <a
                                                    key={idx}
                                                    href={item.href}
                                                    target="_blank"
                                                    className="flex justify-center items-center p-2 bg-white rounded shadow hover:shadow-lg"
                                                >
                                                    <img
                                                        src={item.src}
                                                        alt={item.alt}
                                                        className="max-w-[169px] max-h-[56px] object-contain bg-white p-1"
                                                        style={{
                                                            background: "transparent"
                                                        }}
                                                    />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="wpb_column vc_column_container vc_col-sm-12">
                <div className="vc_column-inner1">
                    <div className="wpb_wrapper">
                        <div className="section-lg bg-parallax-11 m-top7 ">
                            <div className="container ">
                                <div className="col-md-6 nopadding m-bottom4">
                                    <div className="col-fea-box">
                                        <h4 className="font-white font-bold font15 text-center uppercase"></h4>
                                        <h2 className="font-white font-bold font30 text-center m-bottom3 uppercase">Chính
                                            sách bảo hành đặc biệt</h2>
                                        <div className="col-md-6 col-sm-6 m-bottom2 m3">
                                            <img width="225" height="225" src={baohanh1}
                                                 className="img-responsive attachment-full" alt="" decoding="async"
                                                 loading="lazy" title="site-img83"/>
                                        </div>
                                        <div className="col-md-6 col-sm-6 m-bottom2 m7">
                                            <ul className="font-white space-y-2">
                                                <li className="flex items-start gap-2">
                                                    <CheckSquare className="w-4 h-4 mt-1"/>
                                                    <span>Bảo trì, bảo dưỡng tại nơi sử dụng</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <CheckSquare className="w-4 h-4 mt-1"/>
                                                    <span>Bảo hành đổi mới đến 30 ngày</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <CheckSquare className="w-4 h-4 mt-1"/>
                                                    <span>Vận chuyển miễn phí tới 300 Km</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <CheckSquare className="w-4 h-4 mt-1"/>
                                                    <span>Sản phẩm chính hãng, giá tốt nhất</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <CheckSquare className="w-4 h-4 mt-1"/>
                                                    <span>Và nhiều chế độ tốt cho khách hàng</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6 nopadding m-bottom4">
                                    <div className="col-fea-box-white">
                                        <h2 className="font-black font-bold font30 text-center m-bottom3 uppercase">
                                            Quy định và chính sách
                                        </h2>
                                        <div className="col-md-12">
                                            <ul className="new-domin-list nopadding space-y-2">
                                                <li className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                        <CornerDownRight className="w-4 h-4"/>
                        Chính sách bảo hành
                    </span>
                                                    <a href="https://www.phucanh.vn/page/chinh-sach-bao-hanh"
                                                       target="_blank"
                                                       className="h-full flex items-center text-blue-600 hover:underline">
                                                        Xem
                                                    </a>
                                                </li>
                                                <li className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                        <CornerDownRight className="w-4 h-4"/>
                        Chính sách đổi trả sản phẩm
                    </span>
                                                    <a href="https://www.phucanh.vn/page/chinh-sach-doi-tra-san-pham"
                                                       target="_blank"
                                                       className="h-full flex items-center text-blue-600 hover:underline">
                                                        Xem
                                                    </a>
                                                </li>
                                                <li className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                        <CornerDownRight className="w-4 h-4"/>
                        Chính sách kinh doanh
                    </span>
                                                    <a href="https://www.phucanh.vn/page/chinh-sach-kinh-doanh"
                                                       target="_blank"
                                                       className="h-full flex items-center text-blue-600 hover:underline">
                                                        Xem
                                                    </a>
                                                </li>
                                                <li className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                        <CornerDownRight className="w-4 h-4"/>
                        Chính sách kiểm hàng
                    </span>
                                                    <a href="https://www.phucanh.vn/chinh-sach-kiem-hang.html"
                                                       target="_blank"
                                                       className="h-full flex items-center text-blue-600 hover:underline">
                                                        Xem
                                                    </a>
                                                </li>
                                                <li className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                        <CornerDownRight className="w-4 h-4"/>
                        Chính sách vận chuyển và giao nhận
                    </span>
                                                    <a href="https://www.phucanh.vn/page/van-chuyen-giao-nhan-hang-hoa"
                                                       target="_blank"
                                                       className="h-full flex items-center text-blue-600 hover:underline">
                                                        Xem
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <footer className="footer-bg">
                <div className="container">
                    <div className="row">
                        <div className="col-md-3 col-sm-6 m-top2 font-white footer-address">
                            <h4 className="font16 font-thin uppercase"><b>PHÒNG BÁN HÀNG TRỰC TUYẾN</b></h4>
                            <div className="title-line color"></div>

                            <ul className="listitems left-padd0">
                                <li className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4"/>
                                    <a href="">Tầng 4, 89 Lê Duẩn, phường Cửa Nam, Hà Nội</a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Phone className="w-4 h-4"/>
                                    <a href="">1900 2164 (Máy lẻ 1)</a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Phone className="w-4 h-4"/>
                                    <a href="">Hoặc 0974 55 88 11</a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Mail className="w-4 h-4"/>
                                    <a href="">banhangonline@phucanh.com.vn</a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4"/>
                                    <a href="https://goo.gl/maps/nf2yyHHL2rDTjxAt5" target="_blank" className="yellow">
                                        <b>[Bản đồ đường đi]</b>
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div className="col-md-3 col-sm-6 m-top2 font-white footer-address">
                            <h4 className="font16 font-thin uppercase"><b>SHOWROOM PHÚC ANH 15 XÃ ĐÀN</b></h4>
                            <div className="title-line color"></div>
                            <ul className="listitems left-padd0">
                                <li className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4"/>
                                    <a href="">15 Xã Đàn, phường Kim Liên, Hà Nội.</a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Phone className="w-4 h-4"/>
                                    <a href="">(024) 3968 9966 (Máy lẻ 1)</a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Mail className="w-4 h-4"/>
                                    <a href="">phucanh.xadan@phucanh.com.vn</a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4"/>
                                    <a href="">Giờ mở cửa từ 08h00 đến 21h00</a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4"/>
                                    <a
                                        href="https://goo.gl/maps/nNrnPqeNJ96kyTbh7"
                                        target="_blank"
                                        className="yellow"
                                    >
                                        <b>[Bản đồ đường đi]</b>
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div className="col-md-3 col-sm-6 m-top2 font-white footer-address">
                            <h4 className="font16 font-thin uppercase"><b>Trụ sở chính/SHOWROOM PHÚC ANH 152 TRẦN DUY
                                HƯNG</b></h4>
                            <div className="title-line color"></div>
                            <ul className="listitems left-padd0">
                                <li className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4"/>
                                    <a href="">152-154 Trần Duy Hưng, phường Yên Hoà, Hà Nội.</a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Phone className="w-4 h-4"/>
                                    <a href="">(024) 3968 9966 (Máy lẻ 2)</a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Mail className="w-4 h-4"/>
                                    <a href="">phucanh.tranduyhung@phucanh.com.vn</a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4"/>
                                    <a href="">Giờ mở cửa từ 08h00 đến 21h00</a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4"/>
                                    <a
                                        href="https://goo.gl/maps/jV44ifZSyWgBh8vR6"
                                        target="_blank"
                                        className="yellow"
                                    >
                                        <b>[Bản đồ đường đi]</b>
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div className="col-md-3 col-sm-6 m-top2 font-white footer-address">
                            <h4 className="font16 font-thin uppercase"><b>PHÒNG KINH DOANH PHÂN PHỐI</b></h4>
                            <div className="title-line color"></div>
                            <ul className="listitems left-padd0">
                                <li className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4"/>
                                    <a href="">Tầng 5, 134 Thái Hà, phường Đống Đa, Hà Nội.</a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Phone className="w-4 h-4"/>
                                    <a href="">097 322 7711</a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Mail className="w-4 h-4"/>
                                    <a href="">kdpp@phucanh.com.vn</a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4"/>
                                    <a
                                        href="https://goo.gl/maps/tm7CEhMUJiCnY5na7"
                                        target="_blank"
                                        className="yellow"
                                    >
                                        <b>[Bản đồ đường đi]</b>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-3 col-sm-6 m-top5 font-white footer-address">
                            <h4 className="font16 font-thin uppercase"><b>PHÒNG DỰ ÁN VÀ KHÁCH HÀNG DOANH NGHIỆP</b>
                            </h4>
                            <div className="title-line color"></div>
                            <ul className="listitems left-padd0">
                                <li className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4"/>
                                    <a href="">Tầng 5,134 Thái Hà, phường Đống Đa, Hà Nội.</a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Phone className="w-4 h-4"/>
                                    <a href="">1900 2164 (Máy lẻ 2)</a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Phone className="w-4 h-4"/>
                                    <a href="">Hoặc 038 658 6699</a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Mail className="w-4 h-4"/>
                                    <a href="">kdda@phucanh.com.vn</a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4"/>
                                    <a
                                        href="https://goo.gl/maps/5eGDBEAPxfmuth596"
                                        target="_blank"
                                        className="yellow"
                                    >
                                        <b>[Bản đồ đường đi]</b>
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div className="col-md-3 col-sm-6 m-top5 font-white footer-address">
                            <h4 className="font16 font-thin uppercase"><b>SHOWROOM PHÚC ANH 134 THÁI HÀ</b></h4>
                            <div className="title-line color"></div>
                            <ul className="listitems left-padd0">
                                <li className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4"/>
                                    <a href="">134 Thái Hà, phường Đống Đa, Hà Nội.</a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Phone className="w-4 h-4"/>
                                    <a href="">(024) 3968 9966 (Máy lẻ 3)</a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Mail className="w-4 h-4"/>
                                    <a href="">phucanh.thaiha@phucanh.com.vn</a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4"/>
                                    <a href="">Giờ mở cửa từ 08h đến 21h00</a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4"/>
                                    <a
                                        href="https://goo.gl/maps/MXTQaRNwRjJp5Whb9"
                                        target="_blank"
                                        className="yellow"
                                    >
                                        <b>[Bản đồ đường đi]</b>
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div className="col-md-3 col-sm-6 m-top5 font-white footer-address">
                            <h4 className="font16 font-thin uppercase"><b>SHOWROOM PHÚC ANH 89 LÊ DUẨN</b></h4>
                            <div className="title-line color"></div>
                            <ul className="listitems left-padd0">
                                <li className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4"/>
                                    <a href="">89 Lê Duẩn, phường Cửa Nam, Hà Nội.</a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Phone className="w-4 h-4"/>
                                    <a href="">(024) 3968 9966 (Máy lẻ 4)</a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Mail className="w-4 h-4"/>
                                    <a href="">phucanh.leduan@phucanh.com.vn</a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4"/>
                                    <a href="">Giờ mở cửa từ 08h00 đến 21h00</a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4"/>
                                    <a
                                        href="https://goo.gl/maps/vssCMwPuSZvUey378"
                                        target="_blank"
                                        className="yellow"
                                    >
                                        <b>[Bản đồ đường đi]</b>
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div className="col-md-3 col-sm-6 m-top5 font-white footer-address">
                            <h4 className="font16 font-thin uppercase"><b>SHOWROOM PHÚC ANH 141 PHẠM VĂN ĐỒNG</b></h4>
                            <div className="title-line color"></div>
                            <ul className="listitems left-padd0">
                                <li className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4"/>
                                    <a href="">141-143 Phạm Văn Đồng (ngã ba Hoàng Quốc Việt - Phạm Văn Đồng), phường
                                        Phú Diễn, Hà Nội.</a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Phone className="w-4 h-4"/>
                                    <a href="">(024) 3968 9966 (Máy lẻ 5)</a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Mail className="w-4 h-4"/>
                                    <a href="">phucanh.phamvandong@phucanh.com.vn</a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4"/>
                                    <a href="">Giờ mở cửa từ 08h00 đến 21h00</a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4"/>
                                    <a
                                        href="https://goo.gl/maps/HGWR4uGCS8P8nndR7"
                                        target="_blank"
                                        className="yellow"
                                    >
                                        <b>[Bản đồ đường đi]</b>
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div className="col-md-6 nopadding m-top1 bct">
                            <a rel="nofollow"
                               href="http://online.gov.vn/Home/WebDetails/3453?AspxAutoDetectCookieSupport=1"
                               target="_blank" title="Đã đăng ký bộ công thương"><img src={logo1}
                                                                                      alt="Đã đăng ký bộ công thương"/></a>
                            <a rel="nofollow" target="_blank"
                               href="https://www.dmca.com/Protection/Status.aspx?id=d2e94503-0a12-4acf-ab19-8fb8c9e8ef07&amp;refurl=https%3a%2f%2fwww.phucanh.vn%2f&amp;rlo=true"
                               title="DMCA.com Protection Status" className="dmca-badge">
                                <img src="https://www.phucanh.vn/template/2017/images/dmca-phucanh.png" alt="dmca"/></a>
                        </div>
                    </div>
                </div>

            </footer>
            <div className="bg-gray-900 text-white pt-4 pb-4">
                <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
                    <div className="text-xm text-gray-300 text-center md:text-left mb-2 md:mb-0">
                        © 2022 Công ty TNHH Kỹ Nghệ Phúc Anh. GPKD số: 0101417128 do Sở Kế hoạch và Đầu tư TP Hà Nội cấp
                        ngày 07/10/2003
                    </div>
                    <ul className="flex items-center gap-4">
                        <li>
                            <a href="https://www.facebook.com/phucanhsmartworld/" target="_blank" rel="nofollow"
                               title="Facebook" className="text-blue-600 hover:text-blue-400">
                                <Facebook className="w-5 h-5"/>
                            </a>
                        </li>
                        <li>
                            <a href="https://www.youtube.com/channel/UCs78-o0g93nYfHKVy0AJkWA" target="_blank"
                               rel="nofollow" title="Youtube" className="text-red-600 hover:text-red-400">
                                <Youtube className="w-5 h-5"/>
                            </a>
                        </li>
                        <li>
                            <a href="https://zalo.me/2915476565064825313" target="_blank" rel="nofollow" title="Zalo"
                               className="text-blue-500 hover:text-blue-300">
                                <Zap className="w-5 h-5"/>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}