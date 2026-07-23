// --- ИНИЦИАЛИЗАЦИЯ ДАННЫХ ---
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
  const search = document.getElementById('client-search').value.toLowerCase();
  list.innerHTML = '';
  clients
    .filter(c => c.name.toLowerCase().includes(search) || (c.store && c.store.toLowerCase().includes(search)))
    .forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${c.name}</td>
        <td>${c.store || '-'}</td>
        <td>${c.point || '-'}</td>
        <td>${c.phone || '-'}</td>
        <td>
          <button onclick="editClient(${c.id})">Изменить</button>
          <button onclick="deleteClient(${c.id})" style="background:#e74c3c">Удалить</button>
        </td>`;
      list.appendChild(tr);
    });
}

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
    document.getElementById('client-phone').value = c.phone || '';
  } else {
    document.getElementById('client-form').reset();
    document.getElementById('client-id').value = '';
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
  const phone = document.getElementById('client-phone').value;

  if (id) {
    const idx = clients.findIndex(x => x.id == id);
    clients[idx] = { ...clients[idx], name, store, point, phone };
  } else {
    clients.push({ id: Date.now(), name, store, point, phone });
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
      <td>${o.total.toFixed(2)} ₽</td>
      <td class="status-${o.status}">${o.status}</td>
      <td>
        <button onclick="viewOrderDetails(${o.id})">Детали</button>
        <button onclick="deleteOrder(${o.id})" style="background:#e74c3c">Удалить</button>
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
    <p><strong>Статус:</strong> <span class="status-${order.status}">${order.status}</span></p>
    <p><strong>Итого:</strong> ${order.total.toFixed(2)} ₽</p>
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

  // Группируем заказы по дате
  const byDate = {};
  orders.forEach(o => {
    if (!byDate[o.date]) byDate[o.date] = [];
    byDate[o.date].push(o);
  });

  let html = '<table class="data-table"><thead><tr><th>Дата</th><th>Заказы (список)</th><th>Товары (все позиции)</th><th>Итого за день</th></tr></thead><tbody>';

  Object.keys(byDate).sort().forEach(date => {
    const dayOrders = byDate[date];
    let dayTotal = 0;
    const itemsList = [];

    dayOrders.forEach(o => {
      dayTotal += o.total;
      o.items.forEach(i => itemsList.push(i));
    });

    // Таблица заказов за день
    const ordersTable = document.createElement('table');
    ordersTable.style.width = '100%';
    ordersTable.style.borderCollapse = 'collapse';
    ordersTable.innerHTML = `
      <thead><tr style="background:#f8f9fa;"><th>#</th><th>Направление</th><th>Клиент/Магазин</th><th>Сумма</th><th>Статус</th></tr></thead>
      <tbody>`;

    dayOrders.forEach(o => {
      const displayName = o.storeName ? `${o.storeName} (${o.clientName})` : o.clientName;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>#${o.id}</td>
        <td>${o.direction || '-'}</td>
        <td>${displayName}</td>
        <td>${o.total.toFixed(2)} ₽</td>
        <td class="status-${o.status}">${o.status}</td>`;
      ordersTable.querySelector('tbody').appendChild(tr);
    });

    // Таблица товаров за день (плоский список всех позиций)
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
      <td><strong>${dayTotal.toFixed(2)} ₽</strong></td>`;
    html += calendarRow.outerHTML;
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

// --- НОВЫЙ ЗАКАЗ (С ПОИСКОМ ТОВАРОВ) ---
function renderNewOrderForm() {
  const clientSelect = document.getElementById('order-client-select');
  clientSelect.innerHTML = '<option value="">Выберите клиента</option>';
  clients.forEach(c => {
    clientSelect.innerHTML += `<option value="${c.id}">${c.name}${c.store ? ' (' + c.store + ')' : ''}</option>`;
  });

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('order-date').value = today;
  document.getElementById('order-items').innerHTML = '';
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
    <span class="item-total" style="font-weight:bold;">0 ₽</span>
    <button type="button" class="btn-delete-item" style="background:#e74c3c; padding:0.3rem 0.6rem;">×</button>`;

  container.appendChild(row);

  // Логика поиска товара в этом ряду
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
  });

  row.querySelector('.btn-delete-item').addEventListener('click', () => {
    row.remove();
    recalculateOrderTotal();
  });
}

document.getElementById('btn-add-item').addEventListener('click', addOrderItemRow);

function recalculateOrderTotal() {
  // Эта функция нужна, если ты хочешь отдельно считать итог формы до сохранения.
  // Сейчас итог считается при сохранении заказа, но можно использовать и здесь.
}

document.getElementById('new-order-form').addEventListener('submit', e => {
  e.preventDefault();

  const clientId = document.getElementById('order-client-select').value;
  if (!clientId) { alert('Выберите клиента'); return; }
  const client = clients.find(c => c.id == clientId);
  const date = document.getElementById('order-date').value;
  const status = document.getElementById('order-status').value;

  const itemsContainer = document.getElementById('order-items');
  const rows = itemsContainer.querySelectorAll('.item-row');
  const items = [];
  let total = 0;

  rows.forEach(row => {
    const productName = row.querySelector('.product-search').value.trim();
    const qtyInput = row.querySelector('.item-qty');
    const priceEl = row.querySelector('.item-price');

    if (!productName) return; // пропускаем пустые строки

    const qty = parseInt(qtyInput.value) || 1;
    // Цена берётся из текста «X ₽», если нет — ищем в products по названию (на случай ручного ввода)
    let price = parseFloat(priceEl.textContent.replace(' ₽', '')) || 0;
    if (price === 0) {
      const prod = products.find(p => p.name.toLowerCase() === productName.toLowerCase());
      if (prod) price = prod.price;
    }

    const lineTotal = price * qty;
    total += lineTotal;

    items.push({
      productName,
      qty,
      price,
      lineTotal
    });
  });

  if (items.length === 0) {
    alert('Добавьте хотя бы один товар в заказ');
    return;
  }

  const newOrder = {
    id: Date.now(),
    clientId,
    clientName: client.name,
    storeName: client.store,
    date,
    status,
    items,
    total
  };

  orders.push(newOrder);
  saveData();

  alert('Заказ сохранён!');
  renderNewOrderForm(); // сброс формы
  renderOrders();       // обновить список заказов
});
