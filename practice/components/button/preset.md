# Button 组件最佳实践

## 基本使用原则

### 1. 按钮类型选择
- **主要按钮 (Primary)**：一个页面中只应该有一个主要按钮，用于最重要的操作
- **次要按钮 (Default)**：用于次要操作，如取消、重置等
- **虚线按钮 (Dashed)**：用于添加操作，通常配合图标使用
- **文本按钮 (Text/Link)**：用于次要操作或导航链接

### 2. 按钮尺寸
- **大按钮 (large)**：用于重要的 CTA 操作
- **中等按钮 (middle)**：默认尺寸，适用于大部分场景
- **小按钮 (small)**：用于表格操作列或空间受限的场景

### 3. 按钮状态管理
```tsx
// 正确：使用 loading 状态防止重复提交
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await submitForm();
  } finally {
    setLoading(false);
  }
};

<Button type="primary" loading={loading} onClick={handleSubmit}>
  提交
</Button>
```

## 性能优化

### 1. 避免内联函数
```tsx
// 错误：每次渲染都会创建新函数
<Button onClick={() => handleClick(id)}>点击</Button>

// 正确：使用 useCallback 或将函数提取到外部
const handleButtonClick = useCallback(() => {
  handleClick(id);
}, [id]);

<Button onClick={handleButtonClick}>点击</Button>
```

### 2. 合理使用 danger 类型
```tsx
// 用于删除、重置等危险操作
<Button danger type="primary" onClick={handleDelete}>
  删除
</Button>
```

## 无障碍访问

### 1. 提供有意义的文本
```tsx
// 好的实践
<Button>保存草稿</Button>
<Button>发布文章</Button>

// 避免过于简单的文本
<Button>确定</Button>
<Button>操作</Button>
```

### 2. 使用 aria 属性
```tsx
<Button 
  loading={submitting}
  aria-label={submitting ? "正在提交" : "提交表单"}
>
  {submitting ? "提交中..." : "提交"}
</Button>
```

## 常见场景

### 1. 表单提交
```tsx
<Form onFinish={onFinish}>
  {/* 表单项 */}
  <Form.Item>
    <Space>
      <Button type="primary" htmlType="submit" loading={loading}>
        提交
      </Button>
      <Button onClick={handleReset}>
        重置
      </Button>
    </Space>
  </Form.Item>
</Form>
```

### 2. 确认对话框
```tsx
const showConfirm = () => {
  Modal.confirm({
    title: '确认删除',
    content: '删除后无法恢复，是否继续？',
    okText: '确认删除',
    okType: 'danger',
    cancelText: '取消',
    onOk: handleDelete,
  });
};

<Button danger onClick={showConfirm}>
  删除
</Button>
```

### 3. 图标按钮
```tsx
import { PlusOutlined, EditOutlined } from '@ant-design/icons';

// 带图标的按钮
<Button type="primary" icon={<PlusOutlined />}>
  新增
</Button>

// 只有图标的按钮
<Button type="text" icon={<EditOutlined />} />
```

## 样式定制

### 1. 主题定制
```tsx
// 使用 ConfigProvider 定制主题
<ConfigProvider
  theme={{
    components: {
      Button: {
        primaryColor: '#1890ff',
        borderRadius: 6,
      },
    },
  }}
>
  <Button type="primary">自定义按钮</Button>
</ConfigProvider>
```

### 2. CSS-in-JS
```tsx
import styled from 'styled-components';

const StyledButton = styled(Button)`
  &.ant-btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    
    &:hover {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      opacity: 0.8;
    }
  }
`;
```

## 注意事项

1. **避免按钮文字过长**：超过合理长度应考虑换行或缩短文字
2. **保持一致性**：同一应用中的按钮样式应保持一致
3. **响应式设计**：在移动端适当调整按钮尺寸
4. **加载状态**：异步操作必须提供加载反馈
5. **禁用状态**：禁用时应清楚说明原因 