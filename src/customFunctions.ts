import { getGitHubIssuesByOwnerAndRepo, getGitHubIssuesByRepoId } from "./utils/getGitHubIssues";
import getZenHubBoard from "./utils/getZenHubBoard";

function GITHUB_ISSUES(owner: string, repo: string, labels?: string): any[][] {
  if (!owner || !repo) {
    throw new Error(`too few arguments`);
  }
  const githubApiToken =
    PropertiesService.getUserProperties().getProperty("GITHUB_API_TOKEN") ?? "";
  if (!githubApiToken) {
    throw new Error(`github api token not set`);
  }

  const issues = getGitHubIssuesByOwnerAndRepo(githubApiToken, owner, repo, labels);

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

function GITHUB_ISSUES_BY_REPOID(repoId: string, labels?: string): any[][] {
  if (!repoId) {
    throw new Error(`too few arguments`);
  }
  const githubApiToken =
    PropertiesService.getUserProperties().getProperty("GITHUB_API_TOKEN") ?? "";
  if (!githubApiToken) {
    throw new Error(`github api token not set`);
  }

  const issues = getGitHubIssuesByRepoId(githubApiToken, repoId, labels);

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

function ZENHUB_ISSUES(workspaceId: string, repoId: string): any[][] {
  if (!workspaceId || !repoId) {
    throw new Error(`too few arguments`);
  }
  const zenhubApiToken =
    PropertiesService.getUserProperties().getProperty("ZENHUB_API_TOKEN") ?? "";
  if (!zenhubApiToken) {
    throw new Error(`zenhub api token not set`);
  }

  const board = getZenHubBoard(zenhubApiToken, workspaceId, repoId);

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
  board.pipelines.forEach((pipeline) => {
    pipeline.issues.forEach((issue) => {
      rows.push([
        pipeline.id,
        pipeline.name,
        issue.issue_number,
        issue.is_epic,
        issue.estimate?.value ?? "",
        issue.position ?? "",
      ]);
    });
  });

  return rows;
}
