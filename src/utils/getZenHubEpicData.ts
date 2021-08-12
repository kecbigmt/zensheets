import { ZENHUB_DEFAULT_ENDPOINT } from "./constants";

// ref. https://github.com/ZenHubIO/API#get-epic-data

type Pipeline = {
  workspace_id: string;
  name: string;
  pipeline_id: string
};

type Issue = {
  issue_number: number;
  is_epic: boolean;
  repo_id: number;
  estimate: { value: number };
  pipelines: Pipeline[];
  pipeline: Pipeline;
}

type ZenHubEpicData = {
  total_epic_estimates: {
    value: number;
  };
  estimate: {
    value: number;
  };
  piepeline: Pipeline;
  pipelines: Pipeline[];
  issues: Issue[];
}

const getZenHubEpicData = (
  zenhubApiToken: string,
  repoId: string,
  epicId: number,
): ZenHubEpicData => {
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
    `/p1/repositories/${repoId}/epics/${epicId}`;

  const resp = UrlFetchApp.fetch(url, options);
  if (resp.getResponseCode() !== 200) {
    throw new Error(
      `zenhub api error: code=${resp.getResponseCode()}, body=${resp.getContentText()}`
    );
  }
  const epicData: ZenHubEpicData = JSON.parse(resp.getContentText());

  return epicData;
};

export default getZenHubEpicData;
