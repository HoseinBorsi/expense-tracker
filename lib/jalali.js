/**
 * کتابخونه تبدیل تاریخ میلادی به شمسی و برعکس
 * بدون هیچ وابستگی خارجی
 * مبتنی بر الگوریتم معروف Kazimierz M. Borkowski
 */
const JalaliDate = (function() {

    // تعداد روزهای هر ماه میلادی
    const G_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // تعداد روزهای هر ماه شمسی
    const J_DAYS = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];

    // نام ماه‌های شمسی
    const J_MONTHS = [
        'فروردین', 'اردیبهشت', 'خرداد',
        'تیر', 'مرداد', 'شهریور',
        'مهر', 'آبان', 'آذر',
        'دی', 'بهمن', 'اسفند'
    ];

    // نام روزهای هفته
    const J_WEEKDAYS = [
        'شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه',
        'چهارشنبه', 'پنجشنبه', 'جمعه'
    ];

    /**
     * بررسی کبیسه بودن سال میلادی
     */
    function isLeapGregorian(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }

    /**
     * بررسی کبیسه بودن سال شمسی
     */
    function isLeapJalali(year) {
        const y = year - 1;
        return (y % 33) % 4 === 3;
    }

    /**
     * تبدیل تاریخ میلادی به شمسی
     */
    function toJalali(gy, gm, gd) {
        let days = (gy - 1) * 365 +
                    Math.floor((gy - 1) / 4) -
                    Math.floor((gy - 1) / 100) +
                    Math.floor((gy - 1) / 400);

        for (let i = 0; i < gm - 1; i++) {
            days += G_DAYS[i];
        }
        if (gm > 2 && isLeapGregorian(gy)) {
            days += 1;
        }
        days += gd;

        const EPOCH = 227015;
        days -= EPOCH;

        let jy = 1;
        while (true) {
            const yearDays = isLeapJalali(jy) ? 366 : 365;
            if (days <= yearDays) break;
            days -= yearDays;
            jy++;
        }

        let jm;
        for (jm = 0; jm < 12; jm++) {
            const monthDays = (jm === 11 && isLeapJalali(jy)) ? 30 : J_DAYS[jm];
            if (days <= monthDays) break;
            days -= monthDays;
        }

        return {
            year: jy,
            month: jm + 1,
            day: days
        };
    }

    /**
     * تبدیل تاریخ شمسی به میلادی
     */
    function toGregorian(jy, jm, jd) {
        let days = 0;
        for (let y = 1; y < jy; y++) {
            days += isLeapJalali(y) ? 366 : 365;
        }
        for (let m = 0; m < jm - 1; m++) {
            days += (m === 11 && isLeapJalali(jy)) ? 30 : J_DAYS[m];
        }
        days += jd;

        const EPOCH = 227015;
        days += EPOCH;

        let gy = 1;
        while (true) {
            const yearDays = isLeapGregorian(gy) ? 366 : 365;
            if (days <= yearDays) break;
            days -= yearDays;
            gy++;
        }

        let gm;
        for (gm = 0; gm < 12; gm++) {
            const monthDays = (gm === 1 && isLeapGregorian(gy)) ? 29 : G_DAYS[gm];
            if (days <= monthDays) break;
            days -= monthDays;
        }

        return {
            year: gy,
            month: gm + 1,
            day: days
        };
    }

    /**
     * قالب‌بندی تاریخ شمسی به صورت متنی
     */
    function format(jy, jm, jd, formatStr) {
        formatStr = formatStr || '{weekday} {d} {month} {year}';
        const monthName = J_MONTHS[jm - 1];
        const weekday = getWeekday(jy, jm, jd);

        return formatStr
            .replace('{year}', toPersianNumbers(jy))
            .replace('{month}', monthName)
            .replace('{weekday}', weekday)
            .replace('{d}', toPersianNumbers(jd));
    }

    /**
     * گرفتن نام روز هفته
     */
    function getWeekday(jy, jm, jd) {
        const g = toGregorian(jy, jm, jd);
        const date = new Date(g.year, g.month - 1, g.day);
        const dayIndex = (date.getDay() + 1) % 7;
        return J_WEEKDAYS[dayIndex];
    }

    /**
     * تبدیل اعداد به فارسی
     */
    function toPersianNumbers(num) {
        const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return String(num).replace(/\d/g, function(d) {
            return persianDigits[parseInt(d, 10)];
        });
    }

    /**
     * گرفتن تعداد روزهای یک ماه شمسی
     */
    function getMonthDays(jy, jm) {
        if (jm === 12 && isLeapJalali(jy)) {
            return 30;
        }
        return J_DAYS[jm - 1];
    }

    /**
     * امروز به شمسی
     */
    function today() {
        const now = new Date();
        return toJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
    }

    return {
        toJalali: toJalali,
        toGregorian: toGregorian,
        format: format,
        getWeekday: getWeekday,
        getMonthDays: getMonthDays,
        toPersianNumbers: toPersianNumbers,
        today: today,
        MONTHS: J_MONTHS,
        WEEKDAYS: J_WEEKDAYS,
        isLeapJalali: isLeapJalali
    };
})();