---
title: Spring Security 7 and Passkeys: A Practical Guide
author: Jettro Coenradie
url: https://jettro.dev/spring-security-7-and-passkeys-a-practical-guide-4f5635aa4c4c
hostname: jettro.dev
description: Humans are bad password managers. Re-use, weak choices are common in using passwords. Apple and other hardware suppliers introduced Face…
sitename: Medium
date: 2025-12-02
---
# Spring Security 7 and Passkeys: A Practical Guide

Humans are bad password managers. Re-use, weak choices are common in using passwords. Apple and other hardware suppliers introduced Face ID, fingerprint recognition, and the Apple Watch to make logging into your laptop and phone easier. With a biometric key, you have a secure passwordless access method. You combine something you have (laptop/phone) with something you are (biometric).

FIDO (**Fast Identity Online**) uses biometric keys, or passkeys, to enable this method of authenticating to websites. WebAuthn is the W3C standard, and FIDO2 includes this standard as well. This authentication technique is called passkeys.

In this blog, you'll follow along as we create a Spring Boot application with Spring Security 7 that uses passkeys for authentication.

## Introduction to passkeys

Passkeys are passwordless credentials based on FIDO2/WebAuthn. Instead of a shared secret you type, a passkey is a **public/private key pair**: the public key lives with the service, the private key stays on (or is securely synced between) the user’s devices. Login happens by proving possession of the private key, usually unlocked via biometrics or a local PIN. Because the private key never leaves the device/provider and keys are scoped per site, passkeys are designed to be **phishing-resistant by default**.

**Synced passkeys** (the Apple-provided passkey) maximise convenience, but concentrate some risk in the cloud “passkey provider.”

**Device-bound passkeys** keep keys on a single device/hardware token (e.g., a YubiKey), increasing security/control but making cross-device UX harder.

A passkey combines something you have (a laptop, phone, or YubiKey) with something you are (a fingerprint), without the user having to open password apps.

Passkeys don’t make authentication magically free of trade-offs; they move the main risk from ‘users managing secrets’ to ‘devices/providers managing keys. For most apps, that’s a huge net win because phishing and reuse are the biggest real-world threats.

### Authenticate using a passkey.

If you are not familiar with passkeys, the following screenshots give an impression of the authentication flow. We use the passkey from Apple that I have registered with my account. In the next section, you will see how we register a new passkey.

First, we are redirected to the login screen. In here, you can choose the authentication method. Of course, we choose the passkey.

After authentication, you are redirected to the dashboard. The dashboard contains the registered passkey credentials. Note that the Apple passkey is of type sync. The advantage is that you can use multiple authentication methods. For me, Touch ID and my Apple Watch make it possible to authenticate.

Now, let's see what it takes to register a new passkey.

### Registering a new passkey

I have a YubiKey with a fingerprint. You have to set up the key using the Yubi software. The process is simple: you register your fingerprints and secure them with a PIN code. This can be a very long number if you want to. Next, you register application or website keys, just as we are going to do now.

First, the Yubi Authenticator shows the registered credentials. We have a clean key, without registrations.

Next, we push the button to register a new passkey in the application. We give it a name to recognise the key, in our case *YubiKey*.

When you press the register passkey button, a pop-up appears; it is important to select the More **Options button**. In here, you can choose the **Use Security Key** option. Press continue, and the following screen appears. In here, you are asked to activate the key. In my case, the YubiKey starts flashing, and I need to provide my fingerprint.

Now that the YubiKey is added as a passkey, let's verify the registration in the dashboard. Note that the new key is Device-bound. Not synced like with the Apple-provided passkey.

Finally, the Yubi Authenticator shows the new registered key.

Time to move on to the application.

## Passkeys Demo Application

The previous section shows what functionality we have created. In this section, you read about the implementation of the application.

## Get Jettro Coenradie’s stories in your inbox

Join Medium for free to get updates from this writer.

Before I go into the details, I want to point you to a YouTube video from *Daniel Garnier-Moiroux* at Devoxx 2025. This is an excellent introduction to the options Spring Security provides.

### Focus on the backend part.

I chose a slightly different path. I wanted login screens that looked more like being part of my application. Therefore, I had to implement a lot of JavaScript. Most of the frontend parts are generated by an AI Agent. In the future, I want to look for a framework to improve the frontend. For now, I focus on the application's backend.

### The application design

As mentioned before, the application is created with Spring Boot. I decided to go with the latest and greatest, which is version 4.0.0 at the moment of writing. The essential component for the demo is, of course, Spring Security. Again, the most recent version is 7.0.0. For the passkeys, you need the component *spring-security-webauth*. I want a web application, so I added the Spring Boot Web MVC starter. Then there are many Thymeleaf and webjar dependencies. Finally, to make the users and the credentials persistent, I added JPA and H2.

### Configure Spring Security

Most Spring Security components are configured through the SecurityFilterChain. In this code block, we configure the endpoints that require authentication and those that do not.

`@Configuration`

@EnableWebSecurity

public class SecurityConfig {


@Bean

public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

http

.authorizeHttpRequests(authz -> authz

.requestMatchers("/webjars/**").permitAll()

.requestMatchers("/css/**", "/js/**", "/images/**").permitAll()

.requestMatchers("/.well-known/**").permitAll()

.requestMatchers("/", "/register", "/login").permitAll()

.requestMatchers("/login/webauthn").permitAll()

.requestMatchers("/webauthn/authenticate/options").permitAll()

.requestMatchers("/h2-console/**").permitAll()

.requestMatchers("/webauthn/**").authenticated()

.requestMatchers("/passkey/**").authenticated()

.anyRequest().authenticated()

);

return http.build();

}

It is essential to understand that some endpoints need a valid authenticated user, for instance, when adding a new passkey `/passkey/**`

. Another endpoint cannot have an authenticated user; think about the `/register`

, and the `/login/webauthn`

. In case you did not notice, permitAll() means everybody can access, so no authentication.

To enable form-based login and create our custom login page, we add this config.

`.formLogin(form -> form`

.loginPage("/login")

.defaultSuccessUrl("/dashboard", true)

.permitAll()

)

Now we need to tell Spring Security we want to use passkeys through webAuthn. That is what this part does.

`.webAuthn(webAuthn -> webAuthn`

.rpName("Passkeys Demo")

.rpId("localhost")

.allowedOrigins("http://localhost:8080")

)

### The passkey endpoints

Auto-configuration in Spring Boot handles most of the hard work. Some endpoints override the page's look and feel.

GET /passkey/register — Directs the visitor to our custom Thymeleaf page to start the registration of a new passkey

POST /webauthn/register — Receives the credentials required to register a new passkey. Stores the credentials using the UserCredentialRepository.

DELETE /passkey/{credentialId} — A custom endpoint to manage registered credentials for passkeys. Calls the UserCredentialRepository to remove the credentials from the database.

### Overriding default credential repository

Without additional configuration, everything is stored in memory. I mentioned we added JPA and H2. We want to keep the actual registration available after a restart. To replace the InMemory with a JDBC-based implementation, you have to add these two beans.

`@Bean`

public JdbcPublicKeyCredentialUserEntityRepository publicKeyCredentialUserEntityRepository(JdbcOperations jdbc) {

return new JdbcPublicKeyCredentialUserEntityRepository(jdbc);

}


@Bean

public JdbcUserCredentialRepository userCredentialRepository(JdbcOperations jdbc) {

return new JdbcUserCredentialRepository(jdbc);

}

As we are using JPA with JDBC, we have to prepare the schema. We want to keep the database; therefore, we need to configure H2 with a file-based approach.

Below is the config you need for this to work.

`spring.application.name=passkeys-tryout`


# H2 Database

spring.datasource.url=jdbc:h2:file:./data/passkeydb

spring.datasource.driverClassName=org.h2.Driver

spring.datasource.username=sa

spring.datasource.password=


# JPA

spring.jpa.database-platform=org.hibernate.dialect.H2Dialect

spring.jpa.hibernate.ddl-auto=none

spring.jpa.show-sql=true


# SQL Initialization

spring.sql.init.mode=always


# Disable Open Session In View (best practice)

spring.jpa.open-in-view=false


# Enable debug logging for WebAuthn

logging.level.org.springframework.security.web.webauthn=TRACE

logging.level.org.springframework.security.authentication=DEBUG

logging.level.com.webauthn4j=DEBUG

Spring Boot looks for a file `schema.sql`

on the classpath. In our case, the SQL creates the required tables.

`-- WebAuthn User Entities Table`

CREATE TABLE IF NOT EXISTS user_entities (

id VARCHAR(255) PRIMARY KEY,

name VARCHAR(255) NOT NULL UNIQUE,

display_name VARCHAR(255) NOT NULL

);


-- WebAuthn Credentials Table

CREATE TABLE IF NOT EXISTS user_credentials (

id VARCHAR(255) DEFAULT RANDOM_UUID() PRIMARY KEY,

user_entity_user_id VARCHAR(255) NOT NULL,

credential_id VARCHAR(1024) NOT NULL UNIQUE,

public_key TEXT NOT NULL,

signature_count BIGINT NOT NULL,

public_key_credential_type VARCHAR(32) NOT NULL,

created TIMESTAMP NOT NULL,

last_used TIMESTAMP,

label VARCHAR(512),

backup_eligible BOOLEAN NOT NULL DEFAULT FALSE,

backup_state BOOLEAN NOT NULL DEFAULT FALSE,

uv_initialized BOOLEAN NOT NULL DEFAULT FALSE,

authenticator_transports VARCHAR(512),

attestation_object VARBINARY(1024),

attestation_client_data_json VARBINARY(1024),

FOREIGN KEY (user_entity_user_id) REFERENCES user_entities(id)

);


-- Application Users Table

CREATE TABLE IF NOT EXISTS users (

id BIGINT AUTO_INCREMENT PRIMARY KEY,

username VARCHAR(255) NOT NULL UNIQUE,

display_name VARCHAR(255) NOT NULL,

password VARCHAR(255) NOT NULL,

enabled BOOLEAN NOT NULL DEFAULT TRUE

);

## Concluding plus references

That is it. I hope you gain a better understanding of passkeys and Spring Security's support for them.

If you want to try it out yourself or look at the code, you can find the repository here:

[https://github.com/jettro/passkeys-tryout-spring-security](https://github.com/jettro/passkeys-tryout-spring-security)

### Other references

[https://docs.spring.io/spring-security/reference/servlet/authentication/passkeys.html](https://docs.spring.io/spring-security/reference/servlet/authentication/passkeys.html)