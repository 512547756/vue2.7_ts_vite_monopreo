import { defineComponent, PropType, ref, computed, watch, h } from "vue";
import fromPairs from "lodash/fromPairs";
import cloneDeep from "lodash/cloneDeep";
import take from "lodash/take";
import { Field } from "../form/types";
import RenderField from "../form/render-field";
export const generateSearch = (fields: Field[]) => {
    return cloneDeep(fromPairs(fields.map((item) => [item.key, item.value]))) || {};
};

export default defineComponent({
    name: "SySearch",
    props: {
        fields: {
            // 需要的字段
            type: Array as PropType<Field[]>,
            default: () => [],
        },
        min: {
            // 最小显示数
            type: Number,
            default: 3,
        },
        loading: {
            // 是否展示loading
            type: Boolean,
            default: false,
        },
        value: {
            // 接收的v-model的值
            type: Object as PropType<any>,
            required: true,
            default: () => ({}),
        },
    },
    emits: ["update:value", "update:query", "reset", "search"],
    setup(prop, { emit, slots }) {
        const form = computed({
            get() {
                return prop.value;
            },
            set(v) {
                emit("update:value", v);
            },
        });

        // 是否展开
        const expand = ref<boolean>(false);

        // 显示的字段
        const showFields = computed<Field[]>(() => {
            return take(prop.fields, expand.value ? prop.fields.length : prop.min);
        });

        const hasExceed = computed<boolean>(() => {
            return prop.fields.length > prop.min;
        });

        const setForm = () => {
            form.value = generateSearch(prop.fields);
        };

        setForm();

        const handleReset = () => {
            setForm();
            emit("reset", form.value);
        };

        const toggleExpand = () => {
            expand.value = !expand.value;
        };

        const renderForm = (item: any) => {
            return (
                <RenderField
                    data={item}
                    value={form.value[item.key]}
                    {...{
                        on: {
                            "update:value": (v: any) => {
                                form.value[item.key] = v;
                            },
                        },
                    }}
                />
            );
        };

        const renderCol = () => {
            return showFields.value.map((item, index) => {
                const labelWidth = item.labelWidth || 80;
                return (
                    <a-col
                        xl={{ span: item?.colSpan ? item?.colSpan : item.label ? 6 : 4 }}
                        xs={{ span: 6 }}
                        lg={{ span: item?.colSpan ? item?.colSpan : item.label ? 6 : 4 }}
                        key={item.key}>
                        {item.jsx?.(h) ||
                            slots[item.slot]?.({ data: item, index }) ||
                            (item.label ? (
                                <a-row type="flex">
                                    <a-col
                                        flex={`${labelWidth}px`}
                                        class={"ant-form-item-label"}
                                        style={{ lineHeight: "32px", textAlign: "left" }}>
                                        <label title={item.label}>{item.label}</label>
                                    </a-col>
                                    <a-col style={{ width: `calc(100% - ${labelWidth}px)` }}>{renderForm(item)}</a-col>
                                </a-row>
                            ) : (
                                renderForm(item)
                            ))}
                    </a-col>
                );
            });
        };

        const renderButton = () => {
            return (
                <a-col
                    xl={{ span: showFields.value[0].label ? 6 : 4 }}
                    xs={{ span: 6 }}
                    lg={{ span: showFields.value[0].label ? 6 : 4 }}>
                    <div class={{ "search__button--end": expand.value }}>
                        <a-space style="width:100%">
                            <a-button onClick={() => emit("search", form.value)} type="primary" icon="search">
                                查询
                            </a-button>
                            <a-button onClick={() => handleReset()} icon="reload">
                                重置
                            </a-button>
                            {hasExceed.value ? (
                                <a-button
                                    type="link"
                                    underline={false}
                                    onClick={() => toggleExpand()}
                                    icon={!expand.value ? "down" : "up"}>
                                    {expand.value ? "收起" : "展开"}
                                </a-button>
                            ) : null}
                        </a-space>
                    </div>
                </a-col>
            );
        };

        watch(
            // 更新查询条件
            () => form.value,
            (v) => {
                emit("update:query", v);
            }
        );

        return () => {
            return (
                <a-row gutter={[30, 10]} style={{ flexFlow: "wrap" }}>
                    {renderCol()}
                    {renderButton()}
                </a-row>
            );
        };
    },
});
