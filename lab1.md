# Lab 1: Make the Dashboard Come Alive with Context

*Go from "here's our server traffic" to "here's how the campaign is performing"*

**What you'll build:** A dashboard that combines operational data, business data, and external context into one coherent campaign view.

---

## We need MORE data

The existing dashboard shows request volume spiking during the campaign -- that's good. But the VP wants to know: are we actually converting that traffic into orders? And what external factors might be affecting performance?

---

## Task 1: Style the banner panel

**Features: HTML content in text panels**

The dashboard already has a plain markdown text panel at the top. Before we add data, let's make it look like a campaign command center.

### Steps

1. Click the banner panel → **Edit**.
2. In the panel editor, change **Content type** from `Markdown` to `HTML`.
3. Replace the content with an HTML `<div>` that uses a dark gradient background, bold white title, and a subtitle line referencing the Geography/Device filters and annotations. For example:

   ```html
   <div style="background: linear-gradient(135deg, #0d1b3e 0%, #1a2f6e 35%, #2d1b69 70%, #4a1459 100%); padding: 18px 28px; border-radius: 8px; border-left: 5px solid #5b8dee; height: 100%; display: flex; flex-direction: column; justify-content: center; box-sizing: border-box;">
     <div style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: 0.3px; margin-bottom: 6px;">
       Bigger Than Jupiter Sale — Campaign Command Center
     </div>
     <div style="font-size: 12px; color: rgba(255,255,255,0.65); line-height: 1.6;">
       <span style="color: #a78bfa; font-weight: 600;">Astronomix</span> · Spring Equinox Flash Sale |
       Filter by <span style="color: #7eb8f7; font-weight: 600;">Geography</span> and
       <span style="color: #7eb8f7; font-weight: 600;">Device</span> using the dropdowns above ·
       Dashed annotations mark key campaign events.
     </div>
   </div>
   ```

4. Click **Apply**.

> **Why this matters:** A styled banner immediately tells the viewer *what this dashboard is for*. It sets the context before anyone looks at a single number.

---

## Task 2: Pull in orders data from MySQL

**Features: Using additional data sources, Time Filter macro**

The orders database (MySQL) is the source of truth for completed purchases. Add two panels that show:

- **Orders during this time period** (from MySQL)
- **Revenue this time period** (from MySQL)

> **Why this matters:** Web analytics tell us how much traffic we have, but MySQL tells us whether that traffic is *buying*. Grafana isn't just the place for your server metrics -- it's your home for everything.

The two charts side by side will already tell an interesting story: if traffic goes up but orders don't, something is wrong.

### Panel 1: Orders this time period

1. Click **Add** → **Visualization** in the dashboard.

   > **TODO: Screenshot** — Show the Add → Visualization button in the dashboard toolbar.
   ![Add visualization](img/task1-add-visualization.png)

2. Change the visualization type to **Stat**.
3. Set the **Title** to `Orders this time period`.
4. Change the datasource to **Orders MySQL**.

   > **TODO: Screenshot** — Show the datasource dropdown with Orders MySQL selected.
   ![Select MySQL datasource](img/task1-select-mysql.png)

5. Switch the query editor to **Code** mode.
6. Paste this SQL:

   ```sql
   SELECT COUNT(*) AS total_orders
   FROM orders.orders
   WHERE $__timeFilter(order_date)
   ```

   > **TODO: Screenshot** — Show the SQL query pasted in Code mode with the query editor visible.
   ![Orders query in code mode](img/task1-orders-query.png)

7. Set **Format** to `Table`.
8. Under **Field** → **Unit**, set to `Short`.
9. Under **Stat styles** → **Color mode**, set to `Background`.
10. Set the background color to purple.

    > **TODO: Screenshot** — Show the completed Orders stat panel with purple background and a value displayed.
    ![Orders stat panel result](img/task1-orders-stat-panel.png)

11. Click **Apply**.

### Panel 2: Revenue this time period

1. Click **Add** → **Visualization**.
2. Change the visualization type to **Stat**.
3. Set the **Title** to `Revenue this time period`.
4. Change the datasource to **Orders MySQL**.
5. Switch the query editor to **Code** mode.
6. Paste this SQL:

   ```sql
   SELECT SUM(total_amount) AS total_revenue
   FROM orders.orders
   WHERE $__timeFilter(order_date)
   ```

7. Set **Format** to `Table`.
8. Under **Field** → **Unit**, set to `Currency` → `US Dollar ($)`.
9. Under **Stat styles** → **Color mode**, set to `Background`.
10. Set the background color to green.
11. Click **Apply**.
12. Drag both panels so they sit side by side on the same row.

    > **TODO: Screenshot** — Show both stat panels (Orders in purple, Revenue in green) arranged side by side on the dashboard.
    ![Orders and revenue panels side by side](img/task1-panels-side-by-side.png)

---

## Task 3: Write a SQL Expression to surface "Revenue Per Visitor"

**Features: SQL Expressions**

The Prometheus metrics give us visitors per second. The MySQL source gives us total revenue. Neither source alone gives us Revenue Per Visitor -- a key metric the VP cares about.

We'll combine both sources using a **SQL Expression**, which runs an in-memory SQL query across the results of other queries -- no ETL pipeline, no data warehouse required.

> **Why this matters:** You just visualized a business metric that doesn't exist in any single system, by combining data from two different places, using language (SQL) you already know.

### Steps

1. Click **Add** → **Visualization** on the dashboard.
2. Change the visualization type to **Stat**.
3. **Add Query A** — MySQL revenue *(hidden)*:
   - Set datasource to **Orders MySQL**.
   - Switch to **Code** mode and set format to `Table`.
   - Paste:

     ```sql
     SELECT SUM(total_amount) AS revenue
     FROM orders.orders
     WHERE $__timeFilter(order_date)
     ```

   - Click the **eye icon** on this query to hide it (it feeds the expression, not the viz).

     > **TODO: Screenshot** — Show the eye icon location on a query row, with the query toggled to hidden.
     ![Hide query with eye icon](img/task2-hide-query.png)

4. **Add Query B** — Prometheus visitor count *(hidden)*:
   - Click **Add query** and set datasource to **grafanacloud-prom** (Prometheus).
   - Paste:

     ```promql
     sum(increase(app_frontend_sessions_created_total[$__range]))
     ```

   - Set as **Instant** query.
   - Click the **eye icon** to hide this query too.

5. **Add Query C** — SQL Expression:
   - Click **Add query** and set datasource to `-- Expression --`.
   - Select type **SQL**.

     > **TODO: Screenshot** — Show the Expression datasource selected with the SQL type dropdown visible.
     ![Select SQL expression type](img/task2-sql-expression-type.png)

   - Paste:

     ```sql
     SELECT A.revenue / B.__value__ AS revenue_per_visitor FROM A, B LIMIT 1
     ```

   - Leave this query **visible** -- this is what the panel displays.

     > **TODO: Screenshot** — Show all three queries (A, B, C) in the query editor, with A and B hidden and C visible.
     ![All three queries configured](img/task2-all-queries.png)

6. Set **Title** to `Revenue Per Visitor`.
7. Under **Field** → **Unit**, set to `Currency` → `US Dollar ($)`, decimals `2`.
8. Under **Stat styles** → **Color mode**, set to `Background`.
9. Click **Apply**, then **Save dashboard**.

   > **TODO: Screenshot** — Show the finished Revenue Per Visitor stat panel displaying a dollar value.
   ![Revenue per visitor stat panel result](img/task2-revenue-per-visitor-result.png)

> **Key concept:** `A` and `B` are table names in the SQL Expression -- they map directly to the `refId` of each query. The expression runs in-memory inside Grafana, no external join needed.

---

## Task 4: Add campaign annotations with Infinity

**Features: Infinity data source, Annotating visualizations**

Use the **Infinity data source** to pull in campaign events from a JSON endpoint. These appear as vertical annotation lines on the time series charts, marking:

- Campaign Launch
- Email Send #1
- Email Send #2

> **Why this matters:** Now when the VP sees a spike in orders, they know *why* -- because an email went out. Without annotations, every spike is a mystery.

### How it works

The frontend app exposes a `/api/campaign-events` JSON endpoint that returns campaign events with `time`, `title`, `tags`, and `text` fields. The Infinity data source fetches this JSON and Grafana renders the events as annotation lines on every time series panel.

Annotations don't have to come from a metrics or logs backend -- any HTTP endpoint returning the right shape of data works via Infinity.

### Steps

1. Open **Dashboard Settings** (gear icon) → **Annotations** → **New annotation query**.

   > **TODO: Screenshot** — Show Dashboard Settings → Annotations page with the "New annotation query" button.
   ![Dashboard settings annotations](img/task3-annotations-settings.png)

2. Set **Name** to `Campaign Events`.
3. Set **Data source** to the **Infinity** datasource (labeled `flagapi`).

   > **TODO: Screenshot** — Show the datasource dropdown with Infinity (flagapi) selected for the annotation.
   ![Select Infinity datasource](img/task3-select-infinity.png)

4. Configure the query:
   - **Type**: `JSON`
   - **Source**: `URL`
   - **URL**: `/api/campaign-events`
   - **Method**: `GET`
   - **Parser**: `Backend`
   - **Format**: `Table`

   > **TODO: Screenshot** — Show the Infinity query config with Type, Source, URL, Method, Parser, and Format fields filled in.
   ![Infinity annotation query configuration](img/task3-infinity-query-config.png)

5. Set **Icon color** to yellow or whichever color that will stand out well in your dashboard.
6. Ensure the annotation is **Enabled**.
7. Click **Save**.

> **Key concept:** Grafana automatically maps the `time`, `title`, `tags`, and `text` fields from the JSON response to annotation fields. These are the field names Grafana looks for by convention.

Go back to your dashboard and look at any time series panel -- you should now see vertical lines marking when the campaign launched and when each email was sent. Hover over an annotation line to see its title and description.

> **TODO: Screenshot** — Show a time series panel with the campaign annotation lines visible (Campaign Launch, Email #1, Email #2).
![Annotations visible on time series panel](img/task3-annotations-on-panel.png)

These annotations are toggle-able: click the **Campaign Events** toggle at the top of the dashboard to show or hide them. This is useful when you want a clean view of the data without the annotation lines, or when presenting to different audiences who may not need the campaign context.

> **TODO: Screenshot** — Show the annotation toggle row at the top of the dashboard with "Campaign Events" toggle visible.
![Annotation toggle at top of dashboard](img/task3-annotation-toggle.png)

---

## Task 5: Use a transformation to tidy up panel labels

**Features: Transformations**

The Prometheus metric labels on some panels are verbose and technical (e.g., `ecommerce/checkoutservice`). Before sharing this with a VP, clean them up.

Use a **Rename by Regex** transformation to strip the namespace prefix from service names.

> **Why this matters:** Transformations let you reshape data for your audience without changing the underlying query or metric. Your dashboard users shouldn't need to be Prometheus experts.

### Steps

1. Edit the **Request Rate by Service** time series panel.
2. Click the **Transform** tab.
3. Click **Add transformation** and search for **Rename by Regex**.

   > **TODO: Screenshot** — Show the Transform tab with the "Rename by Regex" transformation selected.
   ![Add rename by regex transformation](img/task4-add-transformation.png)

4. For **Match**, enter: `.+/(.+)`
5. For **Replace**, enter: `$1`

   This makes `ecommerce/checkoutservice` render as simply `checkoutservice` in the legend.

   > **TODO: Screenshot** — Show a before/after of the legend: `ecommerce/checkoutservice` becoming `checkoutservice`.
   ![Before and after rename by regex](img/task4-rename-result.png)

6. Click **Apply**, then **Save dashboard**.

> **Pro tip:** The Transformations tab has ~20 built-in transforms. The most useful ones for business dashboards are **Rename by Regex** (clean up labels), **Group By** (aggregate by label), and **Join by Field** (SQL-style join across queries).

---

## Task 6: Configure the Polystat panel (Sales Health by Geography)

**Features: Polystat plugin, composite scoring**

The dashboard has a **Sales Health by Geography** panel that already has its data query -- a composite score per geography combining timeout rate, success rate, revenue health, and refund rate. But the display isn't configured yet. Your job is to make it visual.

### Steps

1. Edit the **Sales Health by Geography** panel.
2. In **Panel options**, set:
   - **Shape:** Hexagon (pointed top)
   - **Polygon size:** `25`
   - **Display mode:** All (show label + value)
   - **Decimals:** `1`
   - **Value font size:** `14`, **Label font size:** `12`
3. Set **Global thresholds** (3 levels):
   - `0` → Red (`rgba(245, 54, 54, 0.9)`)
   - `85` → Orange (`rgba(237, 129, 40, 0.89)`)
   - `95` → Green (`rgba(50, 172, 45, 0.97)`)
4. Enable **Tooltips** with value and timestamp shown.
5. Click **Apply**.

### Verify

Each geography should render as a coloured hexagon -- red if health < 85, orange 85-95, green >= 95.

> **Why this matters:** The polystat gives an instant "traffic light" view of every market. The VP can scan it in one second and know where to focus. This is the kind of panel that earns a dashboard a permanent spot on the wall.

---

## Task 7: Convert the User-Facing Error Rate panel to a table

**Features: Transformations (Reduce, Sort, Organize fields)**

The **User-Facing Error Rate** panel is currently a time series. That's useful for trends, but what the VP really wants is a ranked list: *which user actions are failing most right now?* A table with colour-coded cells answers that question instantly.

### Steps

1. Edit the **User-Facing Error Rate** panel → change the panel type from **Time series** to **Table**.
2. Go to the **Transform** tab:
   - Add **Reduce** -- include all series, calculations: `Mean` and `Max`
   - Add **Sort by** -- sort by `Mean`, descending
   - Add **Organize fields** -- rename the `Field` column to `User Action`
3. In **Field config** → **Overrides**, add an override `By name` → `Mean` and `Max`:
   - Set **Cell display mode** to `Color background`
   - Set **Thresholds:** green at `0`, yellow at `2`, red at `10`
   - Set **Unit:** `Percent (0-100)`
   - Set **Decimals:** `1`
4. Click **Apply**.

### Verify

The table should show user actions (e.g. `view-products`, `add-product-to-cart`) ranked by mean error rate with colour-coded cells -- green for healthy, yellow for concerning, red for critical.

> **Why this matters:** A ranked, colour-coded table is one of the most effective visualisations for identifying *which* part of the user journey is broken. The VP doesn't need to interpret a spaghetti chart -- the worst action is always at the top, always red.

---

## Lab 1 Recap

By the end of Lab 1, you have a dashboard that:

- Has a **styled banner** that identifies the campaign and hints at the interactive controls
- Shows **business performance** (orders, revenue, revenue per visitor) alongside system health
- **Calculates a key business metric** (revenue per visitor) that doesn't exist in any single system
- Has **campaign events annotated** on the timeline so spikes are never a mystery
- Has **clean, readable labels** instead of verbose Prometheus internals
- Provides **at-a-glance market health** via the polystat hexagons
- Shows a **ranked error rate table** so you can instantly see which user actions are failing

> **TODO: Screenshot** — Show the full completed Lab 1 dashboard with all panels, annotations, and clean labels.
![Completed Lab 1 dashboard](img/lab1-completed-dashboard.png)

**The handoff line:** *"I now have rich data, consumable by business users, and with real context -- but I still can't slice it by market or device. When the VP asks 'how does mobile traffic compare with desktop?', I can't answer. And if I spot a problem, I can't investigate or act from here."* --> That's where Lab 2 comes in.
