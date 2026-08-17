---
sidebar_position: 3
---

import GrafanaFeature from '@site/src/components/GrafanaFeature';

# 1.3 Sync your dashboard into Git (Optional)

**Feature:** <GrafanaFeature>Git Sync</GrafanaFeature>

**Git Sync in Grafana** lets you synchronize your resources so you can store your dashboards as JSON files in any Git provider and manage them as code. You and your team can version control, collaborate, and automate deployments efficiently.

In this lab, you'll set up a Git Sync connection to synchronize changes to your dashboard with a Git repository.

## Step 1: Get your Git repository ready

### Log on to the Git instance and look around

We've set up a Gitea instance -- an open source Git service -- and created a **dashboards** repo that you will use to store your dashboards in this lab.

1. In a new browser tab, **access the Gitea instance** that we've provided for this workshop.

   The URL will look something like `https://git.<your workshop ID>.aws.work-shop.grafana.net`

2. Click **Sign in** (top right) and then click **Sign in with Keycloak**.

3. Once you're signed in, click the **Explore** button at the top and click on your personal **dashboards** repo (it should be the only repository listed). 

4. You'll see this repo already contains a couple of files:

   - a `README.md`, which Grafana will use to show documentation when you open this folder
   - a starter dashboard, `starter.json`, which shows a very simple text-based dashboard that we'll sync into Grafana

5. **Copy your repository's URL** as you'll need it later.

### Create an access token

Git Sync works with any Git provider that supports Git over HTTPS. This includes GitHub, GitLab, Bitbucket, and Gitea. In this step we'll create an access token that Grafana can use to authenticate with your Git repository.

1. From the Gitea home screen, **click on your profile avatar** (top right) and then click **Settings**.

2. From the left side menu, **click Applications** to open the application auth and security token page.

3. In the section titled **Manage Access Tokens**:

    ![Generating access token in Gitea](/img/gitea_accesstoken.webp)
   
    - Enter a token name of your choice - e.g. **git-sync-grafana**. This will only be displayed here.
    - Ensure repository and organization access is set to **All (public, private, limited)**
    - Check the box to include the permission: **Repositories -> Read/Write**
    - Click the **Generate Token** button

4. **Copy the token** that is generated on the next screen. It will only be presented once, and you will need it in the next step.


## Step 2: Configure Grafana Git Sync


### Connect Grafana to your Git repository

Now we'll create a Git connection in Grafana's provisioning settings, which will automatically sync dashboards to and from your personal Git repository.

1.  Go to your Grafana instance.

2.  From the side menu, navigate to **Administration -> General -> Provisioning**. _(Or, press **Ctrl/Cmd+K** to focus to the search bar and type **provisioning**.)_

3.  Click **Configure with Pure Git**.

4.  Enter the following details:

    - Repository URL: **paste the dashboard URL you copied in the first step, and add `.git` to the end.** It should look like this: `https://git.<workshop-id>.aws.work-shop.grafana.net/<username>/dashboards.git`. _If in doubt, go back to the Git instance, find your repository and copy the URL._

    - Access token: **(paste the access token you copied earlier)**

    - Username: **(enter your username, e.g. abcd12jonsmith123)**

    Then click **Configure repository** to continue.

5.  On the next screen, ensure you set _Branch_ to **main**. This tells Grafana to sync dashboards from the `main` branch of your Git repository. Then click **Choose what to synchronize** to go to the next screen.

6.  On _Choose what to synchronize_, make sure you select **Sync external storage to a new Grafana folder.**

    Review the suggested display name (it should be something like `devedaf94monodot307/dashboards.git`) and click the **Synchronize** button to continue.

    :::info[Why choose a new folder?]

    We're in a multi-user environment in this workshop, so we choose **sync to a new folder**. This option allows you to work independently in your own folder, without affecting others.

    In a production environment, you may prefer to sync **all** dashboards to Git. To implement that option, you could select the option to sync all dashboards at root level.
   
    :::

7.  Click **Begin synchronization** to continue.

8.  Finally, click **Choose additional settings**:

7.  Final step! Be sure to set these settings:

    ![Git Sync additional settings](/img/gitsync_additional.webp)

   - Set **sync interval** to **300** (5 minutes).

   - Select **Enable push to synchronized branch** - this will allow Grafana to directly push to the branch, instead of creating a pull request.

### Check out the new folder

After setting up your Git Sync connection, you can click **View folder** which will show you the contents of your personal **dashboards** folder, including the README we saw earlier, and your "starter" dashboard:

![Git Sync folder](/img/gitsync_folder.webp)

## Step 3: Move your dashboard into Git and verify sync

Now let's move the dashboard into the synced folder, and verify that future changes are persisted in Git.

### Copy your dashboard to your Git Sync folder

1.  In Grafana, open your first dashboard. 

2.  In the top right, click the **Edit** button, then click **the down arrow on the Save button**, selecting **Save as copy** from the context menu.

3.  Select **Target folder** to be your personal **Git Sync** folder (e.g. `abcd12jonsmith123/dashboards.git`). Verify the remaining settings are as follows:

   - Branch: **main**

   - Repository path: **(leave empty - we'll save it in the root)**

   - Filename: **(optionally choose a filename, or accept the default)**

4.  You should see a confirmation message that the dashboard was saved to Git.

### Edit your dashboard and verify changes are in Git

Now the fun part! Let's make a change to the dashboard and verify that it is persisted in Git.

1.  Click the **Edit** button on your dashboard.

2.  Make a change to the dashboard, such as adding a new panel or modifying an existing one.

3.  Click **Save** to save the changes.

4.  Verify that the changes are reflected in your Git repository. Do this by navigating to the Git repository that you explored earlier. 

   Observe that Grafana has pushed a commit with your changes.

### Delete your old dashboard

You'll note that your old dashboard still exists. That's because we configured Git Sync to sync with a **new** folder, and leave existing resources untouched.

Let's tidy things up so that there's just one copy of your dashboard:

1.  In Grafana, navigate to **Dashboards** and find your first, **non-synchronized** folder.

    :::warning

    We want to delete your first, non-synchronized folder. So the folder **should not** have a purple sync icon and **should not** have a name like `abcd12jonsmith123/dashboards.git`.

    :::

2.  Check the box to the left of the folder name to select it, then press the **Delete** button.

3.  When prompted, enter the confirmation string to acknowledge that all of the folder's resources will also be deleted,

That's it! Now you have just one instance of your dashboard, which is synced into your personal Git repository.

## Wrapping up

In this lab you learned how to use Git Sync to synchronize a subset of your Grafana dashboards into a Git repository.

This powerful feature allows you to use the Git workflows you know, like pull requests and approvals, to synchronize and control your critical dashboards.

In production, you might want to:

- enforce approvals and reviews before you apply changes to your dashboards in Grafana
- synchronize dashboards across environments - such as development, staging and production
- trigger automated validation checks in your CI tool whenever a new dashboard update is pushed

[See the Git Sync docs for more information.](https://grafana.com/docs/grafana/latest/as-code/observability-as-code/provision-resources/git-sync-deployment-scenarios/)

For the rest of this workshop, you'll be working with your Git-synchronized dashboard.


