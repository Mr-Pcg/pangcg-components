import { defineConfig } from 'dumi';

export default defineConfig({
  outputPath: 'docs-dist',
  base: process.env.NODE_ENV === 'production' ? '/pangcg-components/' : '/', // 生产环境使用 /pangcg-components/ 否则使用 /
  publicPath: process.env.NODE_ENV === 'production' ? '/pangcg-components/' : '/', // 生产环境使用 /pangcg-components/ 否则使用 /
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
        link: 'components/edit-form-table', // components会默认自动对应到src文件夹
        activePath: '/components',
      },
      {
        title: 'API',
        link: '/api',
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
          title: 'Table表格',
          children: [],
        },
        {
          title: '异常处理',
          children: [],
        },
      ],
      '/api': [
        {
          title: 'API 文档',
          children: [
            {
              title: '通用 API',
              link: '/api/common',
            },
            {
              title: '组件 API',
              link: '/api/components',
            },
          ],
        },
      ],
    },
  },
});
