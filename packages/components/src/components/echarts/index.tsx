import { defineComponent, onMounted, nextTick, watch } from "vue";
import * as echarts from "echarts";
import { randomString, EventBus } from "@nnw/utils";

export default defineComponent({
    name: "SyChart",
    props: {
        opts: {
            type: Object as any,
            default: Object.create(null),
        },
        geoJson: {
            type: "" as any,
            default: null,
        },
    },
    setup(prop, { expose }) {
        const uid = randomString();

        let chartInstance: echarts.ECharts | null = null;

        const updateOptions = (opts: any) => {
            if (!chartInstance) {
                return;
            }

            chartInstance.setOption(opts);
        };

        onMounted(() => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const div = document.getElementById(uid)!;
            chartInstance = echarts.init(div, undefined, {
                renderer: "canvas",
            });

            EventBus.addObserve("WindowResize", () => {
                chartInstance?.resize();
            });

            if (prop.geoJson) {
                echarts.registerMap("ZheJiang", prop.geoJson);
            }

            chartInstance.setOption(prop.opts);
            nextTick(() => {
                chartInstance?.resize();
            });
        });

        watch(
            () => prop.opts,
            () => {
                // 先 resize，再 setOptions 否则动画会丢失
                chartInstance?.resize();
                chartInstance?.setOption(prop.opts);
            }
        );

        // vue2.7 支持expose，但是如果升级到3x defineExpose需要向外暴漏
        expose({
            chartInstance,
            updateOptions,
        });

        return () => {
            return <div id={uid} style={{ width: "100%", height: "100%" }}></div>;
        };
    },
});
