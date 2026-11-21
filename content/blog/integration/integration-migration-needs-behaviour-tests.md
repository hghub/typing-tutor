---
slug: integration-migration-needs-behaviour-tests
title: Integration Migration: Why Converted Code Needs Behaviour Tests
description: Separate conversion coverage from behavioural evidence using fixtures, null handling, unsupported features and explicit compiler and runtime results.
hero: 🧪
category: developer
section: integration
readTime: 6 min read
publishDate: 2026-11-17
tags: ["migration", "integration", "DataWeave", "Ballerina", "contract tests", "synthetic demo"]
---
## A Conversion Report Is A Starting Point

An integration has behaviour as well as syntax. A generated mapping can look plausible yet treat explicit null differently from a missing field. Error handling, retries, ordering, transactions and configuration create further opportunities for a migration to change observable outcomes.

The [Migration Evidence Lab](/tools/migration-evidence-demo) demonstrates one small failure clearly. Its two browser interpreters run against editable synthetic fixtures. DataWeave and Ballerina snippets illustrate the intended mapping; neither language runtime is executed and the target template is not compiled. The lab does not upload or convert a real project.

## Follow The Null-Handling Example

The declared source contract uses defaults for missing or null values. It preserves an empty string, false and zero. That distinction matters: a legitimate zero identifier must not turn into a default just because it is falsy in another language.

Run the customer example with the deliberately incomplete target. The explicit-null fixture fails because the target interpreter handles a missing property but preserves null. Open the failed row and compare expected and actual outputs.

Enable null-aware default handling and run again. The fixture checks now pass. Add a new flat JSON fixture to explore your own synthetic edge case. Editing fixtures or changing the correction clears the report so that an old result is not presented as evidence for new inputs.

These results prove only that the two small interpreters agree on these inputs. They do not establish complete MuleSoft or Ballerina semantics. Source behaviour in a real migration must be captured from an authorized executable baseline or a reviewed specification.

## Keep Different Kinds Of Evidence Separate

| Evidence | What it can support | What it cannot prove alone |
| --- | --- | --- |
| Parser coverage | Which constructs were recognized | Runtime behaviour survived |
| Compiler result | Target code is accepted by a specified compiler | Business results match |
| Contract fixtures | Expected outputs for chosen cases | All possible inputs are equivalent |
| Operational tests | Behaviour under selected faults | Production readiness in every environment |
| Staff review | Known gaps and release decisions | Automatic correctness of future edits |

The operational-gaps example makes this explicit. Even when its browser fixtures pass, custom connector, retry/idempotency and environment configuration work remain listed. A green mapping result must not erase those blockers.

## Reuse Existing Migration Tools

[WSO2's official MuleSoft migration guide](https://wso2.com/integration-platform/docs/integrator/migrate/from-mulesoft) describes migration tooling, generated reports and items needing manual attention. Documentation checked17November2026. Check the actual installed product and tool version before assuming a documented feature is available in a customer's environment.

A specialist workbench should complement appropriate vendor tooling. Its useful role may be inventorying exceptions, preparing reviewed patches, managing test fixtures, comparing runtime evidence and assembling a release pack. Claiming a universal converter without a version and support matrix would hide the difficult work.

## Where A Private Coding Model Could Help

A local coding model could propose a replacement for a narrowly identified unsupported mapping using approved examples. Parsers and templates should handle predictable structures. The proposed patch should then go through compilation, isolated tests and expert review. Caching accepted patterns can avoid repeated generation.

Start with prompting and retrieval; fine-tuning needs a measured reason and authorized training material. Model licensing, quantization, memory, concurrency and review effort all affect the practical result. Lower model charges do not establish lower cost per accepted migration.

The initial paid pilot could cover one source/target version pair, a limited HTTP/JSON flow family and an explicit fixture set. No deployment, secret transfer, payment replay or non-idempotent action should happen through the demonstration. Tests using untrusted generated code would require separate isolated execution with strict network and resource controls.

## Define Success Before The Pilot

For an integration team in Pakistan or internationally, agree the supported flow family, remaining manual work and acceptance tests before discussing a broad platform migration. Record compiler version, test environment, fixture provenance and unresolved differences. Treat a build failure as evidence to investigate rather than a prompt to retry indefinitely.

Try the [synthetic comparison lab](/tools/migration-evidence-demo). A useful first discussion is which failure would be expensive to discover after cutover, and how a bounded test could expose it before release.
