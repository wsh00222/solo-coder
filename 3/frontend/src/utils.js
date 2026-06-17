// 通用小工具函数

/** 格式化 ISO 时间为本地可读字符串 */
export function formatDate(isoStr) {
  try {
    const d = new Date(isoStr);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  } catch {
    return isoStr;
  }
}

/** 生成唯一ID（用于前端临时 key，不依赖后端） */
export function uid() {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}

/** 将数组按分页参数切片 */
export function paginate(list, page, pageSize) {
  const start = (page - 1) * pageSize;
  return list.slice(start, start + pageSize);
}

/** 题型中文名映射 */
export const QUESTION_TYPE_LABEL = {
  single: '单选题',
  multiple: '多选题',
  text: '文本题',
};
