import { defineComponent, PropType, computed, ref, Ref } from "vue";
import { Field, Option, Group } from "./types";
import moment, { MomentInput } from "moment";

export default defineComponent({
    name: "RenderField",
    props: {
        data: {
            type: Object as PropType<Field>,
            default: () => ({}),
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        formStatus: {
            type: String as PropType<"add" | "edit" | "detail">,
            default: "add",
        },
        value: {
            type: "" as unknown as PropType<any>,
        },
    },
    emits: ["update:value", "input", "blur", "change"],
    setup(prop, { emit }) {
        const model = computed({
            get() {
                return prop.value;
            },
            set(v) {
                const value = prop.data.valueFormat && !prop.data.lazyFormat ? prop.data.valueFormat(v) : v;
                emit("input", value ? (value.trim ? value.trim() : value) : value);
                emit("update:value", value ? (value.trim ? value.trim() : value) : value);
            },
        });

        const options: Ref<(Option | Group)[]> = ref([]);

        const getOptions = () => {
            prop.data.asyncOption?.().then((res) => {
                options.value = res;
            });
        };

        const sizeStyle = "width:100%;";

        //  设置placeholder
        const formPlaceholder = (label: string, placeholder?: string, type = "输入") => {
            return prop.formStatus === "detail" ? " " : placeholder || `请${type}${label}`;
        };

        const onBlur = (e: any) => {
            emit("blur", e);
        };

        const onChange = (e: any) => {
            emit("change", e);
        };

        const disabledDate = (current: MomentInput) => {
            if (current) {
                if (prop.data.beforeDate) {
                    return current < moment().startOf("day");
                }
                if (prop.data.afterDate) {
                    return current > moment().endOf("day");
                }
            }
            return false;
        };

        const filterOption = (input: any, option: any) => {
            if (option.componentOptions.children.length > 1) {
                return option.componentOptions.children.some((item: any) => {
                    item.componentOptions.children[0].text?.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                });
            }
            return option.componentOptions.children[0].text?.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        };
        getOptions();

        const render = () => {
            switch (prop.data.type) {
                case "radio-group":
                    return (
                        <a-radio-group
                            value={model.value}
                            default-value={model.value}
                            disabled={!!prop.disabled}
                            onBlur={onBlur}
                            onChange={(e: any) => {
                                model.value = e.target.value;
                                onChange(e);
                            }}>
                            {prop.data.option?.map((opt) => (
                                <a-radio value={opt.value} name={opt.label} disabled={opt.disabled}>
                                    {opt.icon && <i class={opt.icon} />} {opt.label}
                                </a-radio>
                            ))}
                        </a-radio-group>
                    );
                case "date":
                    return (
                        <a-date-picker
                            value={model.value}
                            value-format={prop.data.dateValueFormat ? prop.data.dateValueFormat : "YYYY-MM-DD"}
                            placeholder={formPlaceholder(prop.data.label, prop.data.placeholder, "选择")}
                            style={sizeStyle}
                            disabled={!!prop.disabled}
                            showTime={prop.data.showTime}
                            showToday={false}
                            allowClear={true}
                            inputReadOnly={true}
                            disabledDate={disabledDate || prop.data.disabledDate}
                            onBlur={onBlur}
                            onChange={(e: any) => {
                                model.value = e;
                                onChange(e);
                            }}
                        />
                    );
                case "date-range":
                    return (
                        <a-range-picker
                            value={model.value}
                            value-format="YYYY-MM-DD"
                            placeholder={[
                                formPlaceholder(prop.data.label, prop.data.placeholder, "选择"),
                                formPlaceholder(prop.data.label, prop.data.placeholder, "选择"),
                            ]}
                            style={sizeStyle}
                            disabled={!!prop.disabled}
                            allowClear={true}
                            disabledDate={disabledDate || prop.data.disabledDate}
                            onBlur={onBlur}
                            onChange={(e: any) => {
                                model.value = e;
                                onChange(e);
                            }}
                        />
                    );
                case "textarea":
                    return (
                        <a-textarea
                            value={model.value}
                            placeholder={formPlaceholder(prop.data.label, prop.data.placeholder)}
                            rows={4}
                            disabled={!!prop.disabled}
                            maxLength={prop.data.maxLength || 300}
                            onBlur={(e: any) => {
                                model.value = prop.data.valueFormat
                                    ? prop.data.valueFormat(e.target.value)
                                    : e.target.value;
                                onBlur(e);
                            }}
                            onChange={(e: any) => {
                                model.value = e.target.value.trim();
                                onChange(e);
                            }}
                        />
                    );
                case "select":
                    return (
                        <a-select
                            value={model.value}
                            mode={prop.data.mode}
                            showSearch={prop.data.enabledShowSearch}
                            filterOption={filterOption}
                            placeholder={formPlaceholder(prop.data.label, prop.data.placeholder, "选择")}
                            disabled={!!prop.disabled}
                            style={sizeStyle}
                            allowClear={true}
                            onBlur={onBlur}
                            onChange={(e: any) => {
                                model.value = e;
                                onChange(e);
                            }}>
                            {(prop.data.option || options.value)?.map((opt) => {
                                return (opt as Group).group ? (
                                    <a-select-opt-group label={(opt as Group).title}>
                                        {(opt as Group).group.map((gopt) => (
                                            <a-select-option value={gopt.value} disabled={gopt.disabled ? true : false}>
                                                {gopt.label}
                                            </a-select-option>
                                        ))}
                                    </a-select-opt-group>
                                ) : (
                                    <a-select-option
                                        value={(opt as Option).value}
                                        disabled={(opt as Option).disabled ? true : false}>
                                        {(opt as Option).label}
                                    </a-select-option>
                                );
                            })}
                        </a-select>
                    );
                case "switch":
                    return (
                        <a-switch
                            checked={model.value}
                            disabled={!!prop.disabled}
                            onchange={(e: boolean) => {
                                model.value = e;
                                onChange(e);
                            }}
                        />
                    );
                case "checkbox-group":
                    return (
                        <a-checkbox-group
                            value={model.value}
                            name={prop.data.type}
                            options={prop.data.option || options.value}
                            onChange={(e: any) => {
                                model.value = e;
                                onChange(e);
                            }}
                        />
                    );
                // <a-checkbox value={model.value} disabled={!!prop.disabled} />;
                case "number":
                    return (
                        <a-input-number
                            value={model.value}
                            disabled={!!prop.disabled}
                            max={prop.data.max || Infinity}
                            min={prop.data.min || 0}
                            placeholder={formPlaceholder(prop.data.label, prop.data.placeholder, "选择")}
                            style={sizeStyle}
                            step={prop.data.step || 1}
                            precision={prop.data.precision}
                            onBlur={onBlur}
                            onChange={(e: any) => {
                                model.value = e;
                                onChange(e);
                            }}
                        />
                    );
                default:
                    return (
                        <a-input
                            value={model.value}
                            placeholder={formPlaceholder(prop.data.label, prop.data.placeholder, "选择")}
                            addon-after={prop.data.unit}
                            disabled={!!prop.disabled}
                            title={model.value}
                            allowClear={true}
                            maxLength={prop.data.maxLength || 100}
                            onBlur={(e: any) => {
                                model.value = prop.data.valueFormat
                                    ? prop.data.valueFormat(e.target.value)
                                    : e.target.value;
                                onBlur(e);
                            }}
                            onChange={(e: any) => {
                                model.value = e.target.value.trim();
                                onChange(e);
                            }}
                        />
                    );
            }
        };
        return () => {
            return render();
        };
    },
});
