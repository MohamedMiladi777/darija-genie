 2026-05-28 19:38

Status:

Tags:

# DarijaGenie Frameworks & Libraries

For the front end, we can use React Native which offers cross platform integration (advantage over Angular). 

For the backend, we can use vercel's ai sdk. The reason why we could use these is that they are language agnostic, meaning that if a better provider comes out, we can quickly switch to it without risking refactoring the entire code.

Angular is built on top of typescript

For the database, we will use MySql for text entries and Google cloud for TTS. (Postgresql)

Redis:  Provides the framework for long term and short term memory. (2)

**With Redis:** You can use Redis as a **Semantic Cache**. When a user asks a question, Redis checks your cache using vector similarity matching. If a semantically similar question has been answered before, Redis returns that answer instantly ($<10\text{ms}$) without hitting the AI provider at all, dropping your API costs to zero for that request.

Express.js or the backend framework
Node.js for runtime environment

Main language : Typescript

Getting started (1)

### References

1) [Angular-Full-Stack](https://github.com/DavideViolante/Angular-Full-Stack)
2) [Redis](https://redis.io/blog/redis-as-the-engine-behind-real-time-intelligent-chatbots/)
---
