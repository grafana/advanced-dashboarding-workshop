---
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 1.1 Create a dashboard, fast

## Step 1: Create your personal folder

You're sharing a Grafana Cloud workspace with your team today. So let's create a folder for your personal use.

1. Click on the menu icon to open the sidebar, and click **Dashboards**.
2. Click the **New** dropdown and then click **New Folder**.
3. Enter a name for your folder, such as your initials or username.
4. Click **Create**, and you will be redirected to your new folder.

:::grot-tip[Grot's Pro Tip]

Organizing your dashboards into folders helps keep your Grafana instance tidy and makes it easier to find what you need.

:::

## Step 2: Create a dashboard with Grafana Assistant

Now let's create the initial dashboard. We want to show the number of frontend sessions and the number of checkout orders, along with a couple of other relevant panels. Grafana Assistant can help you create this dashboard in seconds.

<Tabs groupId="implementation-methods">
  <TabItem value="ai" label="With Grafana Assistant">

1.  From the side menu, click **Assistant**.

2.  Enter the following prompt to create a dashboard:

    ```assistant title="Suggested prompt"
    Please create an operations dashboard for my ecommerce application. 
    
    Give high level stats for the number of frontend sessions, and the number of checkout orders. 
    
    Then add a couple of other relevant panels based on what you find, grouping by geography if available.
    ```
    
    Wait for Grafana Assistant to create the dashboard.

3.  Once Assistant has finished, review the dashboard and rearrange any panels how you like them.

4.  Finally, make sure you save your changes by clicking **Save**, then **select your personal folder**, and click the **Save** button.

</TabItem>
  <TabItem value="manual" label="From a template">

1.  From the top bar, search for the dashboard **Ecommerce Operations Starter**.

2.  When the dashboard has loaded, click **Edit** and then **Save as copy** to save to your personal folder.

</TabItem>

</Tabs>


## What's next

Next, we'll load up the dashboard with context and data.
