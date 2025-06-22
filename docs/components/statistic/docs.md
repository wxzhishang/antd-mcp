## 何时使用
- 当需要突出某个或某组数字时。
- 当需要展示带描述的统计类数据时使用。
## API
#### Statistic
| 参数             | 说明               | 类型                 | 默认值 | 版本  |
| ---------------- | ------------------ | -------------------- | ------ | ----- |
| decimalSeparator | 设置小数点         | string               | `.`    |       |
| formatter        | 自定义数值展示     | (value) => ReactNode | -      |       |
| groupSeparator   | 设置千分位标识符   | string               | `,`    |       |
| loading          | 数值是否加载中     | boolean              | false  | 4.8.0 |
| precision        | 数值精度           | number               | -      |       |
| prefix           | 设置数值的前缀     | ReactNode            | -      |       |
| suffix           | 设置数值的后缀     | ReactNode            | -      |       |
| title            | 数值的标题         | ReactNode            | -      |       |
| value            | 数值内容           | string \| number     | -      |       |
| valueStyle       | 设置数值区域的样式 | CSSProperties        | -      |       |
#### Statistic.Countdown <Badge type="error">Deprecated</Badge>
<Antd component="Alert" message="版本 >= 5.25.0 时请使用 Statistic.Timer 作为替代方案。" type="warning" banner="true"></Antd>
<!-- prettier-ignore -->
| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| format | 格式化倒计时展示，参考 [dayjs](https://day.js.org/) | string | `HH:mm:ss` |  |
| prefix | 设置数值的前缀 | ReactNode | - |  |
| suffix | 设置数值的后缀 | ReactNode | - |  |
| title | 数值的标题 | ReactNode | - |  |
| value | 数值内容 | number | - |  |
| valueStyle | 设置数值区域的样式 | CSSProperties | - |  |
| onFinish | 倒计时完成时触发 | () => void | - |  |
| onChange | 倒计时时间变化时触发 | (value: number) => void | - |  |
#### Statistic.Timer <Badge>5.25.0+</Badge>
| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| type | 计时类型，正计时或者倒计时 | `countdown` `countup` | - |  |
| format | 格式化倒计时展示，参考 [dayjs](https://day.js.org/) | string | `HH:mm:ss` |  |
| prefix | 设置数值的前缀 | ReactNode | - |  |
| suffix | 设置数值的后缀 | ReactNode | - |  |
| title | 数值的标题 | ReactNode | - |  |
| value | 数值内容 | number | - |  |
| valueStyle | 设置数值区域的样式 | CSSProperties | - |  |
| onFinish | 倒计时完成时触发, 指定为 `countup` 此属性不生效 | () => void | - |  |
| onChange | 倒计时时间变化时触发 | (value: number) => void | - |  |
