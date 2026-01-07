---
title: Short and long-term memory with Amazon Bedrock AgentCore and Spring AI
author: Jettro Coenradie
url: https://jettro.dev/short-and-long-term-memory-with-amazon-bedrock-agentcore-and-spring-ai-a2b5ab830120
hostname: jettro.dev
description: A blog post about the integration of Amazon Bedrock AgentCore with Spring AI. It shows how to use short- and long-term memory.
sitename: Medium
date: 2025-12-23
---
# Short and long-term memory with Amazon Bedrock AgentCore and Spring AI

In a previous post, you can read about the mechanics of integrating short-term and long-term memory into your Agentic application. In this blog, you can read about the integration into Spring AI. The integration is also deployed to AWS infrastructure through CDK. The funpart? Most components are still in Alpha, SNAPSHOT, or not available.

In this post, you tag along on a bumpy ride as we deploy AgentCore Runtime and Memory using CDK. We use the Spring AI Bedrock community project (“branch memory”) and a custom-built tool to enable the agent to interact with long-term memory.

If you have questions, use the comments. If you like the post, add some claps.

## Deploying the Amazon Bedrock AgentCore stack

The CDK project is structured around **stacks** and **constructs**. Stacks provide a clear deployment unit: each stack can be deployed independently, while a main stack can still be used to deploy the entire system in a single operation. Stacks can also depend on each other, which defines the deployment order when one stack requires resources from another. For example, the agent-core stack depends on an image provided by an ECS (Elastic Container Service) stack.

The AWS CDK library offers a large set of built-in constructs, known as **Level 2 constructs**. These constructs provide higher-level abstractions with sensible defaults and validations, making infrastructure easier to define and reason about. In contrast, **Level 1 constructs** (Cfn*) are thin, generated wrappers around CloudFormation resources. They closely mirror the underlying CloudFormation API and expose all configuration options, but with little abstraction.

In addition to the constructs provided by the CDK, we define our own **custom constructs**. These combine multiple constructs that logically belong together into a reusable building block, allowing us to model higher-level concepts while keeping individual stacks small and focused.

More information about available constructs can be found here:[https://docs.aws.amazon.com/cdk/api/v2/docs/aws-construct-library.html](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-construct-library.html)

### The Elastic Container Repository stack

Our construct accepts only the repository name. Other parameters accepted by the L2 construct are configured in our construct. Notice that we remove the repository when the stack is removed. In a production environment, you can change these properties to keep the containers.

`export interface EcrRepositoryConstructProps {`

repositoryName: string;

}


export class EcrRepositoryConstruct extends Construct {

public readonly repository: ecr.Repository;


constructor(scope: Construct, id: string, props: EcrRepositoryConstructProps) {

super(scope, id);


// Create ECR repository for agent runtime images

this.repository = new ecr.Repository(this, 'Repository', {

repositoryName: props.repositoryName,

imageScanOnPush: true,

removalPolicy: RemovalPolicy.DESTROY, // Change to RETAIN for production

emptyOnDelete: true, // Change to false for production

lifecycleRules: [

{

description: 'Keep last 10 images',

maxImageCount: 10,

}

],

});

}

}

This construct is used in the stack for the ecr-repository. Notice that we pass the repository name to create via a property object defined in the previous code block.

`import * as cdk from 'aws-cdk-lib';`

import { Construct } from 'constructs';

import { EcrRepositoryConstruct } from '../constructs/ecr-repository-construct';


export class EcrStack extends cdk.Stack {

public readonly ecrConstruct: EcrRepositoryConstruct;


constructor(scope: Construct, id: string, props?: cdk.StackProps) {

super(scope, id, props);


// Create ECR repository using construct

this.ecrConstruct = new EcrRepositoryConstruct(this, 'EcrRepositoryConstruct', {

repositoryName: 'bedrock-agent-runtime',

});

}

}

### The Amazon Bedrock AgentCore stack

The AgentCore stack consists of two constructs—one for the memory and one for the runtime. Suppose you have no idea what short- and long-term memory are in AgentCore. Please see my other blog post.

First, the memory construct.

`export interface AgentCoreMemoryConstructProps {`

memoryName: string;

description?: string;

expirationDays?: number;

}


export class AgentCoreMemoryConstruct extends Construct {

public readonly memory: agentcore.Memory;

public readonly memoryId: string;

public readonly memoryArn: string;


constructor(scope: Construct, id: string, props: AgentCoreMemoryConstructProps) {

super(scope, id);


// Create memory with all built-in strategies

this.memory = new agentcore.Memory(this, 'Memory', {

memoryName: props.memoryName,

description: props.description || `AgentCore memory for ${props.memoryName}`,

expirationDuration: cdk.Duration.days(props.expirationDays || 90),

memoryStrategies: [

// Short-term: Compresses conversations into concise overviews

agentcore.MemoryStrategy.usingBuiltInSummarization(),


// Long-term: Distills general facts and concepts

agentcore.MemoryStrategy.usingBuiltInSemantic(),


// Long-term: Captures user preferences and patterns

agentcore.MemoryStrategy.usingBuiltInUserPreference(),

],

});


// Extract memory ID and ARN for use in the application

this.memoryId = this.memory.memoryId;

this.memoryArn = this.memory.memoryArn;

}

}

Notice how we can pass a name for the memory, a description and the expirationDays. The long-term memory uses events from short-term memory to retrieve memory records. Each long-term memory item has its own extraction strategy. The construct uses three built-in types: summarisation, semantic, and user preferences.

Also, notice how the construct stores the memoryId and arn as properties. That way, the stack can read these properties after the construct is created.

The Amazon Bedrock AgentCore Runtime needs a Docker container. In the next section, you get more information about this Spring AI application. For now, it is enough to know that we have a Docker container that we upload through CDK.

The AgentCore Runtime construct is larger. It contains more components. First, we need to build and push the Docker image. Next, we specify the AgentCore Runtime artefact using the uploaded Docker container from the ECR from the previous section. Next, we create the runtime and configure the policies the agent needs to execute.

`import { Construct } from 'constructs';`

import * as path from 'path';

import * as ecr from 'aws-cdk-lib/aws-ecr';

import * as iam from 'aws-cdk-lib/aws-iam';

import * as imagedeploy from 'cdk-docker-image-deployment';

import * as agentcore from '@aws-cdk/aws-bedrock-agentcore-alpha';

import * as cdk from 'aws-cdk-lib';


export interface AgentCoreRuntimeConstructProps {

repository: ecr.Repository;

runtimeName: string;

dockerfilePath: string;

imageTag?: string;

memoryId?: string;

}


export class AgentCoreRuntimeConstruct extends Construct {

public readonly runtime: agentcore.Runtime;

public readonly imageDeployment: imagedeploy.DockerImageDeployment;


constructor(scope: Construct, id: string, props: AgentCoreRuntimeConstructProps) {

super(scope, id);


const imageTag = props.imageTag || 'latest';


// Deploy Docker image from directory to your ECR repository

// This automatically builds and pushes the image to your repository

this.imageDeployment = new imagedeploy.DockerImageDeployment(this, 'ImageDeployment', {

source: imagedeploy.Source.directory(props.dockerfilePath),

destination: imagedeploy.Destination.ecr(props.repository, {

tag: imageTag,

}),

});


// Create agent runtime artifact from your ECR repository

const agentRuntimeArtifact = agentcore.AgentRuntimeArtifact.fromEcrRepository(

props.repository,

imageTag

);


// Create environment variables for the runtime

const environmentVariables: { [key: string]: string } = {};


// Add memory ID if provided

if (props.memoryId) {

environmentVariables['AGENTCORE_MEMORY_ID'] = props.memoryId;

}


// Create Bedrock AgentCore Runtime with public network configuration

this.runtime = new agentcore.Runtime(this, 'Runtime', {

runtimeName: props.runtimeName,

agentRuntimeArtifact: agentRuntimeArtifact,

networkConfiguration: agentcore.RuntimeNetworkConfiguration.usingPublicNetwork(),

environmentVariables: Object.keys(environmentVariables).length > 0 ? environmentVariables : undefined,

});


// Ensure runtime depends on image deployment

this.runtime.node.addDependency(this.imageDeployment);


// Grant the runtime execution role permission to pull from the repository

props.repository.grantPull(this.runtime.grantPrincipal);


// Add Bedrock permissions for the runtime to invoke models

this.runtime.role.addToPrincipalPolicy(new iam.PolicyStatement({

effect: iam.Effect.ALLOW,

actions: [

'bedrock:InvokeModel',

'bedrock:InvokeModelWithResponseStream',

],

resources: [

// Allow access to all foundation models in all regions

'arn:aws:bedrock:*::foundation-model/*',

// Allow access to inference profiles in this account (all regions)

`arn:aws:bedrock:*:${cdk.Stack.of(this).account}:inference-profile/*`,

],

}));


// Add AgentCore Memory permissions if memory ID is provided

if (props.memoryId) {

this.runtime.role.addToPrincipalPolicy(new iam.PolicyStatement({

effect: iam.Effect.ALLOW,

actions: [

// Memory operations

'bedrock-agentcore:GetMemory',

'bedrock-agentcore:PutMemory',

'bedrock-agentcore:DeleteMemory',

'bedrock-agentcore:ListMemories',

// Event operations

'bedrock-agentcore:CreateEvent',

'bedrock-agentcore:GetEvent',

'bedrock-agentcore:DeleteEvent',

'bedrock-agentcore:ListEvents',

// Memory record operations

'bedrock-agentcore:GetMemoryRecord',

'bedrock-agentcore:DeleteMemoryRecord',

'bedrock-agentcore:ListMemoryRecords',

'bedrock-agentcore:RetrieveMemoryRecords',

'bedrock-agentcore:BatchCreateMemoryRecords',

'bedrock-agentcore:BatchUpdateMemoryRecords',

'bedrock-agentcore:BatchDeleteMemoryRecords',

// Memory extraction jobs

'bedrock-agentcore:StartMemoryExtractionJob',

'bedrock-agentcore:ListMemoryExtractionJobs',

],

resources: [

// Allow access to the specific memory

`arn:aws:bedrock-agentcore:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:memory/${props.memoryId}`,

// Allow access to all memory strategies within this memory

`arn:aws:bedrock-agentcore:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:memory/${props.memoryId}/*`,

],

}));

}

}

}

Both constructs can now be used within the AgentCore stack.

`import * as cdk from 'aws-cdk-lib';`

import { Construct } from 'constructs';

import * as path from 'path';

import * as ecr from 'aws-cdk-lib/aws-ecr';

import { AgentCoreRuntimeConstruct } from '../constructs/agentcore-runtime-construct';

import { AgentCoreMemoryConstruct } from '../constructs/agentcore-memory-construct';


export interface AgentCoreStackProps extends cdk.StackProps {

repository: ecr.Repository;

}


export class AgentCoreStack extends cdk.Stack {

public readonly agentCoreConstruct: AgentCoreRuntimeConstruct;

public readonly memoryConstruct: AgentCoreMemoryConstruct;


constructor(scope: Construct, id: string, props: AgentCoreStackProps) {

super(scope, id, props);


// Create AgentCore Memory with built-in strategies

this.memoryConstruct = new AgentCoreMemoryConstruct(

this,

'AgentCoreMemoryConstruct',

{

memoryName: 'bedrock_agent_memory',

description: 'Memory for Bedrock agent with summarization, semantic, and user preference strategies',

expirationDays: 90,

}

);


// Path to the agent-java directory containing Dockerfile

const dockerfilePath = path.join(__dirname, '../../../agent-java');


// Create AgentCore Runtime using construct

// This will automatically build and push the Docker image to the ECR repository

this.agentCoreConstruct = new AgentCoreRuntimeConstruct(

this,

'AgentCoreRuntimeConstruct',

{

repository: props.repository,

dockerfilePath: dockerfilePath,

runtimeName: 'bedrock_agent_runtime',

memoryId: this.memoryConstruct.memoryId,

}

);

}

}

Notice how the constructs are created and how the AgentCoreRuntime uses the provided Repository.

### The main stack

Now, we need to combine these two stacks and make them available to the application stack through the main stack. Notice how the ecrStack is provided to the AgentCoreStack.

`import * as cdk from 'aws-cdk-lib';`

import { Construct } from 'constructs';

import { EcrStack } from './ecr-stack';

import { AgentCoreStack } from './agentcore-stack';


export class MainStack extends cdk.Stack {

constructor(scope: Construct, id: string, props?: cdk.StackProps) {

super(scope, id, props);


// Deploy ECR stack first (repository for Docker images)

const ecrStack = new EcrStack(this, 'EcrStack', props);


// Deploy AgentCore stack

const agentCoreStack = new AgentCoreStack(this, 'AgentCoreStack', {

...props,

repository: ecrStack.ecrConstruct.repository,

});

agentCoreStack.addDependency(ecrStack);

}

}

This is all the infrastructure code you need to deploy our application.

## Coding the Agent with Spring AI Memory AgentCore

Most samples for the Amazon Bedrock AgentCore are written in Python. Coming from an enterprise background, it is not hard to find a Java framework. The Spring AI framework is mature and ready for all your agentic journeys. Spring AI integrates well with many large language model providers. Among them is Amazon Bedrock.

### Introduce Spring AI

I like how the Spring AI team validates the project's existence.

Spring AI addresses the fundamental challenge of AI integration: Connecting your enterprise Data and APIs with AI Models.


The framework brings everything we need in the land of enterprise software to the world of Artificial Intelligence. It does so, as it has before, by abstracting a single API across different AI providers. Still, it gives you the flexibility to access provider-specific attributes when needed.

### Introduce Spring AI Amazon Bedrock

Spring AI Amazon Bedrock integrates with the converse API and the embeddings API from Bedrock. The framework provides starter templates and auto-configuration for both clients. Through Bedrock, Spring AI can use all the essential language models out there.

You need the following dependency to include Spring AI Amazon Bedrock in your project.

`<dependency>`

<groupId>org.springframework.ai</groupId>

<artifactId>spring-ai-starter-model-bedrock-converse</artifactId>

</dependency>

Next, configure the default region and model, then inject a client and call the Bedrock API.

`spring.ai.bedrock.aws.region=eu-west-1`

spring.ai.bedrock.converse.chat.options.model=eu.amazon.nova-2-lite-v1:0

`public ChatController (ChatClient.Builder chatClient){`

this.chatClient = chatClient

.defaultAdvisors(MessageChatMemoryAdvisor.builder(chatMemory).build())

.defaultTools(new DateTimeTools())

.build();

}


public String handler(PromptRequest promptRequest){

return chatClient

.prompt()

.user(promptRequest.prompt())

.call()

.content();

}

Notice that we add a default tool. This means that each interaction with the chatClient includes the DateTimeTool. You can also configure tools on a per-invocation basis.

### Introduce Spring AI AgentCore

Some Spring AI extensions are community-driven. One of the projects I discussed earlier is the [MCP Security project](https://springaicommunity.mintlify.app/projects/incubating/mcp-security). The [Amazon Bedrock AgentCore](https://springaicommunity.mintlify.app/projects/incubating/spring-ai-bedrock-agentcore) integration is also a young, community-driven project. You can find a release candidate in the Maven repository.

The project contains a Spring Boot starter and an annotation for the Agent entry point. Together with the ping endpoint, that is what an Agent needs to run on the AgentCore infrastructure.

To work with AgentCore, you need the following dependency. As I am on the bleeding edge, I need the SNAPSHOT dependency.

`<dependency>`

<groupId>org.springaicommunity</groupId>

<artifactId>spring-ai-bedrock-agentcore-starter</artifactId>

<version>1.0.0-SNAPSHOT</version>

</dependency>

The code below is enough to use the agent within AgentCore.

`@AgentCoreInvocation`

public String agentCoreHandler(PromptRequest promptRequest, AgentCoreContext agentCoreContext){

var sessionId = agentCoreContext.getHeader(AgentCoreHeaders.SESSION_ID);

logger.info(sessionId);


return chatClient

.prompt()

.user(promptRequest.prompt())

.call()

.content();

}

To run our application as an agent on the AgentCore Runtime, we only need a Docker container. In the previous part of this blog, you read about using that container to deploy it through CDK.

## Get Jettro Coenradie’s stories in your inbox

Join Medium for free to get updates from this writer.

Starting the application is the default runner.

`@SpringBootApplication`

public class AgentsApplication {

public static void main(String[] args) {

SpringApplication.run(AgentsApplication.class, args);

}

}

The Docker container configuration is straightforward as well.

`FROM --platform=linux/arm64 amazoncorretto:21-alpine`


# Create non-root user

RUN addgroup -S appuser && adduser -S appuser -G appuser


# Set working directory

WORKDIR /app


# Copy JAR file

COPY target/bedrock-agent-1.0.0-SNAPSHOT.jar app.jar


# Change ownership to non-root user

RUN chown appuser:appuser /app/app.jar


# Switch to non-root user

USER appuser


# Expose port

EXPOSE 8080


# Use exec form (container support is default in JDK 21)

ENTRYPOINT ["java", "-jar", "app.jar"]

Now you have everything you need to deploy the agent.

### Introduce Spring AI AgentCore Memory

In the [previous blog post](https://jettro.dev/deep-dive-into-agentcore-memory-using-the-java-sdk-9446a60126df), I discussed the AgentCore Memory Java API in detail. The AgentCore community project for Spring AI aims to make it as easy as possible to integrate AgentCore Memory. When writing this post, the memory part was still in a branch. I’ll update the code in this blog post if anything changes. You need to include the following module to work with AgentCore Memory.

`<dependency>`

<groupId>org.springaicommunity</groupId>

<artifactId>spring-ai-memory-bedrock-agentcore</artifactId>

<version>1.0.0-SNAPSHOT</version>

</dependency>

When working with Amazon Bedrock AgentCore memory, it is essential to create a memory instance before using it. You can think of this step as building a database. The CDK code handles initialising the memory. To work with memory, you need to specify a few properties. The critical property is the `agentcore.memory.memory-id`

. This field is read from an environment variable provided by the CDK deployment. Below are the properties required for the memory to function.

`agentcore.memory.memory-id=${AGENTCORE_MEMORY_ID:your-memory-id-here}`

agentcore.memory.total-events-limit=100

agentcore.memory.default-session=default

agentcore.memory.page-size=50

agentcore.memory.ignore-unknown-roles=true

### Providing short-term memory as an advisor

Remember that short-term memory is the working memory containing the events from the conversation. Events are triggered when a user sends a message, and the agent responds.

Spring AI has a memory abstraction for agents. The memory is provided as an Advisor. By providing a unique conversation ID, you can separate conversations. In AgentCore Memory, you can find the correct session using the provided actor and session IDs.

The code below adds the short-term memory as an advisor to the ChatClient.

`@RestController`

public class ChatController {


private final ChatClient chatClient;

private final ChatMemory chatMemory;


private static final Logger logger = LoggerFactory.getLogger(ChatController.class);


public ChatController (ChatClient.Builder chatClient, ChatMemoryRepository memoryRepository){

this.chatMemory = MessageWindowChatMemory.builder()

.chatMemoryRepository(memoryRepository)

.maxMessages(10)

.build();


this.chatClient = chatClient

.defaultAdvisors(MessageChatMemoryAdvisor.builder(chatMemory).build())

.defaultTools(new DateTimeTools())

.build();

this.memoryProvider = memoryProvider;

}


@AgentCoreInvocation

public String agentCoreHandler(PromptRequest promptRequest, AgentCoreContext agentCoreContext){

var sessionId = agentCoreContext.getHeader(AgentCoreHeaders.SESSION_ID);

logger.info(sessionId);


return chatClient

.prompt()

.advisors(a -> a.param(ChatMemory.CONVERSATION_ID, conversationId(promptRequest, sessionId)))

.user(promptRequest.prompt())

.call()

.content();

}


private String conversationId(PromptRequest promptRequest, String sessionId){

return "%s:%s".formatted(promptRequest.actor(), sessionId);

}

}

Notice how we add the defaultAdvisor using the ChatMemoryRepository. This repository is configured using the properties described in the previous section. Also, notice how we construct the conversation ID through the actor ID and the session ID.

### Providing long-term memory as a tool

At the moment of writing, there is no support for long-term memory in the community project we used for AgentCore Memory integration. In my opinion, long-term memory requires a different integration. Long-term memory is a semantic search over user preferences, conversation summaries, and extracted facts. The user input is not always the best input for those semantic searches. The agent should formulate the query to the long-term memory. Luckily, this integration already exists in the form of tools.

The long-term memory strategies are obtained through the `Memory`

object. The memory ID is configured through an environment variable. The class `LongTermMemoryProvider`

loads the available strategies from the Memory. To work with the Memory, we need to configure the BedrockAgentCoreControlClient.

`@Configuration`

public class AgentsConfiguration {

@Bean

BedrockAgentCoreControlClient bedrockAgentCoreControlClient() {

return BedrockAgentCoreControlClient.create();

}


@Bean

@Lazy

LongTermMemoryProvider longTermMemoryProvider(BedrockAgentCoreControlClient controlClient,

BedrockAgentCoreClient coreClient,

AgentCoreShortMemoryRepositoryConfiguration configuration) {

return new LongTermMemoryProvider(controlClient, coreClient, configuration.memoryId() );

}

}

We load the Memory instance through the following code block, which is part of the LongTermMemoryProvider. The AWS SDK always looks the same. Create a Request object and call a client method to receive the response object. All Request objects use the builder pattern.

`private Memory loadExistingMemory() {`

GetMemoryRequest getRequest = GetMemoryRequest.builder()

.memoryId(this.memoryId)

.build();


Memory memory = controlClient.getMemory(getRequest).memory();

log.info("Memory found: {}", memory.name());

return memory;

}

From the Memory, we obtain three strategies: summary, semantic, and user preference. The following code block loops over the found strategies. Beware: we do not yet support custom strategy. We only support the three provided strategies.

`@PostConstruct`

public void loadStrategies() {

var memory = loadExistingMemory();


memory.strategies().forEach(strategy -> {

log.info("Loaded strategy: {}", strategy.name());

switch (strategy.type()) {

case USER_PREFERENCE:

this.userPreferenceStrategy = new LongTermMemoryStrategy(strategy, memoryId, coreClient);

break;

case SEMANTIC:

this.semanticStrategy = new LongTermMemoryStrategy(strategy, memoryId, coreClient);

break;

case SUMMARIZATION:

this.summaryStrategy = new LongTermMemoryStrategy(strategy, memoryId, coreClient);

break;

default:

log.warn("Unknown strategy: {}", strategy.name());

}

});

}

Notice how we use the strategy type to initialise the correct strategy object. Each strategy is provided as a LongTermMemoryStrategy instance. An essential part of a long-term memory strategy is the namespace. The namespace is configured with the strategy and defaults to the following format. You can change this format, though.

`/strategies/{memoryStrategyId}/actors/{actorId}`

Currently, we only support memoryStrategyId, actorId, and sessionId in this namespace. The following code block contains the method to search in long-term memory.

`public List<String> searchMemory(SearchMemoryRequest request) {`

SearchCriteria searchCriteria = SearchCriteria.builder()

.memoryStrategyId(memoryStrategyId)

.searchQuery(request.query())

.build();


RetrieveMemoryRecordsRequest retrieveMemoryRecordsRequest = RetrieveMemoryRecordsRequest.builder()

.memoryId(memoryId)

.maxResults(request.maxResults())

.namespace(buildNamespace(request))

.searchCriteria(searchCriteria)

.build();

RetrieveMemoryRecordsResponse retrieveMemoryRecordsResponse = coreClient.retrieveMemoryRecords(retrieveMemoryRecordsRequest);


if (!retrieveMemoryRecordsResponse.hasMemoryRecordSummaries()) {

logger.info("No memory records found for query: {}", request.query());

return List.of();

}


return retrieveMemoryRecordsResponse.memoryRecordSummaries().stream()

.map(item -> {

logger.info("Memory record content: {}", item.content().text());

return item.content().text();

})

.toList();

}

We are almost ready; the final piece of the puzzle is to create a tool wrapping the long-term memory. In the following code block, you see the tool implementation. Notice the `@Tool`

with a description to help the agent understand how to use the tool.

`public class LongTermMemoryTool {`

private static final Logger logger = LoggerFactory.getLogger(LongTermMemoryTool.class);

private final LongTermMemoryProvider memoryProvider;

private final String actorId;

private final String sessionId;


public LongTermMemoryTool(LongTermMemoryProvider memoryProvider, String actorId, String sessionId) {

this.memoryProvider = memoryProvider;

this.actorId = actorId;

this.sessionId = sessionId;

}


@Tool(description = "Searches for semantic similar memories based on the provided request")

public List<String> searchSemanticMemory(String query) {

logger.info("Searching semantic memory for: {}", query);

return memoryProvider.searchSemanticMemories(new SearchMemoryRequest(query, actorId, sessionId));

}


@Tool(description = "Searches for summary in the memories based on the provided request")

public List<String> searchSummaryMemory(String query) {

logger.info("Searching summary memory for: {}", query);

return memoryProvider.searchSummaryMemories(new SearchMemoryRequest(query, actorId, sessionId));

}


@Tool(description = "Searches for user preferences in the memories based on the provided request")

public List<String> searchUserPreferenceMemory(String query) {

logger.info("Searching user preference memory for: {}", query);

return memoryProvider.searchUserPreferenceMemories(new SearchMemoryRequest(query, actorId, sessionId));

}

}

Also, note that the actorId and sessionId are stored in this instance. A tool object is created on each request. The following code block shows how to pass this tool to the chatClient.

`@AgentCoreInvocation`

public String agentCoreHandler(PromptRequest promptRequest, AgentCoreContext agentCoreContext){

var sessionId = agentCoreContext.getHeader(AgentCoreHeaders.SESSION_ID);

logger.info(sessionId);


return chatClient

.prompt()

.tools(new LongTermMemoryTool(memoryProvider, promptRequest.actor(), sessionId))

.advisors(a -> a.param(ChatMemory.CONVERSATION_ID, conversationId(promptRequest, sessionId)))

.user(promptRequest.prompt())

.call()

.content();

}

That's it. In the next section, I’ll show you the agent in action in the AWS Console.

## Use the AWS console for debugging

The agent is available through the console. First, we look at the runtime, then the memory. After that, the sandbox and finally a tail of the agent log.

## Call the Amazon Bedrock AgentCore Runtime agent

If you do not want to use the console, you can also create a small client application to call the Amazon Bedrock AgentCore Runtime.

`public class RuntimeTestMemory {`

public static void main(String[] args) {

BedrockAgentCoreClient client = BedrockAgentCoreClient.builder()

.region(Region.EU_WEST_1)

.build();


String payload = "{\"prompt\": \"What would be a good name for my favourite animal?\", \"actor\": \"jettro\"}";

String sessionId = "session-413e123e-c8c7-45a2-8d1c-11111111111111";


InvokeAgentRuntimeRequest request = InvokeAgentRuntimeRequest.builder()

.agentRuntimeArn("arn:aws:bedrock-agentcore:eu-west-1:11111111111:runtime/bedrock_agent_runtime-Lc8XuS252H")

.runtimeSessionId(sessionId) // Must be 33+ char. Every new SessionId will create a new MicroVM

.payload(SdkBytes.fromUtf8String(payload))

.build();



try (ResponseInputStream<InvokeAgentRuntimeResponse> responseStream = client.invokeAgentRuntime(request)) {

String responseData = IoUtils.toUtf8String(responseStream);

System.out.println("Agent Response: " + responseData);


System.out.println(sessionId);

} catch (IOException e) {

e.printStackTrace();

}

}

}

## Next steps

In a follow-up post, I write about integrating the agent into an application. I’ll work on authenticating and authorising users. I’ll add a backend with an API Gateway and a single-page web app frontend, both deployed via CloudFormation. Next, I want to look at the Amazon Bedrock AgentCore Gateway and integrate MCP servers.

Of course, I’ll also monitor the AgentCore community project closely, and I’ll keep the example up to date with the latest project status.

## References

The project GitHub repo:

Spring AI Homepage:

Spring AI Bedrock AgentCore community homepage:

Reference to the alpha constructs for AgentCore CDK:

Amazon Bedrock AgentCore SDK information:

[https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/bedrock-agentcore.html](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/bedrock-agentcore.html)[https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/bedrock-agentcore-control.html](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/bedrock-agentcore-control.html)

Developer guide Amazon Bedrock AgentCore