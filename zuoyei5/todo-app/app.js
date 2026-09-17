// 任务清单：状态驱动 + localStorage 持久化
const form = document.querySelector('#add-form');
const input = document.querySelector('#task-input');
const tip = document.querySelector('#tip');
const list = document.querySelector('#task-list');
const filters = document.querySelector('.filters');

// 唯一状态：从 localStorage 恢复，没有存档时用空数组
let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
let currentFilter = 'all'; // all / active / done

const save = () => localStorage.setItem('tasks', JSON.stringify(tasks));

const render = () => {
  list.innerHTML = '';

  const shown = tasks.filter(t =>
    currentFilter === 'all' ? true :
    currentFilter === 'active' ? !t.done : t.done
  );

  if (shown.length === 0) {
    const li = document.createElement('li');
    li.textContent = tasks.length === 0 ? '暂无任务' : '没有符合条件的任务';
    list.appendChild(li);
    return;
  }

  shown.forEach((task) => {
    const li = document.createElement('li');
    li.textContent = task.text;
    if (task.done) li.classList.add('done');

    const del = document.createElement('button');
    del.className = 'del';
    del.textContent = '删除';
    li.appendChild(del);

    li.addEventListener('click', (e) => {
      if (e.target.classList.contains('del')) {
        // 删除：改数组 → 保存 → 重画
        tasks.splice(tasks.indexOf(task), 1);
      } else {
        // 切换完成状态：改的是数组里的对象
        task.done = !task.done;
      }
      save();
      render();
    });

    list.appendChild(li);
  });
};

form.addEventListener('submit', (e) => {
  e.preventDefault(); // 表单提交默认会刷新页面，必须先拦住
  const text = input.value.trim();
  if (text === '') {
    tip.textContent = '任务名不能为空';
    return;
  }
  tasks.push({ text: text, done: false });
  save();
  tip.textContent = '';
  input.value = '';
  render();
});

filters.addEventListener('click', (e) => {
  if (e.target.tagName !== 'BUTTON') return;
  currentFilter = e.target.dataset.filter;
  render();
});

render();
