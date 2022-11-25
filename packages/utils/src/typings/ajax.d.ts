declare namespace Ajax {
    /**
     * @description ajax res基础返回体
     * @export
     * @interface Response
     * @template T
     */
    export interface Response<T = any> {
        // .java
        code: number;
        success: boolean;
        data?: T;
        result?: T;
        // .net
        Data: T;
        Message: string;
        State: string;
    }
}
