module.exports = {
  branches: ["main"],
  repositoryUrl: "https://github.com/bamiyanapp/uchi-stock.git",
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "conventionalcommits"
      }
    ],
    "@semantic-release/release-notes-generator",
    [
      "@semantic-release/github",
      {
        successComment: false,
        failCommentCondition: false,
        releasedLabels: false
      }
    ]
  ]
};
