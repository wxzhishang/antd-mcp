import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

/** 项目根目录 */
export const ROOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..")

/** 提取的组件数据存储目录 */
export const EXTRACTED_DATA_DIR = resolve(ROOT_DIR, "docs");

/** 提取的组件列表路径 */
export const EXTRACTED_COMPONENTS_LIST_PATH = join(EXTRACTED_DATA_DIR,"components-index.json");
/** 提取的结果元信息路径 */
export const EXTRACTED_METADATA_PATH = join(EXTRACTED_DATA_DIR, "metadata.json");
/** 提取的组件数据目录 */
export const EXTRACTED_COMPONENTS_DATA_PATH = join(EXTRACTED_DATA_DIR, "components");
/** 提取的组件更新日志路径 */
export const EXTRACTED_COMPONENTS_DATA_CHANGELOG_PATH = join(EXTRACTED_DATA_DIR,"components-changelog.json");

/** 最佳实践数据存储目录 */
export const BEST_PRACTICES_DIR = resolve(ROOT_DIR, "practice");
/** 最佳实践组件数据目录 */
export const BEST_PRACTICES_COMPONENTS_PATH = join(BEST_PRACTICES_DIR, "components");

/** README.md 目录路径 */
export const README_PATH = join(ROOT_DIR, "README.md");

/** antd组件更新记录文件路径 */
export const EXTRACT_COMPONENTS_CHANGELOG_PATH = "components-changelog-cn.json";

/** 默认提取 ant design 的路径  */
export const DEFAULT_ANT_DESIGN_EXTRACT_PATH = "./ant-design";

/** 组件文档文件名(本地提取文档) */
export const DOC_FILE_NAME = "docs.md";
/** 组件示例文件名(本地提取文档) */
export const EXAMPLE_FILE_NAME = "examples.md";
/** 预设最佳实践文件名 */
export const PRESET_PRACTICE_FILE_NAME = "preset.md";
/** 爬取最佳实践文件名 */
export const CRAWLED_PRACTICE_FILE_NAME = "crawled.md";

/** antd仓库地址 */
export const ANT_DESIGN_REPO_URL = "https://github.com/ant-design/ant-design";