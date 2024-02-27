function onInstall(e: GoogleAppsScript.Events.AddonOnInstall) {
  // @ts-ignore
  onOpen(e);
}

function onOpen(e: GoogleAppsScript.Events.SheetsOnOpen) {
  const menu = SpreadsheetApp.getUi().createAddonMenu();
  Logger.log(JSON.stringify(e));
  if (e && e.authMode === ScriptApp.AuthMode.NONE) {
    menu.addItem('Authorize', 'onAuthorize');
  } else {
    menu.addItem('Configure', 'buildConfigureSidebar');
  }
  menu.addToUi();
}

function onAuthorize() {
  Browser.msgBox('Hello');
}

function onHomepage(e) {
  Logger.log(JSON.stringify(e));
  return createConfigureCard();
}

function createConfigureCard() {
  const userProps = PropertiesService.getUserProperties();
  const githubApiToken = userProps.getProperty('GITHUB_API_TOKEN') ?? '';
  const zenhubApiToken = userProps.getProperty('ZENHUB_API_TOKEN') ?? '';

  const builder = CardService.newCardBuilder();
  const section = CardService.newCardSection()
    .addWidget(CardService.newTextInput().setFieldName('githubApiToken').setValue(githubApiToken).setTitle('GitHub API Token'))
    .addWidget(CardService.newTextInput().setFieldName('zenhubApiToken').setValue(zenhubApiToken).setTitle('ZenHub API Token'))
    .addWidget(CardService.newTextInput().setFieldName('zenhubGraphqlApiKey').setValue(zenhubApiToken).setTitle('ZenHub GraphQL API Key'))
    .addWidget(CardService.newButtonSet().addButton(CardService.newTextButton().setText('Save').setOnClickAction(CardService.newAction().setFunctionName('onClickUpdate'))));
  builder.addSection(section);

  return builder.build();
}

function onClickUpdate(e) {
  const githubApiToken = e.formInput.githubApiToken;
  const zenhubApiToken = e.formInput.zenhubApiToken;
  const zenhubGraphqlApiKey = e.formInput.zenhubGraphqlApiKey;

  const userProps = PropertiesService.getUserProperties();
  userProps.setProperties({
    GITHUB_API_TOKEN: githubApiToken,
    ZENHUB_API_TOKEN: zenhubApiToken,
    ZENHUB_GRPAHQL_API_KEY: zenhubGraphqlApiKey,
  });
  Browser.msgBox('Configure saved');
}

function buildConfigureSidebar() {
  const htmlOutput = HtmlService.createTemplateFromFile('index').evaluate();
  SpreadsheetApp.getUi().showSidebar(htmlOutput);
}

function saveConfigure({ githubApiToken, zenhubApiToken, zenhubGraphqlApiKey }: { githubApiToken: string; zenhubApiToken: string, zenhubGraphqlApiKey: string }) {
  const userProps = PropertiesService.getUserProperties();
  userProps.setProperties({
    githubApiToken,
    zenhubApiToken,
    zenhubGraphqlApiKey,
  });
  Browser.msgBox('Configure saved');
}

/**
 * Multiplies the input value by 2.
 *
 * @param {number|Array<Array<number>>} input The value or range of cells
 *     to multiply.
 * @return The input multiplied by 2.
 * @customfunction
 */
function DOUBLE(input: number): number {
  return input * 2;
}