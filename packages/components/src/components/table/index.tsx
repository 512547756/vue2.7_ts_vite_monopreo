import { defineComponent, PropType, ref, computed, watch, h, onMounted, onUpdated } from "vue";
import { Pagination, Column } from "./types";
import { Rule } from "../form/types";
import RenderField from "../form/render-field";
import isFunction from "lodash/isFunction";
import fromPairs from "lodash/fromPairs";

export default defineComponent({
    name: "SyTable",
    props: {
        dataSource: {
            // 数据源
            type: Array,
            default: () => [],
        },
        pagination: {
            // 分页
            type: Object as PropType<Pagination>,
            default: () => ({
                current: 1,
                pageSize: 10,
            }),
        },
        enableCheckInterceptor: {
            // 是否允许勾选的方法，该方法的返回值用来决定这一行的 checkbox 是否可以勾选
            type: Function as PropType<({ row }: any) => boolean>,
            default: () => {
                return true;
            },
        },
        footerMethod: {
            // 表尾的数据设置方法
            type: Function as PropType<({ columns, data }: any) => any[][]>,
        },
        rowClassName: {
            // 给行附加 className
            type: Function as PropType<string | (({ $rowIndex, column, columnIndex, $columnIndex }: any) => any)>,
            default: () => {
                return "col-gray";
            },
        },
        footerCellClassName: {
            // 给表尾的单元格附加 className
            type: Function as PropType<string | (({ $rowIndex, column, columnIndex, $columnIndex }: any) => any)>,
            default: () => {
                return "col-gray";
            },
        },
        editMode: {
            // 编辑触发形式 cell , row
            type: String,
            default: "cell",
        },
        editTrigger: {
            // 编辑触发方式 click, dblclick
            type: String,
            default: "click",
        },
        enableIndex: {
            // 是否启用序号列
            type: Boolean,
            default: true,
        },
        enableChecked: {
            // 是否启用复选框
            type: Boolean,
            default: false,
        },
        fixedIndex: {
            // 将列固定在左侧或者右侧（注意：固定列应该放在左右两侧的位置） left（固定左侧）, right（固定右侧）
            type: String,
            default: "",
        },
        resetColumns: {
            // columns
            type: Array as PropType<Column[]>,
            default: () => [],
        },
        extendRules: {
            // 扩展的rules规则
            type: Object as PropType<Record<string, Rule[]>>,
            default: () => ({}),
        },
        loadingValue: {
            // loading
            type: Boolean,
            default: false,
        },
    },
    setup(prop, { emit, slots, expose }) {
        const tableRef = ref(); // table实例
        const rules = ref({});
        /** 创建默认表单验证规则 */
        const generateRule = () => {
            rules.value = fromPairs(
                prop.resetColumns
                    .filter((item: any) => item?.editFiled?.required)
                    .map(({ title, dataIndex }) => {
                        return [
                            dataIndex,
                            [
                                {
                                    required: true,
                                    message: `${title}不可为空`,
                                },
                                ...(prop.extendRules?.[dataIndex as string] || []),
                            ],
                        ];
                    })
            );
        };

        const seqMethod = ({ rowIndex }: any) => {
            const { current, pageSize } = prop.pagination;
            if (current) {
                return (current - 1) * pageSize + rowIndex + 1;
            }
            return rowIndex + 1;
        };

        const getColumnProps = (item: Column) => {
            const props = {
                field: item.dataIndex as string,
                title: item.title as string,
                align: item.align || "center",
                fixed: item.fixed,
            };
            if (item.width) {
                Object.assign(props, { width: item.width });
            }
            return props;
        };

        const renderContent = (column: Column, row: any, index: any) => {
            if (isFunction(column?.customRender)) {
                return column?.customRender(row[column.dataIndex as string], row);
            }
            if (column?.scopedSlots?.customRender) {
                return slots[column?.scopedSlots?.customRender]?.({
                    text: row[column.dataIndex as string],
                    row,
                    index,
                });
            }

            return <span>{row[column.dataIndex as string]}</span>;
        };

        const validAll = async () => {
            const errMap1 = await tableRef.value.validate(true).catch((errMap: any) => errMap);
            if (errMap1) {
                return false;
            }
            return true;
        };

        const selectAllEvent = ({ checked, records }: any) => {
            emit("change", { checked, records });
        };

        const selectChangeEvent = ({ checked, records }: any) => {
            emit("change", { checked, records });
        };

        const renderItem = ({ column, index }: any) => {
            const fileds = {
                props: getColumnProps(column),
                scopedSlots: {
                    default: ({ row }: any) => {
                        return column.type === "expand" ? "" : renderContent(column, row, index);
                    },
                    // 新增展开行功能
                    content: ({ row }: any) => {
                        return renderContent(column, row, index);
                    },
                },
            };

            if (column.children) {
                return (
                    <vxe-table-column
                        {...{ props: fileds.props }}
                        scopedSlots={fileds.scopedSlots}
                        title={fileds.props.title}>
                        {column.children.map((item: any, i: any) => renderItem({ column: item, index: i }))}
                    </vxe-table-column>
                );
            }

            // 针对编辑表格
            if (column.editFiled) {
                Object.assign(column.editFiled, { label: fileds.props.title });
                const renderEdit = ({ row }: any) => {
                    if (isFunction(column.editFiled?.customRender)) {
                        return column.editFiled?.customRender(row[fileds.props.field], row);
                    }

                    if (column.editFiled?.slot) {
                        return slots[column.editFiled.slot]?.({
                            text: row[fileds.props.field],
                            row,
                        });
                    }
                    return (
                        <RenderField
                            {...{
                                props: {
                                    data: column.editFiled,
                                    value: row[fileds.props.field],
                                    disabled: column.editFiled.disabled,
                                },
                                on: {
                                    "update:value": (v: any) => {
                                        row[fileds.props.field] = v;
                                    },
                                },
                            }}
                        />
                    );
                };
                const scopedSlots = {
                    edit: renderEdit,
                    default: renderEdit,
                };
                Object.assign(fileds.props, {
                    "edit-render": {
                        placeholder: "请点击输入",
                        enabled: column.editFiled,
                        autoselect: true,
                    },
                });
                return <vxe-table-column {...{ props: fileds.props }} scopedSlots={scopedSlots}></vxe-table-column>;
            }
            return <vxe-table-column {...{ props: fileds.props }} scopedSlots={fileds.scopedSlots}></vxe-table-column>;
        };

        const render = () => {
            return (
                <vxe-table
                    ref={tableRef}
                    resizable
                    auto-resize
                    border
                    show-footer={prop.footerMethod ? true : false}
                    data={prop.dataSource}
                    loading={prop.loadingValue}
                    {...{
                        on: {
                            "checkbox-all": selectAllEvent,
                            "checkbox-change": selectChangeEvent,
                        },
                        props: {
                            "checkbox-config": {
                                checkMethod: prop.enableCheckInterceptor,
                                strict: true,
                            },
                            "seq-config": {
                                seqMethod,
                            },
                            "edit-config": {
                                trigger: prop.editTrigger,
                                mode: prop.editMode,
                            },
                            "footer-method": prop.footerMethod,
                            "edit-rules": rules.value,
                            "row-class-name": prop.rowClassName,
                            "footer-cell-class-name": prop.footerCellClassName,
                        },
                    }}>
                    {/* visible得配合refreshColumn使用 */}
                    <vxe-table-column type="checkbox" width={40} visible={prop.enableChecked}></vxe-table-column>

                    {prop.enableIndex && (
                        <vxe-table-column title="序号" type="seq" width="60" align="center" fixed={prop.fixedIndex} />
                    )}

                    {prop.resetColumns.map((column, index) => {
                        return renderItem({ column, index });
                    })}
                </vxe-table>
            );
        };

        watch(
            () => [prop.extendRules, prop.resetColumns],
            ([newV, newV1]) => {
                if (newV || newV1) {
                    generateRule();
                }
            }
        );

        onMounted(() => {
            tableRef.value.refreshColumn();
            generateRule();
        });

        onUpdated(() => {
            tableRef.value.refreshColumn();
        });

        // vue2.7 支持expose，但是如果升级到3x defineExpose需要向外暴漏
        expose({
            validAll,
        });

        return () => {
            return render();
        };
    },
});
