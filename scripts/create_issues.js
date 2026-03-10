#!/usr/bin/env node
// Script to create GitHub issues from markdown files in /issues directory.
// Requires environment variables GH_TOKEN and GH_REPO (owner/repo).

const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');

async function main() {
  const token = process.env.GH_TOKEN;
  const repo = process.env.GH_REPO;
  if (!token || !repo) {
    console.error('Please set GH_TOKEN and GH_REPO environment variables.');
    process.exit(1);
  }
  const [owner, repoName] = repo.split('/');
  const octokit = new Octokit({ auth: token });

  const issuesDir = path.join(__dirname, '..', 'issues');
  const files = fs.readdirSync(issuesDir).filter(f => f.endsWith('.md'));
  for (const file of files) {
    const content = fs.readFileSync(path.join(issuesDir, file), 'utf-8');
    const lines = content.split('\n');
    const titleLine = lines.find(l => l.startsWith('#')) || '';
    const title = titleLine.replace(/^#\s*/, '').trim();
    const body = lines.slice(1).join('\n').trim();

    try {
      console.log(`Creating GitHub issue: ${title}`);
      const res = await octokit.issues.create({
        owner,
        repo: repoName,
        title,
        body,
      });
      console.log(`Created issue #${res.data.number}`);
    } catch (err) {
      console.error(`Failed to create issue for ${file}:`, err.message);
    }
  }
}

main();
