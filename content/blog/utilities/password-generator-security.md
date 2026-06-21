---
slug: password-generator-security
title: How Strong Is Your Password? Entropy, Crack Time, and How to Generate Safer Ones
description: Learn what makes a password truly strong, understand entropy and crack-time estimates, and generate cryptographically random passwords — all in your browser.
hero: 🔐
category: security
section: utilities
readTime: 6 min read
publishDate: 2026-04-19
tags: ["password generator","password strength","entropy","crack time","security","free tool"]
---
## Why "Password123" Is Gone in 0.001 Seconds

Modern GPU-based password cracking rigs attempt over **1 billion guesses per second**. A simple 8-character lowercase password has around 200 billion combinations — cracked in under 4 minutes. Add uppercase, digits and symbols, and the math changes dramatically.

## What Is Password Entropy?

Entropy (measured in bits) represents how unpredictable a password is. A password drawn from a pool of N characters and L characters long has entropy = L × log₂(N) bits. More bits = more combinations = harder to crack.

- **Under 28 bits** — Very Weak: cracked instantly
- **28–40 bits** — Weak: minutes to hours
- **40–60 bits** — Fair: days to weeks on a consumer GPU
- **60–80 bits** — Strong: years to decades
- **80+ bits** — Very Strong: millions of years

## Generating a Strong Password

Rafiqy's [Password Generator](/tools/password-generator) uses `crypto.getRandomValues()` — your browser's cryptographically secure random number generator, the same standard used by security software. Set your length (6–64 characters) and toggle which character types to include.

A 16-character password using all four character types achieves **95+ bits of entropy** — that's over a million years to crack at 1 billion guesses per second.

## Test Your Own Password

Use the *Test your own password* section to check any password you already use. It runs entirely in your browser — nothing is ever sent to a server. You'll see the entropy score, strength label, and realistic crack-time estimate in real time.

## Quick Rules for Strong Passwords

1. Use at least 16 characters
2. Mix uppercase, lowercase, digits and symbols
3. Never reuse passwords across accounts
4. Use a password manager to remember them

Generate a strong password or test your existing one — 100% private, nothing leaves your browser.

Open Password Generator →
