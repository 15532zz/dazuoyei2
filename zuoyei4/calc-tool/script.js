// ============================================
// 消费记账小工具（自主实践 · 实践指南四 第八部分）
// 场景：日常消费记账 —— 录入消费记录，清洗非法数据，统计总额、分类占比与最大单笔支出
// 数据流程：原始数据 → 清洗 → 计算 → 格式化输出，每个箭头对应一个函数
// 运行：浏览器打开 index.html，按 F12 看 Console；点击页面按钮可 prompt 录入
// 规范：全程 const/let，严格相等 ===，不使用 var 和 ==
// ============================================

// ---------- 第一步：定义数据（第1次提交） ----------
// 分类白名单：不在白名单内的分类清洗时归入“其他”
const CATEGORIES = ['餐饮', '交通', '学习', '娱乐', '其他'];

// 原始消费记录（故意混入三条非法记录，用于验证清洗逻辑）
const rawExpenses = [
  { item: '午餐-牛肉面', category: '餐饮', amount: 18.5 },
  { item: '地铁通勤', category: '交通', amount: 6 },
  { item: 'JavaScript高级程序设计', category: '学习', amount: 89 },
  { item: '奶茶', category: '餐饮', amount: 15 },
  { item: '电影票', category: '娱乐', amount: 45 },
  { item: '   共享单车   ', category: '交通', amount: 1.5 },
  { item: '', category: '餐饮', amount: 20 },              // 非法：项目名为空
  { item: '来路不明的支出', category: '餐饮', amount: -30 }, // 非法：负金额
  { item: '坏数据', category: '餐饮', amount: '五十' }       // 非法：金额不是数字
];

// ---------- 第二步：清洗与计算函数（第2次提交） ----------
// 判断金额是否合法：必须是数字、有限值、非负（NaN 和 Infinity 都不认）
const isValidAmount = (amount) =>
  typeof amount === 'number' && Number.isFinite(amount) && amount >= 0;

// 清洗：filter 挑出合法记录，map 统一规整（去空格、分类兜底、金额保留两位小数）
const cleanExpenses = (list) => list
  .filter(e => typeof e.item === 'string' && e.item.trim() !== '')
  .filter(e => isValidAmount(e.amount))
  .map(e => ({
    item: e.item.trim(),
    category: CATEGORIES.includes(e.category) ? e.category : '其他',
    amount: Math.round(e.amount * 100) / 100   // 浮点精度：先转整数分再转回元
  }));

// 总支出：reduce 把数组聚合成一个数
const totalExpense = (list) =>
  list.reduce((sum, e) => sum + e.amount, 0);

// 分类汇总：reduce 聚合成 { 分类: 金额 } 对象
const sumByCategory = (list) =>
  list.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

// 最大单笔支出：reduce 两两比较留下金额大的；空数组返回 null 防止越界
const topExpense = (list) => {
  if (list.length === 0) return null;
  return list.reduce((max, e) => e.amount > max.amount ? e : max, list[0]);
};

// 金额格式化：统一两位小数（展示层处理浮点）
const formatMoney = (n) => `¥${n.toFixed(2)}`;

// ---------- 研究任务1：双字段排序 ----------
// sort 比较函数规则：返回负数 a 排前，正数 b 排前，0 保持原顺序（ES2019 起规范保证稳定）
// 需求：先按分类（按白名单顺序）排序，同类内再按金额从高到低
const sortByCategoryThenAmount = (list) =>
  [...list].sort((a, b) => {
    const ca = CATEGORIES.indexOf(a.category);
    const cb = CATEGORIES.indexOf(b.category);
    if (ca !== cb) return ca - cb;      // 第一关键字：分类顺序
    return b.amount - a.amount;         // 第二关键字：金额降序
  });

// ---------- 研究任务2：正则表达式校验 ----------
// 金额输入规则：整数 或 最多两位小数，如 12、12.5、12.50；^ 开头 $ 结尾，\d 数字，{1,2} 1到2位
const AMOUNT_RE = /^\d+(\.\d{1,2})?$/;
const parseAmount = (input) => {
  if (typeof input !== 'string') return NaN;
  const s = input.trim();
  return AMOUNT_RE.test(s) ? Number(s) : NaN;
};

// ---------- 研究任务3：性能对比（for 循环 vs reduce） ----------
const sumByFor = (list) => {
  let sum = 0;                          // 累加器会被重新赋值，用 let
  for (let i = 0; i < list.length; i++) {
    sum += list[i].amount;
  }
  return sum;
};

const benchmark = (list) => {
  console.time('for循环求和耗时');
  sumByFor(list);
  console.timeEnd('for循环求和耗时');
  console.time('reduce求和耗时');
  totalExpense(list);
  console.timeEnd('reduce求和耗时');
};

// ---------- 第三步：格式化输出与交互（第3次提交） ----------
// 格式化报告：空数据给友好提示而不是崩溃（防御性编程）
const formatReport = (list) => {
  const valid = cleanExpenses(list);
  if (valid.length === 0) {
    return '没有有效消费记录，请先录入合法数据';
  }
  const total = totalExpense(valid);
  const byCat = sumByCategory(valid);
  const top = topExpense(valid);
  const catText = Object.keys(byCat)
    .map(cat => `${cat}${formatMoney(byCat[cat])}（${(byCat[cat] / total * 100).toFixed(1)}%）`)
    .join('、');
  return `有效记录${valid.length}条，总支出${formatMoney(total)}；分类明细：${catText}；最大单笔：${top.item}${formatMoney(top.amount)}`;
};

// prompt 录入：在浏览器中点击按钮或在 Console 调用 startInput() 触发
const startInput = () => {
  if (typeof prompt !== 'function') {
    console.log('当前环境不支持 prompt，请直接在 Console 操作 rawExpenses 数组');
    return;
  }
  const records = [];
  let adding = true;
  while (adding) {
    const item = prompt('请输入消费项目（点取消结束录入）：');
    if (item === null) break;
    const category = prompt('请输入分类（餐饮/交通/学习/娱乐/其他）：') || '其他';
    const amount = parseAmount(prompt('请输入金额（元，最多两位小数）：'));
    if (item.trim() === '' || !isValidAmount(amount)) {
      alert('这条记录不合法（项目名不能为空、金额必须是非负数字），已跳过');
    } else {
      records.push({ item: item.trim(), category: category.trim(), amount });
    }
    adding = confirm('继续录入下一条？');
  }
  if (records.length > 0) {
    console.log('本次录入有效记录：');
    console.table(records);
    console.log(formatReport(records));
  } else {
    console.log('未录入任何有效记录');
  }
};

// ---------- 主程序：样本数据自动跑一遍，结果输出到 Console ----------
console.log('【原始数据】');
console.table(rawExpenses);

const validExpenses = cleanExpenses(rawExpenses);
console.log('【清洗后有效记录】');
console.table(validExpenses);

console.log('【统计报告】', formatReport(rawExpenses));

// 非法/空输入的防御性测试
console.log('【空数据测试】', formatReport([]));
console.log('【全非法测试】', formatReport([{ item: '', category: '餐饮', amount: -5 }]));

// 研究任务1输出：双字段排序结果
console.log('【研究任务1：先按分类再按金额排序】');
console.table(sortByCategoryThenAmount(validExpenses));

// 研究任务3输出：性能对比（数据量小，多次循环放大差异）
console.log('【研究任务3：for 与 reduce 性能对比】');
benchmark(new Array(100000).fill(null).map((_, i) => ({ item: `项${i}`, category: '其他', amount: i % 100 })));

// 暴露到 window，供页面按钮 onclick 调用
if (typeof window !== 'undefined') {
  window.startInput = startInput;
  window.formatReport = formatReport;
  const btn = document.getElementById('btn-input');
  if (btn) btn.addEventListener('click', startInput);
}
