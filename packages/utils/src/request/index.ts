import Axios from "../lib/Axios";
import { errorHandler } from "./errorHandler";
import requestInterceptor from "./reuqestInterceptor";
import responseInterceptors from "./responseInterceptors";

const api = new Axios({ baseURL: "process.env.VUE_APP_API" });

api.instance.interceptors.request.use(
    (config) => {
        return requestInterceptor(config);
    },
    (err) => Promise.reject(err)
);

api.instance.interceptors.response.use(
    (res) => {
        if (![200].includes(res.data?.code) && res.data?.message) {
            // 冲突异常，用户可操作 code 码
            if (![50001].includes(res.data?.code)) {
                return Promise.reject(res);
            }
        }
        return responseInterceptors(res);
    },
    (err) => errorHandler(err)
);

export default api;
