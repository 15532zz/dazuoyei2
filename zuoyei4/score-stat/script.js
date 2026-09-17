// ============================================
// 班级成绩统计工具（课堂案例复现 · 实践指南四 第七部分）
// 全程不写页面，程序在 Console 运行：浏览器打开 index.html 后按 F12
// ============================================

// ---------- 第一步：定义成绩数据（第1次提交） ----------
const scores = [
  { name: '李四', score: 92 },
  { name: '王五', score: 45 },
  { name: '赵六', score: 77 },
  { name: '孙七', score: 59 },
  { name: '周八', score: 88 },
  { name: '吴九', score: 105 },   // 故意混入非法值：满分100
  { name: '郑十', score: -3 }     // 负分
];

// 检查点1：数据能被 console.table 正常打印
console.table(scores);

// ---------- 第二步：清洗与统计函数（第2次提交） ----------
// 清洗：只保留0至100之间的合法成绩
const cleanScores = (list) => list.filter(s => s.score >= 0 && s.score <= 100);

// 平均分
const average = (list) => {
  if (list.length === 0) return 0;   // 空数组保护，除零会产生NaN
  const total = list.reduce((sum, s) => sum + s.score, 0);
  return (total / list.length).toFixed(2);
};

// 最高分
const highest = (list) => list.reduce((max, s) => s.score > max.score ? s : max, list[0]);

// 不及格名单
const failed = (list) => list.filter(s => s.score < 60).map(s => s.name);

console.log('清洗后：', cleanScores(scores));
console.log('平均分：', average(cleanScores(scores)));
console.log('最高分：', highest(cleanScores(scores)));
console.log('不及格：', failed(cleanScores(scores)));

// ---------- 第三步：等级分布与格式化输出（第3次提交） ----------
// 等级判定（单值进单值出，纯函数）
const toGrade = (score) => {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
};

// 各等级人数统计
const gradeCount = (list) => {
  const result = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  list.forEach(s => { result[toGrade(s.score)]++; });
  return result;
};

// 格式化报告
const report = (list) => {
  const valid = cleanScores(list);
  if (valid.length === 0) {
    return '没有有效成绩';
  }
  const dist = gradeCount(valid);
  return `有效人数${valid.length}人，平均${average(valid)}分，最高${highest(valid).score}分（${highest(valid).name}）；等级分布：A${dist.A}人 B${dist.B}人 C${dist.C}人 D${dist.D}人 F${dist.F}人；不及格名单：${failed(valid).join('、') || '无'}`;
};

try {
  console.log(report(scores));
} catch (err) {
  console.error('报告生成失败：', err.message);
}

// 故意实验（防御性编程）：空数组时输出“没有有效成绩”而不是崩溃
console.log('空数组测试：', report([]));
