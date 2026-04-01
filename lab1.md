# Lab 1: Make the Dashboard Come Alive with Context

*Go from "here's our server traffic" to "here's how the campaign is performing"*

**What you'll build:** A dashboard that combines operational data, business data, and external context into one coherent campaign view.

---

## We need MORE data

The existing dashboard shows request volume spiking during the campaign -- that's good. But the VP wants to know: are we actually converting that traffic into orders? And what external factors might be affecting performance?

---

## Task 1: Pull in orders data from MySQL

**Features: Using additional data sources, Time Filter macro**

The orders database (MySQL) is the source of truth for completed purchases.

Add two panels that show:

- **Orders during this time period** (from MySQL)
- **Revenue this time period** (from MySQL)

> **Why this matters:** Web analytics tell us how much traffic we have, but MySQL tells us whether that traffic is *buying*. Grafana isn't just the place for your server metrics, it's your home for everything.

The two charts side by side will already tell an interesting story: if traffic goes up but orders don't, something is wrong.

---

## Task 2: Write a SQL Expression to surface "Revenue Per Visitor"

**Features: SQL Expressions**

The Prometheus metrics give us visitors per second. The MySQL source gives us total revenue. Neither source alone gives us Average Order Value (AOV) -- a key metric the VP cares about.

Copy the existing queries for visits this time period and revenue this time period.

Add a **SQL Expression** to divide the revenue query by the order count query:

```sql
SELECT revenue / visitor_count AS avg_order_value
FROM ...
```

> **Why this matters:** You just visualized a business metric that doesn't exist in any single system, by combining data from two different places, using language (SQL) you already know. No ETL pipeline, no data warehouse, no engineer required, updated in real time.

---

## Task 3: Add campaign annotations with Infinity

**Features: Infinity data source, Annotating visualizations**

Use the **Infinity data source** to pull in campaign events from a JSON endpoint. These appear as vertical annotation lines on the time series charts, marking:

- Campaign launch
- Email send #1 (day 1)
- Email send #2 (day 3)

> **Why this matters:** Now when the VP sees a spike in orders at 09:00 on Tuesday, they know *why* -- because the email went out. Without annotations, every spike is a mystery.

---

## Task 4: Use a transformation to tidy up panel labels

**Features: Transformations**

The Prometheus metric labels on the revenue and orders panels are verbose and technical (e.g. `{job="checkoutservice", namespace="prod"}`). Before sharing this with a VP, clean them up.

Use a **Rename by Regex** transformation on the checkout error rate panel:

- Match: `.+/(.+)` (captures the service name after the last `/`)
- Replace: `$1`

This makes `namespace/checkoutservice` render as simply `checkoutservice` in the legend.

> **Why this matters:** Transformations let you reshape data for your audience without changing the underlying query or metric. Your dashboard users shouldn't need to be Prometheus experts.

**Pro tip:** The Transformations tab has ~20 built-in transforms covering grouping, joining, pivoting, and regex renaming. The most useful ones for business dashboards are GroupBy (aggregate by label), Join by Field (SQL-style join across two queries), and Rename by Regex.

---

## Task 5: Ask Assistant

<!-- TODO: Define the Assistant task -->

---

## Lab 1 Recap

By the end of Lab 1, you have a dashboard that:

- Shows business performance (orders, revenue, AOV) alongside system health
- Calculates a key business metric (revenue per visitor) which doesn't exist anywhere else
- Has important business events annotated on the timeline
- Has normalised verbose and technical field names into more understandable text

**The handoff line:** *"I now have rich data, consumable by business users, and with real context -- but I still can't slice it by market or device. When the VP asks 'how does mobile traffic compare with desktop?', I can't answer. And if I spot a problem, I can't investigate or act from here."* --> That's where Lab 2 comes in.
