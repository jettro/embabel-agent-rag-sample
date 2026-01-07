---
title: Building Agents with Embabel: A Hands-On Introduction
author: Jettro Coenradie
url: https://jettro.dev/building-agents-with-embabel-a-hands-on-introduction-4f96d2edeac0
hostname: jettro.dev
description: (Updated on January 2, 2026, for the 0.3.1 release of Embabel)
sitename: Medium
date: 2025-07-22
---
# Building Agents with Embabel: A Hands-On Introduction

*(Updated on January 2, 2026, for the 0.3.1 release of Embabel)*

Check my new blog: [Creating and using an MCP server using Spring AI and Embabel](https://jettro.dev/creating-and-using-an-mcp-server-using-spring-ai-and-embabel-09637fb0c733)

Embabel is an emerging framework designed to bring intelligent, goal-driven behaviour to Java applications. It introduces a model in which **agents** execute **actions** using **domain-specific objects** as both inputs and outputs, enabling a structured and type-safe approach to integrating Large Language Models (LLMs). At the heart of Embabel lies a **Goal-Oriented Action Planning (GOAP)** mechanism that enables agents to dynamically determine the most effective sequence of actions to achieve a given objective. Built on top of the **Spring AI** project, Embabel leverages the strengths of the Spring ecosystem while introducing a novel abstraction for intelligent automation. Notably, the project was initiated by **Rod Johnson**, the original creator of the Spring Framework, lending it both vision and credibility. Embabel represents a promising foundation for developers seeking to embed LLM capabilities into enterprise-grade Java systems.

In this blog, you will learn about the essential components of an application, utilising Embabel to create an Agent. After explaining the components, you can follow a thorough explanation to make the complete application.

The goal of the application is to create a LinkedIn post about a new blog post by providing the URL. The application uses Spring Boot, Embabel, Docker (for MCP servers), and Firecrawl to load the contents of a web page.

## Essential Embabel components

Embabel is still in the early stages of development. Therefore, a lot can change. Embabel builds on top of Spring AI. The framework includes a substantial number of components for use when creating an agent-based application. If you want to know everything, consult the documentation. The components described below are the ones you need to understand to begin working with Embabel.

### Platform

The platform is started through several annotations and a typical Spring Boot configuration. The platform wraps the agents and embeds the shell to enable interaction with the agent. This shell is your friend, as you will see later. I like the logging theme. Below is the result of enabling the Star Wars theme.

I keep getting a smile on my face if I see this log:

Deployed an agent I have: Promote post on socials Agent


### Agent

An agent is an entity capable of achieving a goal. The agent's description is essential for the platform to select the appropriate agent for the job. An agent requires actions and a planner to generate a plan from the available actions.

### Planner

The planner creates a plan for utilising the available actions to achieve the user's requested goal. For many agent frameworks, this plan is made by an LLM. Embabel uses an implementation of **Goal-Oriented Action Planning (GOAP). **Actions have a cost, and the model seeks to achieve the goal using the most cost-effective solution. Through GOAP, making the plan is more consistent.

### Action

Action is what causes the agent to do something. You mark an action through an annotation. The planner does not use the action description to determine what to do; you can use it at your discretion.

An action can utilise an LLM, but it is not required to do so. It can also be a simple calculation, a database call, or whatever you need. An action takes one or more domain models and returns a domain model. That way, it is clear what the Agent can expect from the action. The order in which actions are called is determined by the actions' preconditions and the cost/value combination. Preconditions are created through the input arguments and the domain models. You can also specify your preconditions.

The **value and cost** of an action are essential to GOAP. The planner chooses actions with a high value and low cost before other actions to accomplish a task.

### AchievesGoal

Add this annotation to an action to specify a goal that the agent can accomplish. The description in this annotation is critical for the platform to select the right Agent for the job. It helps if you provide some example questions or commands that this Goal can handle.

For the selection process, you can assign a cost to this goal, which helps the platform select the appropriate Agent and goal.

### Toolgroups

Tool groups combine tools for use in specific actions. You add a tool group to an action through the annotation. A dedicated tool group is available for wrapping an MCP server.

### McpServer

MCP servers are becoming the de facto for exposing APIs to AI models. It has its pros and cons. One of them is security; however, that is a topic for another time.

A significant advantage of MCP is that many suppliers now create their own MCP servers to integrate SaaS functionality. You will see an example that wraps the Firecrawl API.

Embabel includes an MCP client that facilitates wrapping an MCP Server running in Docker on your local machine and connecting to it via Stdio. You make this MCP server accessible as a ToolGroup through a simple configuration.

## Creating the sample application

The sample agent we are creating writes a social media post (e.g., on LinkedIn) about a new blog post or a specific URL. The agent accepts a user command to write a post about the URL provided. It extracts the page, writes the post, selects the most appropriate image from the URL, reviews the post and returns the result.

You can check out the code and run it for yourself.

### Initialising the project

Embabel provides a [quick start](https://github.com/embabel/embabel-agent?tab=readme-ov-file#quick-start) for a project. I decided to go the old way and initialise a Spring Boot project myself. I stay with Maven for the build. Through dependency management, I define the version for all Spring Boot dependencies. For Embabel, we have a few available dependencies: one for the framework starter, one for the LLM, and one for the test framework. You no longer need to supply the Embabel repository; artefacts are in Maven Central.

In the sample, I want to interact through the shell; I need the shell starter. I also plan on using OpenAI. I need to include the OpenAI starter. Below is the essential part of the pom. As of version 0.2.0, artefacts are available in Maven Central. No need to include other repositories.

`<dependency>`

<groupId>com.embabel.agent</groupId>

<artifactId>embabel-agent-starter-openai</artifactId>

<version>${embabel-agent.version}</version>

</dependency>


<dependency>

<groupId>com.embabel.agent</groupId>

<artifactId>embabel-agent-starter-shell</artifactId>

<version>${embabel-agent.version}</version>

</dependency>


<!-- Dependencies for testing -->

<dependency>

<groupId>com.embabel.agent</groupId>

<artifactId>embabel-agent-test</artifactId>

<version>${embabel-agent.version}</version>

<scope>test</scope>

</dependency>

### Configure the Embabel application.

Spring Boot facilitates convention over configuration. By default, the platform uses *OpenAI's gpt-4.1-mini*. In application.yml, you can modify these defaults. Below is my complete configuration.

`spring:`

ai:

mcp:

client:

enabled: true

name: embabel

version: 1.0.0

request-timeout: 30s

type: SYNC


stdio:

connections:

firecrawl:

command: docker

args:

- run

- -i

- --rm

- -e

- FIRECRAWL_API_KEY

- mcp/firecrawl

env:

FIRECRAWL_API_KEY: ${FIRECRAWL_API_KEY}

embabel:

models:

defaultLlm: gpt-4.1

llm-operations:

data-binding:

maxAttempts: 2

agent-platform:

ranking:

llm: gpt-4.1-mini


logging:

level:

com.embabel: INFO

com.embabel.agent.api.annotation.support.AgentMetadataReader: INFO

dev.jettro.blogpromotor: DEBUG



Initially, you can add more LLM through starters. You can add the **Ollama starter** to include more models. All active models are scanned and added as options for use as LLMs or embedding models. If you include a starter, the model becomes available.

## Get Jettro Coenradie’s stories in your inbox

Join Medium for free to get updates from this writer.

Next is the MCP client. In this configuration, we point to the Docker image for the FireCrawl MCP server. All this server needs is an environment variable. Upon application startup, the Docker container is started and made available through a local connection using stdio.

Next is the Embabel configuration. First, we set the **default LLM** to be gpt-4.1. Next, we adjust the maximum number of attempts in the event of data-binding issues. One situation in which this occurred was when I provided a nonexistent URL to the Firecrawl tool. This throws an IllegalArgumentException. By default, we retry it 10 times. That will affect the credits we use at Firecrawl. In this configuration, we set the **maximum retry attempts** to 2. In the future, there will likely be an option to configure this retry mechanism per MCP client integration. Then, there is the LLM used for ranking. This is the ranking provided by the platform to help you choose the right Agent for the job at hand.

Finally, we configure logging by specifying different levels for each package.

### Initialising the application

The application starts with a main class and some annotations. This is how we enable the shell, scan for agents, choose the logging theme, and initialise the MCP servers.

*(This part changed a lot since 0.3, the EnableAgent annotation is gone)*

`@SpringBootApplication`

public class App {

public static void main(String[] args) {

SpringApplication.run(App.class, args);

}

}

You can now configure the logging profile in application.yml.

`embabel:`

agent:

logging:

personality: starwars

The shell is the primary method for interacting with the agent. It comes with numerous features. Simply asking for help should provide you with all the information you need.

You can ask the agent to perform an action for you using the *execute* command.

starwars> execute “Write a post about the blog post

[https://jettro.dev/learn-ai-agent-basics-using-python-and-ollama-a62108d80df9]"

The result from the agent is this:

`# Social Media Post`

Curious about how AI agents work behind the scenes? Discover the essential building blocks of AI agent

development using Python and Ollama, and learn how to implement practical agents without relying on large frameworks. This blog post breaks

down key concepts and offers hands-on code examples to help you build smarter, more adaptable AI solutions. Read more here:

https://jettro.dev/learn-ai-agent-basics-using-python-and-ollama-a62108d80df9


# Original

URL

https://jettro.dev/learn-ai-agent-basics-using-python-and-ollama-a62108d80df9


# Tags

AI, Python,

Automation


# Image URL

https://miro.medium.com/v2/resize:fit:700/1*yPAtTe5F73bivI2edf2BHA.png


# Image

Reason

This image is visually engaging and features a clear, modern illustration related to artificial intelligence and agents,

which aligns closely with the blog post’s focus on building AI agents and the ReAct framework. Its size and clarity make it highly suitable

for social media promotion, attracting attention while remaining relevant to the technical content of the blog.


#

Review

This LinkedIn post is engaging and relevant for professionals interested in AI and Python development. It clearly highlights

the value of the blog post by mentioning essential building blocks, practical examples, and the use of Ollama without large frameworks. The

call to action is clear, and the content aligns well with LinkedIn’s professional audience. For added engagement, consider asking a question

or inviting comments about readers’ experiences with AI agents.

Original URL:

https://jettro.dev/learn-ai-agent-basics-using-python-and-ollama-a62108d80df9


# Reviewer

Marketing Reviewer, Tuesday,

July 22, 2025



LLMs used: [gpt-4.1] across 4 calls

Prompt tokens: 86,927, completion tokens: 5,608

Cost: $0.2187

Tool usage:

ToolStats(name=embabel_firecrawl_firecrawl_scrape, calls=1, avgResponseTime=6126 ms, failures=0)

### Monitor the logs

The logs are a good friend when working with Embabel. During application startup, the logs indicate which profiles are active. They show the models available to the application. I remove the information about time, level, logger, etc. That makes it more readable.

`Starting App using Java 22.0.2 with PID 84053 (/Users/jettrocoenradie/Development/personal/embabel/agent-blog-promotor/target/classes started by jettrocoenradie in /Users/jettrocoenradie/Development/personal/embabel/agent-blog-promotor)`

Running with Spring Boot v3.5.3, Spring v6.2.8

The following 3 profiles are active: "shell", "starwars", "docker"

BlogPromoterAgent initialized with postWordCount: 100, reviewWordCount: 100

AgentPlatformAutoConfiguration about to be processed...

Ollama models will not be queried as the 'ollama' profile is not active

Docker local models will be discovered at http://localhost:12434/engines

Failed to load models from http://localhost:12434/engines: I/O error on GET request for "http://localhost:12434/engines/v1/models": null

No Docker local models discovered. Check Docker server configuration.

Open AI compatible models are available at default OpenAI location. API key is set

Open AI models are available: OpenAiProperties(maxAttempts=10, backoffMillis=5000, backoffMultiplier=5.0, backoffMaxInterval=180000)

Default LLM: gpt-4.1

Next, we see the initialisation of the MCP servers. Note that we initialise two MCP servers, yes, one more than the configuration above mentions.

`STDERR Message received: Initializing Firecrawl MCP Server...`

STDERR Message received: Running in stdio mode, logging will be directed to stderr

STDERR Message received: [info] Firecrawl MCP Server initialized successfully

STDERR Message received: [info] Configuration: API URL: default

STDERR Message received: Firecrawl MCP Server running on stdio

Server response with Protocol: 2024-11-05, Capabilities: ServerCapabilities[experimental=null, logging=LoggingCapabilities[], prompts=null, resources=null, tools=ToolCapabilities[listChanged=null]], Info: Implementation[name=firecrawl-mcp, version=1.7.0] and Instructions null

Server response with Protocol: 2024-11-05, Capabilities: ServerCapabilities[experimental={}, logging=null, prompts=null, resources=null, tools=ToolCapabilities[listChanged=false]], Info: Implementation[name=mcp-time, version=1.0.0] and Instructions null

MCP is available. Found 2 clients: Implementation[name=firecrawl-mcp, version=1.7.0] Implementation[name=mcp-time, version=1.0.0]

RegistryToolGroupResolver: name='SpringBeansToolGroupResolver', 9 available tool groups:

The logs show the Agent to be called based on user input, including all details about the agent, actions, and the data types involved. Note that the ranker, responsible for choosing the right agent, shows the confidence factor in the made choice.

`Created process options: {"contextId":null,"blackboard":null,"test":false,"verbosity":{"showPrompts":false,"showLlmResponses":false,"debug":false,"showPlanning":true,"showLongPlans":true},"allowGoalChange":true,"budget":{"cost":2.0,"actions":50,"tokens":1000000},"control":{"toolDelay":"NONE","operationDelay":"NONE","earlyTerminationPolicy":{"name":"MaxActionsEarlyTerminationPolicy"}}}`

Executing in closed mode: Trying to find appropriate agent

Choosing Agent based on UserInput(content=Write a post about the blog post https://jettro.dev/learn-ai-agent-basics-using-python-and-ollama-a62108d80df9, timestamp=2025-07-22T10:15:10.425145Z)

Chosen Agent I have with confidence 0.95 based on UserInput(content=Write a post about the blog post https://jettro.dev/learn-ai-agent-basics-using-python-and-ollama-a62108d80df9, timestamp=2025-07-22T10:15:10.425145Z)

You will find only what you bring in: Created agent instance description: Fetch content from a blog post, generate a post for socials about the blog post, select the best image from the page, review it for engagement.


provider: dev.jettro.blogpromotor.agent

version: 0.1.0-SNAPSHOT

name: Promote on socials Agent

goals:

Given a blog URL, generate a social media post and route it to the Marketing Reviewer for approval.: dev.jettro.blogpromotor.agent.BlogPromoterAgent.constructSocialMediaPost - pre={hasRun_dev.jettro.blogpromotor.agent.BlogPromoterAgent.constructSocialMediaPost=TRUE, it:dev.jettro.blogpromotor.agent.ReviewedPost=TRUE, it:dev.jettro.blogpromotor.agent.PostImage=TRUE, it:dev.jettro.blogpromotor.agent.SocialMediaPost=TRUE} value=0.0

actions:

dev.jettro.blogpromotor.agent.BlogPromoterAgent.constructSocialMediaPost - pre={it:dev.jettro.blogpromotor.agent.ReviewedPost=TRUE, it:dev.jettro.blogpromotor.agent.PostImage=TRUE, it:dev.jettro.blogpromotor.agent.SocialMediaPost=FALSE, hasRun_dev.jettro.blogpromotor.agent.BlogPromoterAgent.constructSocialMediaPost=FALSE} post={it:dev.jettro.blogpromotor.agent.SocialMediaPost=TRUE, hasRun_dev.jettro.blogpromotor.agent.BlogPromoterAgent.constructSocialMediaPost=TRUE}

dev.jettro.blogpromotor.agent.BlogPromoterAgent.craftPost - pre={it:dev.jettro.blogpromotor.agent.BlogPost=TRUE, it:dev.jettro.blogpromotor.agent.Post=FALSE, hasRun_dev.jettro.blogpromotor.agent.BlogPromoterAgent.craftPost=FALSE} post={it:dev.jettro.blogpromotor.agent.Post=TRUE, hasRun_dev.jettro.blogpromotor.agent.BlogPromoterAgent.craftPost=TRUE}

dev.jettro.blogpromotor.agent.BlogPromoterAgent.fetchBlogPost - pre={it:com.embabel.agent.domain.io.UserInput=TRUE, it:dev.jettro.blogpromotor.agent.BlogPost=FALSE, hasRun_dev.jettro.blogpromotor.agent.BlogPromoterAgent.fetchBlogPost=FALSE} post={it:dev.jettro.blogpromotor.agent.BlogPost=TRUE, hasRun_dev.jettro.blogpromotor.agent.BlogPromoterAgent.fetchBlogPost=TRUE}

dev.jettro.blogpromotor.agent.BlogPromoterAgent.reviewPost - pre={it:dev.jettro.blogpromotor.agent.Post=TRUE, it:dev.jettro.blogpromotor.agent.ReviewedPost=FALSE, hasRun_dev.jettro.blogpromotor.agent.BlogPromoterAgent.reviewPost=FALSE} post={it:dev.jettro.blogpromotor.agent.ReviewedPost=TRUE, hasRun_dev.jettro.blogpromotor.agent.BlogPromoterAgent.reviewPost=TRUE}

dev.jettro.blogpromotor.agent.BlogPromoterAgent.selectBestImage - pre={it:dev.jettro.blogpromotor.agent.BlogPost=TRUE, it:dev.jettro.blogpromotor.agent.PostImage=FALSE, hasRun_dev.jettro.blogpromotor.agent.BlogPromoterAgent.selectBestImage=FALSE} post={it:dev.jettro.blogpromotor.agent.PostImage=TRUE, hasRun_dev.jettro.blogpromotor.agent.BlogPromoterAgent.selectBestImage=TRUE}

conditions: []

data types: [BlogPost, OperationContext, Post, PostImage, ReviewedPost, SocialMediaPost, UserInput]

With the chosen agent and the available actions, the planner must devise the optimal plan. The plan is reevaluated after each action. The log shows the plan before it is executed. Note the order of the actions and ask yourself if you would do the same thing.

`Control, control, you must learn control! Formulated plan <`

dev.jettro.blogpromotor.agent.BlogPromoterAgent.fetchBlogPost ->

dev.jettro.blogpromotor.agent.BlogPromoterAgent.selectBestImage ->

dev.jettro.blogpromotor.agent.BlogPromoterAgent.craftPost ->

dev.jettro.blogpromotor.agent.BlogPromoterAgent.reviewPost ->

dev.jettro.blogpromotor.agent.BlogPromoterAgent.constructSocialMediaPost

That is it for the logs; you can request additional logs. You can also request that all calls to the LLM be printed. I leave that up to you.

### Write the code for the agent

The application.yml already contains the MCP server configuration for Firecrawl. We now want to wrap that server in a ToolGroup to pass it to an action. Below is the code for the tool group. Note that we instruct it to use Docker and to include only tools that contain the term 'firecrawl'.

`@Bean(name = "mcpFirecrawlToolsGroup")`

public ToolGroup mcpFirecrawlToolsGroup() {

return new McpToolGroup(

ToolGroupDescription.Companion.invoke(

"A collection of tools to interact with the MCP Firecrawl service",

"mcp-firecrawl"

),

"Docker",

"mcp-firecrawl",

Set.of(ToolGroupPermission.HOST_ACCESS, ToolGroupPermission.INTERNET_ACCESS),

mcpSyncClients,

callback -> callback.getToolDefinition().name().contains("firecrawl")

);

}

I’ll skip all the data objects. They are simple Java Record classes. In the following code block, you’ll find the agent class. Note the annotation to mark the class as an Agent.

`@Agent(description = "Fetch content from a blog post, generate a post for socials about the blog post, select the " +`

"best image from the page, review it for engagement.",

name = "Promote on socials Agent")

public class BlogPromoterAgent {

private static final Logger logger = LoggerFactory.getLogger(BlogPromoterAgent.class);


private final int postWordCount;

private final int reviewWordCount;


BlogPromoterAgent(

@Value("${postWordCount:100}") int postWordCount,

@Value("${reviewWordCount:100}") int reviewWordCount

) {

this.postWordCount = postWordCount;

this.reviewWordCount = reviewWordCount;

logger.info("BlogPromoterAgent initialized with postWordCount: {}, reviewWordCount: {}",

postWordCount, reviewWordCount);

}

}

Next, let us add an action to the agent. Note how this action starts with a UserInput. Note that we configure the toolGroup and how we prompt the LLM. Pay attention to the **createObject** function call. This makes the LLM interaction type safe.

`@Action(toolGroups = {"mcp-firecrawl"})`

BlogPost fetchBlogPost(UserInput userInput, OperationContext operationContext) {

return operationContext.ai().withLlm(

LlmOptions.fromCriteria(AutoModelSelectionCriteria.INSTANCE)

.withTemperature(0.2) // Higher temperature for more creative output

).withPromptContributor(Personas.EXTRACTOR)

.createObject(String.format("""

Fetch the content of the blog post from the URL that is provided by the user.

If the user does not provide a URL or if the URL is not valid, return an error message with the problem.

Provide the content without any boilerplate or additional information.

Extract all the image urls from the page and return them in a list.


# User input

%s

""", userInput.getContent().trim()), BlogPost.class);

}

The other actions are similar to this one. They accept a different input argument and provide a different output. The review post is slightly different. We want to have more control over the returning object and add an object that is not available to the LLM. Therefore, we need to use the OperationContext in combination with **generateText**.

`@Action`

ReviewedPost reviewPost(Post post, OperationContext context) {

String review = context.promptRunner()

.withLlm(LlmOptions.fromCriteria(AutoModelSelectionCriteria.INSTANCE))

.withPromptContributor(Personas.REVIEWER)

.generateText(String.format("""

You will be given a social media post to review.

Review it in %d words or less.

Assure the sentences are connected and the post is coherent.

Consider whether the post is engaging, relevant, and appropriate for the platform %s.

If the post is not appropriate, provide a reason why it is not appropriate.

Provide the original url in the result: %s.


# Social Media Post

%s

""",

reviewWordCount,

"LinkedIn", // Assuming LinkedIn as the platform, can be parameterized

post.originalUrl(),

post.content()

).trim());

return new ReviewedPost(

post,

review,

Personas.REVIEWER

);

}

The final action I would like to show is the one action that achieves a goal. This action has an additional annotation AchievesGoal. Note that we give example scenarios to call this goal. Also note that this action does not do any work other than combining some data into a new object.

`@AchievesGoal(`

description = "Given a blog URL, generate a social media post and route it to the Marketing Reviewer for approval.",

examples = {"Generate a social media post for this blog: https://example.com/blog-post"})

@Action

SocialMediaPost constructSocialMediaPost(ReviewedPost post, PostImage postImage) {

return new SocialMediaPost(

post,

postImage

);

}

## Concluding

I hope you are as enthusiastic about the Embabel framework as I am. For more information about the framework, please visit this link.

[https://github.com/embabel/embabel-agent?tab=readme-ov-file](https://github.com/embabel/embabel-agent?tab=readme-ov-file)

Now, let's create the social media post for this blog post using my tool.

execute “Create a social media post for this URL:

[https://medium.com/@jettro.coenradie/building-agents-with-embabel-a-hands-on-introduction-4f96d2edeac0]”

`# Social Media Post`

Discover how Embabel is redefining intelligent automation for Java applications. In our latest blog

post, we explore how Embabel leverages Goal-Oriented Action Planning (GOAP) and integrates seamlessly with Spring AI to empower developers

to build smart, goal-driven agents. Learn how to create an agent that crafts LinkedIn posts from any URL, and see practical code examples

for building your own agent-based solutions. Whether you’re an enterprise developer or AI enthusiast, this hands-on introduction will guide

you through Embabel’s essential components and setup. Unlock the future of AI-powered Java systems today. Read more:

https://jettro.dev/building-agents-with-embabel-a-hands-on-introduction-4f96d2edeac0


# Original

URL

https://jettro.dev/building-agents-with-embabel-a-hands-on-introduction-4f96d2edeac0


# Tags

AI, Java,

Automation


# Image URL

https://miro.medium.com/v2/resize:fit:700/1*jV9gQQge4t5n_1p7Th4KbQ.png


# Image

Reason

This image is visually engaging, features a modern illustration relevant to artificial intelligence and agents, and is sized

appropriately for social media. It aligns closely with the blog post’s focus on building intelligent, goal-driven Java applications with

Embabel, making it both relevant and highly suitable for attracting attention on social media platforms.


# Review

This

LinkedIn post is engaging and relevant for its target audience of developers and AI enthusiasts. It clearly highlights the value of Embabel

for intelligent automation in Java applications, mentions practical use cases, and promises hands-on guidance. The call to action is clear,

and the content is appropriate for LinkedIn’s professional audience. Including the blog URL encourages further exploration. To increase

engagement, consider adding a question to prompt discussion or a relevant hashtag.


Original URL:

https://jettro.dev/building-agents-with-embabel-a-hands-on-introduction-4f96d2edeac0


# Reviewer

Marketing Reviewer,

Tuesday, July 22, 2025



LLMs used: [gpt-4.1] across 4 calls

Prompt tokens: 83,435, completion tokens: 3,290

Cost: $0.1932

Tool usage:

ToolStats(name=embabel_firecrawl_firecrawl_scrape, calls=1, avgResponseTime=5749 ms, failures=0)