module.exports = {
  branches: ["main"],
  repositoryUrl: "https://github.com/bamiyanapp/uchi-stock.git",
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "conventionalcommits",
        releaseRules: [
          { type: "feat", release: "minor" },
          { type: "fix", release: "patch" },

          { type: "Feat", release: "minor" },
          { type: "Fix", release: "patch" },
          { type: "Refactor", release: "patch" },

          { type: "Feat/fix", release: "patch" },
          { type: "Fix/tech", release: "patch" },

          { type: "Docs", release: false },
          { type: "Chore", release: false }
        ],
        defaultReleaseType: "patch"
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
