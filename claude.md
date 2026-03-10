# Claude with Agents

This project is set up for using Claude AI with multiple specialized agents.

## Structure

- `claude.md`: Main configuration and instructions for Claude.
- `agents/`: Directory containing individual agent configurations.
  - Each agent has its own folder with an `agent.md` file defining its role and prompt.

## Usage

To use an agent, reference the corresponding `agent.md` file in your interactions with Claude.

## Agents

- Agent 1: Developer Agent - Identifies issues, implements fixes, creates PRs, and addresses review feedback.
- Agent 2: Reviewer Agent - Reviews PRs, merges if approved, or provides feedback for fixes.
- Agent 3: Project Owner Agent - Discusses project goals, requirements, and provides guidance as the project owner.