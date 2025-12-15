# Google Sheets Webhook Setup

This guide explains how to set up Google Sheets to automatically trigger a deployment when the sheet is updated.

## Overview

When your Google Sheet is modified, a Google Apps Script will call GitHub's API to trigger the `repository_dispatch` event, which will start a new deployment workflow.

## Prerequisites

1. A GitHub Personal Access Token (PAT) - **Fine-grained**
2. Access to edit the Google Sheet
3. The Google Sheet ID (used in `SHEET_ID`)

## Step 1: Create a GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → **Fine-grained tokens**
2. Click "Generate new token"
3. Configure the token:
   - **Token name**: Give it a descriptive name (e.g., "Google Sheets Webhook")
   - **Expiration**: Set an appropriate expiration (or no expiration)
   - **Description**: Optional description
   - **Repository access**: Select "Only select repositories"
   - **Selected repositories**: Choose your repository (e.g., `cap-alerts-web`)
4. Under **Repository permissions**, find **Contents**:
   - Set to **Read and write** (this allows triggering workflows)
5. Click "Generate token"
6. **Copy the token immediately** - you won't be able to see it again

**Important**: You do NOT need to add this token to GitHub Actions secrets. The token is only used in Google Apps Script to authenticate API calls to GitHub. GitHub Actions workflows have their own built-in `GITHUB_TOKEN` that's automatically available.

## Step 2: Set Up Google Apps Script

1. Open your Google Sheet
2. Go to **Extensions → Apps Script**
3. Add the following code:

```javascript
// Configuration
const GITHUB_OWNER = "YOUR_GITHUB_USERNAME"; // e.g., 'joshmcarthur'
const GITHUB_REPO = "YOUR_REPO_NAME"; // e.g., 'cap-alerts-web'
const GITHUB_EVENT_TYPE = "deploy";

/**
 * Triggered when the sheet is opened (optional - for testing)
 */
function onOpen() {
  // Uncomment the line below to test the webhook
  // triggerGitHubWorkflow();
}

/**
 * Calls GitHub API to trigger repository_dispatch event
 */
function triggerGitHubWorkflow() {
  // Get token from Script Properties (more secure) or use constant
  const token =
    PropertiesService.getScriptProperties().getProperty("GITHUB_TOKEN") ||
    GITHUB_TOKEN;

  if (!token || token === "YOUR_GITHUB_TOKEN_HERE") {
    Logger.log("Error: GitHub token not configured");
    return;
  }

  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/dispatches`;

  const payload = {
    event_type: GITHUB_EVENT_TYPE,
    client_payload: {
      sheet_id: SpreadsheetApp.getActiveSpreadsheet().getId(),
      timestamp: new Date().toISOString(),
    },
  };

  const options = {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Google-Apps-Script",
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();

    if (responseCode === 204) {
      Logger.log("Successfully triggered GitHub workflow");
    } else {
      const responseText = response.getContentText();
      Logger.log(`Error: ${responseCode} - ${responseText}`);
    }
  } catch (error) {
    Logger.log(`Exception: ${error.toString()}`);
  }
}
```

5. **Update the configuration variables:**
   - Replace `YOUR_GITHUB_USERNAME` with your GitHub username
   - Replace `YOUR_REPO_NAME` with your repository name

## Step 3: Store Token Securely

Instead of hardcoding the token, use Google Apps Script Properties:

1. In the Apps Script editor, go to **Project Settings** (gear icon)
2. Scroll down to "Script properties"
3. Click "Add script property"
4. Property: `GITHUB_TOKEN`
5. Value: Your GitHub Personal Access Token
6. Click "Save script property"

The code will automatically use this value if it's set.

## Step 4: Set Up the Trigger

1. In the Apps Script editor, click on the clock icon (Triggers) in the left sidebar
2. Click "Add Trigger" (bottom right)
3. Configure:
   - **Function to run**: `triggerGitHubWorkflow`
   - **Event source**: From spreadsheet
   - **Event type**: On edit
4. Click "Save"
5. You may need to authorize the script - follow the prompts

## Step 5: Test the Setup

1. Make a small edit to your Google Sheet (e.g., change a cell value)
2. Wait a few seconds
3. Go to your GitHub repository → Actions tab
4. You should see a new workflow run triggered by "deploy"

## Troubleshooting

### Workflow doesn't trigger

- Check the Apps Script execution log: View → Execution log
- Verify the GitHub token has the correct permissions
- Ensure the repository name and owner are correct
- Check that the trigger is set up correctly

### Permission errors

- Make sure it has "Contents: Read and write" permission and is scoped to the correct repository
- Verify the token hasn't expired
- Check that the repository name and owner match exactly

### Rate limiting

- GitHub API has rate limits. If you're making many rapid edits, consider using a more sophisticated trigger that batches changes

## Alternative: Manual Trigger

If you prefer to trigger deployments manually instead of automatically:

1. In Apps Script, create a custom menu:

```javascript
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("Deploy")
    .addItem("Trigger Deployment", "triggerGitHubWorkflow")
    .addToUi();
}
```

2. Users can then click "Deploy → Trigger Deployment" from the sheet menu

## Security Notes

- Never commit your GitHub token to the repository
- Use Script Properties to store sensitive data
- Consider using a GitHub App instead of a PAT for better security (more complex setup)
- Regularly rotate your tokens
