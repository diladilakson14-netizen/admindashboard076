# ITM 12022 – Individual Assignment: Responsive Dashboard (Lanka Fresh Mart)

## Student Details
- **Student Name:** `<Enter Your Full Name>`
- **Student Index Number:** `<Enter Your Index Number>`
- **Module:** ITM 12022 – Business Applications

---

## Colour Theme

The dashboard uses a three-colour primary palette applied consistently across all UI elements:

| Role | Colour | Hex |
|---|---|---|
| Primary / Purple | ![#6C3BFF](https://placehold.co/12x12/6C3BFF/6C3BFF.png) Purple | `#6C3BFF` |
| Secondary / Blue | ![#2979FF](https://placehold.co/12x12/2979FF/2979FF.png) Blue | `#2979FF` |
| Text / Ice White | ![#EDEBFF](https://placehold.co/12x12/EDEBFF/EDEBFF.png) Ice White | `#EDEBFF` |

- **Default appearance:** Dark mode (deep navy `#090c15` / `#121626` backgrounds).
- **Light mode:** Toggled via the ☀️/🌙 button — soft lavender `#f2f0ff` backgrounds with deep purple text.
- All colours are defined as CSS custom properties in `:root` (light) and `body.dark-theme` (dark), so a single class toggle switches the entire theme.

---

## Where CSS Grid and Flexbox Are Used

1. **Flexbox (`display: flex`)**:
   - **Navigation Bar (`.navbar`, `.brand`, `.nav-links`, `.nav-actions`, `.user-profile`)**: Aligns the Lanka Fresh Mart brand on the left, the four navigation links in the center, and the theme toggle, user profile, and mobile hamburger button on the right using `justify-content: space-between` and `align-items: center`.
   - **KPI Summary Cards (`.kpi-card`, `.kpi-content`)**: Aligns each card's icon container alongside its stacked label, dynamically calculated metric value, and subtitle.
   - **Dashboard & Chart Headers (`.dashboard-header`, `.chart-card-header`)**: Aligns section titles with interactive filter controls and chart type badges.

2. **CSS Grid (`display: grid`)**:
   - **Main Dashboard Container (`.dashboard-container`)**: Structures the vertical flow of the header bar, KPI section, charts section, and reference tables.
   - **KPI Summary Row (`.kpi-grid`)**: Uses `grid-template-columns: repeat(4, minmax(0, 1fr))` on desktop (`> 1024px`), switches to `repeat(2, minmax(0, 1fr))` on tablet (`769px–1024px`), and collapses to `1fr` (1 card per row) on mobile (`<= 768px`).
   - **Charts Section (`.charts-grid`)**: Uses `grid-template-columns: repeat(2, minmax(0, 1fr))` and `grid-template-areas: "lineChart barChart"` on desktop, stacking vertically into a single column at `<= 1024px`.

---

## Optional Extensions Implemented

- **Dark / Light Mode Toggle (Default: Dark)**: The page loads in dark mode (`body.dark-theme`). Clicking ☀️/🌙 toggles the class, switching all CSS variables instantly. Chart.js axis, title, grid, and tooltip colours are re-rendered to match the active theme.
- **Smooth Mobile Menu Animation**: Uses CSS `max-height` and `opacity` transitions toggled via `classList.toggle('open')`. The menu opens with a purple-tinted glow shadow.
- **Interactive Chart Tooltips & Period Filter**: Styled dark tooltips with purple/blue borders and formatted LKR values. A period selector (All 6 Months, Q1, Q2) re-filters KPIs, tables, and charts live.
- **Subtle Micro-Animations**:
  - Cards lift `translateY(-3px)` with a purple glow border on hover.
  - KPI icons scale up `1.06×` on card hover.
  - Nav links lift with a purple glow background on hover; active link uses a `#6C3BFF → #2979FF` gradient.
  - Brand icon, user avatar, and hamburger button all have smooth hover transitions.
  - Chart badges animate on hover with a purple border glow.
  - All transitions use `cubic-bezier(0.4, 0, 0.2, 1)` for a smooth, material feel.
  - `@media (prefers-reduced-motion: reduce)` disables all transitions for accessibility.

---

## Known Issues
- None. Tested in the latest Google Chrome and Mozilla Firefox with zero console errors across `1366px`, `820px`, and `375px` viewports.

---

## Learning References
- MDN Web Docs – CSS Grid Layout (`https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout`)
- MDN Web Docs – CSS Flexible Box Layout (`https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout`)
- MDN Web Docs – `Array.prototype.reduce()` (`https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce`)
- MDN Web Docs – CSS Custom Properties (`https://developer.mozilla.org/en-US/docs/Web/CSS/--*`)
- W3Schools – Responsive Web Design Media Queries (`https://www.w3schools.com/css/css_rwd_mediaqueries.asp`)
- Chart.js Official Documentation (`https://www.chartjs.org/docs/latest/`)
