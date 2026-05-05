---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 3.2 Take action from a dashboard

**Features: Actions**

The investigation is complete: GB mobile customers are hitting payment timeouts. The VP wants to act immediately -- cancel the affected orders immediately, so that the stock is released for new customers during the sale -- without waiting for a developer to write a script.

An **Action** lets you attach an interactive button to a panel that fires an HTTP request when clicked. You'll build a table of affected orders from MySQL and wire a one-click cancel button directly into it. When you click the button, it sends a POST to an API with the order number.

## Task 1: Add a failed orders panel

We'll add a new panel to the dashboard that shows a table of failed orders.

### Add the panel

1. Add a new panel and name the panel `Incomplete Orders`.
2. Set its type to **Table**.
2. Set the datasource to **Orders MySQL**.
3. Switch to **Code** mode and paste this SQL:

   ```sql
   SELECT
     o.order_date AS "Order Date",
     o.order_id  AS "Order ID",
     c.country   AS "Country",
     o.device    AS "Device",
     FORMAT(o.total_amount, 2) AS "Amount",
     o.status    AS "Status",
     NULL        AS "Actions"  -- we'll add a button here later
   FROM orders o
   JOIN customers c ON o.customer_id = c.customer_id
   WHERE $__timeFilter(o.order_date)
     AND c.country IN (${geography:singlequote})   -- references the 'geography' variable
     AND o.device  IN (${device:singlequote})      -- references the 'device' variable
     AND o.status != 'completed'
   ORDER BY o.order_date DESC
   LIMIT 20
   ```
   
   :::grot-tip

   Notice how we're baking in the _geography_ and _device_ dashboard variables into the query, so that we show results that are relevant to the current dashboard context.

   :::

### Make it look good

Add a couple of field overrides to make the table look nice. Use this Assistant prompt to help you:

<Tabs groupId="implementation-methods">
  <TabItem value="ai" label="Grafana Assistant">
```assistant title="Suggested prompt"
In the Recent Orders table, format the Amount column as dollars, and change the Status column to pill view, with payment_timeout in red, cancelled in blue, and completed in green
```
</TabItem>
  <TabItem value="manual" label="Manual steps">
1. Add a field override for the **Amount** column:
   - Choose **Fields with name** then select **Amount**.
   - Add override property:
     - Type: **Standard options > Unit**
     - Value: **Currency / Dollars ($)**

2. Add a second field override for the **Status** column:
   - Matcher: `byName` → `Status`
   - Cell type: `Color text`
   - Value mappings:
      - `payment_timeout` → red, display text `Payment Timeout`
      - `cancelled` → blue, display text `Cancelled`
      - `completed` → green, display text `Completed`
</TabItem>
</Tabs>

## Task 2: Cancel failed orders with an Action button

### Set up the Actions column

1. Add a field override for **Actions**:
    - Matcher: `byName` → `Actions`
   - Add override property:
      - Cell type: **Actions** (this renders the column as buttons)

2. Open [webhook.site](https://webhook.site) in a new tab. Copy your unique URL -- this is where the order cancellation request will be sent.

3. Under **Data links and actions**, under the **Actions** heading, click **Add action**.

   - Title: **Cancel order**
   - Connection: **Direct from browser**
   - Method: **POST**
   - 

4. On the **Actions** field override from step 7, add a Viz Action with this config:
    - **Title:** `Cancel Order`
    - **Type:** Fetch
    - **Method:** POST
    - URL: `https://<ID>.aws.work-shop.grafana.net/api/cancel` (replace `<ID>` with your workshop ID)
    - Headers: `Content-Type: application/json`
    - **Body:**
      ```json
      {
        "order_id": "${__data.fields['Order ID']}",
        "admin_password": "astronomix-admin"
      }
      ```
      
      :::grot-tip

      Notice how we reference data fields from the panel using the `__data.fields` structure.
   
      :::

    - **Confirmation:** `Do you really want to cancel order ${__data.fields['Order ID']}?`

5. Click **Apply**, then **Save** the dashboard.

### Verify it works

Now let's verify the action works, by cancelling a couple of orders:

1. Filter to `$geography = GB`, `$device = Mobile-iOS` -- you should see payment timeout orders
2. Click the **Cancel Order** button on a row
3. Confirm the dialog, then the request should fire.
4. Refresh the dashboard and you should see the order status change to `cancelled`.
5. Try performing this for another couple of orders and see how what happens.

:::grot-tip

You just took a targeted, customer-facing action without opening a terminal, writing a script, or waiting for an engineer. Observe and operate -- from the same screen. 

:::

## Wrapping up

In this section you've learned how to take action from a dashboard. This is an extremely powerful capability that turns a plain old dashboard into a power tool. Now any dashboard user can be an operator, too! You can take action without writing a script, and most importantly without switching context.

Actions can be added to any panel, and can be configured to fire HTTP requests with dynamic payloads based on the context of the click.

You could use Actions to:

- Send notifications to your team
- Trigger a script to run on a server
- Perform a rollback or restart of a service
- Send a message to a Slack channel
- Send an email to a list of recipients

Click **Next** to continue to the final section where we'll polish up the dashboard and make it more user-friendly.
