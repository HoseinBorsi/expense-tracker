// ===== کلید ذخیره‌سازی در localStorage =====
const STORAGE_KEY = 'expense_tracker_items';

// ===== بارگیری هزینه‌ها از localStorage =====
function loadExpenses() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        return [];
    }
    try {
        return JSON.parse(stored);
    } catch (e) {
        console.error('خطا در خوندن از localStorage:', e);
        return [];
    }
}

// ===== ذخیره‌ی هزینه‌ها در localStorage =====
function saveExpenses(expenses) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

// ===== قالب‌بندی عدد با دو رقم اعشار =====
function formatAmount(amount) {
    return Number(amount).toLocaleString('fa-IR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// ===== گرفتن تاریخ امروز به فرمت YYYY-MM-DD =====
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// ===== نمایش/مخفی‌کردن پیام «خالی» =====
function toggleEmptyMessage(expenses) {
    const emptyMessage = document.getElementById('empty-message');
    const listEl = document.getElementById('expenses-list');

    if (expenses.length === 0) {
        emptyMessage.classList.remove('hidden');
        listEl.classList.add('hidden');
    } else {
        emptyMessage.classList.add('hidden');
        listEl.classList.remove('hidden');
    }
}

// ===== نمایش لیست هزینه‌ها در صفحه =====
function renderExpenses() {
    const expenses = loadExpenses();
    const listEl = document.getElementById('expenses-list');

    // پاک کردن محتوای قبلی
    listEl.innerHTML = '';

    // نمایش/مخفی کردن پیام خالی
    toggleEmptyMessage(expenses);

    // اضافه کردن هر هزینه به لیست
    expenses.forEach(function(expense, index) {
        const li = document.createElement('li');
        li.className = 'expense-item';
        li.dataset.index = index;

        // بخش اطلاعات
        const infoDiv = document.createElement('div');
        infoDiv.className = 'expense-info';

        const amountSpan = document.createElement('div');
        amountSpan.className = 'expense-amount';
        amountSpan.textContent = formatAmount(expense.amount) + ' تومان';

        const descDiv = document.createElement('div');
        descDiv.className = 'expense-description';
        descDiv.textContent = expense.description;

        const dateDiv = document.createElement('div');
        dateDiv.className = 'expense-date';
        dateDiv.textContent = expense.date;

        infoDiv.appendChild(amountSpan);
        infoDiv.appendChild(descDiv);
        infoDiv.appendChild(dateDiv);

        // بخش دکمه‌ی حذف
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'expense-actions';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-delete';
        deleteBtn.textContent = '🗑 حذف';
        deleteBtn.addEventListener('click', function() {
            deleteExpense(index);
        });

        actionsDiv.appendChild(deleteBtn);

        li.appendChild(infoDiv);
        li.appendChild(actionsDiv);
        listEl.appendChild(li);
    });
}

// ===== افزودن هزینه‌ی جدید =====
function addExpense(event) {
    event.preventDefault();

    const amountInput = document.getElementById('amount');
    const descriptionInput = document.getElementById('description');
    const dateInput = document.getElementById('date');

    const amount = amountInput.value.trim();
    const description = descriptionInput.value.trim();
    const date = dateInput.value;

    // اعتبارسنجی
    if (!amount || Number(amount) <= 0) {
        alert('لطفاً یه مقدار معتبر وارد کن.');
        return;
    }
    if (!description) {
        alert('لطفاً یه توضیح کوتاه بنویس.');
        return;
    }
    if (!date) {
        alert('لطفاً تاریخ رو انتخاب کن.');
        return;
    }

    // ساخت آیتم جدید
    const newExpense = {
        amount: Number(amount),
        description: description,
        date: date
    };

    // بارگیری لیست موجود و اضافه کردن
    const expenses = loadExpenses();
    expenses.push(newExpense);
    saveExpenses(expenses);

    // پاک کردن فرم و به‌روزرسانی نمایش
    document.getElementById('expense-form').reset();
    document.getElementById('date').value = getTodayDate();
    renderExpenses();
}

// ===== حذف یه هزینه با تأیید =====
function deleteExpense(index) {
    const confirmed = confirm('آیا مطمئنی که می‌خوای این هزینه رو حذف کنی؟');
    if (!confirmed) {
        return;
    }

    const expenses = loadExpenses();
    expenses.splice(index, 1);
    saveExpenses(expenses);
    renderExpenses();
}

// ===== مقداردهی اولیه وقتی صفحه بار می‌شه =====
function init() {
    // تنظیم تاریخ پیش‌فرض به امروز
    document.getElementById('date').value = getTodayDate();

    // اتصال رویداد submit به فرم
    document.getElementById('expense-form').addEventListener('submit', addExpense);

    // نمایش هزینه‌های ذخیره‌شده
    renderExpenses();
}

// ===== اجرا بعد از بارگیری کامل صفحه =====
document.addEventListener('DOMContentLoaded', init);