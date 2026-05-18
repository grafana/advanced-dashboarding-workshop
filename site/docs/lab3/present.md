---
sidebar_position: 3
---

import SlackMessage from '@site/src/components/SlackMessage';
import GrafanaFeature from '@site/src/components/GrafanaFeature';
import useBaseUrl from '@docusaurus/useBaseUrl';

# 3.3 (Optional) Polish and share

Now, let's add some polish to the dashboard before sharing it.

## Task 1: Move the logs to a new tab

**Feature: <GrafanaFeature>Dashboard tabs</GrafanaFeature>**

Logs are great, but they can be noisy and distracting. But we don't want to lose that data, since it can be useful for troubleshooting. So we'll move them to a new tab.

1.  Click the **+** icon in the top right corner, then click on **Group into tabs**.
2.  Ensure the first tab (called **New tab**) is selected, then in the Tab options sidebar, set its title to **KPIs**.
3.  Next to the tab, click the button **New tab** to create a new tab.
4.  Rename this tab to **Logs**.
5.  Click and drag the logs panel into the Logs tab:

    :::tip
    When dragging a panel, hover over the target tab so that the tab is selected, then drop the panel into place.

    <video autoPlay loop muted={true} playsInline style={{width:'100%', borderRadius:'8px'}}>
    <source src={useBaseUrl('/img/drag-compressed.webm')} type="video/webm" />
    </video>

    :::

6.  Finally, click on the **Logs** tab to select it for editing.
7.  Change the **Layout** to **Auto**.
8.  In the Layout section, enable the **Fill screen** toggle, which will make the panel fill the entire tab.


## Task 2: Add a banner panel

**Feature: <GrafanaFeature>HTML styling support</GrafanaFeature>**

The dashboard already has a plain Markdown text panel at the top. Before we add data, let's make it look like a campaign command center.

### Steps

1. Click the banner panel → **Edit**.

   Or, if your dashboard doesn't have a banner panel, click **Add panel** and select the **Text** panel type.

2. In the panel editor, change **Content type** from `Markdown` to `HTML`.
3. Replace the content with an HTML `<div>` that uses a dark gradient background, bold white title, and a subtitle line referencing the Geography filter and annotations. For example:

   ```html
   <div style="background: linear-gradient(135deg, #0d1b3e 0%, #1a2f6e 35%, #2d1b69 70%, #4a1459 100%); padding: 18px 28px; border-radius: 8px; border-left: 5px solid #5b8dee; height: 100%; display: flex; flex-direction: column; justify-content: center; box-sizing: border-box;">
     <div style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: 0.3px; margin-bottom: 6px;">
       Bigger Than Jupiter Sale — Campaign Command Center
     </div>
     <div style="font-size: 12px; color: rgba(255,255,255,0.65); line-height: 1.6;">
       <span style="color: #a78bfa; font-weight: 600;">Astronomix</span> · Spring Equinox Flash Sale ·
       Dashed annotations mark key campaign events.
     </div>
   </div>
   ```
4. **Clear the panel title**, and ensure **Transparent background** is selected.
6. Click **Apply**.

## Wrapping up

Now your dashboard:

- Has a **styled banner** that identifies the campaign and hints at the interactive controls
- Has **clean, readable labels** instead of verbose Prometheus internals
- Moves technical content to a separate tab

## The end

You've reached the end of this workshop! You can now:

- Build dashboards with Grafana Assistant
- Use dashboard variables to create dynamic dashboards
- Use dashboard actions to take action from a dashboard
- Bring in your data, wherever it lives with Grafana's rich ecosystem of data sources
- Use Grafana's rich data processing capabilities to transform your data into insights

**Thanks for attending! We look forward to seeing you in another workshop very soon.**

