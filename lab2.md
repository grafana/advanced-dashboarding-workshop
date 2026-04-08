# Lab 2: Turn the Dashboard into a Power Tool

*Go from "I can see the problem" to "I can investigate and act on it in the same dashboard"*

**The narrative development:** While looking at the dashboard, the VP notices something: **revenue per session is lower on mobile devices**, especially in the UK. Is it a UX issue? A payment problem? A currency thing? You need to drill down and investigate the problem quickly.

---

## Task 1: Add device and geography variables (with chaining)

**Features: Managing dashboard variables, chained variables**

Add two dashboard variables:

- `$geography` -- Query variable, pulling distinct countries from the MySQL orders database
- `$device` -- Query variable, pulling distinct devices from MySQL, **filtered by `$geography`**

Wire both variables into the existing panels so the whole dashboard filters dynamically.

The key teaching moment here is **chained variables**: the `$device` variable references `$geography` in its SQL query, so selecting "GB" automatically narrows the device list to only devices seen in GB orders. Attendees won't see "Mobile-Android" if there are no Android orders from that region.

> **Why this matters:** Instead of building a separate dashboard for each market, you now have *one* dashboard that any regional team can use. This is the difference between a dashboard you *look at* and one you *work with*.

### Create the `$geography` variable

1. Click the **gear icon** (Dashboard settings, top-right) → **Variables** → **+ Add variable**.
2. Configure the variable:
   - **Type:** Query
   - **Name:** `geography`
   - **Label:** `Geography`
   - **Data source:** Orders MySQL (`orders-mysql-appenv`)
   - **Query:**

     ```sql
     SELECT DISTINCT country FROM orders.customers
     WHERE country IS NOT NULL AND country != 'Not Set - Default'
     ORDER BY country
     ```

   - **Refresh:** On dashboard load
   - **Multi-value:** enabled
   - **Include All option:** enabled
3. Click **Run query** to preview values, then **Save**.

### Create the `$device` variable (the chained variable)

4. Click **+ Add variable** again.
5. Configure the variable:
   - **Type:** Query
   - **Name:** `device`
   - **Label:** `Device`
   - **Data source:** Orders MySQL (`orders-mysql-appenv`)
   - **Query** (references `$geography` -- this is the chain):

     ```sql
     SELECT DISTINCT o.device FROM orders.orders o
     JOIN orders.customers c ON o.customer_id = c.customer_id
     WHERE c.country IN (${geography:singlequote})
     AND o.device IS NOT NULL
     ORDER BY o.device
     ```

   - **Refresh:** On time range change
   - **Multi-value:** enabled
   - **Include All option:** enabled
6. Click **Run query**, confirm the device list changes when you change `$geography`, then **Save**.

> **Key concept:** Order matters -- `$geography` must appear above `$device` in the variables list so it resolves first.

### Wire variables into panels

Several panels currently show all data regardless of filter selection. Update them to respect the variables.

For each panel below, click the panel → **Edit** → update the query:

7. **Visitors** (stat panel) -- Prometheus. Replace the query with:

   ```promql
   sum(increase(app_frontend_sessions_created_total{geography=~"${geography:regex}",device=~"${device:regex}"}[$__range]))
   ```

8. **Visitors by Device** (time series) -- Prometheus. Replace the query with:

   ```promql
   sum by(device) (rate(app_frontend_sessions_created_total{geography=~"${geography:regex}",device=~"${device:regex}"}[$__rate_interval]))
   ```

9. **Revenue by Market** (bar chart) -- MySQL. Add a geography filter to the `WHERE` clause:

   ```sql
   AND c.country IN (${geography:singlequote})
   ```

10. **Payment Failures** (table) -- MySQL. Add both filters to the `WHERE` clause:

    ```sql
    AND c.country IN (${geography:singlequote})
    AND o.device IN (${device:singlequote})
    ```

11. **Revenue Per Visitor** -- update **both** hidden queries:
    - **Query A** (MySQL) -- add variable filters to the `WHERE` clause:

      ```sql
      SELECT SUM(o.total_amount) AS revenue
      FROM orders.orders o
      JOIN orders.customers c ON o.customer_id = c.customer_id
      WHERE $__timeFilter(o.order_date)
        AND c.country IN (${geography:singlequote})
        AND o.device IN (${device:singlequote})
      ```

    - **Query B** (Prometheus) -- add label filters:

      ```promql
      sum(increase(app_frontend_sessions_created_total{geography=~"${geography:regex}",device=~"${device:regex}"}[$__range]))
      ```

    - **Query C** (SQL Expression) stays the same.

12. Click **Apply** on each panel, then **Save** the dashboard.

### Verify

- Select a single geography (e.g. `GB`) → confirm the Device dropdown repopulates with only GB devices
- Select `All` geography → confirm all devices return
- With a single geography selected, confirm **all** updated panels narrow their results accordingly

---

## Task 2: Make the dashboard self-organising with dynamic dashboards

**Features: Dynamic dashboards, Repeat by variable**

The variables from Task 1 let the VP filter to one geography at a time -- that's useful for drilling down. But the VP's first question at the morning review is broader: *"How does each market compare right now?"* Switching the filter one region at a time is tedious.

Grafana's **Repeat by variable** feature auto-generates a copy of a row for every value in a variable. Select all geographies and the entire campaign comparison is visible on a single scroll -- no switching, no building five separate dashboards.

> **Why this matters:** This is the difference between a dashboard that answers one question and one that answers five at once. The VP can immediately see that GB's row looks different from the others -- without anyone having to explain it.

Scanning down the repeated rows, the VP spots it: GB's revenue and AOV row is visibly lower than every other market. *"Why is GB different?"* -- which leads directly into Task 3.

### Create the repeating row

1. Enter **Edit mode** (pencil icon) → click **Add** → **Row**.
2. Hover the row header → click the **gear icon** → set **Title** to `Campaign Performance` → **Update**.
3. Drag **Active Sessions**, **Active Sessions Over Time**, and **Revenue Per Visitor** into the row.

### Enable repeat on the row

4. Hover the **Campaign Performance** row header → click the **gear icon**.
5. Set **Repeat by variable** → `geography` → **Update**.

### Create the Platform Health row

6. Click **Add** → **Row** → set **Title** to `Platform Health`.
7. Drag all remaining panels (the non-geography-filtered ones) into this row.

### Save and verify

8. **Save** the dashboard (Ctrl+S / Cmd+S).
9. Set the Geography dropdown to **All** -- one Campaign Performance row per market should appear (US, GB, SE, CA, IN).

---

## Task 3: Add a Correlation (Error Rate → Logs)

**Features: Data links, Correlations**

With variables now filtering to `$geography=GB, $device=Mobile-iOS`, the attendee can see which user actions have elevated error rates in the table from Lab 1. But what's actually happening in the logs when those errors occur?

A **Correlation** turns data points in a panel into clickable links that open related data in Explore. You'll add a data link to the User-Facing Error Rate table so each user action becomes a clickable link that opens the relevant logs in Loki.

> **Why this matters:** This demonstrates that Grafana isn't just a place to *display* data -- it's a place to *navigate* between different types of data. You spot a high error rate, click the action name, and you're reading the relevant logs. No context switching, no copy-pasting timestamps, no hunting through unfiltered log lines.

### Steps

1. Edit the **User-Facing Error Rate** table panel.
2. Go to **Field config** → **Overrides** → **Add override** for `Field` (the User Action column).
3. Add property: **Data links** → **Add link**.
4. Configure the link:
   - **Title:** `View logs — ${__data.fields[Field]}`
   - **URL:**

     ```
     /explore?left={"datasource":"grafanacloud-logs","queries":[{"refId":"A","expr":"{} |= \"${__data.fields[Field]}\"","queryType":"range"}],"range":{"from":"${__from}","to":"${__to}"}}
     ```

   - **Open in new tab:** enabled
5. Click **Apply**.

### Verify

- Each row in the User-Facing Error Rate table should now show the user action as a blue clickable link
- Clicking it opens Explore pre-filtered to logs containing that action name, within the dashboard's current time range
- You should be able to see log lines that explain *why* errors are occurring (e.g. `Payment Timeout` entries)

> **Note — Data links vs Correlations:** What we just built is a *data link*: a per-panel, manually configured URL that carries context via template variables. Grafana also has a first-class **Correlations** feature (Administration → Plugins and data → Correlations) that defines reusable links *between data sources* — once you create a Correlation from Prometheus to Loki, every panel using that Prometheus data source gets the link automatically. Correlations are more powerful at scale (one definition covers every panel), but data links give you full control over the URL and are easier to set up for a single panel. In a production environment, you'd typically use Correlations so the link is available everywhere without per-panel configuration.

TODO: Consider replacing this task with a proper Correlations exercise (Administration → Correlations) instead of a data link, to teach the more scalable approach.
>

---

## Task 4: Refund a failed order with a Viz Action

**Features: Viz Actions**

The investigation is complete: GB mobile customers are hitting payment timeouts. The VP wants to act immediately -- issue refunds to affected customers -- without waiting for a developer to write a script.

A **Viz Action** lets you attach an interactive button to a panel that fires an HTTP request when clicked. You'll build a table of affected orders from MySQL and wire a one-click refund button directly into it. When you click the button, it sends a POST to a webhook endpoint with the order details.

### Panel: Recent Orders -- Payment Failures

1. Click **Add** → **Visualization** and change the type to **Table**.
2. Set the datasource to **Orders MySQL** (`orders-mysql-appenv`).
3. Switch to **Code** mode and paste this SQL:

   ```sql
   SELECT
     o.order_id  AS "Order ID",
     c.country   AS "Country",
     o.device    AS "Device",
     o.total_amount AS "Amount",
     o.status    AS "Status",
     NULL        AS "Actions"
   FROM orders o
   JOIN customers c ON o.customer_id = c.customer_id
   WHERE c.country IN (${geography:singlequote})
     AND o.device  IN (${device:singlequote})
     AND o.status = 'payment_timeout'
   ORDER BY o.order_date DESC
   LIMIT 20
   ```

   > **Key concepts:**
   > - `JOIN customers` -- country lives on the customers table, not orders
   > - `${geography:singlequote}` / `${device:singlequote}` -- safely expands multi-value dashboard variables into MySQL `IN (...)` syntax
   > - `NULL AS "Actions"` -- creates a named column to attach the Viz Action to

4. Set **Format** to `Table`.

### Field overrides

5. Add a field override for **Amount**:
   - Matcher: `byName` → `Amount`
   - Unit: `Currency` → `US Dollar ($)`

6. Add a field override for **Status**:
   - Matcher: `byName` → `Status`
   - Cell type: `Color text`
   - Value mappings:
     - `payment_timeout` → red, display text `Payment Timeout`
     - `refunded` → blue, display text `Refunded`
     - `completed` → green, display text `Completed`

7. Add a field override for **Actions**:
   - Matcher: `byName` → `Actions`
   - Cell type: `Actions` (this renders the column as buttons)
   - Width: `220`

### Viz Action: Send Refund Notification

8. Open [webhook.site](https://webhook.site) in a new tab. Copy your unique URL -- this is where the refund notification will be sent.

9. On the **Actions** field override from step 7, add a Viz Action with this config:
   - **Title:** `Send Refund Notification`
   - **Type:** Fetch
   - **Method:** POST
   - **URL:** `https://webhook.site/YOUR-TOKEN` (paste your webhook.site URL)
   - **Headers:** `Content-Type: application/json`
   - **Body:**
     ```json
     {
       "order_id": "${__data.fields['Order ID']}",
       "amount": "${__data.fields['Amount']}"
     }
     ```
   - **Confirmation:** `Send refund notification for order ${__data.fields['Order ID']}?`

   > **Key concept:** `${__data.fields['Field Name']}` is row-level interpolation -- it picks up the value from any column in the clicked row.

10. Click **Apply**, then **Save** the dashboard.

### Verify it works

- Filter to `$geography = GB`, `$device = Mobile-iOS` -- you should see payment timeout orders
- Click the **Send Refund Notification** button on a row
- Confirm the dialog -- the request fires
- Switch to your webhook.site tab -- you should see the request arrive with the Order ID and Amount in the payload

> **Why this matters:** The person looking at this dashboard just took a targeted, customer-facing action without opening a terminal, writing a script, or waiting for an engineer. Observe and operate -- from the same screen. In a real deployment, the webhook URL would be an internal API (e.g. a refund service), and the principle is identical.

> **A note on CORS:** Viz Actions fire directly from the browser, not through Grafana's backend. If your target API is on a different domain, the browser will block the request unless the API returns `Access-Control-Allow-Origin` headers. For this workshop, webhook.site returns permissive CORS headers so requests go through cleanly. In a production environment, **Private Data Source Connect (PDC)** solves this by routing the request through Grafana's backend via a secure tunnel -- no CORS headers needed, and the target API never needs to be publicly accessible.

---

## Task 5: Let Assistant build the next panel

**Features: Grafana Assistant, Dashboarding mode**

You've spent the last two labs building panels by hand — writing SQL, configuring overrides, wiring variables. Now see how fast it can go with AI assistance.

### Steps

1. Open **Grafana Assistant** (the AI icon in the top navigation bar).
2. In the Assistant panel, click the **Agent options** dropdown and select **Dashboarding** mode. This tells Assistant to focus on creating and modifying dashboard panels.
3. Ask Assistant to build a panel you haven't created yet. For example:

   > "Add a time series panel showing order count over time, broken down by device, filtered by the geography and device variables."

4. Review what Assistant generates — check the query, the variable references, and the visualization type.
5. If it looks good, click **Apply** to add it to your dashboard. If it needs tweaks, ask Assistant to adjust (e.g., "change the legend to show only the device name" or "add a yellow threshold at 50 orders").
6. **Save** the dashboard.

### Why this matters

Everything you learned in Labs 1 and 2 — SQL expressions, variable interpolation, field overrides, transformations — is exactly what Assistant uses under the hood. Understanding the fundamentals means you can review, validate, and refine what AI generates. You're not replaced by the tool; you're *faster* with it.

---

## Lab 2 Recap

By the end of Lab 2, you have a dashboard that:

- Filters dynamically by geography and device using chained variables
- Auto-generates comparison rows for every market using dynamic dashboards
- Navigates from metrics to logs via data links (with a path to Correlations at scale)
- Can take action directly from the dashboard via Viz Actions
- Demonstrates AI-assisted panel creation with Grafana Assistant

You've turned a static display into an interactive power tool.
