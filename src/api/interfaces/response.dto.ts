export interface ResponseDto {
    meta: object[];
    data: string[][];
    statistic: {
        elapsed: number,
        rows_read: number,
        bytes_read: number
    };
}
