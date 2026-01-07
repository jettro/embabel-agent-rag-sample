---
title: Supercharge your MCP service with Embabel + human-in-the-loop
author: Jettro Coenradie
url: https://jettro.dev/supercharge-your-mcp-service-with-embabel-human-in-the-loop-2796dff77e05
hostname: jettro.dev
description: You are a developer with a task to create a service for AI Agents to order food and drinks on location. Model Context Protocol (MCP) is a…
sitename: Medium
date: 2025-10-29
---
# Supercharge your MCP service with Embabel + human-in-the-loop

You are a developer with a task to create a service for AI Agents to order food and drinks on location. Model Context Protocol (MCP) is a de facto implementation for such a service. You want a flexible interface where users can send a message with what they want, and you convert it to an order. You need a confirmation from the human if the order is correct.

Embabel is a platform for building AI Agents. One of the runtime modes is as an MCP server. One of the features is to add a method `WaitFor`

. With this method, you tell the agent to wait for a response from the Human.

In this blog post, you follow along as I create the MCP server. I test the MCP server with the `MCP Inspector`

. After that, I show you how to create another Agent that uses the MCP server to provide a food-and-drinks ordering system for its human users.

## Embabel Agents

In Embabel, agents are simple Java beans. When working with Spring Boot, you can inject other beans. That way, Embabel has access to services, storage, and whatever you want.

An Agent starts with an annotation. You can describe the agent's role in the annotation.

`@Agent(description = `

"Handles an incoming food order and processes it accordingly."

)

Agents need actions they can perform. In general, you start with some form of input. In our case, we have a `UserMessage`

. This is the input for the first action. The purpose of this action is to extract the order lines, think of pizza, sandwich, coffee, and cookies.

`@Action(description = "Receive an order request from a user.")`

Order receiveOrder(UserMessage userInput, Ai ai) {

// A call to the LLM using a prompt to extract the order.

}

Other actions are confirmOrder, storeOrder and processOrder. The process order is different. This method specifies the agent's end goal. Check the following code block, which `AchievesGoal`

describes the end goal for the agent. This annotation contains the `export`

value. This can be translated one-on-one to the available methods in the remote MCP server.

`@AchievesGoal(`

description = "Process the food order by validating, preparing, and confirming it.",

export = @Export(remote = true, name = "acceptOrder", startingInputTypes = {UserMessage.class}))

@Action

ProcessedOrder processOrder(ConfirmedAndStoredOrder confirmedOrder, Order order, Ai ai) {

// A call to the LLM to read confirmation status and a message with the result

}

## Remote MCP Server

In the section about Embabel, we already mentioned the `AchievesGoal`

annotation. In this annotation, we specify that this part be included in the remote MCP server. We also specify the name of the tool, `acceptOrder`

and we specify the input of the tool. In our case, that is the UserMessage mentioned before. With this knowledge, the configuration should be clear to you.

`@Export(`

remote = true,

name = "acceptOrder",

startingInputTypes = {UserMessage.class}

)

## Human in the loop

In the first action, we try to map the requested items to menu items. For example, the menu does not contain Cake, but we do have cookies. If a user asks for cake, we suggest cookies instead. We ask the user if this change is ok; therefore, we ask for an order confirmation. We are on the MCP server, and we want the user to confirm. Below is the code to add to the MCP server to do that.

`@Action(description = "Confirm the order with the user before processing.")`

ConfirmedOrder confirmOrder(Order order, Ai ai) {

return WaitFor.formSubmission(

"""

Great, I have a proposed order. Please confirm if you would like to

proceed with this order.


Location: %s

Delivery Date: %s


The order contains the following items:

%s

""".formatted(order.location(),

order.deliveryDate(),

order.printOrderItems()),

ConfirmedOrder.class

);

}

`WaitFor`

is a construct from Embabel to write a new response to the caller, another agent. We instruct the agent to return a confirmation. This confirmation should come from the caller to that agent. The following screenshots of the MCP inspector show the flow of this **HumanInTheLoop **part.

Here, we first connected to the MCP server using SSE at [ http://localhost:8085/sse.](http://localhost:8085/sse.) When connected, choose the tools at the top. Select the tool

`UserMessage_acceptOrder`

and enter the date, location and a text with your order.## Get Jettro Coenradie’s stories in your inbox

Join Medium for free to get updates from this writer.

This is the response after the order submission.

`You must invoke the submitFormAndResumeProcess tool to proceed with the goal "org.rag4j.nomnom.agent.HandleOrderAgent.processOrder".`

The arguments will be

- processId: peaceful_darwin,

- formData: English text describing the form data to submit. See below


Before invoking this, you must obtain information from the user

as described in this form structure.

com.embabel.agent.core.hitl.FormBindingRequest(id=d4a87352-44dc-424d-8cfa-305ca9acf62f, payload=Form(title=Great, I have a proposed order. Please confirm if you would like to proceed with this order.


Location: Luminis Halfweg

Delivery Date: 2025-11-01


The order contains the following items:

- 10 x Coffee

- 10 x Cookie


, controls=[Checkbox(label=Confirmed, checked=false, required=true, disabled=false, id=confirmed), Button(label=Submit, description=Submit, id=4184d9d8-05c5-46dd-9343-06a9e584b5a8)], id=14b6dc51-366c-4e28-9ea7-3b5af25558a5), form='Form(title=Great, I have a proposed order. Please confirm if you would like to proceed with this order.


Location: Luminis Halfweg

Delivery Date: 2025-11-01


The order contains the following items:

- 10 x Coffee

- 10 x Cookie


, controls=[Checkbox(label=Confirmed, checked=false, required=true, disabled=false, id=confirmed), Button(label=Submit, description=Submit, id=4184d9d8-05c5-46dd-9343-06a9e584b5a8)], id=14b6dc51-366c-4e28-9ea7-3b5af25558a5)')

Note the processId: *peaceful_darwin. Also, notice we get 10 cookies, not 10 cakes.* This is the message that is returned to the agent calling the MCP server. Read how the MCP server instructs the Agent what to do. If you agree, move on to the next step.

From the form, I take this part and enter true for the checkbox:

`[Checkbox(label=Confirmed, checked=true, required=true, disabled=false, id=confirmed), Button(label=Submit, description=Submit, id=4184d9d8-05c5-46dd-9343-06a9e584b5a8)], id=14b6dc51-366c-4e28-9ea7-3b5af25558a5)')`

Now, click on the tool `submitFormAndResumeProcess`

. Enter the process ID together with the form above. After pushing the run tool button, this was my response:

`"ProcessedOrder[success=true, message=Order confirmed: `

10x Coffee and 10x Cookie to be delivered to Luminis Halfweg on 2025–11–01.]"

The NomNom MCP server has an in-memory order store. The server includes a few pages to let you view all the data. Below is the screen with the order we have just created.

## Demo

The video shows the Meeting application I am working on. NomNom is integrated into this application. You can see all the steps in the UI, from the agent to the NomNom MCP server.

## The code

Of course, everything is available on GitHub.