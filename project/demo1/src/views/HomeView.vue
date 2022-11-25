<template>
    <div>
        <a-divider>Form</a-divider>
        {{ form }}
        <SyForm :fields="fields" :labelWidth="145" cancelText="取消" v-model="form" />
        <a-divider>Search</a-divider>
        {{ queryCondition }}
        <SySearch :fields="searchFields" v-model="queryCondition" @search="search" @reset="reset" />
        <a-divider>table</a-divider>
        {{ tableData }}
        <SyTable :enableIndex="true" :resetColumns="columns" :dataSource="tableData">
            <template #stockNum="{ row }">
                <a-select
                    style="width: 100%"
                    v-model="row.stockNum"
                    allowClear
                    placeholder="请选择料仓"
                    :options="[{ label: 123, value: 1 }]" />
            </template>
            <template #material="{ row }">
                <a-select
                    style="width: 100%"
                    v-model="row.material"
                    allowClear
                    placeholder="请选择料仓"
                    :options="[{ label: 222, value: 1 }]" />
            </template>
            <template #action="{ row }">
                <a class="actionBtn text_warning" @click="del(row)">删除</a>
                <a-divider type="vertical" />
                <a class="actionBtn text_warning" @click="add">新增</a>
            </template>
        </SyTable>

        <a-divider>横向柱状图</a-divider>
        <div style="width: 100%; height: 200px">
            <HbarChart :flowDirectionList="flowDirectionList" />
        </div>
        <a-divider>柱状图</a-divider>
        <div style="width: 100%; height: 200px">
            <VbarChart :shiftList="shiftList"></VbarChart>
        </div>
        <a-divider>折线面积图</a-divider>
        <div style="width: 100%; height: 200px">
            <SyChart :opts="lineOpts"></SyChart>
        </div>
        <a-divider>饼图</a-divider>
        <div style="width: 100%; height: 200px">
            <SyChart :opts="PieOpts"></SyChart>
        </div>
        <a-divider>环形图</a-divider>
        <div style="width: 100%; height: 200px">
            <SyChart :opts="rangeOptsList"></SyChart>
        </div>
        <a-divider>echarts地图</a-divider>
        <div style="width: 100%; height: 800px">
            <!-- <SyChart :opts="mapOpts" :geoJson="mapJson"></SyChart> -->
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import moment from "moment";
import mapJson from "@/assets/330000.geo.json";
import {
    SyForm,
    generateForm,
    Fields,
    Field,
    SySearch,
    generateSearch,
    SyTable,
    Column,
    SyChart,
    createLineOpts,
    createPieOpts,
    createPieSeriesItem,
    createGradientColors,
    createLineSeriesItem,
} from "@nnw/components";
import HbarChart from "@/components/HbarChart.vue";
import VbarChart from "@/components/VbarChart.vue";

import fromPairs from "lodash/fromPairs";
import cloneDeep from "lodash/cloneDeep";
import throttle from "lodash/throttle";
import { EventBus } from "@nnw/utils";
// 环形图
const createRangData = () => {
    const datas = [];
    const base = [
        { Minimum: "0", Maximum: "50" },
        { Minimum: "50", Maximum: "100" },
        { Minimum: "100", Maximum: "150" },
        { Minimum: "150", Maximum: "200" },
    ];
    for (let index = 0; index < base.length; index++) {
        datas.push({
            range: base[index],
            rangeFormat: `${base[index].Minimum}-${base[index].Maximum}`,
            count: Math.floor(Math.random() * 1000).toString(),
        });
    }
    return datas;
};
const rangeData = ref(createRangData());

const rangeOptsList = computed(() => {
    const priceColors = ["#1EC873", "#FFA200", "#3880F9", "#B945FF"];
    const values = rangeData.value?.map((item) => {
        return {
            value: Number(item.count),
        };
    });

    const formatter = () => {
        // if (list.every((item) => item.count == "0")) {
        //     return "{c}张";
        // }
        return "{c}\n{d}% ";
    };

    const pieOpts = createPieOpts(priceColors);
    pieOpts.series = [createPieSeriesItem(values)];
    pieOpts.series[0].label = {
        show: true,
        formatter: formatter(),
        backgroundColor: "rgba(9, 161, 208, 0.2)",
        color: "#fff",
        fontSize: 12,
        padding: [2, 6],
    };
    pieOpts.series[0].labelLine = {
        show: true,
        smooth: true,
        length: 5,
        length2: 5,
    };
    return pieOpts;
});
// 饼图
const createPieData = () => {
    const datas = [];
    for (let index = 1; index < 4; index++) {
        datas.push({
            type: `类型${index}`,
            count: Math.floor(Math.random() * 1000).toString(),
            price: Math.floor(Math.random() * 1000).toString(),
        });
    }
    return datas;
};
const PieData = ref(createPieData());
const PieOpts = computed(() => {
    const ticketTypeColors: Record<string, string> = {
        类型1: "#FFA200",
        类型2: "#3880F9",
        类型3: "#1EC873",
    };
    const list = PieData.value.map((item) => {
        return {
            ...item,
            color: ticketTypeColors[item.type],
        };
    });
    const formatter = () => {
        if (list.every((item) => item.count == "0")) {
            return "{c}张";
        }
        return "{c}张\n{d}%";
    };
    const values = list.map((item) => {
        return {
            value: Number(item.count),
        };
    });
    const pieOpts = createPieOpts(list.map((item) => item.color) ?? []);
    const pieSeriesItem = createPieSeriesItem(values, false);
    pieSeriesItem.top = 5;
    pieSeriesItem.left = 5;
    pieSeriesItem.right = 5;
    pieSeriesItem.bottom = 10;
    pieSeriesItem.label = {
        show: true,
        formatter: formatter(),
        backgroundColor: "rgba(9, 161, 208, 0.2)",
        color: "#fff",
        fontSize: 12,
        padding: [2, 6],
    };
    pieSeriesItem.labelLine = {
        show: true,
        smooth: true,
        length: 5,
        length2: 5,
    };
    pieSeriesItem.radius = [0, "60%"];
    pieOpts.series = [pieSeriesItem];
    return pieOpts;
});

// 折线图
const createLineDatas = () => {
    const datas = [];
    for (let index = 0; index < 12; index++) {
        const format = (n: number) => {
            return n < 10 ? `0${n}` : `${n}`;
        };
        datas.push({
            dateFormat: `${format(index)}:00`,
            count: Math.floor(Math.random() * 1000).toString(),
        });
    }
    return datas;
};
const lineData = ref(createLineDatas());

const lineOpts = computed(() => {
    const lineCategorys: string[] = [];
    const lineValues: string[] = [];
    lineCategorys.push(
        ...lineData.value.map((item) => {
            return item.dateFormat.toString();
        })
    );
    const lineOpts = createLineOpts(
        [createGradientColors(["rgba(255, 162, 0, 1)", "rgba(255, 162, 0, 0)"])],
        lineCategorys
    );
    lineValues.push(...lineData.value.map((item) => item.count));
    lineOpts.series = [createLineSeriesItem(lineValues, true, {})];
    return lineOpts;
});

// 地图
const ningboCoord = [121.62, 29.86];
const zheJiangOtherCoords = [
    {
        name: "绍兴",
        coords: [120.58, 30.05],
    },
    {
        name: "宁波",
        coords: [121.62, 29.86],
    },
    {
        name: "湖州",
        coords: [120.09, 30.89],
    },
    {
        name: "金华",
        coords: [119.65, 29.08],
    },
    {
        name: "丽水",
        coords: [119.92, 28.47],
    },
    {
        name: "温州",
        coords: [120.7, 27.99],
    },
    {
        name: "衢州",
        coords: [118.86, 28.97],
    },
    {
        name: "台州",
        coords: [121.42, 28.66],
    },
    {
        name: "嘉兴",
        coords: [120.76, 30.75],
    },
    {
        name: "舟山",
        coords: [122.21, 29.99],
    },
];
const symbolPath =
    "'path://M30.9,53.2C16.8,53.2,5.3,41.7,5.3,27.6S16.8,2,30.9,2C45,2,56.4,13.5,56.4,27.6S45,53.2,30.9,53.2z M30.9,3.5C17.6,3.5,6.8,14.4,6.8,27.6c0,13.3,10.8,24.1,24.101,24.1C44.2,51.7,55,40.9,55,27.6C54.9,14.4,44.1,3.5,30.9,3.5z M36.9,35.8c0,0.601-0.4,1-0.9,1h-1.3c-0.5,0-0.9-0.399-0.9-1V19.5c0-0.6,0.4-1,0.9-1H36c0.5,0,0.9,0.4,0.9,1V35.8z M27.8,35.8 c0,0.601-0.4,1-0.9,1h-1.3c-0.5,0-0.9-0.399-0.9-1V19.5c0-0.6,0.4-1,0.9-1H27c0.5,0,0.9,0.4,0.9,1L27.8,35.8L27.8,35.8z'";
const linesSeries = zheJiangOtherCoords.map((v, index) => {
    return {
        type: "lines",
        zlevel: index + 101,
        effect: {
            constantSpeed: 30,
            show: true,
            color: "red",
            symbol: "pin",
            symbolSize: 3,
            trailLength: 0.3,
        },
        symbol: ["circle", "arrow"],
        symbolSize: 5,
        lineStyle: {
            color: "rgba(0, 254, 255, 0.3)",
            width: 0.5,
            curveness: 0.2,
        },
        data: [
            {
                coords: [ningboCoord, v.coords],
            },
        ],
    };
});

const mapOpts = {
    color: ["#012746"],
    geo: {
        map: "ZheJiang",
        selectedMode: "single",
        zlevel: 99,
        bottom: 60,
        left: 60,
        right: 60,
        top: 60,
        show: true,
        layoutCenter: ["50%", "50%"],
        label: {
            show: true,
            color: "#2763A4",
        },
        itemStyle: {
            areaColor: "transparent",
            borderColor: "#2763A4",
            borderWidth: 1,
        },
        emphasis: {
            label: {
                color: "#2763A4",
            },
            itemStyle: {
                areaColor: "#6AA8EE",
            },
        },
        select: {
            label: {
                color: "#fff",
            },
            itemStyle: {
                areaColor: "#6AA8ff99",
            },
        },
        regions: [
            {
                name: "宁波市",
                selected: true,
            },
        ],
    },
    series: [
        {
            // effectScatter画散点【起点】
            type: "effectScatter",
            coordinateSystem: "geo",
            zlevel: 100,
            symbolSize: 15,
            symbol: symbolPath,
            symbolRotate: -90,
            rippleEffect: {
                period: 3,
                brushType: "fill",
                scale: 3,
                number: 3,
            },
            itemStyle: {
                color: "#00feff",
                opacity: 0.7,
            },
            data: [[121.62, 29.86]],
        },
        ...linesSeries,
    ],
};

// 柱状图
const createFlowItem = () => {
    const datas = [];
    for (let index = 0; index < 10; index++) {
        datas.push({
            target: `我是数据${index}`,
            count: Math.floor(Math.random() * 1000).toString(),
        });
    }
    return datas;
};
const flowDirectionList = ref(createFlowItem());

const createBarDatas = () => {
    const datas = [];
    for (let index = 0; index < 8; index++) {
        const date = moment().subtract(index, "day");
        datas.push({
            dateFormat: moment(date).format("YYYY-MM-DD"),
            count: Math.floor(Math.random() * 1000).toString(),
        });
    }
    return datas;
};
const shiftList = ref(createBarDatas());

const onResize = throttle(() => {
    EventBus.post("WindowResize");
}, 500);

window.onresize = onResize;

// form
const form: any = ref(null);
const fields = computed(() => {
    const list: Fields = [
        {
            label: "登记时间",
            key: "registerTime",
            type: "input",
            required: true,
            col: 12,
        },
    ];
    return list;
});
const setForm = () => {
    form.value = Object.assign({}, generateForm(fields.value));
};

setForm();

// search
const searchFields = computed(() => {
    const list: Field[] = [
        {
            label: "试块编号",
            placeholder: "请输入试块编号",
            key: "blockNum",
            type: "input",
        },
    ];
    return list;
});

const queryCondition = ref({});

const setSearch = (data = generateSearch((searchFields.value || []) as any)) => {
    queryCondition.value = data;
};

setSearch();

const search = (v: any) => {
    console.log(v);
};

const reset = (v: any) => {
    setSearch();
};

// table
const columns = computed(() => {
    const list: Column[] = [
        {
            dataIndex: "stockNum",
            title: "料仓",
            align: "center",
            editFiled: {
                type: "select",
                slot: "stockNum",
            },
        },
        {
            dataIndex: "material",
            title: "材料",
            align: "center",
            editFiled: {
                type: "select",
                slot: "material",
            },
        },
        {
            dataIndex: "tableName",
            title: "工控表",
            align: "center",
            editFiled: {
                type: "input",
            },
        },
        {
            dataIndex: "filedName",
            title: "字段名",
            align: "center",
            editFiled: {
                type: "input",
            },
        },
        {
            dataIndex: "designFiledName",
            title: "设计值字段名",
            align: "center",
            editFiled: {
                type: "input",
            },
        },
        {
            dataIndex: "actFiledName",
            title: "实际值字段名",
            align: "center",
            editFiled: {
                type: "input",
            },
        },
        {
            dataIndex: "waterFiledName",
            title: "含水量字段名 ",
            align: "center",
            editFiled: {
                type: "input",
            },
        },
        {
            title: "操作",
            align: "center",
            scopedSlots: { customRender: "action" },
        },
    ];
    return list;
});

const tableData = ref<any[]>([]);
const generateEmptyTableRow = () => {
    return cloneDeep(
        fromPairs(
            columns.value
                .filter((col) => col.title !== "操作")
                .map((v: any) => {
                    return [v.dataIndex, v?.value];
                })
        )
    );
};
const add = () => {
    tableData.value.push(generateEmptyTableRow());
};
add();

const del = (row: any) => {
    const idx = tableData.value.findIndex((item) => row._X_ROW_KEY === item._X_ROW_KEY);
    tableData.value.splice(idx, 1);
    console.log(row);
};
</script>
<style scoped></style>
