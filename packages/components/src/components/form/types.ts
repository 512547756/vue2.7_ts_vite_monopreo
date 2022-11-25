export interface Field {
    labelWidth?: number;
    /** 表单类型 */
    type?:
        | "input"
        | "number"
        | "select"
        | "switch"
        | "checkbox-group"
        | "textarea"
        | "date"
        | "date-range"
        | "radio-group";
    // col 栅格布局 的sapn
    colSpan?: number;
    /** 默认值 */
    value?: any;
    /** 表单键 */
    key: string;
    /** 占位符 */
    placeholder?: string;
    /** select或者radio选项 */
    option?: Array<{
        label: string;
        value: string | number;
        icon?: string;
        disabled?: boolean;
    }>;
    /** 单位 */
    unit?: string;
    /** 辅助文本 */
    text?: string;
    /** radio icon */
    icon?: string;
    /** jsx */
    jsx?: any;
    /** jsx */
    slot?: any;
    label: string;
    disabled?: boolean;
    enabledShowSearch?: boolean; // select 是否支持搜索
    // input-number 最大、最小值等相关参数
    min?: number;
    max?: number;
    // 每次改变步数，可以为小数
    step?: number;
    // 0 整数 1 保留一位小数 2保留两位小数...
    precision?: number;
    // input 最大长度
    maxLength?: number;
    // date 禁用今日之后日期
    afterDate?: boolean;
    // date 禁用今日之前日期
    beforeDate?: boolean;
    // 显示时间
    showTime?: boolean;
    // 日期格式化
    dateValueFormat?: string;
    //add/edit/detail
    formStatus?: string;
    mode?: string;
    asyncOption?: () => Promise<Array<Option | Group>>;
    valueFormat?: (v: any) => any;
    disabledDate?: (currentDate: any) => any;
    lazyFormat?: boolean;
}

export interface Option {
    label: string;
    value: any;
    disabled?: boolean;
}

export interface Group {
    title: string;
    group: {
        label: string;
        value: any;
        disabled?: boolean;
    }[];
}

export interface FJsx {
    type: "jsx";
    jsx: (h: any) => any;
    col?: number;
    hide?: boolean;
}

export interface FSlot {
    type: "slot";
    slot: string;
    col?: number;
    hide?: boolean;
}

/** 不同分辨率占比 */
export interface Span {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    xxl?: number;
}

export interface FormItem extends Field {
    span?: Span;
    required?: boolean;
    col?: number;
    addWhitespace?: boolean;
    /** item 类型 */
    tagType?: "jsx" | "slot" | "default";
    hide?: boolean;
}

export type Fields = Array<FormItem | FJsx | FSlot>;

export interface Rule {
    required?: boolean; //是否必选
    message?: string; //校验文案
    trigger?: "blur" | "change" | ["change", "blur"]; //校验触发的时机
    enum?: string; //枚举类型
    len?: number; //字段长度
    max?: number; //最大长度
    min?: number; //最小长度
    pattern?: RegExp; //正则表达式校验
    validator?: (rule: any, value: any, callback: any) => void; //自定义校验（注意，callback 必须被调用）
    whitespace?: boolean; //必选时，空格是否会被视为错误
}
