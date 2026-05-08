---
sidebar_position: 1
---

import SlackMessage from '@site/src/components/SlackMessage';
import GrafanaFeature from '@site/src/components/GrafanaFeature';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 2.1 Combine data with Expressions

Grafana can calculate new metrics from your existing data — combining values from different sources, without changing anything in your databases or building a pipeline.

<SlackMessage name="Sarah Chen" role="Sales Operations" time="Today at 9:41 AM" reactions={["👀 2"]}>
Can you help us quickly understand conversion rates?

I think we have the right data, but it seems to be in two different places.
</SlackMessage>

---

## Task 1: Calculate revenue per session

**Feature:** <GrafanaFeature>Math expressions</GrafanaFeature>

Revenue and sessions live in two completely separate systems — MySQL and Prometheus. A **Math expression** lets you perform arithmetic across the results of multiple queries, entirely in-memory. No ETL, no data warehouse, no new pipeline.

We'll use it to calculate **Revenue per Session (RPS)**: how much revenue, on average, each visitor is generating.

<p className="text--center">**Revenue per session = total revenue &divide; total number of sessions**</p>

### Add the panel

1. Click **Add** → **Panel** in the dashboard.

2. Set the **Title** to `Revenue per session`, then click **Configure** to open the panel editor.

3. In the **Queries** tab, change the datasource to **Mixed**, as we will be querying both MySQL and Prometheus.

4. In the first query row (**A**):

    - Change the datasource to **Orders MySQL**.
    - Switch the query editor to **Code** mode.
    - Paste this SQL:

      ```sql
      SELECT SUM(total_amount) AS revenue
      FROM orders.orders
      WHERE $__timeFilter(order_date)
      ```

5. Click **Add query** and configure the second row (**B**):

    - Change the datasource to **grafanacloud-xxxxx-prom** (Prometheus).
    - In the **Options** bar, set the query type to **Instant**. :warning:
    - Paste this query:

      ```promql
      sum(increase(app_frontend_sessions_created_total[$__range]))
      ```

### Add the Math expression

1. Click the **Expression** button and select **Math** from the menu.

2. In the expression field, enter:

    ```
    $A / $B
    ```

    :::grot-tip[How it works]

    `$A` and `$B` reference the results of queries A and B. Grafana evaluates the expression in-memory against those results — no data ever leaves Grafana.

    :::

3. Click the **eye icon** on queries A and B to hide them, so only the expression result is shown.

4. Change the visualization type to **Stat**.

### Style it out

1. Now, style the panel to make it clear and visually appealing. We can use Assistant to help us out:

    <Tabs groupId="implementation-methods">
      <TabItem value="ai" label="With Grafana Assistant">

    ```assistant title="Suggested prompt"
    Please format the Revenue per session panel in dollars, with a green background.
    ```

      </TabItem>
      <TabItem value="manual" label="Manually">

        Set the following properties using the panel editor. You can use the search function in the panel editor to quickly find properties by name:

       | Search for | Set property                  | To value                    |
       |------------|-------------------------------|-----------------------------|
       | `unit`     | **Standard options -> Unit**  | **Currency -> Dollars ($)** |
       | `color`    | **Stat styles -> Color mode** | **Background Solid**        |
       | `color`    | **Color scheme**              | **Single color**            |
       | `color`    | **Color**                     | **Green**                   |

      </TabItem>
    </Tabs>

2. Click **Back to dashboard**.

You now have a single Stat panel showing the average revenue each visitor generates — one number, drawn from two completely separate backends.

---

## Task 2: Compare sessions vs completed orders

**Feature:** <GrafanaFeature>SQL Expressions</GrafanaFeature>, <GrafanaFeature>Library Panels</GrafanaFeature>

<SlackMessage name="Sarah Chen" role="Sales Operations" time="Today at 10:12 AM" reactions={["👀 3"]}>
These numbers look good overall, but I wonder if it varies by market?

Could we see sessions vs. completed orders broken down by geography?
</SlackMessage>

This data exists, but it's in two different data sources: frontend sessions are tracked with a Prometheus metric, but completed orders are stored in the database. We'll use a **SQL Expression** to join the two together.

:::note
Rather than building the panel from scratch, we've prepared it as a **Library Panel** — a pre-built panel that can be imported into any dashboard. Library panels are how teams share and reuse visualizations across Grafana without duplicating work.
:::

### Import the Orders vs Sessions panel

1. Click **Add** → **Library panel**.
2. Search for **Sessions vs Orders by Geography** and click **Add panel**.
3. Drag it into position on the dashboard alongside your other panels.
4. Click **Save**.

### What does the chart tell us?

For each geography, the chart shows two bars side by side: **sessions** (how many visitors arrived) and **completed orders** (how many actually bought something).

The gap between those two bars is the regional conversion rate, made visible:

![Sessions vs Orders by Geo](/img/sessions_orders_barchart.webp)

**One market should stand out immediately.** GB's sessions bar is comparable in height to other markets — it's getting traffic. But its completed orders bar is noticeably smaller than you'd expect. Something is stopping GB visitors from completing purchases.

:::grot-tip[What's powering this panel?]

This panel uses a **SQL Expression** — a Grafana feature that runs an in-memory SQL JOIN across the results of multiple queries. Sessions come from Prometheus, orders come from MySQL, and Grafana joins them without either system knowing about the other. No data pipeline required.

If you're curious, open the panel editor and look at the Queries tab to see how it's constructed.

:::

:::warning[Before you edit this panel]

All users share library panels. If you want to make your own edits to the panel, edit the panel and click the **Unlink library panel** button at the top to keep your edits private.

:::

---

## Wrapping up

In this section you've seen two ways Grafana acts as a calculation layer on top of your existing data:

- **Math expressions** — arithmetic across query results from different backends. Simple, fast, and no SQL needed.
- **SQL expressions** — full in-memory SQL across multiple sources. Powerful enough to join a relational database with a time-series system in a single panel.

Neither approach requires touching your data sources, modifying schemas, or building new infrastructure.

Expressions have also helped us to spot something worth investigating: **GB's conversion rate is lower than every other market.** 

In the next section, you'll add filters to drill into exactly what's happening there.

Click **Next** to continue.
