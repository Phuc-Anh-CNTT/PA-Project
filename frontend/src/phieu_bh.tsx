// Interface cho type data backend
export interface PhieuBHById {
    id: number;
    so_phieu_nhan: string;
    ten_khach: string;
    sdt: string;
    mo_ta_loi_luc_tiep_nhan?: string;
    ngay_nhan?: string;
    ngay_hen_tra?: string;
    ngay_tra?: string;
}

// Class tiện xử lý
export class PhieuBHByIdModel {
    id: number;
    so_phieu_nhan: string;
    ten_khach: string;
    sdt: string;
    mo_ta_loi_luc_tiep_nhan?: string;
    ngay_nhan?: string;
    ngay_hen_tra?: string;
    ngay_tra?: string;

    constructor(data: any) {
        this.id = data.id;
        this.so_phieu_nhan = data.so_phieu_nhan;
        this.ten_khach = data.ten_khach;
        this.sdt = data.sdt;
        this.mo_ta_loi_luc_tiep_nhan = data.mo_ta_loi_luc_tiep_nhan;
        this.ngay_nhan = data.ngay_nhan;
        this.ngay_hen_tra = data.ngay_hen_tra;
        this.ngay_tra = data.ngay_tra;
    }

    formatDate(date?: string) {
        if (!date) return "—";
        const d = new Date(date);
        const day = d.getDate().toString().padStart(2, "0");
        const month = (d.getMonth() + 1).toString().padStart(2, "0");
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    }
}

export interface PhieuBHsdt {
    id: number;
    so_phieu_nhan: string;
    ten_khach: string;
    sdt: string;
    ngay_nhan?: string;
    ngay_hen_tra?: string;
    ngay_tra?: string;
    so_luong?: number;
}

// Class để tiện method xử lý (ví dụ format ngày)
export class PhieuBHsdtModel {
    id: number;
    so_phieu_nhan: string;
    ten_khach: string;
    sdt: string;
    ngay_nhan?: string;
    ngay_hen_tra?: string;
    ngay_tra?: string;
    so_luong?: number;

    constructor(data: any) {
        this.id = data.id;
        this.so_phieu_nhan = data.so_phieu_nhan;
        this.ten_khach = data.ten_khach;
        this.sdt = data.sdt;
        this.ngay_nhan = data.ngay_nhan;
        this.ngay_hen_tra = data.ngay_hen_tra;
        this.ngay_tra = data.ngay_tra;
        this.so_luong = data.so_luong;
    }

    formatDate(date?: string) {
        if (!date) return "—";
        const d = new Date(date);
        const day = d.getDate().toString().padStart(2, "0");
        const month = (d.getMonth() + 1).toString().padStart(2, "0");
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    }
}