import fromPairs from "lodash/fromPairs";
import cloneDeep from "lodash/cloneDeep";
import RenderField from "./render-field";
import { FormModel } from "ant-design-vue";
import { Fields, Rule } from "./types";
import { defineComponent, PropType, ref, computed, watch, nextTick, h, set, getCurrentInstance } from "vue";

export const generateForm = (fields: Fields) => {
    return fromPairs(
        fields
            .filter((item: any) => !["jsx", "slot"].includes(item.type as string))
            .map((item: any) => {
                return [item.key, item.value];
            })
    );
};

export default defineComponent({
    name: "SyForm",
    props: {
        fields: {
            // 表单的字段json
            type: Array as PropType<any>,
            default: () => [],
        },
        labelWidth: {
            // label的宽度
            type: Number,
            default: 80,
        },
        layout: {
            // 排列类型
            type: String as PropType<"horizontal" | "vertical" | "inline">,
            default: "horizontal",
        },
        validateOnRuleChange: {
            // 是否在 rules 属性改变后立即触发一次验证
            type: Boolean,
            default: false,
        },
        submitting: {
            // 提交时的loading
            type: Boolean,
            default: false,
        },
        buttonVisible: {
            // 是否显示操作按钮
            type: Boolean,
            default: true,
        },
        extendRules: {
            // 自定义的扩展的规则
            type: Object as PropType<Record<string, Rule[]>>,
            default: () => ({}),
        },
        allDisabled: {
            // 全部禁用
            type: Boolean,
            default: false,
        },
        cancelText: {
            // 取消按钮的文字
            type: String,
            default: "重置",
        },
        submitText: {
            // 取消按钮的文字
            type: String,
            default: "确定",
        },
        footBtnOffsetTop: {
            // 底部按钮向上的偏移量
            type: Number,
            default: 0,
        },
        isEdit: {
            // 是否是编辑
            type: Boolean,
            default: false,
        },
        resetFields: {
            type: Boolean,
            default: true,
        },
        formStatus: {
            // form的状态
            type: String,
            default: "add",
        },
        value: {
            type: Object as PropType<any>,
            default: () => ({}),
        },
    },
    emits: ["update:value", "submit", "editDisabled", "cancel", "onChange"],
    setup(prop, { emit, slots, expose }) {
        const formRef = ref<FormModel | null>(null); // form的实例

        const isHorizontal = computed(() => {
            return prop.layout === "horizontal";
        });

        const isDisabled = ref(false);

        const getDisabled = computed(() => (obj: any) => {
            return prop.allDisabled || isDisabled.value || obj?.disabled || false;
        });

        const form = computed({
            get() {
                return prop.value;
            },
            set(v) {
                emit("update:value", v);
            },
        });

        const rules = ref<Record<string, Rule[]>>({});

        /** 创建form */
        const _generateForm = () => {
            set(form, "value", generateForm(prop.fields));
        };

        _generateForm();

        /** 创建默认表单验证规则 */
        const generateRule = () => {
            rules.value = fromPairs(
                prop.fields
                    .filter((item: any) => item.required)
                    .map(({ label, key, type, addWhitespace }: any) => {
                        const ruleItem = [
                            key,
                            [
                                ...(prop.extendRules?.[key] || []),
                                {
                                    required: true,
                                    message: `${label}不可为空`,
                                    trigger: ["date-range", "date", "radio-group"].includes(type)
                                        ? ["change", "blur"]
                                        : "blur",
                                },
                            ],
                        ];

                        if (addWhitespace) {
                            // 是否添加whitespace（空格验证）这个规则
                            ruleItem[1].push({
                                whitespace: true,
                                message: `${label}不可为空`,
                                trigger: ["date-range", "date", "radio-group"].includes(type)
                                    ? ["change", "blur"]
                                    : "blur",
                            });
                        }
                        return ruleItem;
                    })
            );
        };

        generateRule();

        const validateField = (arr: string[] | string) => {
            return new Promise((resolve, reject) => {
                formRef.value?.validateField(arr, (err) => {
                    reject(err);
                });
            });
        };

        const validate = () => {
            return new Promise((resolve, reject) => {
                formRef.value?.validate((valid) => {
                    if (valid) {
                        resolve(true);
                    }
                    reject(false);
                });
            });
        };

        const clearValidate = (arr: string[] | string) => {
            formRef.value?.clearValidate(arr);
        };

        const submit = () => {
            return new Promise((reslove, reject) => {
                formRef.value?.validate((valid: boolean) => {
                    if (valid) {
                        emit("submit", form.value);
                        reslove(true);
                    }
                    reject(false);
                });
            });
        };

        const editDisabled = () => {
            isDisabled.value = false;
            emit("editDisabled", false);
        };

        const resetForm = () => {
            if (prop.resetFields) {
                formRef.value?.resetFields();
            }
            if (prop.isEdit) {
                isDisabled.value = true;
            }
            nextTick(() => {
                emit("cancel");
            });
        };

        const renderFormItem = () => {
            const renderItem = (
                item: { type?: string; col?: any; jsx: any; slot: any; span?: any; key: any; label?: any },
                index: any
            ) => {
                return (
                    item.jsx?.(h) ||
                    slots[item.slot]?.({
                        data: item,
                        index,
                        disabled: getDisabled.value(item),
                    }) || (
                        <RenderField
                            data={item as any}
                            value={form.value[item.key]}
                            disabled={getDisabled.value(item)}
                            formStatus={prop.formStatus as any}
                            {...{
                                on: {
                                    "update:value": (v: any) => {
                                        form.value[item.key] = v;
                                        emit("onChange", cloneDeep(form.value));
                                    },
                                },
                            }}
                        />
                    )
                );
            };

            return prop.fields
                .filter((item: { hide: string | undefined }) => !item.hide)
                .map(
                    (
                        item: {
                            type: string;
                            col: any;
                            jsx: (arg0: any) => any;
                            slot: string | number;
                            span: any;
                            key: any;
                            label: any;
                        },
                        index: any
                    ) => {
                        if (item.type === "jsx") {
                            return <a-col {...{ props: { span: item.col || 24, key: index } }}>{item.jsx?.(h)}</a-col>;
                        }

                        if (item.type === "slot") {
                            return (
                                <a-col {...{ props: { span: item.col || 24, key: index } }}>
                                    {slots[item.slot]?.({ data: item, index })}
                                </a-col>
                            );
                        }

                        return (
                            <a-col {...{ props: { span: item.col || 6, ...item.span, key: item.key } }}>
                                <a-form-model-item key={item.key} label={item.label} name={item.key} prop={item.key}>
                                    {renderItem(item, index)}
                                </a-form-model-item>
                            </a-col>
                        );
                    }
                );
        };

        const render = () => {
            return (
                <a-form-model
                    {...{
                        // jsx中只能这么处理，要不然会报错
                        props: {
                            model: form.value,
                        },
                    }}
                    ref={formRef}
                    layout={prop.layout}
                    rules={rules.value}
                    validateOnRuleChange={prop.validateOnRuleChange}
                    labelCol={isHorizontal.value ? { span: 1, style: `min-width:${prop.labelWidth}px` } : null}
                    wrapperCol={
                        isHorizontal.value
                            ? {
                                  span: 23,
                                  style: `max-width:calc(100% - ${prop.labelWidth}px)`,
                              }
                            : null
                    }>
                    <a-row gutter={[10, 10]} type="flex" justify="start" class="sy__form">
                        {renderFormItem()}
                        {slots.footer && <a-col span={24}>{slots.footer?.({})}</a-col>}
                        <a-col span={24}>
                            <div class="sy__form--bottom" style={{ marginTop: `${prop.footBtnOffsetTop}px` }}>
                                {slots.button?.({}) || [
                                    prop.buttonVisible &&
                                        (isDisabled.value ? (
                                            <a-button type="primary" onClick={() => editDisabled()}>
                                                编辑
                                            </a-button>
                                        ) : (
                                            <a-space>
                                                <a-button style="margin-left: 10px" onClick={() => resetForm()}>
                                                    {prop.cancelText}
                                                </a-button>
                                                <a-button
                                                    type="primary"
                                                    loading={prop.submitting}
                                                    onClick={() => submit()}>
                                                    {prop.submitText}
                                                </a-button>
                                            </a-space>
                                        )),
                                ]}
                            </div>
                        </a-col>
                    </a-row>
                </a-form-model>
            );
        };

        watch(
            // 更新字段
            () => prop.fields,
            (newV) => {
                if (newV) {
                    _generateForm();
                    generateRule();
                }
            }
        );

        watch(
            // 更新验证规则
            () => prop.extendRules,
            (newV) => {
                if (newV) {
                    generateRule();
                }
            }
        );

        watch(
            // 更新disabled
            () => prop.isEdit,
            (newV) => {
                if (newV) {
                    isDisabled.value = newV;
                }
            },
            { immediate: true }
        );

        // vue2.7 支持expose，但是如果升级到3x defineExpose需要向外暴漏
        expose({
            validateField,
            validate,
            clearValidate,
            _generateForm,
            formRef,
        });

        return () => {
            return render();
        };
    },
});
