
---
title: My 2025: Building agents, Writing, Speaking
author: Jettro Coenradie
url: https://jettro.dev/my-2025-building-agents-writing-speaking-65b1fb99ccda
hostname: jettro.dev
description: It is that moment of the year when we reflect on the past year. You get a few emails about what you did in the past year. I am used to…
sitename: Medium
date: 2025-12-30
---
# My 2025: Building agents, Writing, Speaking

It is that moment of the year when we reflect on the past year. You get a few emails about what you did in the past year. I am used to having an email from LinkedIn with an overview of my contributions. An email from Spotify about what you have been listening to. New to me this year was my listening age. Apparently, I am 74 according to Spotify. My top artist is Marvin Gaye. I listen to Apple Music a lot more; my top artist is a Dutch artist called Karsu. Another thing that I noticed this year is that I got multiple emails with an overview of what I have read, bought, eaten, etc. So yeah, we are watched everywhere.

Back to what I write about on this blog. What did I write about, what books did I read, what conferences did I attend?

## From RAG to Agents

In 2024, I led several workshops on Retrieval-Augmented Generation (RAG). In 2025, RAG got replaced by Agents. Together with Daniël Spee, I created a workshop about Agents. We got accepted with our workshop at [Devoxx](https://jettro.dev/my-devoxx-2025-experience-b78b0e1cace1) and JFall. I learned a great deal about various frameworks for developing agents. First, I [created my agent without](https://jettro.dev/learn-ai-agent-basics-using-python-and-ollama-a62108d80df9) a fundamental agentic framework. After that, I continued with the [OpenAI Agent SDK](https://jettro.dev/create-a-multi-agent-system-with-openai-agent-sdk-a9c9fd618740). In both cases, I talked about keeping state, working with memory, and using a vector store to give the Agent more context.

After OpenAI, I continued my agentic journey with Amazon Bedrock. I re-created the sample with a customer support agent using the new Amazon Nova Lite model. I liked the integration of an OpenAPI interface as a tool for the Agent. Creating a multi-agent system was harder with Bedrock than with OpenAI. But having a production system available that integrates with your other enterprise-ready components was a significant advantage.

Later in the year (we are in July), I got experience with the new agent framework called Strands. In a blog, I talked about the sample application that was easy to run on your laptop, but just as easy to deploy to an AWS environment. I was excited about this feature of the framework.

## Security and Agents

This is not an easy topic. Do you pass your identity to an agent, and do you let the agent impersonate you? Or, do you give the agent its own identity and let the agent act on your behalf? Security and agents were not the best of friends from the start. Especially when talking about MCP as a tool for your agents, security was a sensitive topic. It was Semantic Kernel, a Microsoft framework, that enabled OAuth to serve as your digital twin. I [wrote about it in May](https://jettro.dev/secure-agents-with-semantic-kernel-oauth-and-openapi-64a8f441d3e8), but it did not give me the best experience.

## Running agents on the JVM

In July, I learned about a new framework called Embabel. One reason it was interesting was the involvement of Rod Johnson, the Spring Framework's founder. I wrote an application that analyses a blog post and generates a LinkedIn post from it. The framework's philosophy is refreshing and groundbreaking in the agentic space. I wrote an extensive tutorial about writing an agent using Java and Embabel. It got noticed and referred to from the Embabel website. I also had a few chats with Rod Johnson, which were fun.

Later in the year, I wrote about Embabel and MCP servers. Embabel uses Spring AI, a strong candidate for building agents and MCP servers. I [wrote about that](https://jettro.dev/creating-and-using-an-mcp-server-using-spring-ai-and-embabel-09637fb0c733) as well.

## Spec-driven development and CLI Agents

At Devoxx, I learned about a tool called Backlog.md. This is a tool that supports spec-driven development. Together with a command-line agent like Codex from OpenAI, you first write the application's specifications. The advantage is that you need not choose the wording. You work with the agent to draft the tasks to be performed. If you are satisfied, you ask the agent to write an implementation plan. After a review, you can even ask the agent to implement the task. Agents like Claude, Codex, and others become increasingly capable of doing this as we would, but faster. I wrote about using backlog.md.

## Passkeys and Spring Security

Another inspiring talk at Devoxx focused on using passkeys for authentication. With laptops featuring fingerprint scanners and phones with face recognition, you have a device with passkey capabilities at your fingertips. YubiKeys are another common way to store keys for websites, devices, and more. With the latest release of Spring Security, using passkeys for your application becomes easy. I [write about a sample application](https://jettro.dev/spring-security-7-and-passkeys-a-practical-guide-4f5635aa4c4c) that uses passkeys.

## Short- and Long-term memory for agents

We are approaching the end of the year, and the last trick up my sleeve is again about agents. This time, I take a close look at Amazon Bedrock AgentCore, especially its memory module. In [my first blog post](https://jettro.dev/deep-dive-into-agentcore-memory-using-the-java-sdk-9446a60126df), I used the SDK to communicate with the memory component. I explain the difference in implementation between short- and long-term memory. Of course, I show code and configuration to work with memory. Most of the information you can find on the web deals with Python code. I wanted to work with Java. To work with Amazon Bedrock, I used the excellent integration with the Spring AI framework.

## Get Jettro Coenradie’s stories in your inbox

Join Medium for free to get updates from this writer.

To make life easier, I had a look at the community project that integrates AgentCore into Spring AI agents. In my second blog on this topic, I wanted to take it one step further. I tried to deploy an agent to the Amazon Bedrock AgentCore Runtime using CDK, but I still use Java for the agent code. Short-term memory leveraged the community-driven AgentCore Memory integration. For long-term memory, I created a tool to access it. You can read all about it in this blog post.

## Bring a crew to do your job.

This is the title for a presentation I did a few times this year. It started at [Blipz](https://blipz.io). During this presentation, I explain what an Agent needs to do its job, how it thinks like an LLM, what an execution environment for tools, memory, and maybe a way to interact with other agents looks like. For Blipz, I use LangChain and a framework from my company, [Yuma,](https://weareyuma.com/) called Akgents. I did a rerun of the talk at the [AWS User Group of Den Haag](https://www.meetup.com/awsugnl/events/306678333/). Of course, I wrote a version using Bedrock Agents.

At the end of the year, I did the same version at Apeldoorn IT. However, it was time for a version 2. I recreated the samples using Embabel. I also revamped the slides. I liked the result, and the audience was enthusiastic as well.

Let me know if you are interested in this presentation. I can always tune it for special occasions.

## AI, the future, just a bubble, or a problem?

I am positive about what you can do with AI. That does not mean we should stop thinking for ourselves. The blog post that got the fewest readers this year is the one I wrote that was 90% AI-generated. I am proud that all of my other content is my own; yes, I corrected it with Grammarly, and yes, a lot of the code is generated by AI. Still, I am a firm believer that we have superior brains in some areas. But we have to learn to work with AI, not against it. Before I used AI to write the blog post, I had a lengthy discussion with the same AI about the topic. We challenged each other; I brought in new articles for it to read. I still like the result, and it bothers me that almost nobody read it. But he, that is life :-).

If you are curious now, please read it here:

If you are still not curious, please look at the AWS Re:invent 2025 keynote from Dr Werner Vogels, who talks about the Renaissance Developer. A link is at the end of the blog mentioned above.

## Books

Each year, I draw inspiration from the books I read. Below are some of the books I read in 2025.

Lieve Scheire — A.I. ([link to bol.com](https://www.bol.com/nl/nl/p/a-i/9300000153479601/)): A book in Dutch describing the development of AI without too many technical details. I like the humour side of his writing.

Jamie Dobson — Visionaries, Rebels and Machines ([link to amazon.nl](https://www.amazon.nl/-/en/dp/1917490070?ref=ppx_yo2ov_dt_b_fed_asin_title)): A book explaining the development of AI in the light of historical events.

Arvind Narayanan, Sayash Kapoor — AI Snake Oil: What Artificial Intelligence Can Do, What It Can’t, and How to Tell the Difference ([link to amazon.nl](https://www.amazon.nl/-/en/dp/069124913X)): Again, an interesting read about “the dangers” of AI and of course its capabilities.

Ben Angel — The Wolf Is at the Door: How to Survive and Thrive in an AI-Driven World ([link to amazon.nl](https://www.amazon.nl/-/en/dp/1642011657)): A book about understanding the capabilities of AI and how to use it to become more effective and survive.

Mustafa Suleyman — The Coming Wave: AI, Power and Our Future ([link to amazon.nl](https://www.amazon.nl/-/en/dp/1529923832)): The perspective on technology waves from the CEO of Microsoft. Often referred to by other books and articles.

## Thank you

The last words of 2025 on this blog are a thank you to you. Thank you for reading my content. I live to share knowledge, write, and talk. It pleases me if someone likes it, sometimes through a *clap* or a *comment*. I love those comments with questions. I hope to see you again in 2026.