---
slug: purchase-order-review-before-erp-import
title: Purchase Order Automation: Check the Exceptions Before ERP Import
description: A practical workflow for matching customer order lines, handling price and unit exceptions, and approving a sales-order draft before integration.
hero: 🧾
category: business
section: integration
readTime: 6 min read
publishDate: 2026-11-17
tags: ["purchase order", "order review", "integration", "ERP", "catalogue", "synthetic demo"]
---
## The Expensive Part Is Often The Uncertainty

A customer sends an order for “large takeaway boxes”. A member of staff knows the catalogue has both white and kraft boxes. Someone must confirm the intended product, check the customer's agreed price and avoid entering the same order twice. Reading the words is only one part of the work.

The [Purchase Order Review Demo](/tools/order-review-demo) makes those decisions visible. It uses invented purchase orders and a fixed synthetic catalogue. You can resolve an ambiguous item, review a price exception and export a local draft. It does not use OCR or an LLM, accept document uploads, or connect to an ERP.

## Walk Through A Real Review Pattern

Load the exceptions example. The first product description matches two catalogue entries. The second line has a source price different from the catalogue price. The subtotal itself is correct: the customer quoted 200 boxes at USD0.40 and 500 cups at USD0.10, producing USD130.00 before any other charges.

Choose the intended box. For the cup price, record a meaningful verification note and explicitly accept the synthetic price exception. The draft preserves the source price; it does not silently change the customer's order to the catalogue price. Only after all checks pass can you approve and download a CSV.

Load the duplicate example to see a different blocker. Its reference already exists in the fixed sample ledger. Approval cannot bypass that check. A production implementation would need an authoritative duplicate lookup and an atomic submission strategy, rather than relying on a browser-held list.

## Separate Extraction, Validation And Approval

| Stage | Responsibility | Typical exception |
| --- | --- | --- |
| Read | Extract text and candidate fields with source references | Unreadable quantity or missing reference |
| Match | Compare against authorized products and units | Two products share an alias |
| Validate | Check arithmetic, customer terms and duplicates | A correct subtotal can still use the wrong price |
| Review | A permitted reviewer resolves uncertainty | A special price needs approval |
| Submit | An authenticated integration creates a draft | Network retry must not duplicate an order |

An LLM can propose structured fields and candidate matches. It should not invent catalogue identifiers, grant a discount, infer an undocumented unit conversion or independently confirm an order. The responsible employee and the source systems remain authoritative.

[Ollama structured outputs](https://docs.ollama.com/capabilities/structured-outputs) can constrain a supported self-hosted model response to a JSON schema. Schema compliance is not evidence that a quantity was read correctly. Retain source evidence and separately validate numbers and business rules. Documentation checked17November2026; no Ollama service is connected to this demo.

## Start A Small Pilot Around Existing Systems

For a wholesaler or distributor in Pakistan or internationally, select one recurring order format, one product group and one target import format. Agree how to obtain authorized samples, who may review them, which fields are required and how long inputs are retained. Avoid patient, identity or payment-card information in an early pilot.

Measure a baseline before promising benefits: processing time per accepted order, correction rate, ambiguous lines, duplicate incidents and reviewer effort. Test unseen layouts and awkward inputs as well as clean samples. Local inference may reduce metered model usage at sufficient volume, but compute, OCR, retries, review and support still cost money.

Existing products already address this market. For example, [Nanonets documents purchase-order extraction](https://docs.nanonets.com/docs/purchase-order-model), including line items. The reason to commission a focused integration is a specific gap: catalogue rules, a private deployment requirement, a difficult connector or a review process the existing setup does not handle well. A generic extractor alone is a weak differentiator.

## What This Demo Does Not Establish

The text parser recognizes the displayed pipe-separated layout only. It supports whole quantities, USD sample prices with two decimal places and a subtotal before tax or freight. Export is a draft for inspection, never a submitted order. All edits stay in page memory; reloading removes them. Approval resets when inputs or review decisions change.

A real implementation would add authenticated intake, per-customer data isolation, reviewer permissions, controlled retention and audited idempotent integration. Any local-model worker must sit behind a protected application boundary. Do not expose an unauthenticated inference port.

Try the [synthetic order review workflow](/tools/order-review-demo), then identify the one business rule or connection that would make such a pilot useful in your organization.
