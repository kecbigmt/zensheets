/**
 * Join GitHub issues & ZenHub issues
 *
 * @param {(string|number)[][]} githubIssues
 * @param {(string|number)[][]} zenhubIssues
 * @param {string} pspLabelPrefix the label prefix for pessimistic story points. e.g. "psp_"
 * @param {string} ospLabelPrefix the label prefix for optimistic story points. e.g. "osp_"
 * @returns {(string|number)[][]} joined issues
 */
function JOIN_ISSUES(
  githubIssues: any[][],
  zenhubIssues: any[][],
  pspLabelPrefix?: string,
  ospLabelPrefix?: string
): any[][] {
  if (githubIssues.length < 2) throw new Error("no github issues");
  if (zenhubIssues.length < 2) throw new Error("no zenhub issues");

  const githubIssuesHeader = githubIssues[0];
  const githubNumberIndex = githubIssuesHeader.indexOf("number");
  const githubTitleIndex = githubIssuesHeader.indexOf("title");
  const gihubStateIndex = githubIssuesHeader.indexOf("state");
  const githubAsignneesIndex = githubIssuesHeader.indexOf("asignnees");
  const githubLabelsIndex = githubIssuesHeader.indexOf("labels");

  let insufficientGithubColumns: string[] = [];
  if (githubNumberIndex < 0) insufficientGithubColumns.push("number");
  if (githubTitleIndex < 0) insufficientGithubColumns.push("title");
  if (gihubStateIndex < 0) insufficientGithubColumns.push("state");
  if (githubAsignneesIndex < 0) insufficientGithubColumns.push("asignnees");
  if (githubLabelsIndex < 0) insufficientGithubColumns.push("labels");

  if (insufficientGithubColumns.length > 0) {
    throw new Error(
      "insufficient github issue column(s): " +
        insufficientGithubColumns.join(",")
    );
  }

  const zenhubIssuesHeader = zenhubIssues[0];
  const zenhubPipelineNameIndex = zenhubIssuesHeader.indexOf("pipeline_name");
  const zenhubIsEpicIndex = zenhubIssuesHeader.indexOf("is_epic");
  const zenhubIssueNumberIndex = zenhubIssuesHeader.indexOf("issue_number");
  const zenhubEstimateValueIndex = zenhubIssuesHeader.indexOf("estimate_value");
  const zenhubPositionIndex = zenhubIssuesHeader.indexOf("position");
  const zenhubParentEpicsIndex = zenhubIssuesHeader.indexOf("parent_epics");

  let insufficientZenHubColumns: string[] = [];
  if (zenhubPipelineNameIndex < 0)
    insufficientZenHubColumns.push("pipeline_name");
  if (zenhubIsEpicIndex < 0) insufficientZenHubColumns.push("is_epic");
  if (zenhubIssueNumberIndex < 0)
    insufficientZenHubColumns.push("issue_number");
  if (zenhubEstimateValueIndex < 0)
    insufficientZenHubColumns.push("estimate_value");
  if (zenhubPositionIndex < 0) insufficientZenHubColumns.push("position");

  if (insufficientZenHubColumns.length > 0) {
    throw new Error(
      "insufficient zenhub issue column(s): " +
        insufficientZenHubColumns.join(",")
    );
  }

  const issueNumberMap: { [num: string]: number } = {};
  zenhubIssues.slice(1).forEach((issue, index) => {
    const num = String(issue[zenhubIssueNumberIndex]);
    issueNumberMap[num] = index;
  });

  const header = [
    "pipeline_name",
    "position",
    "is_epic",
    "number",
    "title",
    "state",
    "asignees",
    "labels",
    "most_likely_sp",
  ];
  if (pspLabelPrefix) header.push("pessimistic_sp");
  if (ospLabelPrefix) header.push("optimistic_sp");
  if (zenhubParentEpicsIndex >= 0) header.push("parent_epics");

  const bodyRows = githubIssues.slice(1).map((githubIssue) => {
    let labels = String(githubIssue[githubLabelsIndex]);

    let psp = undefined;
    if (pspLabelPrefix) {
      const { point, newLabels } = extractPoint(labels, pspLabelPrefix);
      psp = point;
      labels = newLabels;
    }

    let osp = undefined;
    if (ospLabelPrefix) {
      const { point, newLabels } = extractPoint(labels, ospLabelPrefix);
      osp = point;
      labels = newLabels;
    }

    const issueNumber = githubIssue[githubNumberIndex];
    const zenhubIssueIndex = issueNumberMap[String(issueNumber)];
    let pipelineName = "";
    let position = undefined;
    let isEpic = undefined;
    let mostLikelySp = undefined;
    let parentEpics = "";
    if (typeof zenhubIssueIndex !== "undefined") {
      const zenhubIssue = zenhubIssues[zenhubIssueIndex + 1];
      pipelineName = zenhubIssue[zenhubPipelineNameIndex];
      position = zenhubIssue[zenhubPositionIndex];
      isEpic = zenhubIssue[zenhubIsEpicIndex];
      mostLikelySp = zenhubIssue[zenhubEstimateValueIndex];
      if (zenhubParentEpicsIndex >= 0) {
        parentEpics = zenhubIssue[zenhubParentEpicsIndex];
      }
    }

    const row = [
      pipelineName,
      position,
      isEpic,
      issueNumber,
      githubIssue[githubTitleIndex],
      githubIssue[gihubStateIndex],
      githubIssue[githubAsignneesIndex],
      labels,
      mostLikelySp,
    ];

    if (pspLabelPrefix) row.push(psp);
    if (ospLabelPrefix) row.push(osp);
    if (zenhubParentEpicsIndex >= 0) row.push(parentEpics);

    return row;
  });

  return [header].concat(bodyRows);
}

export const extractPoint = (
  labels: string,
  prefix: string
): {
  newLabels: string;
  point: number;
} => {
  const start = labels.indexOf(prefix);
  if (start < 0) {
    return {
      newLabels: labels,
      point: NaN,
    }
  }
  let nextCommaIndex = labels.indexOf(",", start + 1);
  const end = nextCommaIndex >= 0 ? nextCommaIndex : labels.length + 1;
  const point = Number(labels.slice(start + prefix.length, end));
  const newLabels =
    nextCommaIndex >= 0
      ? labels.slice(0, start) + labels.slice(end + 1, labels.length + 1)
      : start === 0
      ? ""
      : labels.slice(0, start - 1);
  return { newLabels, point };
};

export default JOIN_ISSUES;
