# Google Sheets Integration Setup Guide

This guide will walk you through the process of connecting a private Google Sheet to this repository so that you can automatically sync your questions to `data/questions.csv`.

## 1. Get the Google Sheet ID
First, you need the unique ID of your Google Sheet.
1. Open your Google Sheet in your browser.
2. Look at the URL. It will look something like this: `https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit`
3. The Sheet ID is the long string of characters between `/d/` and `/edit`. In this example, it is `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`.
4. Save this ID somewhere; you will need it later.

## 2. Set Up a Google Cloud Project & Service Account
To securely access your private Google Sheet without making it public, we use a "Service Account".
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Log in with your Google account.
3. At the top of the page (next to the Google Cloud logo), click the project dropdown and click **New Project**.
4. Give it a name (e.g., "A3T Questions Sync") and click **Create**.
5. Make sure your new project is selected in the top dropdown.

## 3. Enable the Google Sheets API
1. In the Google Cloud Console search bar at the top, search for **Google Sheets API**.
2. Click on it in the results, then click the blue **Enable** button.

## 4. Create a Service Account
1. In the Google Cloud Console, click the hamburger menu (three lines) in the top left.
2. Go to **IAM & Admin** > **Service Accounts**.
3. Click **+ Create Service Account** at the top.
4. Give it a name (e.g., "sheets-sync"). The ID will auto-generate. Click **Create and Continue**.
5. You don't need to assign any roles. Click **Continue**, then **Done**.
6. You will see your new service account in the list. It has an email address that ends in `.iam.gserviceaccount.com`. **Copy this email address**.
7. Click the three dots (Actions) to the right of your service account and select **Manage keys**.
8. Click **Add Key** > **Create new key**.
9. Choose **JSON** and click **Create**.
10. A `.json` file will download to your computer. Keep this file safe; it contains the credentials needed to access your sheet.

## 5. Share Your Google Sheet with the Service Account
1. Open your Google Sheet again.
2. Click the green **Share** button in the top right.
3. Paste the Service Account email address you copied in step 4.6.
4. Give it **Viewer** permission (it only needs to read the data).
5. Uncheck "Notify people" (since it's a bot account) and click **Share**.

## 6. Configure Local Environment (For Local Syncing)
To run the sync script on your local computer (`pnpm run update-questions`):
1. In the root directory of this project, create a file named `.env`.
2. Add the following line to the `.env` file:
   ```
   GOOGLE_SHEET_ID=your_sheet_id_here
   ```
   (Replace `your_sheet_id_here` with the ID from Step 1).
3. Open the JSON file you downloaded in step 4.10 using a text editor (like Notepad or VS Code).
4. Copy the entire contents of the file.
5. Add another line to your `.env` file:
   ```
   GOOGLE_SERVICE_ACCOUNT_CREDENTIALS='paste_entire_json_here'
   ```
   *(Note: ensure it's on a single line, or stringify it if necessary. If you have issues locally, you can also just save the file as `google-credentials.json` locally and point to it, but the environment variable approach matches how GitHub Actions will work.)*

## 7. Configure GitHub Secrets (For Automated Syncing)
To allow GitHub Actions to automatically sync the questions:
1. Go to this repository on GitHub.
2. Click on **Settings** (the gear icon tab).
3. In the left sidebar, expand **Secrets and variables**, then click **Actions**.
4. Click the green **New repository secret** button.
5. Name the secret: `GOOGLE_SHEET_ID`
6. Paste your Sheet ID in the Secret field and click **Add secret**.
7. Click **New repository secret** again.
8. Name the secret: `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS`
9. Open your downloaded JSON file, copy the entire contents, paste it into the Secret field, and click **Add secret**.

## You're All Set!
You can now run `pnpm run update-questions` locally, or trigger the "Sync Google Sheets Questions" workflow from the GitHub Actions tab.
