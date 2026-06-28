// =============================================
// ردیاب هزینه — منطق برنامه
// =============================================

const STORAGE_KEY = 'expense_tracker_items_v2';

// ===== بارگیری هزینه‌ها از localStorage =====
function loadExpenses() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
        return JSON.parse(stored);
    } catch (e) {
        return [];
    }
}

// ===== ذخیره هزینه‌ها در localStorage =====
function saveExpenses(expenses) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

// ===== قالب‌بندی عدد با دو رقم اعشار (فارسی) =====
function formatAmount(amount) {
    return Number(amount).toLocaleString('fa-IR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// ===== آیکون دسته‌بندی =====
const CATEGORY_ICONS = {
    'خوراکی': '🍔',
    'حمل و نقل': '🚗',
    'مسکن': '🏠',
    'تفریح': '🎮',
    'سلامت': '💊',
    'خرید': '🛒',
    'سایر': '📌'
};

const CATEGORY_COLORS = {
    'خوراکی': '#ffeaa7',
    'حمل و نقل': '#81ecec',
    'مسکن': '#fab1a0',
    'تفریح': '#a29bfe',
    'سلامت': '#ff7675',
    'خرید': '#fd79a8',
    'سایر': '#dfe6e9'
};

// ===== مقداردهی dropdownهای تاریخ شمسی =====
function populateJalaliDateInputs() {
    const today = JalaliDate.today();
    const yearSelect = document.getElementById('j-year');
    const monthSelect = document.getElementById('j-month');
    const daySelect = document.getElementById('j-day');

    // سال (سال جاری - ۵ تا +۵)
    yearSelect.innerHTML = '';
    for (let y = today.year - 5; y <= today.year + 5; y++) {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = JalaliDate.toPersianNumbers(y);
        if (y === today.year) opt.selected = true;
        yearSelect.appendChild(opt);
    }

    // ماه
    monthSelect.innerHTML = '';
    JalaliDate.MONTHS.forEach(function(name, i) {
        const opt = document.createElement('option');
        opt.value = i + 1;
        opt.textContent = name;
        if (i + 1 === today.month) opt.selected = true;
        monthSelect.appendChild(opt);
    });

    // روز
    updateJalaliDays();
    daySelect.value = today.day;
}

// ===== به‌روزرسانی روزها بر اساس ماه و سال انتخابی =====
function updateJalaliDays() {
    const year = parseInt(document.getElementById('j-year').value, 10);
    const month = parseInt(document.getElementById('j-month').value, 10);
    const daySelect = document.getElementById('j-day');
    const maxDays = JalaliDate.getMonthDays(year, month);
    const currentDay = parseInt(daySelect.value, 10);

    daySelect.innerHTML = '';
    for (let d = 1; d <= maxDays; d++) {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = JalaliDate.toPersianNumbers(d);
        if (d === currentDay || (d === maxDays && currentDay > maxDays)) {
            opt.selected = true;
        }
        daySelect.appendChild(opt);
    }
}

// ===== گرفتن تاریخ شمسی از dropdownها =====
function getSelectedJalaliDate() {
    return {
        year: parseInt(document.getElementById('j-year').value, 10),
        month: parseInt(document.getElementById('j-month').value, 10),
        day: parseInt(document.getElementById('j-day').value, 10)
    };
}

// ===== قالب‌بندی تاریخ شمسی =====
function formatJalaliDate(jy, jm, jd) {
    return JalaliDate.format(jy, jm, jd, '{weekday} {d} {month} {year}');
}

// =============================================
// STATS
// =============================================
function calculateMonthlyTotal(expenses, jy, jm) {
    let total = 0, count = 0;
    expenses.forEach(function(e) {
        if (e.jy === jy && e.jm === jm) {
            total += e.amount;
            count++;
        }
    });
    return { total: total, count: count };
}

function calculateDailyAverage(expenses, jy, jm) {
    const days = JalaliDate.getMonthDays(jy, jm);
    const total = calculateMonthlyTotal(expenses, jy, jm).total;
    return days > 0 ? Math.round(total / days) : 0;
}

// =============================================
// SUMMARY
// =============================================
function getAvailableMonths(expenses) {
    const monthSet = new Set();
    expenses.forEach(function(e) {
        if (e.jy && e.jm) {
            monthSet.add(e.jy + '-' + String(e.jm).padStart(2, '0'));
        }
    });
    return Array.from(monthSet).sort().reverse();
}

function populateMonthPicker(expenses) {
    const picker = document.getElementById('month-picker');
    const months = getAvailableMonths(expenses);

    picker.innerHTML = '';
    if (months.length === 0) {
        const now = JalaliDate.today();
        const opt = document.createElement('option');
        opt.value = now.year + '-' + String(now.month).padStart(2, '0');
        opt.textContent = JalaliDate.MONTHS[now.month - 1] + ' ' + JalaliDate.toPersianNumbers(now.year);
        picker.appendChild(opt);
        return;
    }

    months.forEach(function(key) {
        const parts = key.split('-');
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = JalaliDate.MONTHS[m - 1] + ' ' + JalaliDate.toPersianNumbers(y);
        picker.appendChild(opt);
    });
}

function updateSummary() {
    const expenses = loadExpenses();
    const picker = document.getElementById('month-picker');
    const totalEl = document.getElementById('summary-total').querySelector('.total-amount');
    const countEl = document.getElementById('stat-count');
    const avgEl = document.getElementById('stat-average');

    const selected = picker.value;
    if (!selected) {
        totalEl.textContent = '۰';
        countEl.textContent = '۰';
        avgEl.textContent = '۰';
        return;
    }

    const parts = selected.split('-');
    const jy = parseInt(parts[0], 10);
    const jm = parseInt(parts[1], 10);
    const stats = calculateMonthlyTotal(expenses, jy, jm);
    const avg = calculateDailyAverage(expenses, jy, jm);

    totalEl.textContent = formatAmount(stats.total);
    countEl.textContent = JalaliDate.toPersianNumbers(stats.count);
    avgEl.textContent = formatAmount(avg);
}

// =============================================
// SEARCH
// =============================================
let searchQuery = '';

function toggleSearch() {
    const bar = document.getElementById('search-bar');
    bar.classList.toggle('hidden');
    if (!bar.classList.contains('hidden')) {
        document.getElementById('search-input').focus();
    } else {
        searchQuery = '';
        document.getElementById('search-input').value = '';
        renderExpenses();
    }
}

// =============================================
// RENDER
// =============================================
function renderExpenses() {
    let expenses = loadExpenses();
    const listEl = document.getElementById('expenses-list');
    const emptyEl = document.getElementById('empty-state');
    const countEl = document.getElementById('list-count');

    // جستجو
    if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        expenses = expenses.filter(function(e) {
            return e.description.toLowerCase().includes(q) ||
                   e.category.toLowerCase().includes(q) ||
                   formatAmount(e.amount).includes(q);
        });
    }

    // مرتب‌سازی نزولی
    expenses.sort(function(a, b) {
        const keyA = a.jy * 10000 + a.jm * 100 + a.jd;
        const keyB = b.jy * 10000 + b.jm * 100 + b.jd;
        return keyB - keyA;
    });

    if (expenses.length === 0) {
        emptyEl.classList.remove('hidden');
        listEl.innerHTML = '';
        countEl.textContent = '۰ مورد';
        return;
    }

    emptyEl.classList.add('hidden');
    countEl.textContent = JalaliDate.toPersianNumbers(expenses.length) + ' مورد';

    // ساخت HTML همه آیتم‌ها یکجا
    const itemsHtml = expenses.map(function(expense, index) {
        const icon = CATEGORY_ICONS[expense.category] || '📌';
        const catColor = CATEGORY_COLORS[expense.category] || '#dfe6e9';
        const dateStr = formatJalaliDate(expense.jy, expense.jm, expense.jd);

        return '<div class="expense-item" style="animation-delay:' + ((index % 10) * 0.03) + 's">' +
            '<div class="expense-category-icon" style="background:' + catColor + '">' + icon + '</div>' +
            '<div class="expense-info">' +
                '<div class="expense-amount">' + formatAmount(expense.amount) + ' تومان</div>' +
                '<div class="expense-description">' + escapeHtml(expense.description) + '</div>' +
                '<div class="expense-date">' + dateStr + '</div>' +
            '</div>' +
            '<div class="expense-actions">' +
                '<button class="btn-delete" data-idx="' + index + '">🗑️</button>' +
            '</div>' +
        '</div>';
    }).join('');

    listEl.innerHTML = itemsHtml;

    // رویداد حذف
    listEl.querySelectorAll('.btn-delete').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            const idx = parseInt(this.dataset.idx, 10);
            const filteredExpenses = filterExpenses(loadExpenses());
            if (filteredExpenses[idx] !== undefined) {
                const target = filteredExpenses[idx];
                const realIdx = findRealIndex(target);
                if (realIdx !== -1) deleteExpense(realIdx);
            }
            e.stopPropagation();
        });
    });
}

function filterExpenses(expenses) {
    if (!searchQuery.trim()) return expenses;
    const q = searchQuery.trim().toLowerCase();
    return expenses.filter(function(e) {
        return e.description.toLowerCase().includes(q) ||
               e.category.toLowerCase().includes(q);
    });
}

function findRealIndex(target) {
    const expenses = loadExpenses();
    for (let i = 0; i < expenses.length; i++) {
        const e = expenses[i];
        if (e.amount === target.amount &&
            e.description === target.description &&
            e.jy === target.jy &&
            e.jm === target.jm &&
            e.jd === target.jd) {
            return i;
        }
    }
    return -1;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// =============================================
// ADD EXPENSE
// =============================================
function addExpense(event) {
    event.preventDefault();

    const amount = document.getElementById('amount').value.trim();
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value.trim();
    const date = getSelectedJalaliDate();

    if (!amount || Number(amount) <= 0) {
        showToast('لطفاً یه مقدار معتبر وارد کن.');
        return;
    }
    if (!description) {
        showToast('لطفاً یه توضیح کوتاه بنویس.');
        return;
    }

    const newExpense = {
        amount: Number(amount),
        category: category,
        description: description,
        jy: date.year,
        jm: date.month,
        jd: date.day
    };

    const expenses = loadExpenses();
    expenses.push(newExpense);
    saveExpenses(expenses);

    document.getElementById('expense-form').reset();

    const today = JalaliDate.today();
    document.getElementById('j-year').value = today.year;
    document.getElementById('j-month').value = today.month;
    updateJalaliDays();
    document.getElementById('j-day').value = today.day;

    toggleAddForm(false);
    populateMonthPicker(expenses);
    updateSummary();
    renderExpenses();
    showToast('💰 هزینه با موفقیت ثبت شد!');
}

// =============================================
// DELETE EXPENSE
// =============================================
function deleteExpense(index) {
    if (!confirm('آیا مطمئنی که می‌خوای این هزینه رو حذف کنی؟')) return;

    const expenses = loadExpenses();
    expenses.splice(index, 1);
    saveExpenses(expenses);

    populateMonthPicker(expenses);
    updateSummary();
    renderExpenses();
    showToast('🗑️ هزینه حذف شد.');
}

// =============================================
// TOGGLE FORM
// =============================================
function toggleAddForm(forceState) {
    const container = document.getElementById('add-form-container');
    const arrow = document.getElementById('toggle-arrow');
    const isOpen = container.classList.contains('open');

    if (forceState === false || (forceState === undefined && isOpen)) {
        container.classList.remove('open');
        arrow.classList.remove('open');
    } else {
        container.classList.add('open');
        arrow.classList.add('open');
    }
}

// =============================================
// EXPORT JSON
// =============================================
function exportJSON() {
    const expenses = loadExpenses();
    if (expenses.length === 0) {
        showToast('هیچ هزینه‌ای برای خروجی گرفتن وجود نداره.');
        return;
    }

    const today = JalaliDate.today();
    const data = {
        exportDate: today.year + '/' + today.month + '/' + today.day,
        totalExpenses: expenses.length,
        items: expenses
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expenses-backup-' + today.year + '-' +
                  String(today.month).padStart(2, '0') + '-' +
                  String(today.day).padStart(2, '0') + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('✅ فایل پشتیبان با موفقیت دانلود شد.');
}

// =============================================
// TOAST
// =============================================
function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(function() {
        toast.remove();
    }, 2500);
}

// =============================================
// FAB (دکمه اسکرول به بالا)
// =============================================
function handleScroll() {
    const fab = document.getElementById('fab-top');
    if (window.scrollY > 300) {
        fab.classList.add('visible');
    } else {
        fab.classList.remove('visible');
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =============================================
// INIT
// =============================================
function init() {
    // تنظیم dropdownهای تاریخ شمسی
    populateJalaliDateInputs();

    // رویداد تغییر ماه/سال (به‌روزرسانی روزها)
    document.getElementById('j-year').addEventListener('change', updateJalaliDays);
    document.getElementById('j-month').addEventListener('change', updateJalaliDays);

    // رویداد فرم
    document.getElementById('expense-form').addEventListener('submit', addExpense);

    // رویداد toggle فرم
    document.getElementById('add-toggle').addEventListener('click', function() {
        toggleAddForm();
    });

    // رویداد انتخابگر ماه
    document.getElementById('month-picker').addEventListener('change', updateSummary);

    // رویداد جستجو
    document.getElementById('search-toggle').addEventListener('click', toggleSearch);
    document.getElementById('search-close').addEventListener('click', toggleSearch);
    document.getElementById('search-input').addEventListener('input', function() {
        searchQuery = this.value;
        renderExpenses();
    });

    // رویداد خروجی
    document.getElementById('export-btn').addEventListener('click', exportJSON);

    // اسکرول
    document.getElementById('fab-top').addEventListener('click', scrollToTop);
    window.addEventListener('scroll', handleScroll);

    // نمایش تاریخ امروز در هدر
    const today = JalaliDate.today();
    document.getElementById('header-date').textContent = formatJalaliDate(today.year, today.month, today.day);

    // بارگیری داده‌ها
    const expenses = loadExpenses();
    populateMonthPicker(expenses);
    updateSummary();
    renderExpenses();
}

// ===== اجرا بعد از بارگیری کامل صفحه =====
document.addEventListener('DOMContentLoaded', init);