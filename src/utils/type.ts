/**
 * 提取的组件示例信息
 */
export interface ExampleInfoList {
    /** 例子名称 */
    name: string;
    /** 例子标题 */
    title: string;
    /** 例子描述 */
    description?: string;
    /** 例子代码 */
    code?: string;
  }
  /**
   * 提取的组件数据
   */
  export interface ComponentData {
    /** 组件名称 */
    name: string;
    /** 组件目录 */
    dirName: string;
    /** 组件文档 */
    documentation: string;
    /** 组件可用版本 */
    validVersion?: string;
    /** 组件描述 */
    description?: string;
    /** 何时使用当前组件 */
    whenToUse?: string;
    // 代码示例信息
    exampleInfoList?: ExampleInfoList[];
  }
  
  /**
   * 提取的组件索引
   */
  export type ComponentIndex = (Pick<
    ComponentData,
    "name" | "dirName" | "description" | "whenToUse"
  > & {
    /** 组件可用版本 */
    validVersion?: string;
  })[];
  
  /**
   * 提取结果元数据
   */
  export interface MetaDataResult {
    /** 提取时间 */
    extractedAt: string;
    /** 提取的组件数量 */
    extractedCount: number;
    /** 组件总数 */
    componentCount: number;
    /** 数据的 antd 版本 */
    antdVersion: string;
  }
  