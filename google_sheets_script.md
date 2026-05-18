# 📊 Connect Google Sheets to Your Checkout Form

Follow these simple steps to make your website automatically save leads (Name, Email, Phone) into a Google Sheet **right before** they pay!

### Step 1: Prepare Your Google Sheet
1. Open a new or existing Google Sheet.
2. In the very first row, add these column headers:
   * **Column A:** Timestamp
   * **Column B:** Name
   * **Column C:** Email
   * **Column D:** Phone
   * **Column E:** Designation

### Step 2: Add the Script
1. In your Google Sheet, click on **Extensions** > **Apps Script** in the top menu.
2. Delete any existing code in the editor, and **paste the following code:**

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  try {
    var data = JSON.parse(e.postData.contents);
    var timestamp = new Date();
    
    // Append data to the next available row (Timestamp, Name, Email, Phone, Designation)
    sheet.appendRow([timestamp, data.name, data.email, data.phone, data.designation]);
    
    return ContentService.createTextOutput(JSON.stringify({"result": "success"}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({"result": "error", "error": error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```
3. Click the **Save** icon (floppy disk) at the top.

### Step 3: Deploy as Web App
1. At the top right of the Apps Script editor, click the blue **Deploy** button > **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web App**.
3. Under "Description", type something like `Lead Capture`.
4. Under "Execute as", select **Me**.
5. Under "Who has access", select **Anyone**. *(This is important!)*
6. Click **Deploy**.
   * *Note: Google might ask you to "Authorize Access". Click it, choose your Google account, click "Advanced", and then "Go to project (unsafe)". This is perfectly safe since you wrote the script.*
7. After deploying, copy the **Web App URL** provided.

### Step 4: Link it to Your Website
1. Open `script.js` in your website folder.
2. Go to **line 110**.
3. Replace `"YOUR_GOOGLE_SCRIPT_URL_HERE"` with the long Web App URL you just copied.

That's it! Test it by filling out the form and clicking "Pay". Your Google Sheet will instantly update with the lead's information!
