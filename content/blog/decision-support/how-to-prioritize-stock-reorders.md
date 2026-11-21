---
slug: how-to-prioritize-stock-reorders
title: What Should You Reorder First? Stock, Incoming Orders and Supplier Delays
description: Plan stock reorders, avoid duplicate purchasing and check shelf life. Test simple demand forecasts and explore custom ML, AI assistance and POS integration.
hero: 📦
category: business
section: decision-support
readTime: 9 min read
publishDate: 2026-11-16
tags: ["inventory","stock","reorder","bakery","pizza","business","integration"]
---

## A Low Stock Number Does Not Tell You What To Do

A pizza kitchen can have cheese on order and still run out before delivery. A bakery can follow a supplier's minimum order and end up with more cream than it can use before expiry. A retailer can double-order because the person preparing a purchase list never saw the existing purchase order.

The useful question is: which stock issue needs action now, and what action actually helps?

## Put All Quantities In The Same Unit

Choose one stock unit for each item. If flour is recorded in kilograms, expected daily use, commitments, incoming quantities, supplier packs and unit cost must also use kilograms. Do not enter a cost per sack against a quantity in kilograms without converting it first.

Start with on-hand stock, quantities already committed, expected usage, confirmed incoming orders and their delivery dates. Separately collect the lead time for a new order, supplier pack sizes, minimum quantities and any shelf-life constraint. Check when each number was last updated.

## Separate A Quantity Gap From A Timing Gap

Consider a hypothetical retailer with 120 units on hand and 20 already committed. At an expected 20 units per day, the remaining 100 units cover five days. An existing order of 200 units arriving in eight days does not prevent the initial shortage.

Placing another normal order may not solve that timing problem either. The practical options might be an expedited delivery, a permitted branch transfer or a revised service commitment. A manager should decide after checking the evidence.

The [Stock & Replenishment Planner](/tools/stock-planner) shows this as a critical timing issue even when the existing purchase order means no additional quantity is suggested. This helps avoid a second, unnecessary order.

## Make The Calculation Visible

This version uses an explicit steady-usage scenario:

- Available stock is on-hand stock less existing commitments, with a minimum of zero.
- Target stock is expected daily use multiplied by delivery lead time, safety-buffer days and the interval until the next stock review.
- Inventory position adds confirmed incoming stock to available stock.
- A positive difference between target and inventory position is rounded up to supplier pack and minimum-order requirements.

The separate timing check asks whether the existing delivery arrives before available stock runs out. These estimates are only as useful as the inputs. The reorder formula is not itself a sales forecast, an optimal purchasing schedule or a guarantee against shortages. A separate statistical lab can help estimate the daily usage input.

[Oracle's inventory planning documentation](https://docs.oracle.com/cd/A60725_05/html/comnls/us/inv/roplan.htm) explains the established relationship between lead-time demand, safety stock and replenishment decisions. The Rafiqy tool adds a visible review interval, supplier-pack assumptions and the separate timing warning for its simple scenario model.

## Check Whether Supplier Packs Create Waste

Suppose expected use is one litre per day, the product lasts five days after delivery, and the supplier requires a minimum purchase of 24 litres. The minimum order deserves review: expected consumption during shelf life is only five litres.

The tool flags that mismatch rather than calling the order automatically safe. It does not know the expiry dates of current batches or whether the supplier can split deliveries. Those facts need a person or a properly integrated inventory system.

## Start With A Small, Measurable Pilot

Choose a handful of important items. Compare the proposed list with the owner's actual purchasing decision. Record differences, stale stock figures, unexpected demand and supplier delays. Measure missed sales, wasted quantities and time spent preparing orders before making claims about savings.

Use the pizza, bakery or retail sample as a demonstration, then replace it with your own assumptions. The tool runs calculations and a small statistical forecast comparison in page memory and can download a plain-text planning brief. It does not send orders, save inventory records or connect directly to a supplier.

## Test A Forecast Before Turning It Into An Order

The working forecast lab accepts 42–366 consecutive daily quantities for one item at one location. It begins with synthetic data. Enter history in the same unit as the selected stock item, with oldest observations first. Do not replace missing records with zero or mistake an out-of-stock day for a day with no customer demand.

The lab compares three inspectable baselines: repeating the most recent seven-day pattern, taking a recent fourteen-day average, and simple exponential smoothing with a fixed weight of 0.3 on each new observation. It tests each method on eight overlapping historical windows, forecasting seven days from earlier observations at each window. It displays mean absolute error and signed bias, then uses the method with the smallest error for a seven-day forecast.

This is a small comparison, not a statistical guarantee. The windows overlap and are not independent trials. A perfect result on a repeated synthetic pattern does not demonstrate accuracy on real sales. The minimum history enables the demonstration; annual events, unstable demand or long supplier lead times may need substantially different evidence.

You can copy the seven-day forecast average into an item's expected daily usage. The reorder formula still uses that steady average. Check individual days for peaks before purchasing. The lab does not provide a calibrated prediction interval or account for promotions and closures.

The [forecasting toolbox in Forecasting: Principles and Practice](https://otexts.com/fpp3/toolbox.html) describes seasonal benchmarks, error measures and time-series cross-validation. Those practices provide a starting point for testing a more capable implementation.

## What A Customized Forecasting System Could Add

These are implementation options to validate with a business, not enabled features of this browser demo:

| Need | Candidate approach | What needs checking |
| --- | --- | --- |
| Recurring patterns and changing levels | ETS/Holt-Winters or seasonal ARIMA | Relevant seasonal cycles, residual errors and improvement over a seasonal baseline |
| Many days with no sales | Croston-SBA or TSB | Genuine zero demand versus missing or unavailable stock; critical-item service needs |
| Promotions, prices and external drivers | LightGBM or XGBoost with lagged quantities, rolling features and known calendar/event inputs | Only information available at the forecast date; enough representative events and validation by item/branch |
| Many related product/location histories | Pooled ML, neural forecasts or a time-series foundation model such as Chronos | Accuracy, compute, deployment conditions and cost per useful planning result |
| Purchasing under budget, packs and expiry limits | Inventory policies and constrained optimization | Reliable costs, batches, supplier dates, permitted substitutions and manager approval |

[ETS methods](https://otexts.com/fpp3/exponential-smoothing.html) and [seasonal ARIMA](https://otexts.com/fpp3/arima.html) provide statistical candidates. [StatsForecast](https://github.com/Nixtla/statsforecast) includes intermittent-demand methods; [MLForecast](https://nixtlaverse.nixtla.io/mlforecast/docs/getting-started/quick_start_local.html) documents feature-based forecasting workflows. [Chronos](https://github.com/amazon-science/chronos-forecasting) is a time-series model family; it is not equivalent to asking a general chatbot to invent next month's sales.

For a pizza business, a scoped pilot could forecast menu sales and convert them into cheese, dough and box requirements using verified recipes and yields. For a bakery, demand estimates need to meet batch sizes and shelf-life constraints before becoming a preparation list. For a distributor, existing orders, branch stock and supplier pack sizes must be reconciled before raising a new order.

Model complexity is a hypothesis to test. Compare it with simpler methods on future-like periods and on the decision horizon that matters. A lower aggregate error can still conceal harmful mistakes on critical or perishable items. Separately measure actual stockouts, waste, working capital and planning effort during a pilot.

## Where An LLM Assistant Helps

A custom assistant could answer “Why is cream critical?”, look up an approved supplier lead time, extract a proposed delivery date from a message, and prepare an exception summary or supplier-message draft. Forecast and inventory services should supply the numeric evidence. Source records and feature contributions are not automatically proof of causation.

The LLM can call permitted tools and retrieve approved records, then explain their results. It should not invent stock counts, silently alter a forecast or place orders simply because a document tells it to. Tool permissions, record isolation, validation and explicit approvals need to be enforced outside the model.

[Ollama supports tool calling](https://docs.ollama.com/capabilities/tool-calling), which can support a customer-hosted assistant on suitable infrastructure. That does not make inference, maintenance or security free, and it does not establish forecasting accuracy. No Ollama or cloud LLM is connected to this public-tool prototype.

## The Integration Opportunity

A customized implementation could reconcile sales from a POS with stock, reservations and purchase orders in another system, then present a reviewable replenishment list. Before connecting systems, agree item identifiers, units, branch ownership, delivery calendars, approved actions and who can see the records.

Rafiqy's planning brief includes questions to prepare that integration discussion. Direct connectors, enquiry capture and automated purchasing are not enabled in the public-tool prototype. Every purchasing decision remains with the business.

[Try the Stock & Replenishment Planner](/tools/stock-planner).
