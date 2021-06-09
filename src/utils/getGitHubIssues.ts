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

export const getGitHubIssuesByOwnerAndRepo = (
  githubApiToken: string,
  owner: string,
  repo: string,
  state?: string,
  labels?: string
): GitHubIssue[] => {
  const params = ['state=' + (state ?? 'open')];
  if (labels) {
    params.push('labels=' + encodeURIComponent(labels));
  }
  
  let path = `/repos/${owner}/${repo}/issues?${params.join('&')}`;
  return getGitHubIssuesByPath(githubApiToken, path);
};

export const getGitHubIssuesByRepoId = (
  githubApiToken: string,
  repoId: string,
  state?: string,
  labels?: string
): GitHubIssue[] => {
  const params = ['state=' + (state ?? 'open')];
  if (labels) {
    params.push('labels=' + encodeURIComponent(labels));
  }

  let path = `/repositories/${repoId}/issues?${params.join('&')}`;
  return getGitHubIssuesByPath(githubApiToken, path);
};

const getGitHubIssuesByPath = (githubApiToken: string, path: string): GitHubIssue[] => {
  const options = {
    method: "get" as GoogleAppsScript.URL_Fetch.HttpMethod,
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: "token " + githubApiToken,
    },
    contentType: "application/json",
  };

  const issues: GitHubIssue[] = [];
  let url = GITHUB_DEFAULT_ENDPOINT + path;
  
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
}
