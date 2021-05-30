## Push to Google Apps Script

```bash
git clone https://github.com/kecbigmt/zensheets.git
clasp create --rootDir src --type standalone --title "ZenSheets"
clasp push
```

## GCP setting (for private googel add-on)
### 1. Prepare images & documents
You need to prepare images & document as below.
Those are required to configure dummy store listing.

### Graphic assets
- Application Icon 32x32
- Application Icon 128x128
- Application Card Banner
- Screenshots (one or more)

Anything is fine, but you should know these will be visible for your Google Workspace users.

### Google Doc
- Create and publish a new document in Google Doc
- You don't have to write anything. It's just a dummy
- It's an alternative to the support page, privacy policy, terms of service of the add-on

### 2. Configure consent screen
Go to [APIs & Services] -> [OAuth concent screen] and edit app registration.

#### 2-1. OAuth consent screen
Fill fields below:
- App name
- User support email
- Developer contact information

#### 2-2. Scopes
Add scopes below:
- https://www.googleapis.com/auth/spreadsheets
- https://www.googleapis.com/auth/script.container.ui
- https://www.googleapis.com/auth/script.external_request

#### 2-3. Test users
If users outside your Google Workspace need to access the app, register their email address.

### 3. Enable APIs
Go to [APIs & Services] -> [Dashboard] -> [ENABLE APIS AND SERVICES].

Then, enable APIs below:
- Google Workspace Marketplace SDK
- Google Workspace Add-ons API

### 4. Link your Google Apps Script project & GCP project
1. Go to the top page of GCP project and copy the project number
2. Move to Google Apps Script console
3. Go to [Project Setting] -> [Google Cloud Platform (GCP) Project]
4. Click [Change project]
5. Enter the project number
6. Click [Set project]

### 5. Deploy the project
Stay in the GAS project console.

1. Click [Deploy] -> [New deployment]
2. Select [Add-on] as type
3. Click [Deploy]
4. You will see Deployment ID & version number. Write them down

### 5. App Configuration
1. Go back to GCP console & go to Google Workspace Marketplace SDK console, or open https://console.cloud.google.com/apis/api/appsmarket-component.googleapis.com
2. Then go to [App Configuration]

#### 5-1. App Integration
1. Check [Google Workspace Add-on]
2. Select [Deploy using Apps Script deployment id]
3. Enter Deployment ID of your GAS project
4. Check [Sheets Add-on]
5. Enter [Sheets Add-on Project Script ID] (You can find it on [Project Setting] of your GAS project)
6. Enter [Sheets Add-on script version] (You should have found it when deploying GAS)

#### 5-2. Developer Links
1. Enter [Developer Name]
2. Enter [Developer Website URL]. Anything is OK
3. Enter [Developer Email]

#### 5-3. App Visibility
1. Select [Private]

Finnaly, click [SAVE].

### 6. Store Listing & publish
1. Go to [Store Listing] in Google Workspace Marketplace SDK console
2. Fill in the required fields. Upload your graphic assets & enter the URL of your Google Docs page in [Support Links]
3. Click [PUBLISH]
4. The add-on will be approved immediately. You will be able to find the store page URL (`http://workspace.google.com/marketplace/app/appname/:id`) at the top of [Store Listing]
5. Open the store page & install the add-on

Now, you can find the add-on on your spreadsheet. Enjoy it!

## Etc
### Change the GAS project

```bash
clasp setting scriptId <Destination Script ID>
```
