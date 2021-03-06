import { getGitHubIssuesByOwnerAndRepo, getGitHubIssuesByRepoId } from "../utils/getGitHubIssues";
import getZenHubBoard from "../utils/getZenHubBoard";
import getZenHubEpicData from "../utils/getZenHubEpicData";

/**
 * GitHub issues (get by the repository owner name & repository name)
 * 
 * @param owner repository owner name
 * @param repo repository name
 * @param state the state of the issues to return. Can be either `open`, `closed`, or `all`. Default: `open`
 * @param labels comma-separated labels to filter e.g. "bug,wontfix"
 * @returns {(string|number)[][]} issues (number, title, state, asignees, labels)
 */
function GITHUB_ISSUES(owner: string, repo: string, state?: string, labels?: string): any[][] {
  if (!owner || !repo) {
    throw new Error(`too few arguments`);
  }
  const githubApiToken =
    PropertiesService.getUserProperties().getProperty("GITHUB_API_TOKEN") ?? "";
  if (!githubApiToken) {
    throw new Error(`github api token not set`);
  }

  const issues = getGitHubIssuesByOwnerAndRepo(githubApiToken, owner, repo, state, labels);

  const rows: any[][] = [["number", "title", "state", "asignnees", "labels"]];
  issues.forEach((issue) => {
    rows.push([
      issue.number,
      issue.title,
      issue.state,
      issue.assignees.reduce(
        (prev, current, currentIndex) =>
          prev + (currentIndex > 0 ? "," : "") + current.login,
        ""
      ),
      issue.labels.reduce(
        (prev, current, currentIndex) =>
          prev + (currentIndex > 0 ? "," : "") + current.name,
        ""
      ),
    ]);
  });

  return rows;
}

/**
 * GitHub issues (get by the repository ID)
 * 
 * @param repoId repository ID e.g. "8514"
 * @param state the state of the issues to return. Can be either `open`, `closed`, or `all`. Default: `open`
 * @param labels comma-separated labels to filter e.g. "bug,wontfix"
 * @returns {(string|number)[][]} issues (number, title, state, asignees, labels)
 */
function GITHUB_ISSUES_BY_REPOID(repoId: string, state?: string, labels?: string): any[][] {
  if (!repoId) {
    throw new Error(`too few arguments`);
  }
  const githubApiToken =
    PropertiesService.getUserProperties().getProperty("GITHUB_API_TOKEN") ?? "";
  if (!githubApiToken) {
    throw new Error(`github api token not set`);
  }

  const issues = getGitHubIssuesByRepoId(githubApiToken, repoId, state, labels);

  const rows: any[][] = [["number", "title", "state", "asignnees", "labels"]];
  issues.forEach((issue) => {
    rows.push([
      issue.number,
      issue.title,
      issue.state,
      issue.assignees.reduce(
        (prev, current, currentIndex) =>
          prev + (currentIndex > 0 ? "," : "") + current.login,
        ""
      ),
      issue.labels.reduce(
        (prev, current, currentIndex) =>
          prev + (currentIndex > 0 ? "," : "") + current.name,
        ""
      ),
    ]);
  });

  return rows;
}

/**
 * ZenHub issues
 * 
 * @param workspaceId the ID of the ZenHub Workspace. This is found in the URL for the workspace. e.g. "5f6b5c9ab4fd7d76a3e5b7d8"
 * @param repoId the ID of the GitHub repository, not its full name. This is found in the URL for the workspace. e.g. "47655910"
 * @returns {(string|number)[][]} issues (pipeline_id, pipeline_name, issue_number, is_epic, estimate_value, position)
 */
function ZENHUB_ISSUES(workspaceId: string, repoId: string, withEpic?: boolean): any[][] {
  if (!workspaceId || !repoId) {
    throw new Error(`too few arguments`);
  }
  const zenhubApiToken =
    PropertiesService.getUserProperties().getProperty("ZENHUB_API_TOKEN") ?? "";
  if (!zenhubApiToken) {
    throw new Error(`zenhub api token not set`);
  }

  const board = getZenHubBoard(zenhubApiToken, workspaceId, repoId);

  const issueEpicMap: { [issue_number: number]: number[] } = {};
  if (withEpic) {
    const epicIds: number[] = [];
    
    for (let pipeline of board.pipelines) {
      for (let issue of pipeline.issues) {
        if (issue.is_epic) {
          if (!epicIds.includes(issue.issue_number)) {
            epicIds.push(issue.issue_number);
          }
        }
      }
    }

    for (let epicId of epicIds) {
      const epicData = getZenHubEpicData(zenhubApiToken, repoId, epicId);
      for (let issue of epicData.issues) {
        if (typeof issueEpicMap[issue.issue_number] !== "undefined") {
          issueEpicMap[issue.issue_number].push(epicId);
        } else {
          issueEpicMap[issue.issue_number] = [epicId];
        }
      }
    }
  }

  const rows: any[][] = [
    [
      "pipeline_id",
      "pipeline_name",
      "issue_number",
      "is_epic",
      "estimate_value",
      "position",
    ],
  ];

  if (withEpic) {
    rows[0].push("parent_epics");
  }

  board.pipelines.forEach((pipeline) => {
    pipeline.issues.forEach((issue) => {
      const row = [
        pipeline.id,
        pipeline.name,
        issue.issue_number,
        issue.is_epic,
        issue.estimate?.value ?? "",
        issue.position ?? "",
      ];
      if (withEpic) {
        const epicIds = issueEpicMap[issue.issue_number];
        row.push(typeof epicIds !== "undefined" ? epicIds.join(",") : "");
      }
      rows.push(row);
    });
  });

  return rows;
}
