import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['cli.ts'],
  format: ['esm'],
  outDir: 'dist',
  clean: true,
  splitting: false, // 关闭代码分割，因为是CLI工具
  treeshake: true, // 启用 tree shaking
  target: 'es2022',
  minify: true,
  platform: 'node',
  esbuildOptions(options) {
    options.charset = 'utf8' // 添加这行来保留中文字符
      options.define = {
        'process.env.VERSION': `"${require('./package.json').version}"`,
        'process.env.IS_BUILD': "true"
    }
  }
})