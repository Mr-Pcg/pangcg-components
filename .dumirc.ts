import { defineConfig } from 'dumi';

export default defineConfig({
  outputPath: 'docs-dist', // 文档输出路经
  base: process.env.NODE_ENV === 'production' ? '/pangcg-components/' : '/', // 生产环境使用 /pangcg -components/ 否则使用 /
  publicPath:
    process.env.NODE_ENV === 'production' ? '/pangcg-components/' : '/',
  themeConfig: {
    name: '组建库',
    nav: [
      {
        title: '指南',
        link: '/guide/getting-start',
        activePath: '/guide/getting-start',
      },
      {
        title: '组件',
        link: '/components/edit-form-table', // components会默认自动对应到src文件夹
        activePath: '/components',
      },
      {
        title: '工具函数',
        link: '/api/utils',
        activePath: '/api',
      },
    ],
    sidebar: {
      '/guide/': [
        {
          title: '指南',
          children: [
            {
              title: '快速开始',
              link: '/guide/getting-start',
            },
          ],
        },
      ],
      '/components/': [
        {
          title: '组件',
          children: [
            {
              title: 'Table表格',
              link: '/components/edit-form-table', // 默认：link
              children: [],
            },
            {
              title: '异常处理',
              link: '/components/error-boundary',
              children: [],
            },
            {
              title: '文件预览',
              link: '/components/pdf-preview',
              children: [],
            },
          ],
        },
      ],
      '/api': [
        {
          title: 'API文档',
          children: [
            {
              title: '通用函数',
              link: '/api/utils',
            },
            {
              title: '高阶函数',
              link: '/api/higher-order-function',
            },
          ],
        },
      ],
    },
  },
});
