
(function (global) {
  'use strict';

  const STORAGE_KEY = 'lankaFreshMartSalesData2026';
  const PREFERENCES_KEY = 'lankaFreshMartPreferences';

  const MONTHS = [
    { name: 'January', short: 'Jan', quarter: 'q1' },
    { name: 'February', short: 'Feb', quarter: 'q1' },
    { name: 'March', short: 'Mar', quarter: 'q1' },
    { name: 'April', short: 'Apr', quarter: 'q2' },
    { name: 'May', short: 'May', quarter: 'q2' },
    { name: 'June', short: 'Jun', quarter: 'q2' },
    { name: 'July', short: 'Jul', quarter: 'q3' },
    { name: 'August', short: 'Aug', quarter: 'q3' },
    { name: 'September', short: 'Sep', quarter: 'q3' },
    { name: 'October', short: 'Oct', quarter: 'q4' },
    { name: 'November', short: 'Nov', quarter: 'q4' },
    { name: 'December', short: 'Dec', quarter: 'q4' }
  ];

  const BRANCHES = ['Colombo', 'Kandy', 'Galle'];

  // The Sample datas
  const DEFAULT_SALES_DATA = [
    { month: 'January', revenue: 1250, units: 2400, branches: { Colombo: 575, Kandy: 400, Galle: 275 } },
    { month: 'February', revenue: 1380, units: 2550, branches: { Colombo: 635, Kandy: 415, Galle: 330 } },
    { month: 'March', revenue: 1460, units: 2700, branches: { Colombo: 670, Kandy: 455, Galle: 335 } },
    { month: 'April', revenue: 1520, units: 2850, branches: { Colombo: 700, Kandy: 480, Galle: 340 } },
    { month: 'May', revenue: 1680, units: 3100, branches: { Colombo: 775, Kandy: 535, Galle: 370 } },
    { month: 'June', revenue: 1750, units: 3250, branches: { Colombo: 805, Kandy: 555, Galle: 390 } },
    { month: 'July', revenue: 1820, units: 3400, branches: { Colombo: 840, Kandy: 575, Galle: 405 } },
    { month: 'August', revenue: 1760, units: 3300, branches: { Colombo: 810, Kandy: 555, Galle: 395 } },
    { month: 'September', revenue: 1950, units: 3600, branches: { Colombo: 900, Kandy: 600, Galle: 450 } },
    { month: 'October', revenue: 2050, units: 3800, branches: { Colombo: 950, Kandy: 650, Galle: 450 } },
    { month: 'November', revenue: 2280, units: 4200, branches: { Colombo: 1050, Kandy: 725, Galle: 505 } },
    { month: 'December', revenue: 2600, units: 4800, branches: { Colombo: 1200, Kandy: 840, Galle: 560 } }
  ];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function safeStorageGet(key) {
    try { return global.localStorage.getItem(key); } catch (error) { return null; }
  }

  function safeStorageSet(key, value) {
    try { global.localStorage.setItem(key, value); return true; } catch (error) { return false; }
  }

  function safeStorageRemove(key) {
    try { global.localStorage.removeItem(key); return true; } catch (error) { return false; }
  }

  function normaliseText(value) {
    return String(value || '').trim().toLowerCase().replace(/[^a-z]/g, '');
  }

  function monthIndex(value) {
    const candidate = normaliseText(value);
    return MONTHS.findIndex((month) => (
      normaliseText(month.name) === candidate || normaliseText(month.short) === candidate
    ));
  }

  function readNumber(value) {
    if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
    const cleaned = String(value == null ? '' : value)
      .replace(/,/g, '')
      .replace(/lkr/ig, '')
      .replace(/k$/i, '')
      .trim();
    return cleaned === '' ? NaN : Number(cleaned);
  }

  function rounded(value) { return Math.round(value * 10) / 10; }

  function fallbackBranches(revenue) {
    const colombo = rounded(revenue * 0.461);
    const kandy = rounded(revenue * 0.316);
    return { Colombo: colombo, Kandy: kandy, Galle: rounded(revenue - colombo - kandy) };
  }

  function buildRecord(row) {
    const index = monthIndex(row.month);
    const revenue = readNumber(row.revenue);
    const units = readNumber(row.units);
    const sourceBranches = row.branches || {};
    const givenBranchValues = BRANCHES.map((branch) => readNumber(sourceBranches[branch]));
    const allBranchesProvided = givenBranchValues.every((value) => Number.isFinite(value) && value >= 0);
    const branches = allBranchesProvided
      ? { Colombo: givenBranchValues[0], Kandy: givenBranchValues[1], Galle: givenBranchValues[2] }
      : fallbackBranches(revenue);

    return {
      month: index === -1 ? String(row.month || '').trim() : MONTHS[index].name,
      short: index === -1 ? '' : MONTHS[index].short,
      monthIndex: index,
      quarter: index === -1 ? '' : MONTHS[index].quarter,
      revenue,
      units,
      branches
    };
  }

  function validateSalesData(rows) {
    const errors = [];
    if (!Array.isArray(rows)) {
      return { valid: false, errors: ['The sales dataset must be an array of monthly records.'], data: [] };
    }

    const prepared = rows.map((row, index) => {
      const record = buildRecord(row || {});
      const rowNumber = index + 2;
      if (record.monthIndex === -1) errors.push(`Row ${rowNumber}: use a valid month name from January to December.`);
      if (!Number.isFinite(record.revenue) || record.revenue < 0) errors.push(`Row ${rowNumber}: Revenue must be a non-negative number.`);
      if (!Number.isFinite(record.units) || record.units < 0) errors.push(`Row ${rowNumber}: Units Sold must be a non-negative number.`);

      const branchTotal = BRANCHES.reduce((total, branch) => total + record.branches[branch], 0);
      if (!Number.isFinite(branchTotal) || Math.abs(branchTotal - record.revenue) > 0.2) {
        errors.push(`Row ${rowNumber}: branch revenue must add up to the monthly revenue.`);
      }
      return record;
    });

    if (prepared.length !== MONTHS.length) errors.push('Import exactly 12 monthly rows, covering January through December 2026.');
    const monthSet = new Set(prepared.map((record) => record.monthIndex));
    if (monthSet.size !== MONTHS.length || monthSet.has(-1)) {
      errors.push('Each month from January through December must appear once, with no duplicates.');
    }

    return { valid: errors.length === 0, errors, data: prepared.sort((a, b) => a.monthIndex - b.monthIndex) };
  }

  function getDefaultData() { return validateSalesData(clone(DEFAULT_SALES_DATA)).data; }

  function getSalesData() {
    const stored = safeStorageGet(STORAGE_KEY);
    if (!stored) return getDefaultData();
    try {
      const result = validateSalesData(JSON.parse(stored));
      return result.valid ? result.data : getDefaultData();
    } catch (error) {
      return getDefaultData();
    }
  }

  function saveSalesData(rows) {
    const result = validateSalesData(rows);
    if (!result.valid) return result;
    if (!safeStorageSet(STORAGE_KEY, JSON.stringify(result.data))) {
      return { valid: false, errors: ['Browser storage is unavailable, so the imported data could not be saved.'], data: result.data };
    }
    return result;
  }

  function resetSalesData() { return safeStorageRemove(STORAGE_KEY); }

  function filterSalesData(data, period) {
    if (!period || period === 'all') return data.slice();
    if (/^q[1-4]$/.test(period)) return data.filter((record) => record.quarter === period);
    if (period.indexOf('month-') === 0) {
      const index = Number(period.replace('month-', ''));
      return data.filter((record) => record.monthIndex === index);
    }
    return data.slice();
  }

  function periodLabel(period, data) {
    const selected = filterSalesData(data || getSalesData(), period);
    if (!selected.length) return 'No months selected';
    if (selected.length === 1) return selected[0].month;
    return `${selected[0].month} – ${selected[selected.length - 1].month}`;
  }

  function getSummary(data) {
    const totalRevenue = data.reduce((total, record) => total + record.revenue, 0);
    const totalUnits = data.reduce((total, record) => total + record.units, 0);
    const bestMonth = data.reduce((best, record) => (!best || record.revenue > best.revenue ? record : best), null);
    const first = data[0];
    const last = data[data.length - 1];
    const growth = first && first.revenue ? ((last.revenue - first.revenue) / first.revenue) * 100 : 0;
    return {
      totalRevenue,
      totalUnits,
      averageRevenue: data.length ? totalRevenue / data.length : 0,
      averageUnits: data.length ? totalUnits / data.length : 0,
      bestMonth,
      growth,
      monthCount: data.length
    };
  }

  function getBranchPerformance(data) {
    const totals = BRANCHES.map((branch) => ({ branch, revenue: 0 }));
    data.forEach((record) => totals.forEach((item) => { item.revenue += Number(record.branches[item.branch]) || 0; }));
    const totalRevenue = totals.reduce((total, item) => total + item.revenue, 0);
    return totals.map((item) => ({
      branch: item.branch,
      revenue: rounded(item.revenue),
      share: totalRevenue ? (item.revenue / totalRevenue) * 100 : 0
    }));
  }

  function getQuarterSummaries(data) {
    return ['q1', 'q2', 'q3', 'q4'].map((quarter) => ({ quarter: quarter.toUpperCase(), ...getSummary(filterSalesData(data, quarter)) }));
  }

  function getPreferences() {
    try { return JSON.parse(safeStorageGet(PREFERENCES_KEY) || '{}'); } catch (error) { return {}; }
  }

  function savePreferences(preferences) {
    return safeStorageSet(PREFERENCES_KEY, JSON.stringify({ ...getPreferences(), ...preferences }));
  }

  function getDefaultPeriod() {
    const value = getPreferences().defaultPeriod;
    return ['all', 'q1', 'q2', 'q3', 'q4'].includes(value) ? value : 'all';
  }

  function getSampleCsv() {
    const rows = ['Month,Revenue,Units Sold,Colombo,Kandy,Galle'];
    getDefaultData().forEach((record) => rows.push([
      record.month, record.revenue, record.units,
      record.branches.Colombo, record.branches.Kandy, record.branches.Galle
    ].join(',')));
    return rows.join('\n');
  }

  global.LankaFreshData = {
    MONTHS,
    BRANCHES,
    DEFAULT_SALES_DATA: clone(DEFAULT_SALES_DATA),
    getSalesData,
    saveSalesData,
    resetSalesData,
    validateSalesData,
    filterSalesData,
    periodLabel,
    getSummary,
    getBranchPerformance,
    getQuarterSummaries,
    getPreferences,
    savePreferences,
    getDefaultPeriod,
    getSampleCsv
  };
})(window);
