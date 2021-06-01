import parseLinkHeader from './parseLinkHeader';

const GITHUB_DEFAULT_ENDPOINT = "https://api.github.com";

// ref. https://docs.github.com/en/rest/reference/issues#list-issues-assigned-to-the-authenticated-user
type GitHubIssue = {
  id: string;
  node_id: string;
  number: number;
  url: string;
  state: string;
  title: string;
  assignee: GitHubUser;
  assignees: GitHubUser[];
  labels: GitHubLabel[];
};

type GitHubUser = {
  login: string;
};

type GitHubLabel = {
  id: string;
  node_id: string;
  url: string;
  name: string;
  description: string;
  color: string;
  default: boolean;
};

export const getGitHubIssues = (
  githubApiToken: string,
  owner: string,
  repo: string,
  labels?: string
): GitHubIssue[] => {
  const options = {
    method: "get" as GoogleAppsScript.URL_Fetch.HttpMethod,
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: "token " + githubApiToken,
    },
    contentType: "application/json",
  };

  const issues: GitHubIssue[] = [];
  let url =
    GITHUB_DEFAULT_ENDPOINT +
    `/repos/${owner}/${repo}/issues${labels ? "?labels=" + labels : ""}`;
  
  while (url) {
    if (!url) {
      break;
    }

    const resp = UrlFetchApp.fetch(url, options);
    if (resp.getResponseCode() !== 200) {
      throw new Error(
        `github api error: code=${resp.getResponseCode()}, body=${resp.getContentText()}`
      );
    }
    issues.push(...JSON.parse(resp.getContentText()));
    url = '';

    const linkHeader = resp.getHeaders()['Link'];
    if (typeof linkHeader === 'string') {
      const links = parseLinkHeader(linkHeader);
      if (links.next) {
        url = links.next;
      }
    }
  }

  return issues;
};

export default getGitHubIssues;
