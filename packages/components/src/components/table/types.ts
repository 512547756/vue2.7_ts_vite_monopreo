export interface Pagination {
    current: number;
    pageSize: number;
}
interface EditFiled {
    type: string;
    slot?: string;
}
export interface Column {
    dataIndex?: string;
    title?: string;
    align?: string;
    width?: number | string;
    fixed?: string;
    editFiled?: EditFiled;
    scopedSlots?: Record<"customRender", string>;
    customRender?: (record: any, row: any) => any;
}
