# Lab 2: Turn the Dashboard into a Power Tool

*Go from "I can see the problem" to "I can investigate and act on it in the same dashboard"*

**The narrative development:** While looking at the dashboard, the VP notices something: **revenue per session is lower on mobile devices**, especially in the UK. Is it a UX issue? A payment problem? A currency thing? You need to drill down and investigate the problem quickly.

---

## Task 1: Add device and geography variables (with chaining)

**Features: Managing dashboard variables, chained variables**

Add two dashboard variables:

- `$geography` -- Query variable, pulling distinct geography label values from Prometheus
- `$device` -- Query variable, pulling distinct device label values from Prometheus, **filtered by `$geography`**

Wire both variables into the existing panels so the whole dashboard filters dynamically.

The key teaching moment here is **chained variables**: the `$device` variable uses `$geography` as a label filter in its query, so selecting "GB" automatically narrows the device list to only devices that generated traffic from GB. Attendees won't see "Mobile-Android" if there's no Android traffic from that region.

> **Why this matters:** Instead of building a separate dashboard for each market, you now have *one* dashboard that any regional team can use. This is the difference between a dashboard you *look at* and one you *work with*.

### Create the `$geography` variable

1. Click the **gear icon** (Dashboard settings, top-right) → **Variables** → **+ Add variable**.
2. Configure the variable:
   - **Type:** Query
   - **Name:** `geography`
   - **Label:** `Geography`
   - **Data source:** `grafanacloud-daec46-prom`
   - **Query type:** Label values
   - **Label:** `geography`
   - **Metric:** `app_frontend_sessions_created_total`
   - **Refresh:** On time range change
   - **Multi-value:** enabled
   - **Include All option:** enabled
3. Click **Run query** to preview values, then **Save**.

### Create the `$device` variable (the chained variable)

4. Click **+ Add variable** again.
5. Configure the variable:
   - **Type:** Query
   - **Name:** `device`
   - **Label:** `Device`
   - **Data source:** `grafanacloud-daec46-prom`
   - **Query type:** Label values
   - **Label:** `device`
   - **Metric:** (leave blank)
   - **Label filters:** add `geography =~ $geography` -- this is the chain
   - **Refresh:** On time range change
   - **Multi-value:** enabled
   - **Include All option:** enabled
6. Click **Run query**, confirm the device list changes when you change `$geography`, then **Save**.

> **Key concept:** Order matters -- `$geography` must appear above `$device` in the variables list so it resolves first.

### Wire variables into panels

For each of these three panels, click the panel → **Edit** → update the query expression:

7. **Active Sessions** -- replace the query with:

   ```promql
   sum(increase(app_frontend_sessions_created_total{geography=~"$geography",device=~"$device"}[$__range]))
   ```

8. **Active Sessions Over Time** -- replace the query with:

   ```promql
   sum by(device) (rate(app_frontend_sessions_created_total{geography=~"$geography",device=~"$device"}[$__rate_interval]))
   ```

9. **Revenue Per Visitor** -- update **query B only** with:

   ```promql
   sum(increase(app_frontend_sessions_created_total{geography=~"$geography",device=~"$device"}[$__range]))
   ```

10. Click **Apply** on each panel, then **Save** the dashboard.

### Verify the chain works

- Select a single geography (e.g. `GB`) → confirm the Device dropdown repopulates with only GB devices
- Select `All` geography → confirm all devices return

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

## Task 3: Fix a Correlation to navigate from data to context

**Features: Correlations**

With variables now filtering to `$geography=GB, $device=Mobile-iOS`, the attendee can see that payment errors are elevated in this segment. But what's actually happening in the checkout service logs at that moment?

There's a pre-built Correlation that links from the payment error rate chart to the checkout service logs in Loki. It's currently pointing at the wrong label. Your job is to fix it.

### What is a Correlation?

A Correlation in Grafana is a link between two data sources. It lets you click on a data point in one panel and jump directly to related data in another -- carrying context like the time range and label values with you. Instead of copy-pasting a timestamp into Loki, you click and you're there.

### Steps

1. Navigate to **Administration > Plugins and data > Correlations** (or find it via the search bar).
2. Find the existing Correlation that links from the **Prometheus** data source to the **Loki** data source. It was set up to connect checkout error metrics to checkout service logs.
3. The problem: the Correlation's **target query** is filtering on the wrong label. It currently uses `service_name` but the checkout service logs in Loki are labelled with `job`. Update the target query's label filter so it matches on `job="checkoutservice"` instead.
4. Save the Correlation.
5. Go back to your dashboard and click on a data point in the **Checkout Error Rate Over Time** panel. You should now see a **link** appear. Click it -- you should land in Explore, viewing the checkout service logs filtered to the same time window.

### Verify it works

- Click on an error spike around the time GB mobile errors are elevated
- Confirm that Explore opens with Loki selected, the time range matching the spike, and the logs filtered to the checkout service
- You should be able to see log lines that explain *why* errors are occurring (e.g. `Payment Timeout` entries)

> **Why this matters:** This demonstrates that Grafana isn't just a place to *display* data -- it's a place to *navigate* between different types of data. You spot an anomaly in metrics, click, and you're reading the relevant logs. No context switching, no copy-pasting timestamps, no hunting through a sea of unfiltered log lines.

---

## Task 4: Refund a bad order with a Viz Action

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

## Task 5: Ask Assistant

<!-- TODO: Define the Assistant task -->

---

## Lab 2 Recap

By the end of Lab 2, you have a dashboard that:

- Filters dynamically by geography and device using chained variables
- Auto-generates comparison rows for every market using dynamic dashboards
- Navigates from metrics to logs via Correlations
- Can take action directly from the dashboard via Viz Actions

You've turned a static display into an interactive power tool.
