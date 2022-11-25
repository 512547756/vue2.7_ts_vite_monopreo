import "ant-design-vue/dist/antd.css";
import Antd from "ant-design-vue";
import Vue from "vue";
import SySearch, { generateSearch } from "./src/components/search";
import SyForm, { generateForm } from "./src/components/form";
import SyTable from "./src/components/table";
import { Column, Pagination } from "./src/components/table/types";
import { Fields, Field, FormItem, Rule } from "./src/components/form/types";
import SyChart from "./src/components/echarts";
import { ColorStop, Colors, BarDirectionEnum } from "./src/components/echarts/types";
import {
    // 渐变色
    createGradientColors,
    // 柱状图
    createBarOpts,
    createBarSeriesItem,
    // 饼图
    createPieOpts,
    createPieSeriesItem,
    // 折线图
    createLineOpts,
    createLineSeriesItem,
} from "./src/components/echarts/opts";
import VXETable from "vxe-table";
import "vxe-table/lib/style.css";

Vue.use(Antd);
Vue.use(VXETable);

export {
    //  搜索
    SySearch,
    generateSearch,
    //  表单
    SyForm,
    generateForm,
    //  表格
    SyTable,
    //  图表
    SyChart,
    BarDirectionEnum,
    createGradientColors,
    createBarOpts,
    createBarSeriesItem,
    createPieOpts,
    createPieSeriesItem,
    createLineOpts,
    createLineSeriesItem,
};
export type { Fields, Field, FormItem, Column, Pagination, Rule, ColorStop, Colors };
