// src/theme/colors.tsx

/**
 * 全局颜色配置
 *
 * 使用方式：
 * import colors from '../theme/colors';
 * colors.primary, colors.text.primary 等。
 */

const colors = {
  // 主色调
  primary: '#2089dc',        // 品牌主色
  secondary: '#ff6347',      // 辅助色

  // 背景色
  background: '#f5f7fa',     // 页面背景
  surface: '#ffffff',        // 卡片、表单等容器背景

  // 文本
  text: {
    primary: '#333333',      // 一级文字
    secondary: '#666666',    // 二级文字
    disabled: '#999999',     // 禁用文字
    inverse: '#ffffff',      // 在深色背景上的文字
  },

  // 状态色
  error: '#d32f2f',          // 错误
  warning: '#f57c00',        // 警告
  success: '#388e3c',        // 成功
  info: '#1976d2',           // 信息

  // 分割线
  divider: '#e0e0e0',        // 边框、分割线
};

export type Colors = typeof colors;
export default colors;
