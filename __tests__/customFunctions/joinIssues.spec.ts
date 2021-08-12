import JOIN_ISSUES, {
  extractPoint,
} from "../../src/customFunctions/joinIssues";

const githubIssues = [
  ["number", "title", "state", "asignnees", "labels"],
  ["123", "ABC", "open", "john", "psp_5,osp_2"],
  ["456", "DEF", "closed", "mike,michael", "enhancement,osp_5,psp_13"],
  ["789", "GHI", "open", "", "bug,psp_3,osp_0.5,wontfix"],
];

const zenhubIssues = [
  [
    "pipeline_id",
    "pipeline_name",
    "issue_number",
    "is_epic",
    "estimate_value",
    "position",
  ],
  ["opq", "New Issues", 123, false, 3, 0],
  ["opq", "New Issues", 456, true, 8, 1],
  ["rst", "Icebox", 789, false, 1, 0],
  ["opq", "New Issues", 98765, false, 1, 2],
  ["uvw", "Product Backlog", 43210, false, 5, 0],
];

const zenhubIssuesWithParentEpics = [
  [
    "pipeline_id",
    "pipeline_name",
    "issue_number",
    "is_epic",
    "estimate_value",
    "position",
    "parent_epics",
  ],
  ["opq", "New Issues", 123, false, 3, 0, "456"],
  ["opq", "New Issues", 456, true, 8, 1, ""],
  ["rst", "Icebox", 789, false, 1, 0, ""],
  ["opq", "New Issues", 98765, false, 1, 2, "456"],
  ["uvw", "Product Backlog", 43210, false, 5, 0, ""],
];

describe("JOIN_ISSUES", () => {
  it("should join correctly (without osp & psp)", () => {
    expect(JOIN_ISSUES(githubIssues, zenhubIssues)).toStrictEqual([
      [
        "pipeline_name",
        "position",
        "is_epic",
        "number",
        "title",
        "state",
        "asignees",
        "labels",
        "most_likely_sp",
      ],
      ["New Issues", 0, false, "123", "ABC", "open", "john", "psp_5,osp_2", 3],
      [
        "New Issues",
        1,
        true,
        "456",
        "DEF",
        "closed",
        "mike,michael",
        "enhancement,osp_5,psp_13",
        8,
      ],
      [
        "Icebox",
        0,
        false,
        "789",
        "GHI",
        "open",
        "",
        "bug,psp_3,osp_0.5,wontfix",
        1,
      ],
    ]);
  });

  it("should join correctly (with psp)", () => {
    expect(JOIN_ISSUES(githubIssues, zenhubIssues, "psp_")).toStrictEqual([
      [
        "pipeline_name",
        "position",
        "is_epic",
        "number",
        "title",
        "state",
        "asignees",
        "labels",
        "most_likely_sp",
        "pessimistic_sp",
      ],
      ["New Issues", 0, false, "123", "ABC", "open", "john", "osp_2", 3, 5],
      [
        "New Issues",
        1,
        true,
        "456",
        "DEF",
        "closed",
        "mike,michael",
        "enhancement,osp_5",
        8,
        13,
      ],
      [
        "Icebox",
        0,
        false,
        "789",
        "GHI",
        "open",
        "",
        "bug,osp_0.5,wontfix",
        1,
        3,
      ],
    ]);
  });

  it("should join correctly (with osp & psp)", () => {
    expect(
      JOIN_ISSUES(githubIssues, zenhubIssues, "psp_", "osp_")
    ).toStrictEqual([
      [
        "pipeline_name",
        "position",
        "is_epic",
        "number",
        "title",
        "state",
        "asignees",
        "labels",
        "most_likely_sp",
        "pessimistic_sp",
        "optimistic_sp",
      ],
      ["New Issues", 0, false, "123", "ABC", "open", "john", "", 3, 5, 2],
      [
        "New Issues",
        1,
        true,
        "456",
        "DEF",
        "closed",
        "mike,michael",
        "enhancement",
        8,
        13,
        5,
      ],
      ["Icebox", 0, false, "789", "GHI", "open", "", "bug,wontfix", 1, 3, 0.5],
    ]);
  });
});


it("should join correctly (with parent epics)", () => {
  expect(JOIN_ISSUES(githubIssues, zenhubIssuesWithParentEpics)).toStrictEqual([
    [
      "pipeline_name",
      "position",
      "is_epic",
      "number",
      "title",
      "state",
      "asignees",
      "labels",
      "most_likely_sp",
      "parent_epics",
    ],
    ["New Issues", 0, false, "123", "ABC", "open", "john", "psp_5,osp_2", 3, "456"],
    [
      "New Issues",
      1,
      true,
      "456",
      "DEF",
      "closed",
      "mike,michael",
      "enhancement,osp_5,psp_13",
      8,
      "",
    ],
    [
      "Icebox",
      0,
      false,
      "789",
      "GHI",
      "open",
      "",
      "bug,psp_3,osp_0.5,wontfix",
      1,
      "",
    ],
  ]);
});

describe("extractPoint", () => {
  it("should extract 'psp_13' from 'enhancement,psp_13'", () => {
    expect(extractPoint("enhancement,osp_5,psp_13", "osp_")).toStrictEqual({
      point: 5,
      newLabels: "enhancement,psp_13",
    });
  });

  it("should extract 'psp_5' from 'psp_5'", () => {
    expect(extractPoint("psp_5", "psp_")).toStrictEqual({
      point: 5,
      newLabels: "",
    });
  });

  it("should extract 'psp_2' from 'psp_5,osp_2'", () => {
    expect(extractPoint("psp_5,osp_2", "psp_")).toStrictEqual({
      point: 5,
      newLabels: "osp_2",
    });
  });

  it("should extract 'osp_2' from 'psp_5,osp_2'", () => {
    expect(extractPoint("psp_5,osp_2", "osp_")).toStrictEqual({
      point: 2,
      newLabels: "psp_5",
    });
  });
});
