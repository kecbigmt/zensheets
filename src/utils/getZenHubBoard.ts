import { ZENHUB_DEFAULT_ENDPOINT } from "./constants";

// ref. https://github.com/ZenHubIO/API#get-a-zenhub-board-for-a-repository
type ZenHubBoard = {
  pipelines: ZenHubPipeline[];
};

type ZenHubPipeline = {
  id: string;
  name: string;
  issues: ZenHubIssue[];
};

type ZenHubIssue = {
  issue_number: number;
  is_epic: boolean;
  estimate?: { value: number };
  position?: boolean;
};

const getZenHubBoard = (
  zenhubApiToken: string,
  workspaceId: string,
  repoId: string
): ZenHubBoard => {
  const options = {
    method: "get" as GoogleAppsScript.URL_Fetch.HttpMethod,
    headers: {
      "X-Authentication-Token": zenhubApiToken,
      ContentType: "application/json",
    },
    contentType: "application/json",
  };

  const url =
    ZENHUB_DEFAULT_ENDPOINT +
    `/p2/workspaces/${workspaceId}/repositories/${repoId}/board`;

  const resp = UrlFetchApp.fetch(url, options);
  if (resp.getResponseCode() !== 200) {
    throw new Error(
      `zenhub api error: code=${resp.getResponseCode()}, body=${resp.getContentText()}`
    );
  }
  const board: ZenHubBoard = JSON.parse(resp.getContentText());

  return board;
};

export default getZenHubBoard;
