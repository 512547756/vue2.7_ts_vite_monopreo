<template>
    <div v-if="shiftList" class="chart_content pd_20">
        <SyChart :opts="opts"></SyChart>
    </div>
</template>

<script setup lang="ts">
import { SyChart } from "@nnw/components";
import { createBarOpts, createBarSeriesItem, createGradientColors } from "@nnw/components";
import { computed } from "vue";
import moment from "moment";

interface CountDateItem {
    dateFormat: string;
    count: string;
}

interface Props {
    shiftList?: CountDateItem[];
}

const props = defineProps<Props>();

const opts = computed(() => {
    const categorys: string[] = [];
    const values: string[] = [];

    props.shiftList?.forEach((item) => {
        categorys.push(moment(item.dateFormat).format("YYYY-MM-DD"));
        values.push(item.count);
    });

    const barOpts = createBarOpts([createGradientColors(["#04FEAC", "#1EE554"])], categorys);

    barOpts.series = [createBarSeriesItem(values)];

    return barOpts;
});
</script>

<style scoped lang="less">
.chart_content {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
}
</style>
