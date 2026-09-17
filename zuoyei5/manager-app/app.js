// 图书收藏管理：增 / 删 / 改（编辑）/ 查（搜索） + localStorage 持久化
const form = document.querySelector('#add-form');
const titleInput = document.querySelector('#title-input');
const authorInput = document.querySelector('#author-input');
const ratingInput = document.querySelector('#rating-input');
const tip = document.querySelector('#tip');
const list = document.querySelector('#book-list');
const searchInput = document.querySelector('#search-input');

// 唯一状态：每条记录 3 个字段 + id
// 示例对象：{ id: 1, title: '三体', author: '刘慈欣', rating: 4.5 }
let books = JSON.parse(localStorage.getItem('books') || '[]');
let nextId = books.reduce((max, book) => Math.max(max, book.id), 0) + 1;
let editingId = null; // 当前正在编辑的记录 id，null 表示没有

const save = () => localStorage.setItem('books', JSON.stringify(books));

const render = () => {
  list.innerHTML = '';

  const keyword = searchInput.value.trim().toLowerCase();
  const shown = books.filter(book =>
    book.title.toLowerCase().includes(keyword) ||
    book.author.toLowerCase().includes(keyword)
  );

  if (shown.length === 0) {
    const li = document.createElement('li');
    li.textContent = books.length === 0 ? '还没有图书，添加一本吧' : '没有符合条件的图书';
    list.appendChild(li);
    return;
  }

  shown.forEach(book => {
    const li = document.createElement('li');
    li.dataset.id = book.id;

    if (book.id === editingId) {
      // 编辑态：把三个字段变成输入框
      const title = document.createElement('input');
      title.className = 'edit-title';
      title.value = book.title;

      const author = document.createElement('input');
      author.className = 'edit-author';
      author.value = book.author;

      const rating = document.createElement('input');
      rating.className = 'edit-rating';
      rating.type = 'number';
      rating.min = '0';
      rating.max = '5';
      rating.step = '0.1';
      rating.value = book.rating;

      const ok = document.createElement('button');
      ok.className = 'ok-btn';
      ok.textContent = '保存';

      const cancel = document.createElement('button');
      cancel.className = 'cancel-btn';
      cancel.textContent = '取消';

      li.append(title, author, rating, ok, cancel);
    } else {
      // 展示态
      const info = document.createElement('span');
      info.className = 'info';
      info.textContent = book.title + ' · ' + book.author + ' · ' + book.rating + '分';

      const edit = document.createElement('button');
      edit.className = 'edit-btn';
      edit.textContent = '编辑';

      const del = document.createElement('button');
      del.className = 'del-btn';
      del.textContent = '删除';

      li.append(info, edit, del);
    }

    list.appendChild(li);
  });
};

const showTip = (msg) => { tip.textContent = msg; };

// 新增
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  const author = authorInput.value.trim() || '未知作者';
  const rating = Number(ratingInput.value);

  if (title === '') {
    showTip('书名不能为空');
    return;
  }
  if (ratingInput.value.trim() === '' || Number.isNaN(rating) || rating < 0 || rating > 5) {
    showTip('评分需为 0 到 5 之间的数字');
    return;
  }

  books.push({ id: nextId, title: title, author: author, rating: rating });
  nextId = nextId + 1;
  save();
  form.reset();
  showTip('');
  render();
});

// 列表统一委托：删除 / 进入编辑 / 保存编辑 / 取消
list.addEventListener('click', (e) => {
  const li = e.target.closest('li');
  if (li === null) return;
  const id = Number(li.dataset.id);
  const book = books.find(item => item.id === id);
  if (book === undefined) return;

  if (e.target.classList.contains('del-btn')) {
    books = books.filter(item => item.id !== id);
    if (editingId === id) editingId = null;
    save();
    showTip('');
    render();
    return;
  }

  if (e.target.classList.contains('edit-btn')) {
    editingId = id;
    showTip('');
    render();
    return;
  }

  if (e.target.classList.contains('cancel-btn')) {
    editingId = null;
    showTip('');
    render();
    return;
  }

  if (e.target.classList.contains('ok-btn')) {
    const title = li.querySelector('.edit-title').value.trim();
    const author = li.querySelector('.edit-author').value.trim() || '未知作者';
    const rating = Number(li.querySelector('.edit-rating').value);

    if (title === '') {
      showTip('书名不能为空');
      return;
    }
    if (Number.isNaN(rating) || rating < 0 || rating > 5) {
      showTip('评分需为 0 到 5 之间的数字');
      return;
    }

    book.title = title;
    book.author = author;
    book.rating = rating;
    editingId = null;
    save();
    showTip('');
    render();
  }
});

// 查询
searchInput.addEventListener('input', render);

render();
