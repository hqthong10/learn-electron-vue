export interface IDevice {
    path: string;
    manufacturer?: string;
    serialNumber?: string;
    vendorId?: number;
    productId?: number;
    product?: string;
    release?: number;
    interface?: number;
    usagePage?: number;
    usage?: number;
}