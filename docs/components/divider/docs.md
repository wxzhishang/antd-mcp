## 何时使用
- 对不同章节的文本段落进行分割。
- 对行内文字/链接进行分割，例如表格的操作列。
## API
| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| children | 嵌套的标题 | ReactNode | - |  |
| className | 分割线样式类 | string | - |  |
| dashed | 是否虚线 | boolean | false |  |
| variant | 分割线是虚线、点线还是实线 | `dashed` \| `dotted` \| `solid` | solid | 5.20.0 |
| orientation | 分割线标题的位置 | `start` \| `end` \| `center` | `center` | `start` `end`: 5.24.0 |
| orientationMargin | 标题和最近 left/right 边框之间的距离，去除了分割线，同时 `orientation` 不能为 `center`。如果传入 `string` 类型的数字且不带单位，默认单位是 px | string \| number | - |  |
| plain | 文字是否显示为普通正文样式 | boolean | false | 4.2.0 |
| style | 分割线样式对象 | CSSProperties | - |  |
| size | 间距大小，仅对水平布局有效 | `small` \| `middle` \| `large` | - | 5.25.0 |
| type | 水平还是垂直类型 | `horizontal` \| `vertical` | `horizontal` |  |
