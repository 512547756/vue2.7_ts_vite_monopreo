import { AxiosError } from "axios";

/**
 * ajax 错误处理
 * @param err
 * @returns
 */
export const errorHandler = (err: AxiosError<any, any>) => {
    const status = err?.response?.status;

    const msg = err?.response?.data?.message || "未知错误，请联系管理员";

    switch (status) {
        case 401:
            return Promise.reject(err);
        default:
            return Promise.reject(msg);
    }
};
