/* Lanka Fresh Mart multi-page dashboard application */
(function () {
  'use strict';

  const Data = window.LankaFreshData;
  const state = { charts: {}, render: null, importRows: null };

  function byId(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    const element = byId(id);
    if (element) element.textContent = value;
  }

  function formatNumber(value, maximumFractionDigits) {
    return Number(value || 0).toLocaleString('en-LK', {
      maximumFractionDigits: typeof maximumFractionDigits === 'number' ? maximumFractionDigits : 1
    });
  }

  function formatRevenue(value) {
    return 'LKR ' + formatNumber(value) + 'k';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character];
    });
  }

  function percent(value) {
    const prefix = value > 0 ? '+' : '';
    return prefix + Number(value || 0).toFixed(1) + '%';
  }

  function growthClass(value) {
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return 'neutral';
  }

  function getThemeColors() {
    const dark = document.body.classList.contains('dark-theme');
    return {
      text: dark ? '#EDEBFF' : '#12102b',
      muted: dark ? '#a5a1d6' : '#5d5983',
      grid: dark ? 'rgba(237, 235, 255, 0.09)' : 'rgba(108, 59, 255, 0.1)',
      tooltip: dark ? '#121626' : '#120d2e'
    };
  }

  function commonChartOptions() {
    const colors = getThemeColors();
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: colors.text, font: { family: 'Inter' } } },
        tooltip: {
          backgroundColor: colors.tooltip,
          titleColor: '#EDEBFF',
          bodyColor: '#EDEBFF',
          borderColor: '#6C3BFF',
          borderWidth: 1,
          padding: 10
        }
      },
      scales: {
        x: {
          ticks: { color: colors.muted },
          grid: { color: colors.grid }
        },
        y: {
          ticks: { color: colors.muted },
          grid: { color: colors.grid }
        }
      }
    };
  }

  function replaceChart(key, canvasId, config) {
    const canvas = byId(canvasId);
    if (!canvas || typeof window.Chart === 'undefined') return;
    if (state.charts[key]) state.charts[key].destroy();
    state.charts[key] = new window.Chart(canvas.getContext('2d'), config);
  }

  function createRevenueChart(key, canvasId, records) {
    const options = commonChartOptions();
    options.plugins.tooltip.callbacks = {
      label: function (context) { return ' Revenue: ' + formatRevenue(context.parsed.y); }
    };
    options.scales.y.title = { display: true, text: "Revenue (LKR '000)", color: getThemeColors().muted, font: { weight: '600' } };
    options.scales.x.title = { display: true, text: 'Month (2026)', color: getThemeColors().muted, font: { weight: '600' } };

    replaceChart(key, canvasId, {
      type: 'line',
      data: {
        labels: records.map(function (record) { return record.short; }),
        datasets: [{
          label: "Revenue (LKR '000)",
          data: records.map(function (record) { return record.revenue; }),
          borderColor: '#6C3BFF',
          backgroundColor: 'rgba(108, 59, 255, 0.18)',
          pointBackgroundColor: '#2979FF',
          pointBorderColor: '#EDEBFF',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 3,
          tension: 0.35,
          fill: true
        }]
      },
      options: options
    });
  }

  function createUnitsChart(key, canvasId, records) {
    const options = commonChartOptions();
    options.plugins.tooltip.callbacks = {
      label: function (context) { return ' Units sold: ' + formatNumber(context.parsed.y, 0); }
    };
    options.scales.y.title = { display: true, text: 'Units Sold', color: getThemeColors().muted, font: { weight: '600' } };
    options.scales.x.title = { display: true, text: 'Month (2026)', color: getThemeColors().muted, font: { weight: '600' } };

    replaceChart(key, canvasId, {
      type: 'bar',
      data: {
        labels: records.map(function (record) { return record.short; }),
        datasets: [{
          label: 'Units Sold',
          data: records.map(function (record) { return record.units; }),
          backgroundColor: 'rgba(41, 121, 255, 0.78)',
          hoverBackgroundColor: '#2979FF',
          borderRadius: 7,
          borderSkipped: false,
          maxBarThickness: 52
        }]
      },
      options: options
    });
  }

  function createBranchChart(key, canvasId, branches) {
    const options = commonChartOptions();
    options.plugins.tooltip.callbacks = {
      label: function (context) { return ' Revenue: ' + formatRevenue(context.parsed.y); }
    };
    options.scales.y.title = { display: true, text: "Revenue (LKR '000)", color: getThemeColors().muted, font: { weight: '600' } };
    options.scales.x.grid = { display: false };

    replaceChart(key, canvasId, {
      type: 'bar',
      data: {
        labels: branches.map(function (item) { return item.branch; }),
        datasets: [{
          label: "Branch Revenue (LKR '000)",
          data: branches.map(function (item) { return item.revenue; }),
          backgroundColor: ['#6C3BFF', '#2979FF', 'rgba(108, 59, 255, 0.64)'],
          hoverBackgroundColor: ['#825cff', '#4e95ff', 'rgba(108, 59, 255, 0.86)'],
          borderRadius: 8,
          borderSkipped: false,
          maxBarThickness: 92
        }]
      },
      options: options
    });
  }

  function renderBranchTable(tableId, branches) {
    const table = byId(tableId);
    if (!table) return;
    table.innerHTML = branches.map(function (item) {
      return '<tr><td><strong>' + escapeHtml(item.branch) + '</strong></td><td>' + formatRevenue(item.revenue) + '</td><td>' + item.share.toFixed(1) + '%</td></tr>';
    }).join('');
  }

  function renderBasicMonthlyTable(tableId, records) {
    const table = byId(tableId);
    if (!table) return;
    table.innerHTML = records.map(function (record) {
      return '<tr><td><strong>' + escapeHtml(record.month) + '</strong></td><td>' + formatRevenue(record.revenue) + '</td><td>' + formatNumber(record.units, 0) + '</td></tr>';
    }).join('');
  }

  function renderSalesMonthlyTable(records, allData) {
    const table = byId('sales-monthly-table');
    if (!table) return;
    table.innerHTML = records.map(function (record) {
      const previous = allData[record.monthIndex - 1];
      const change = previous && previous.revenue ? ((record.revenue - previous.revenue) / previous.revenue) * 100 : null;
      const changeText = change === null ? '—' : percent(change);
      const changeClass = change === null ? 'neutral' : growthClass(change);
      return '<tr><td><strong>' + escapeHtml(record.month) + '</strong></td><td>' + formatRevenue(record.revenue) + '</td><td>' + formatNumber(record.units, 0) + '</td><td class="' + changeClass + '">' + changeText + '</td></tr>';
    }).join('');
  }

  function renderReportMonthlyTable(records) {
    const table = byId('reports-monthly-table');
    if (!table) return;
    table.innerHTML = records.map(function (record) {
      const perUnit = record.units ? (record.revenue * 1000) / record.units : 0;
      return '<tr><td><strong>' + escapeHtml(record.month) + '</strong></td><td>' + formatRevenue(record.revenue) + '</td><td>' + formatNumber(record.units, 0) + '</td><td>LKR ' + formatNumber(perUnit) + '</td></tr>';
    }).join('');
  }

  function bestBranch(branches) {
    return branches.reduce(function (best, branch) {
      return !best || branch.revenue > best.revenue ? branch : best;
    }, null);
  }

  function fillDashboardKpis(prefix, summary, branches, label) {
    const branch = bestBranch(branches);
    const best = summary.bestMonth;
    setText(prefix + '-total-revenue', formatRevenue(summary.totalRevenue));
    setText(prefix + '-total-units', formatNumber(summary.totalUnits, 0));
    setText(prefix + '-best-month', best ? best.month : '—');
    setText(prefix + '-best-branch', branch ? branch.branch : '—');
    setText(prefix + '-revenue-meta', label + " • LKR '000");
    setText(prefix + '-units-meta', summary.monthCount + (summary.monthCount === 1 ? ' month selected' : ' months selected'));
    setText(prefix + '-best-month-meta', best ? formatRevenue(best.revenue) + ' monthly revenue' : 'No data');
    setText(prefix + '-best-branch-meta', branch ? formatRevenue(branch.revenue) + ' revenue' : 'No data');
  }

  function setFilterDefault(render) {
    const filter = byId('period-filter');
    if (!filter) return;
    const preferred = Data.getDefaultPeriod();
    if (filter.querySelector('option[value="' + preferred + '"]')) filter.value = preferred;
    state.render = function () { render(filter.value); };
    filter.addEventListener('change', state.render);
    state.render();
  }

  function renderDashboard(period) {
    const allData = Data.getSalesData();
    const records = Data.filterSalesData(allData, period);
    const summary = Data.getSummary(records);
    const branches = Data.getBranchPerformance(records);
    const label = Data.periodLabel(period, allData);
    const leader = bestBranch(branches);

    setText('dashboard-status', 'Overview of ' + label + ' 2026 sales across Colombo, Kandy, and Galle.');
    setText('dashboard-revenue-subtitle', label + " revenue in LKR '000");
    setText('dashboard-units-subtitle', label + ' sales volume');
    setText('dashboard-branch-subtitle', label + ' branch revenue comparison');
    setText('dashboard-table-caption', 'Showing ' + summary.monthCount + (summary.monthCount === 1 ? ' month' : ' months') + ' for ' + label + '.');
    setText('dashboard-branch-caption', 'Revenue and share for ' + label + '.');
    fillDashboardKpis('dashboard', summary, branches, label);
    renderBasicMonthlyTable('dashboard-monthly-table', records);
    renderBranchTable('dashboard-branch-table', branches);
    createRevenueChart('dashboardRevenue', 'dashboardRevenueChart', records);
    createUnitsChart('dashboardUnits', 'dashboardUnitsChart', records);
    createBranchChart('dashboardBranch', 'dashboardBranchChart', branches);

    const insights = byId('dashboard-insights');
    if (insights) {
      insights.innerHTML =
        '<li><i class="fa-solid fa-chart-line" aria-hidden="true"></i><strong>' + (summary.bestMonth ? escapeHtml(summary.bestMonth.month) : 'No month') + '</strong> is the strongest month with ' + (summary.bestMonth ? formatRevenue(summary.bestMonth.revenue) : 'no revenue') + '.</li>' +
        '<li><i class="fa-solid fa-store" aria-hidden="true"></i><strong>' + (leader ? escapeHtml(leader.branch) : 'No branch') + '</strong> leads the selected period, contributing ' + (leader ? leader.share.toFixed(1) : '0.0') + '% of revenue.</li>' +
        '<li><i class="fa-solid fa-boxes-stacked" aria-hidden="true"></i>The selected period averages <strong>' + formatNumber(summary.averageUnits, 0) + ' units</strong> per month across the three branches.</li>';
    }
  }

  function setupDashboard() {
    setFilterDefault(renderDashboard);
  }

  function renderSales(period) {
    const allData = Data.getSalesData();
    const records = Data.filterSalesData(allData, period);
    const summary = Data.getSummary(records);
    const branches = Data.getBranchPerformance(records);
    const label = Data.periodLabel(period, allData);
    const branch = bestBranch(branches);
    const changeLabel = summary.monthCount < 2 ? 'Select 2+ months' : percent(summary.growth);

    setText('sales-status', 'Sales analysis for ' + label + ' 2026. Every chart and metric uses the selected months.');
    setText('sales-total-revenue', formatRevenue(summary.totalRevenue));
    setText('sales-total-units', formatNumber(summary.totalUnits, 0));
    setText('sales-average-revenue', formatRevenue(summary.averageRevenue));
    setText('sales-growth', changeLabel);
    setText('sales-revenue-meta', label + " • LKR '000");
    setText('sales-units-meta', summary.monthCount + (summary.monthCount === 1 ? ' month selected' : ' months selected'));
    setText('sales-average-meta', 'Average across ' + summary.monthCount + (summary.monthCount === 1 ? ' month' : ' months'));
    setText('sales-growth-meta', summary.monthCount < 2 ? 'A single month has no trend' : 'First-to-last month revenue');
    setText('sales-revenue-subtitle', label + " revenue in LKR '000");
    setText('sales-units-subtitle', label + ' units sold');
    setText('sales-branch-subtitle', label + ' branch revenue contribution');
    setText('sales-table-caption', 'Revenue, units, and month-over-month change for ' + label + '.');
    renderSalesMonthlyTable(records, allData);
    createRevenueChart('salesRevenue', 'salesRevenueChart', records);
    createUnitsChart('salesUnits', 'salesUnitsChart', records);
    createBranchChart('salesBranch', 'salesBranchChart', branches);

    const insights = byId('sales-insights');
    if (insights) {
      insights.innerHTML =
        '<li><i class="fa-solid fa-sack-dollar" aria-hidden="true"></i>Average monthly revenue is <strong>' + formatRevenue(summary.averageRevenue) + '</strong> for the selected period.</li>' +
        '<li><i class="fa-solid fa-arrow-trend-up" aria-hidden="true"></i>Revenue change from the first selected month to the last is <strong class="' + growthClass(summary.growth) + '">' + (summary.monthCount < 2 ? 'not applicable' : percent(summary.growth)) + '</strong>.</li>' +
        '<li><i class="fa-solid fa-store" aria-hidden="true"></i><strong>' + (branch ? escapeHtml(branch.branch) : 'No branch') + '</strong> is the branch leader with ' + (branch ? formatRevenue(branch.revenue) : 'no revenue') + ' in selected revenue.</li>';
    }
  }

  function setupSales() {
    setFilterDefault(renderSales);
  }

  function renderReports(period) {
    const allData = Data.getSalesData();
    const records = Data.filterSalesData(allData, period);
    const summary = Data.getSummary(records);
    const branches = Data.getBranchPerformance(records);
    const label = Data.periodLabel(period, allData);
    const quarters = Data.getQuarterSummaries(allData);
    const annualSummary = Data.getSummary(allData);

    setText('reports-status', 'Detailed sales report for ' + label + ' 2026, with a full-year quarterly summary below.');
    setText('reports-chart-subtitle', label + " revenue comparison in LKR '000");
    setText('reports-monthly-caption', summary.monthCount + (summary.monthCount === 1 ? ' monthly record' : ' monthly records') + ' for ' + label + '.');
    setText('reports-branch-caption', 'Branch revenue comparison for ' + label + '.');
    fillDashboardKpis('reports', summary, branches, label);
    renderReportMonthlyTable(records);
    renderBranchTable('reports-branch-table', branches);
    createRevenueChart('reportsRevenue', 'reportsRevenueChart', records);

    const quarterTable = byId('reports-quarter-table');
    if (quarterTable) {
      quarterTable.innerHTML = quarters.map(function (quarter) {
        const share = annualSummary.totalRevenue ? (quarter.totalRevenue / annualSummary.totalRevenue) * 100 : 0;
        return '<tr><td><strong>' + quarter.quarter + '</strong></td><td>' + formatRevenue(quarter.totalRevenue) + '</td><td>' + formatNumber(quarter.totalUnits, 0) + '</td><td>' + formatRevenue(quarter.averageRevenue) + '</td><td>' + share.toFixed(1) + '%</td></tr>';
      }).join('');
    }
  }

  function setupReports() {
    setFilterDefault(renderReports);
  }

  function parseCsv(text) {
    const rows = [];
    let row = [];
    let cell = '';
    let quoted = false;

    for (let index = 0; index < text.length; index += 1) {
      const character = text[index];
      if (character === '"') {
        if (quoted && text[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          quoted = !quoted;
        }
      } else if (character === ',' && !quoted) {
        row.push(cell.trim());
        cell = '';
      } else if ((character === '\n' || character === '\r') && !quoted) {
        if (character === '\r' && text[index + 1] === '\n') index += 1;
        row.push(cell.trim());
        if (row.some(function (value) { return value !== ''; })) rows.push(row);
        row = [];
        cell = '';
      } else {
        cell += character;
      }
    }

    if (quoted) throw new Error('The CSV contains an unmatched quotation mark.');
    row.push(cell.trim());
    if (row.some(function (value) { return value !== ''; })) rows.push(row);
    return rows;
  }

  function headerName(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  function findHeader(headers, allowedNames) {
    return headers.findIndex(function (header) { return allowedNames.indexOf(headerName(header)) !== -1; });
  }

  function showStatus(id, type, message) {
    const element = byId(id);
    if (!element) return;
    element.className = 'status-message show ' + type;
    element.textContent = message;
  }

  function renderImportPreview(records) {
    const empty = byId('import-preview-empty');
    const wrapper = byId('import-preview-table-wrap');
    const table = byId('import-preview-table');
    if (!table) return;
    table.innerHTML = records.map(function (record) {
      return '<tr><td><strong>' + escapeHtml(record.month) + '</strong></td><td>' + formatRevenue(record.revenue) + '</td><td>' + formatNumber(record.units, 0) + '</td><td>' + formatRevenue(record.branches.Colombo) + '</td><td>' + formatRevenue(record.branches.Kandy) + '</td><td>' + formatRevenue(record.branches.Galle) + '</td></tr>';
    }).join('');
    if (empty) empty.hidden = true;
    if (wrapper) wrapper.hidden = false;
    setText('import-preview-caption', 'Validated 12-month preview. Review the data, then apply it to this browser.');
  }

  function resetImportPreview() {
    state.importRows = null;
    const empty = byId('import-preview-empty');
    const wrapper = byId('import-preview-table-wrap');
    const apply = byId('apply-import');
    if (empty) empty.hidden = false;
    if (wrapper) wrapper.hidden = true;
    if (apply) apply.disabled = true;
    setText('import-preview-caption', 'Choose a valid CSV to see its normalized 12-month preview.');
  }

  function validateImportText(text) {
    const rows = parseCsv(text.replace(/^\uFEFF/, ''));
    if (rows.length < 2) throw new Error('The CSV needs a header row and monthly data rows.');

    const headers = rows[0];
    const monthIndex = findHeader(headers, ['month']);
    const revenueIndex = findHeader(headers, ['revenue', 'monthlyrevenue']);
    const unitsIndex = findHeader(headers, ['units', 'unitssold', 'unit']);
    const branchIndexes = {
      Colombo: findHeader(headers, ['colombo']),
      Kandy: findHeader(headers, ['kandy']),
      Galle: findHeader(headers, ['galle'])
    };
    const missing = [];
    if (monthIndex === -1) missing.push('Month');
    if (revenueIndex === -1) missing.push('Revenue');
    if (unitsIndex === -1) missing.push('Units Sold');
    if (missing.length) throw new Error('Missing required CSV header(s): ' + missing.join(', ') + '.');

    const providedBranchColumns = Object.keys(branchIndexes).filter(function (branch) { return branchIndexes[branch] !== -1; });
    if (providedBranchColumns.length > 0 && providedBranchColumns.length < 3) {
      throw new Error('Provide all optional branch headers (Colombo, Kandy, Galle) or omit all of them.');
    }

    const records = rows.slice(1).map(function (row) {
      const record = {
        month: row[monthIndex],
        revenue: row[revenueIndex],
        units: row[unitsIndex]
      };
      if (providedBranchColumns.length === 3) {
        record.branches = {
          Colombo: row[branchIndexes.Colombo],
          Kandy: row[branchIndexes.Kandy],
          Galle: row[branchIndexes.Galle]
        };
      }
      return record;
    });

    const result = Data.validateSalesData(records);
    if (!result.valid) throw new Error(result.errors.join(' '));
    return result.data;
  }

  function setupImport() {
    const input = byId('csv-file');
    const download = byId('download-sample');
    const apply = byId('apply-import');
    resetImportPreview();

    if (input) {
      input.addEventListener('change', function () {
        const file = input.files && input.files[0];
        resetImportPreview();
        if (!file) return;
        if (!/\.csv$/i.test(file.name)) {
          showStatus('import-status', 'error', 'Choose a CSV file with a .csv extension.');
          return;
        }

        const reader = new FileReader();
        reader.onload = function () {
          try {
            state.importRows = validateImportText(String(reader.result || ''));
            renderImportPreview(state.importRows);
            if (apply) apply.disabled = false;
            showStatus('import-status', 'success', 'CSV validated successfully. Preview the 12 months, then apply the data.');
          } catch (error) {
            showStatus('import-status', 'error', error.message || 'The CSV could not be validated.');
          }
        };
        reader.onerror = function () {
          showStatus('import-status', 'error', 'The selected file could not be read.');
        };
        reader.readAsText(file);
      });
    }

    if (download) {
      download.addEventListener('click', function () {
        const blob = new Blob([Data.getSampleCsv()], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'lanka-fresh-mart-2026-sample.csv';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      });
    }

    if (apply) {
      apply.addEventListener('click', function () {
        if (!state.importRows) return;
        const result = Data.saveSalesData(state.importRows);
        if (result.valid) {
          showStatus('import-status', 'success', 'Imported data applied successfully. Dashboard, Sales, and Reports now use this browser-stored dataset.');
          apply.disabled = true;
        } else {
          showStatus('import-status', 'error', result.errors.join(' '));
        }
      });
    }
  }

  function updateThemeChoices(theme) {
    document.querySelectorAll('[data-theme-choice]').forEach(function (button) {
      button.classList.toggle('selected', button.dataset.themeChoice === theme);
    });
  }

  function storedTheme() {
    try {
      return window.localStorage.getItem('lankaFreshMartTheme') === 'light' ? 'light' : 'dark';
    } catch (error) {
      return 'dark';
    }
  }

  function applyTheme(theme, save) {
    const dark = theme !== 'light';
    document.body.classList.toggle('dark-theme', dark);
    const icon = byId('theme-icon');
    if (icon) icon.className = dark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    updateThemeChoices(dark ? 'dark' : 'light');
    if (save) {
      try { window.localStorage.setItem('lankaFreshMartTheme', dark ? 'dark' : 'light'); } catch (error) { /* local storage unavailable */ }
    }
    if (state.render) state.render();
  }

  function setupSharedNavigation() {
    const hamburger = byId('hamburger-btn');
    const links = byId('nav-links');
    if (hamburger && links) {
      hamburger.addEventListener('click', function () {
        const open = links.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', String(open));
      });
      links.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          links.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
        });
      });
    }

    const toggle = byId('theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        applyTheme(document.body.classList.contains('dark-theme') ? 'light' : 'dark', true);
      });
    }
  }

  function setupSettings() {
    const period = byId('settings-default-period');
    const save = byId('save-settings');
    const reset = byId('reset-data');
    if (period) period.value = Data.getDefaultPeriod();

    document.querySelectorAll('[data-theme-choice]').forEach(function (button) {
      button.addEventListener('click', function () {
        applyTheme(button.dataset.themeChoice, true);
        showStatus('settings-status', 'success', 'Theme preference saved for this browser.');
      });
    });

    if (save && period) {
      save.addEventListener('click', function () {
        const saved = Data.savePreferences({ defaultPeriod: period.value });
        showStatus('settings-status', saved ? 'success' : 'error', saved ? 'Default reporting period saved for this browser.' : 'Browser storage is unavailable, so the preference could not be saved.');
      });
    }

    if (reset) {
      reset.addEventListener('click', function () {
        if (!window.confirm('Reset imported sales data and return to the supplied 2026 sample dataset?')) return;
        const resetDone = Data.resetSalesData();
        showStatus('data-reset-status', resetDone ? 'success' : 'error', resetDone ? 'The imported dataset was removed. All pages will use the supplied 2026 sample data.' : 'Browser storage is unavailable, so imported data could not be reset.');
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!Data) {
      console.error('LankaFreshData failed to load.');
      return;
    }

    applyTheme(storedTheme(), false);
    setupSharedNavigation();

    const page = document.body.dataset.page;
    if (page === 'dashboard') setupDashboard();
    if (page === 'sales') setupSales();
    if (page === 'reports') setupReports();
    if (page === 'import') setupImport();
    if (page === 'settings') setupSettings();
  });
})();
