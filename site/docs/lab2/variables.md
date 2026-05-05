---
sidebar_position: 2
---

import SlackMessage from '@site/src/components/SlackMessage';
import GrafanaFeature from '@site/src/components/GrafanaFeature';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 2.2 Filter and investigate

You've spotted that GB's conversion rate is lower than every other market. Now you need to filter the dashboard to focus on GB specifically — and find out what's actually going wrong.

<SlackMessage name="Sarah Chen" role="Sales Operations" time="Today at 10:31 AM" reactions={["👀 4"]}>
That bar chart makes it really clear that GB is underperforming.

Is there any way we can filter the whole dashboard to just show GB data? I want to dig into what's happening there.
</SlackMessage>

The answer is **dashboard variables** — dropdowns that filter every panel on the dashboard simultaneously. You'll add two: one for geography, and one for device that automatically narrows based on the geography you select.

---

## Task 1: Add geography and device variables

**Feature:** <GrafanaFeature>Dashboard variables</GrafanaFeature>

### Create the `$geography` variable

1. Click the **gear icon** (Dashboard settings, top-right) → **Variables** → **+ Add variable**.
2. Configure the variable:
   - Type: **Query**
   - Name: `geography`
   - Label: `Geography`
   - Multi-value: **enabled**
   - Include All value: **enabled**

3. Click **Open variable editor** and configure the query:
   - Data source: **Orders MySQL**
   - Query:

     ```sql
     SELECT DISTINCT country FROM orders.customers
     WHERE country IS NOT NULL AND country != 'Not Set - Default'
     ORDER BY country
     ```

   - Refresh: **On dashboard load**

4. Click **Preview** to confirm countries appear, then click **Close**.

### Create the `$device` variable

1. Click **+ Add variable**.
2. Configure the variable:
   - Type: **Query**
   - Name: `device`
   - Label: `Device`
   - Multi-value: **enabled**
   - Include All value: **enabled**

3. Click **Open variable editor** and configure the query:
   - Data source: **Orders MySQL**
   - Query:

     ```sql
     SELECT DISTINCT o.device FROM orders.orders o
     JOIN orders.customers c ON o.customer_id = c.customer_id
     WHERE c.country IN (${geography:singlequote})
     AND o.device IS NOT NULL
     ORDER BY o.device
     ```

   - Refresh: **On time range change**

4. Click **Preview**, then change the Geography dropdown to `GB` — the device list should update to show only devices seen in GB. Click **Save**.

:::grot-tip[Variable ordering]

Order matters — `$geography` must appear above `$device` in the variables list so it resolves first.

:::

---

## Task 2: Use the variables to investigate GB

**Feature:** <GrafanaFeature>Dashboard variables</GrafanaFeature>

Now you'll wire the variables into the **Initiate Checkout Actions by Status Code** panel, and use it to surface what's actually happening in GB.

### Note the current error rate

Before you make any changes, look at the **Initiate Checkout Actions by Status Code** (or similarly named) panel on your dashboard and note the current ratio of error responses (4xx/5xx) to successful ones (2xx). This is the aggregate view across all geographies.

### Wire the variables into the panel

1. Click the **Initiate Checkout Actions by Status Code** panel → **Edit**.
2. In the query editor, find the label selectors in the PromQL query. Add the geography and device variable filters into the label selectors, using regex matching to allow for multiple selections. For example:

   ```promql
   page_attr_device=~"${device:regex}", page_attr_geography=~"${geography:regex}"
   ```
   
   Your query should now look like this:

    ```promql
    sum by(event_data_http_status_code) (feo11y:frontend_actions_requests:rate5m{
       action_name="initiate-checkout", 
       page_attr_device=~"${device:regex}", 
       page_attr_geography=~"${geography:regex}"
    })
    ```

   :::grot-tip[How variable interpolation works]

   `${geography:regex}` tells Grafana to format the variable's current value as a regex-compatible string. If multiple geographies are selected, it expands to `GB|US|SE` automatically.

   :::

3. Click **Apply**, then **Save** the dashboard.

### Filter to GB and observe

1. Set the **Geography** dropdown to `GB`.
2. Look at the **Requests by Status Code** panel again.

**The error rate should be noticeably higher than what you saw before.** In the aggregate view of all requests, GB's errors were diluted because of successful traffic from every other market. When the graph is scoped to GB only, the signal is clear.

This is the value of segment-level filtering over aggregate dashboards: the problem was always there — it just wasn't visible until you looked at the right slice of data.

---

## Wrapping up

You've turned a static dashboard into an interactive investigation tool. By adding chained variables and wiring them into a single panel, you've gone from "GB's conversion is low" to "GB has an elevated error rate" -- and you didn't leave Grafana.

In the next lab, you'll take this one level deeper: find the specific orders affected by those errors, and take action on them directly from the dashboard.

Click **Next** to continue.
