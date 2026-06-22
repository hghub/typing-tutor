---
slug: circuit-breaker-vs-retry-vs-timeout
title: "Circuit Breaker vs Retry vs Timeout: A Practical Guide to Resilient APIs"
description: Learn when to use timeouts, retries, and circuit breakers together without causing retry storms, duplicate transactions, or cascading API failures.
hero: 🛡️
category: mulesoft
section: integration
readTime: 9 min read
publishDate: 2026-06-22
tags: ["API Resilience","Circuit Breaker","Retry","Timeout","MuleSoft","Mule 4","Integration Architecture","API-Led Connectivity"]
---
**Enterprise integration • API resilience • MuleSoft architecture**

A timeout protects one request. A retry gives a selected transient failure another chance. A circuit breaker protects the wider platform from repeatedly calling a dependency that is already unhealthy.

These patterns solve different problems. Used together carefully, they contain failures and preserve capacity. Used without limits, especially through aggressive retries and poorly aligned timeouts, they can turn a slow backend into a wider outage.

## The Production Problem

Consider a backend service that normally responds in two or three seconds. Under load, the same operation begins taking more than 20 seconds.

The calling API waits, reaches its timeout, and retries. More requests arrive while the first attempts are still consuming resources. Users also repeat actions because they do not know whether the original request succeeded.

The result can be worse than the original slowdown:

- open requests consume threads, connections, memory, and worker capacity
- connection pools and queues begin to fill
- retries multiply traffic to the struggling dependency
- write operations can create duplicate reservations, payments, or updates
- one slow backend starts affecting unrelated APIs and customer journeys

The answer is not simply to increase the timeout or retry every failure. Resilient design starts by assigning each control a specific responsibility.

## Timeout vs Retry vs Circuit Breaker

| Pattern | Question it answers | Primary protection |
| --- | --- | --- |
| Timeout | How long should this request wait? | The individual request and caller resources |
| Retry | Should this selected temporary failure be attempted again? | Recovery from short-lived transient failures |
| Circuit breaker | Should we continue calling this dependency? | The wider platform and the unhealthy dependency |

The most important distinction is scope. A timeout evaluates one attempt. A retry initiates another attempt. A circuit breaker evaluates recent outcomes across many calls and can stop new attempts temporarily.

## 1. Timeout: Limit How Long One Attempt Can Wait

A timeout places a deadline on a downstream operation. Without one, a caller can wait indefinitely while holding resources needed by other work.

Common timeout types include:

- **Connection timeout:** how long to wait while establishing a connection
- **Read or response timeout:** how long to wait for data after a connection exists
- **End-to-end deadline:** the maximum time available for the complete request across all layers

A timeout does not make the backend healthy. It only stops the current attempt from waiting longer.

### Design timeouts as a budget

Timeouts should be coordinated across the complete call chain. If a mobile client allows 12 seconds, an Experience API cannot safely spend all 12 seconds waiting for a Process API, which then waits another 12 seconds for a System API.

Each layer needs enough time to:

1. call its dependency
2. receive or generate a controlled failure
3. perform any permitted retry
4. return before its own caller gives up

Choose values from observed latency percentiles, network overhead, transaction criticality, and the user-facing deadline. A timeout copied from another API is not evidence-based configuration.

## 2. Retry: Repeat Only Failures That May Recover

A retry is useful when a failure is temporary and another attempt has a reasonable chance of succeeding. Examples can include a brief network interruption, a connection reset, throttling that provides a retry window, or a short-lived service-unavailable response.

Retries become dangerous when they are broad, immediate, or repeated at multiple layers. If 100 failed requests each receive three additional attempts, the dependency can receive 300 extra calls while already unhealthy. If several layers retry independently, the multiplication can be much larger.

A controlled retry policy should define:

- which errors are genuinely transient
- the maximum number of attempts
- the delay between attempts
- exponential backoff and jitter where supported
- the total request deadline
- whether the operation is safe to repeat
- which single layer owns the retry

> **Retry rule:** never retry because an error merely looks technical. Retry only when the failure classification, operation semantics, and remaining deadline make another attempt safe and useful.

### Why write operations require special care

Retrying a read is generally less risky than retrying a request that creates a reservation, charges a card, submits an order, or updates a customer record.

A timeout proves only that the caller did not receive a response. It does not prove that the backend failed to complete the operation.

Before retrying a write, use at least one reliable duplicate-prevention strategy:

- an idempotency key
- a unique business reference
- a status-check endpoint
- an upsert or naturally idempotent operation
- an asynchronous acceptance pattern with a correlation ID

Without such protection, a successful first attempt followed by a lost response can become a duplicate transaction after retry.

## 3. Circuit Breaker: Stop Calling a Dependency That Is Unlikely to Recover Immediately

A circuit breaker observes outcomes across multiple calls. When failures or slow calls cross a configured threshold, it temporarily blocks calls to the affected dependency.

The standard states are:

- **Closed:** calls are allowed and outcomes are monitored
- **Open:** calls fail fast or use a valid fallback without invoking the dependency
- **Half-open:** a limited number of trial calls test whether the dependency has recovered

Unlike a timeout, which protects one request, a circuit breaker prevents the platform from repeatedly spending resources on a dependency that is already showing sustained failure.

The breaker should usually evaluate technical health signals such as timeouts, connection failures, service unavailability, and slow-call rates. Business validation errors such as invalid input or a rejected booking do not normally mean the dependency is unhealthy.

## 4. How the Three Patterns Work Together

A typical request path is:

1. Check whether the circuit currently permits the call.
2. Call the dependency with a defined timeout.
3. If a selected transient failure occurs, confirm that the operation is safe to repeat.
4. Retry a limited number of times using backoff and jitter, while remaining inside the end-to-end deadline.
5. Record success, failure, timeout, and slow-call outcomes.
6. Open the circuit when recent outcomes cross the configured threshold.
7. While open, fail fast or use a truthful, business-approved fallback.
8. After the recovery interval, allow a small number of half-open trial calls.

```text
if circuit.isOpen():
    return controlledUnavailableResponse()

result = callDependency(timeout = requestBudget)

if result.isTransientFailure()
   and operation.isSafeToRetry()
   and deadline.hasTimeRemaining():
    wait(backoffWithJitter)
    result = retryOnce()

circuit.record(result)
return mapToConsumerResponse(result)
```

This is conceptual pseudocode. The exact implementation depends on the runtime, connector, service mesh, gateway, and resilience library used by your platform.

## 5. Practical Starting Configuration

Suppose a reservation backend normally responds in two to three seconds but sometimes exceeds 20 seconds during peak load. An initial test configuration might be:

| Setting | Illustrative starting value |
| --- | --- |
| Backend response timeout | 10 seconds |
| Maximum retries | 1 |
| Retry delay | Exponential backoff with jitter |
| Minimum calls before circuit evaluation | 20 |
| Failure-rate threshold | 50% |
| Slow-call threshold | 8 seconds |
| Slow-call rate threshold | 60% |
| Circuit open duration | 60 seconds |
| Half-open trial calls | 3 |

These are examples, not universal defaults. Tune them with production latency percentiles, traffic volume, backend capacity, expected recovery time, transaction risk, and acceptable customer experience.

Test the policy under load. A setting that appears reasonable during a single manual request may behave very differently when hundreds of callers retry together.

## 6. Mule 4 Implementation Notes

Mule 4 provides the `Until Successful` scope for synchronous retry behavior. MuleSoft documents that it retries all processors inside the scope until they succeed or the configured retry count is exhausted.

That behavior creates two important design responsibilities:

- Keep the scope small so a retry does not repeat unrelated processors.
- Do not place unsafe write operations inside it unless duplicate execution is controlled.

```xml
<until-successful
    maxRetries="${reservation.retry.max}"
    millisBetweenRetries="${reservation.retry.interval}">
    <flow-ref name="call-reservation-backend" />
</until-successful>
```

This example shows retry structure only. Error selection, timeout configuration, idempotency, backoff strategy, circuit state, and observability still need deliberate design.

> **MuleSoft warning:** `Until Successful` is a retry mechanism, not a complete circuit-breaker strategy. Wrapping a backend call in this scope does not by itself prevent repeated calls during a sustained outage.

## 7. Where the Logic Belongs in API-Led Architecture

Backend-specific resilience usually belongs close to the dependency. Business recovery decisions belong where the business process is understood.

| Layer | Typical responsibility |
| --- | --- |
| System API | Backend timeout, selected technical retry, circuit state, and error translation |
| Process API | Business fallback, orchestration, compensation, or asynchronous handling |
| Experience API | Channel-appropriate response for web, mobile, or partner consumers |
| API gateway / ingress | Rate limits, spike control, quotas, and traffic protection |

This is a useful default, not an absolute rule. The final design should prevent multiple layers from retrying the same failure independently.

## 8. Choose Fallbacks That Tell the Truth

### For read operations

- return valid cached data
- return the last known result with a clear freshness indicator
- return partial information when the missing dependency is non-critical
- fail fast with a clear temporary-unavailability response

### For write operations

- fail fast and ask the caller to retry later
- return `202 Accepted` only when the request was safely accepted for asynchronous processing
- queue the operation only when business rules permit delayed execution
- return a correlation ID and provide a status endpoint

Never return fake success for an unconfirmed write. A fallback should preserve business truth, not merely improve the HTTP success rate.

## 9. Common Design Mistakes

### Retrying every 5xx response

Not every server error is transient. Repeating a persistent failure can intensify an outage.

### Retrying at every API layer

Retries multiply across the call chain. Assign retry ownership to one deliberate point.

### Retrying non-idempotent writes

A blind retry can create duplicate payments, reservations, orders, or updates.

### Using the same timeout everywhere

A content lookup, CRM search, payment authorization, and reservation creation flow have different latency and risk profiles.

### Opening the circuit for business errors

Invalid input, duplicate data, or a failed business rule does not automatically indicate an unhealthy dependency.

### Continuing after the caller's deadline

Work that continues after the consumer has timed out can waste capacity or complete a transaction the user believes failed.

### Returning fake success

Do not claim that a write succeeded unless completion was confirmed or the request was safely accepted for later processing.

## 10. Monitoring and Operational Visibility

Resilience controls must be observable. Operations teams should know whether retries are helping, when a circuit opens, and whether the dependency recovers.

Track:

- timeout count and rate
- retry count and retry success rate
- circuit state changes and open duration
- slow-call rate and backend latency percentiles
- fallback usage
- half-open trial outcomes
- duplicate-prevention and idempotency outcomes
- remaining deadline at each attempt

Logs and traces should include the correlation ID, API, dependency, operation, elapsed time, retry attempt, circuit state, and final outcome. Never log complete credentials, payment data, or sensitive payloads to gain observability.

## Production Review Checklist

- Define the end-to-end deadline before setting individual timeouts.
- Confirm which errors are transient and retryable.
- Assign retry ownership to one layer.
- Limit attempts and use backoff with jitter where supported.
- Protect write operations with idempotency or a status-check pattern.
- Keep circuit-breaker thresholds specific to the dependency and operation.
- Exclude business validation failures from technical health calculations.
- Use truthful fallbacks.
- Test slow, failed, partially recovered, and overloaded scenarios.
- Alert on rising retries, circuit transitions, and fallback usage.
- Revisit thresholds using production evidence rather than leaving initial values unchanged.

## Final Lesson

Timeout, retry, and circuit breaker are complementary controls:

- **Timeout** contains one slow attempt.
- **Retry** handles a small set of temporary failures.
- **Circuit breaker** protects the platform during sustained failure.

The objective is not to prevent every failure. It is to contain failure, preserve capacity, recover safely, and give consumers a controlled and truthful response.

For another request-path example, read [When MuleSoft Client ID Enforcement Returns 401 Behind NGINX Ingress](/blog/integration/mulesoft-client-id-secret-401-nginx-ingress), or explore more [Integration engineering guides](/blog/integration).

## Official References

- [AWS Builders' Library: Timeouts, retries, and backoff with jitter](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/)
- [Microsoft Azure Architecture Center: Circuit Breaker pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker)
- [MuleSoft Documentation: Until Successful Scope](https://docs.mulesoft.com/mule-runtime/latest/until-successful-scope)
