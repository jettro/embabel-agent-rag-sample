---
title: Spec-driven development using Codex and Backlog.md
author: Jettro Coenradie
url: https://jettro.dev/spec-driven-development-using-codex-and-backlog-md-1de89cd229d5
hostname: jettro.dev
description: Don’t worry, this is not one of those blogs telling you we no longer need developers. In my daily work as a developer, I have become…
sitename: Medium
date: 2025-10-11
---
# Spec-driven development using Codex and Backlog.md

Don’t worry, this is not one of those blogs telling you we no longer need developers. In my daily work as a developer, I have become accustomed to tools like Co-pilot, Warp, and recently, Codex. Yes, they make me a more effective programmer. Again, yes, they make mistakes. Working with these tools does not significantly alter my approach to projects. One thing that can change my way of working is spec or specification-driven development.

Specifications become truly important when working from them. They have to be accurate and complete. Businesspeople should understand them and, most likely, write them. But what about all those demo applications that I always create? I do not have requirements for them. With tools like Kiro from AWS, you have to put a lot of effort into writing and reading texts. It feels like a waterfall approach. At Devoxx, I got introduced to [Backlog.md](https://backlog.md/). This gave me a better feeling. The lightweight approach even gives me the idea to use it for smaller demo projects.

## Backlog.md

Backlog.md is a Kanban-style task management system that works on the command line. From the start, it was developed to be used through an Agent. Think about tools like Claude Desktop and OpenAI Codex. All tasks are stored as Markdown files in a Git repository. Through the command-line UI, you get a clear view of all tasks and their status.

In general, you let the Agent do the heavy lifting of writing all the tasks in a structured format. You verify the content and make any necessary adjustments. When you are satisfied with the requirements for a task, you ask the agent to develop an implementation plan. Again, this plan is added to the task's markdown file. You can verify it again. Next, instruct the agent to assign the task to itself, mark it as 'in progress,' and begin working on the implementation.

That is, in short, what we are going to do. However, first, we need something to build.

## Connect Four

[Connect four](https://en.wikipedia.org/wiki/Connect_Four) is a simple game for two players. You can find multiple versions online, but what if you can create one yourself? I wanted to have one for the command line. Below is a movie of what I created using Backlog.md and Codex. What you see here took me around 2 hours, including installation and learning both tools. Before working on this game, I had not used them before.

In the game, I am player 1. Notice that I get Hints.

## Installation of Codex

For me, the first step was installing Codex.

Codex CLI is a coding agent that you can run locally from your terminal and that can read, modify, and run code on your machine, in the chosen directory. It’s open-source, built in Rust for speed and efficiency, and rapidly improving at openai/codex on GitHub.


Installation is easy when using `brew`

.

`> brew install codex`

> codex

If you run Codex for the first time, you need to authenticate with ChatGPT. You need the Plus, Pro, Team, Edu, or Enterprise plan to utilise Codex. You can use an OpenAI API key, but that is more complicated. For more information, please refer to the installation page.

Try some commands, using `/model`

is a good one. Select the codex model if another model is selected. You can start with a reasoning level of *Medium*. This is the default. If you are not satisfied with the results, you can choose to go higher.

Giving a complete view of what Codex can do is not part of this blog. Check the documentation or other resources.

### AGENTS.md

Think of AGENTS.md as a

README for agents: a dedicated, predictable place to provide the context and instructions to help AI coding agents work on your project.

Backlog.md generates this file to explain to Codex how to work with Backlog. The generated file is large. Therefore, I will not show it here. The file contains information about:

- Source of Truth & File Structure
- Common Mistakes to Avoid
- Understanding Task Format (Read-Only Reference)
- Defining Tasks
- Implementing Tasks
- Typical Workflow
- Definition of Done (DoD)
- Finding Tasks and Content with Search
- Quick Reference: DO vs DON’T
- Complete CLI Command Reference

More information about the AGENTS.md can be found at: [https://agents.md](https://agents.md)

## Installation of Backlog.md

Installing Backlog.md is as easy as installing Codex.

`> brew install backlog-md`

Next, we start our project.

`> mkdir connect-four`

> cd connect-four

> backlog init "Connect Four"

When running the init, you get asked if it is ok to create an empty Git repository. Next, you need to select the Agents you are going to use. This is important for generating the AGENTS.md file, as mentioned in the previous section. I selected AGENTS.md for Codex.

## Get Jettro Coenradie’s stories in your inbox

Join Medium for free to get updates from this writer.

You can answer additional questions for advanced configuration. You can also leave the defaults.

Open the Backlog UI in the console.

`> backlog board view`

As you can see, the Kanban board is not empty. In the next section, I’ll give you the requests I made to Codex.

## Creating tasks

Now, we start using Codex to generate tasks. You can tell it what task to create, and you can also give it a command to generate multiple tasks to reach a specific goal.

I started with this task:

I want to create a game of Connect Four in the terminal. Help me write the tasks.


After reading the task, I asked Codex to assign the task to itself and write an implementation plan.

pick up task-1, assign it to yourself, and add an implementation plan


When I am satisfied with the implementation plan, I instruct Codex to move it to 'in progress' or 'not done' if it is not already in this state, and then I ask it to initiate the implementation.

build task-1


After this, you do the same steps again. Other tasks I requested are.

Add the tasks to have a computer opponent

Add tasks to make the board look better: add color, align the column numbers with the columns, don’t reprint the board


each time but change it in place

The generated project did not have a .gitignore file. Additionally, the Python project tool was utilised. So I created tasks for a gitignore file and for introducing UV. Below are screenshots for the UV task before and after the implementation plan was added.

I hope you get an idea of what it's like to work with Specification-Driven Development while using Backlog.md and Codex. Below is the link to the repository if you are interested in reviewing the code. You should also be able to check out the project and open the Backlog.md board from the project's root directory. That way, you see the open issues.