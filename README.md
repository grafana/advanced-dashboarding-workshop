# Advanced Dashboarding Workshop

<p align="center"><img src="img/grot_dashboard.png" alt="Grot Dashboard" width="50%"></p>

## Updating the docs

To compress a screen recording (for animations):

    ffmpeg -i recording.webm -c:v libvpx-vp9 -crf 40 -b:v 0 -an recording-compressed.webm


## The Scenario

**Astronomix** is an online telescope and astronomy equipment retailer. They've just launched a **Bigger Than Jupiter Sale** -- a short flash sale timed around the spring equinox. It's your job to build the *Campaign Command Center*: a single Grafana dashboard that the VP of Commerce will review during the flash sale.

The dashboard needs to answer one question: **"How is the flash sale performing, and is anything getting in the way?"**

**Starting environment:** A partially-built "Astronomix Business Review" dashboard. It already has a handful of panels showing HTTP request volume and basic error rates -- useful, but it only tells a technical story. You need to broaden it.

## Prerequisites

Before attending this workshop, you should be able to:

- Create and configure different types of panels in Grafana
- Understand the key visualization types: Stat, Time series
- Create and use dashboard variables

If you can't do these yet, we recommend joining our [Extreme Dashboard Makeover](https://github.com/grafana/extreme-dashboard-makeover-breakouts) workshop.

## Labs

| Lab | Title | What you'll learn |
|-----|-------|-------------------|
| 1 | [Make the Dashboard Come Alive with Context](./lab1.md) | Big Tent data sources, SQL Expressions, Annotations, Transformations |
| 2 | [Turn the Dashboard into a Power Tool](./lab2.md) | Variable chaining, Dynamic dashboards, Correlations, Viz Actions |

## Getting Started

Import the starting dashboard into your Grafana instance:

1. Click the menu button at the top left, and then click on *Dashboards*.
2. On the Dashboards screen, click the *New* button and then click *Import*.
3. Upload the [starting dashboard JSON](./dashboards/starting-dashboard.json) or paste its contents.
4. Choose the appropriate data sources when prompted and click *Import*.

---

![Grafana Logo](img/grafana.png)
