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

---

## Task 2: Make the dashboard self-organising with dynamic dashboards

**Features: Dynamic dashboards, Repeat by variable**

The variables from Task 1 let the VP filter to one geography at a time -- that's useful for drilling down. But the VP's first question at the morning review is broader: *"How does each market compare right now?"* Switching the filter one region at a time is tedious.

First, update the `$geography` variable to allow **multi-value** selection and enable **Include All**. Then:

1. Group the campaign performance panels (sessions, revenue, revenue per visitor) into a **row**
2. In the row's Repeat options, set **Repeat by variable: geography**
3. Select all geographies (US, GB, SE, CA, IN) in the variable dropdown

Grafana now auto-generates one row per geography. The entire campaign comparison is visible on a single scroll -- no switching, no building five separate dashboards.

> **Why this matters:** This is the difference between a dashboard that answers one question and one that answers five at once. The VP can immediately see that GB's row looks different from the others -- without anyone having to explain it.

Scanning down the repeated rows, the VP spots it: GB's revenue and AOV row is visibly lower than every other market. *"Why is GB different?"* -- which leads directly into Task 3.

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

## Task 4: Add a Viz Action

**Features: Viz Actions**

TODO: Define the Viz Action task (e.g. invoke an API to restart a service, add an annotation)

---

## Lab 2 Recap

By the end of Lab 2, you have a dashboard that:

- Filters dynamically by geography and device using chained variables
- Auto-generates comparison rows for every market using dynamic dashboards
- Navigates from metrics to logs via Correlations
- Can take action directly from the dashboard via Viz Actions

You've turned a static display into an interactive power tool.
