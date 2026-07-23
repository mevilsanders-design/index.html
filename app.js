// --- ИНИЦИАЛИЗАЦИЯ ДАННЫХ ---
// Мобильное меню
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const toggleBtn = document.getElementById('toggle-menu');

toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('open');
  overlay.classList.add('active');
});

overlay.addEventListener('click', () => {
  sidebar.classList.remove('open');
  overlay.classList.remove('active');
});
let clients = JSON.parse(localStorage.getItem('crm_clients')) || [];
let orders = JSON.parse(localStorage.getItem('crm_orders')) || [];
const products = [
  { id: 1, name: 'Молоко 3.2% 1л', price: 95 },
  { id: 2, name: 'Хлеб белый нарезной', price: 45 },
  { id: 3, name: 'Яйца С0 10шт', price: 130 },
  { id: 4, name: 'Сахар 1кг', price: 65 },
  { id: 5, name: 'Масло сливочное 200г', price: 190 },
  { id: 6, name: 'Гречка 900г', price: 85 },
  { id: 7, name: 'Макароны 400г', price: 55 },
  { id: 8, name: 'Чай чёрный 100г', price: 120 },
  { id: 9, name: 'Кофе растворимый 95г', price: 210 },
  { id: 10, name: 'Печенье 200г', price: 90 },
];

// --- СОХРАНЕНИЕ ---
function saveData() {
  localStorage.setItem('crm_clients', JSON.stringify(clients));
  localStorage.setItem('crm_orders', JSON.stringify(orders));
}

// --- НАВИГАЦИЯ ---
document.querySelectorAll('aside nav a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();

    // закрываем мобильное меню при клике
    sidebar.classList.remove('open');
    overlay.classList.remove('active');

    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('aside nav a').forEach(a => a.classList.remove('active'));

    const viewId = 'view-' + link.dataset.view;
    document.getElementById(viewId).classList.add('active');
    link.classList.add('active');

    if (viewId === 'view-clients') renderClients();
    if (viewId === 'view-orders') renderOrders();
    if (viewId === 'view-calendar') renderCalendar();
    if (viewId === 'view-new-order') renderNewOrderForm();
  });
});

// --- КЛИЕНТЫ ---
function renderClients() {
  const list = document.getElementById('clients-list');
  const search = (document.getElementById('client-search')?.value || '').toLowerCase();
  list.innerHTML = '';

  clients
    .filter(c =>
      c.name.toLowerCase().includes(search) ||
      (c.store && c.store.toLowerCase().includes(search)) ||
      (c.direction && c.direction.toLowerCase().includes(search))
    )
    .forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${c.name}</strong></td>
        <td>${c.store || '-'}</td>
        <td>${c.direction || '-'}</td>
        <td>
          <button onclick="viewClientDetails(${c.id})" style="padding:0.5rem 0.75rem; font-size:0.9rem;">Инфо</button>
          <button onclick="editClient(${c.id})" style="padding:0.5rem 0.75rem; font-size:0.9rem;">Изменить</button>
          <button onclick="deleteClient(${c.id})" style="background:#e74c3c; padding:0.5rem 0.75rem; font-size:0.9rem;">Удалить</button>
        </td>`;
      list.appendChild(tr);
    });
}

// --- ДЕТАЛИ КЛИЕНТА (МОДАЛКА) ---
function viewClientDetails(id) {
  const c = clients.find(x => x.id === id);
  if (!c) return;

  document.getElementById('client-view-title').textContent = `Клиент: ${c.name}`;
  document.getElementById('client-view-body').innerHTML = `
    <p><strong>Название:</strong> ${c.name}</p>
    <p><strong>Сеть/магазин:</strong> ${c.store || '—'}</p>
    <p><strong>Точка/адрес:</strong> ${c.point || '—'}</p>
    <p><strong>Направление:</strong> ${c.direction || '—'}</p>
    <p><strong>Телефон:</strong> ${c.phone || '—'}</p>
    <div style="margin-top:1rem; padding:1rem; background:#f8f9fa; border-radius:8px;">
      <strong>Комментарий:</strong><br>
      ${(c.comment || '').replace(/\n/g, '<br>') || '<em>Нет комментариев</em>'}
    </div>`;

  document.getElementById('client-view-modal').classList.add('active');
}

function closeClientViewModal() {
  document.getElementById('client-view-modal').classList.remove('active');
}

// --- ДОБАВЛЕНИЕ/РЕДАКТИРОВАНИЕ КЛИЕНТА ---
document.getElementById('btn-add-client').addEventListener('click', () => {
  openClientModal();
});

function openClientModal(id = null) {
  document.getElementById('client-modal').classList.add('active');
  if (id) {
    const c = clients.find(x => x.id === id);
    document.getElementById('client-id').value = c.id;
    document.getElementById('client-name').value = c.name;
    document.getElementById('client-store').value = c.store || '';
    document.getElementById('client-point').value = c.point || '';
    document.getElementById('client-direction').value = c.direction || '';
    document.getElementById('client-phone').value = c.phone || '';
    document.getElementById('client-comment').value = c.comment || '';
    document.getElementById('client-modal-title').textContent = 'Редактировать клиента';
  } else {
    document.getElementById('client-form').reset();
    document.getElementById('client-id').value = '';
    document.getElementById('client-modal-title').textContent = 'Добавить клиента';
  }
}

function closeClientModal() {
  document.getElementById('client-modal').classList.remove('active');
}

document.getElementById('client-form').addEventListener('submit', e => {
  e.preventDefault();
  const id = document.getElementById('client-id').value;
  const name = document.getElementById('client-name').value;
  const store = document.getElementById('client-store').value;
  const point = document.getElementById('client-point').value;
  const direction = document.getElementById('client-direction').value;
  const phone = document.getElementById('client-phone').value;
  const comment = document.getElementById('client-comment').value;

  if (id) {
    const idx = clients.findIndex(x => x.id == id);
    clients[idx] = { ...clients[idx], name, store, point, direction, phone, comment };
  } else {
    clients.push({ id: Date.now(), name, store, point, direction, phone, comment });
  }
  saveData();
  closeClientModal();
  renderClients();
});

function editClient(id) { openClientModal(id); }

function deleteClient(id) {
  if (!confirm('Удалить клиента?')) return;
  clients = clients.filter(c => c.id !== id);
  saveData();
  renderClients();
}

// --- ЗАКАЗЫ (СПИСОК) ---
function renderOrders() {
  const list = document.getElementById('orders-list');
  const search = (document.getElementById('order-search')?.value || '').toLowerCase();
  list.innerHTML = '';

  orders.slice().reverse().forEach(o => {
    const clientName = o.clientName || 'Клиент не указан';
    const storeName = o.storeName ? ` (${o.storeName})` : '';
    const match = clientName.toLowerCase().includes(search) || o.id.toString().includes(search);
    if (!match) return;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>#${o.id}</td>
      <td>${o.date}</td>
      <td>${clientName}${storeName}</td>
      <td style="color:#27ae60; font-weight:bold;">${o.total.toFixed(2)} ₽</td>
      <td class="status-${o.status}">${o.status}</td>
      <td>
        <button onclick="viewOrderDetails(${o.id})">Детали</button>
        <button onclick="deleteOrder(${o.id})" style="background:#e74c3c;">Удалить</button>
      </td>`;
    list.appendChild(tr);
  });
}

function deleteOrder(id) {
  if (!confirm('Удалить заказ?')) return;
  orders = orders.filter(o => o.id !== id);
  saveData();
  renderOrders();
}

// --- ДЕТАЛИ ЗАКАЗА (МОДАЛКА) ---
function viewOrderDetails(id) {
  const order = orders.find(o => o.id === id);
  if (!order) return;

  const itemsHtml = order.items.map(i => `
    <tr>
      <td>${i.productName}</td>
      <td>${i.qty}</td>
      <td>${i.price.toFixed(2)} ₽/шт</td>
      <td>${i.lineTotal.toFixed(2)} ₽</td>
    </tr>`).join('');

  document.getElementById('modal-order-title').textContent = `Заказ #${order.id} — ${order.clientName}`;
  document.getElementById('modal-order-body').innerHTML = `
    <p><strong>Дата:</strong> ${order.date}</p>
    <p><strong>Магазин/сеть:</strong> ${order.storeName || '-'}</p>
    <p><strong>Направление клиента:</strong> ${order.clientDirection || '-'}</p>
    <p><strong>Статус:</strong> <span class="status-${order.status}">${order.status}</span></p>
    <p><strong>Итого:</strong> <span style="color:#27ae60; font-weight:bold;">${order.total.toFixed(2)} ₽</span></p>
    <h4>Состав заказа</h4>
    <table class="data-table" style="margin-top:10px;">
      <thead>
        <tr style="background:#f8f9fa;">
          <th>Товар</th>
          <th>Кол-во</th>
          <th>Цена</th>
          <th>Итого</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>`;

  document.getElementById('order-details-modal').classList.add('active');
}

function closeOrderDetails() {
  document.getElementById('order-details-modal').classList.remove('active');
}

// --- КАЛЕНДАРЬ (СВОДКА ПО ДНЯМ) ---
function renderCalendar() {
  const container = document.getElementById('calendar-summary');
  container.innerHTML = '<p>Загрузка...</p>';

  const byDate = {};
  orders.forEach(o => {
    if (!byDate[o.date]) byDate[o.date] = [];
    byDate[o.date].push(o);
  });

  let html = '<table class="data-table"><thead><tr><th>Дата</th><th>Заказы</th><th>Товары</th><th style="color:#27ae60; font-weight:bold;">Итого за день</th></tr></thead><tbody>';

  Object.keys(byDate).sort().forEach(date => {
    const dayOrders = byDate[date];
    let dayTotal = 0;
    const itemsList = [];

    dayOrders.forEach(o => {
      dayTotal += o.total;
      o.items.forEach(i => itemsList.push(i));
    });

    const ordersTable = document.createElement('table');
    ordersTable.style.width = '100%';
    ordersTable.style.borderCollapse = 'collapse';
    ordersTable.innerHTML = `
      <thead><tr style="background:#f8f9fa;"><th>#</th><th>Клиент/Магазин</th><th>Сумма</th><th>Статус</th></tr></thead>
      <tbody>`;

    dayOrders.forEach(o => {
      const displayName = o.storeName ? `${o.storeName} (${o.clientName})` : o.clientName;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>#${o.id}</td>
        <td>${displayName}</td>
        <td style="color:#27ae60;">${o.total.toFixed(2)} ₽</td>
        <td class="status-${o.status}">${o.status}</td>`;
      ordersTable.querySelector('tbody').appendChild(tr);
    });

    const itemsTable = document.createElement('table');
    itemsTable.style.width = '100%';
    itemsTable.style.borderCollapse = 'collapse';
    itemsTable.innerHTML = `
      <thead><tr style="background:#f8f9fa;"><th>Товар</th><th>Кол-во</th><th>Цена</th><th>Итого</th></tr></thead>
      <tbody>`;

    itemsList.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.productName}</td>
        <td>${item.qty}</td>
        <td>${item.price.toFixed(2)} ₽/шт</td>
        <td>${item.lineTotal.toFixed(2)} ₽</td>`;
      itemsTable.querySelector('tbody').appendChild(tr);
    });

    const calendarRow = document.createElement('tr');
    calendarRow.innerHTML = `
      <td><strong>${date}</strong></td>
      <td style="vertical-align:top; font-size:0.85rem;">${ordersTable.outerHTML}</td>
      <td style="vertical-align:top; font-size:0.85rem;">${itemsTable.outerHTML}</td>
      <td style="text-align:center; color:#27ae60; font-weight:bold; font-size:1.1rem;">${dayTotal.toFixed(2)} ₽</td>`;
    html += calendarRow.outerHTML;
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

// --- НОВЫЙ ЗАКАЗ (С ПОИСКОМ ТОВАРОВ И ИТОГОМ) ---
function renderNewOrderForm() {
  const clientSelect = document.getElementById('order-client-select');
  clientSelect.innerHTML = '<option value="">Выберите клиента</option>';
  clients.forEach(c => {
    clientSelect.innerHTML += `<option value="${c.id}">${c.name}${c.store ? ' (' + c.store + ')' : ''}</option>`;
  });

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('order-date').value = today;
  document.getElementById('order-items').innerHTML = '';
  document.getElementById('order-total-display').textContent = '0 ₽';
  addOrderItemRow();
}

function addOrderItemRow() {
  const container = document.getElementById('order-items');
  const row = document.createElement('div');
  row.className = 'item-row';
  row.innerHTML = `
    <div class="product-search-wrapper">
      <input type="text" class="product-search" placeholder="Начните вводить название товара..." autocomplete="off" />
      <div class="product-dropdown"></div>
    </div>
    <input type="number" class="item-qty" placeholder="Кол-во" min="1" value="1" style="width:80px;" />
    <span class="item-price" style="text-align:right; padding-right:8px; color:#666;">—</span>
    <span class="item-total" style="font-weight:bold; color:#555;">0 ₽</span>
    <button type="button" class="btn-delete-item" style="background:#e74c3c; padding:0.3rem 0.6rem;">×</button>`;

  container.appendChild(row);

  const searchInput = row.querySelector('.product-search');
  const dropdown = row.querySelector('.product-dropdown');
  const priceEl = row.querySelector('.item-price');
  const totalEl = row.querySelector('.item-total');
  const qtyEl = row.querySelector('.item-qty');

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(query));

    dropdown.innerHTML = '';
    if (query.length > 0 && filtered.length > 0) {
      dropdown.classList.add('open');
      filtered.forEach(p => {
        const div = document.createElement('div');
        div.className = 'dropdown-item';
        div.textContent = `${p.name} — ${p.price.toFixed(0)} ₽`;
        div.onclick = () => {
          searchInput.value = p.name;
          priceEl.textContent = p.price.toFixed(0) + ' ₽';
          const qty = parseInt(qtyEl.value) || 1;
          totalEl.textContent = (p.price * qty).toFixed(0) + ' ₽';
          dropdown.classList.remove('open');
          searchInput.blur();
          recalculateOrderTotal();
        };
        dropdown.appendChild(div);
      });
    } else {
      dropdown.classList.remove('open');
    }
  });

  searchInput.addEventListener('focus', () => {
    if (searchInput.value.length > 0) dropdown.classList.add('open');
  });

  searchInput.addEventListener('blur', () => {
    setTimeout(() => dropdown.classList.remove('open'), 200);
  });

  qtyEl.addEventListener('input', () => {
    const priceText = priceEl.textContent;
    if (priceText === '—' || !priceText.includes('₽')) return;
    const price = parseFloat(priceText.replace(' ₽', ''));
    const qty = parseInt(qtyEl.value) || 0;
    totalEl.textContent = (price * qty).toFixed(0) + ' ₽';
    recalculateOrderTotal();
  });

  row.querySelector('.btn-delete-item').addEventListener('click', () => {
    row.remove();
    recalculateOrderTotal();
  });
}

document.getElementById('btn-add-item').addEventListener('click', addOrderItemRow);

function recalculateOrderTotal() {
  const rows = document.querySelectorAll('.item-row');
  let total = 0;
  rows.forEach(row => {
    const totalEl = row.querySelector('.item-total');
    const text = totalEl.textContent.replace(' ₽', '');
    const val = parseFloat(text) || 0;
    total += val;
  });
  document.getElementById('order-total-display').textContent = total.toFixed(0) + ' ₽';
}

document.getElementById('new-order-form').addEventListener('submit', e => {
  e.preventDefault();

  const clientId = document.getElementById('order-client-select').value;
  if (!clientId) {
    alert('Выберите клиента');
    return;
  }

  const client = clients.find(c => c.id == clientId);
  if (!client) {
    alert('Клиент не найден');
    return;
  }

  const date = document.getElementById('order-date').value;
  const status = document.getElementById('order-status').value;

  const items = [];
  let total = 0;

  document.querySelectorAll('.item-row').forEach(row => {
    const productName = row.querySelector('.product-search').value;
    const qtyInput = row.querySelector('.item-qty');
    const priceText = row.querySelector('.item-price').textContent;

    if (!productName || !qtyInput.value || priceText === '—') return;

    const qty = parseInt(qtyInput.value, 10);
    const price = parseFloat(priceText.replace(' ₽', ''));
    const lineTotal = price * qty;

    items.push({
      productName,
      qty,
      price,
      lineTotal
    });
    total += lineTotal;
  });

  if (items.length === 0) {
    alert('Добавьте хотя бы одну позицию в заказ');
    return;
  }

  const newOrder = {
    id: Date.now(),
    clientId: client.id,
    clientName: client.name,
    storeName: client.store || '',
    clientDirection: client.direction || '',
    date,
    status,
    items,
    total
  };

  orders.push(newOrder);
  saveData();

  alert('Заказ сохранён!');
  document.getElementById('new-order-form').reset();
  renderNewOrderForm();
  renderOrders();
});

