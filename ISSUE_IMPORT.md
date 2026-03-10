# Importing Local Issues to GitHub

This repository tracks bugs and enhancements in the `/issues` directory. Each file contains a markdown description following a consistent format.

To push these items into a GitHub repository as real issues, use the helper script provided:

```bash
# install dependencies if needed (from repo root)
npm install @octokit/rest

# set your GitHub personal access token and repo
env GH_TOKEN=... GH_REPO=owner/repo node scripts/create_issues.js
```

The script will read every `*.md` file under `/issues`, use the first heading as the issue title, and the rest of the file as the body.

Once issues are created on GitHub, you may want to add labels or link them to projects manually.

This workflow keeps local tracking in sync with the remote GitHub project.