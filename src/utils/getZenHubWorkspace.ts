const ZENHUB_GRAPHQL_ENDPOINT_URL = 'https://api.zenhub.com/public/graphql';

const query = `

`;

const searchIssuesByPipelineQuery = `
  query searchIssuesByPipeline($workspaceId:ID!, $pipelineId: ID!, $first: Int!) {
    searchIssuesByPipeline(pipelineId: $pipelineId, first: $first, filters: {}) {
      nodes {
        number,
        title,
        state,
        pipelineIssue(workspaceId: $workspaceId) {
          pipeline {
            name
          },
        },
        parentZenhubEpics(first: 5) {
          nodes {
            oldIssue {
              number
            }
          }
        },
        releases {
          nodes {
            title
          }
        }
      }
    }
  }
`;