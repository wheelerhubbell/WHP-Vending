# WHP Reception Integrity

Version: WHP-RECEPTION-INTEGRITY-v0.1  
Adopted: 2026-09-24

## Governing invariant

**Reception does not mutate the object.**

No actor's interpretation, refusal, acceptance, critique, reliance decision, underwriting decision, AI output, institutional response, counterparty position, or external standard changes the status of a recorded claim merely by being expressed.

A reception may affect state only when it supplies an authorized, evidence-linked event that satisfies the applicable transition rule.

## Universal invariants

### WHP-RI-001 — Source invariance
A source remains what its source artifact establishes. A later description of the source is a new record, not a rewrite of the source.

### WHP-RI-002 — Interpretation separation
An interpretation, acceptance, rejection, critique, reliance decision, or refusal is recorded as a reception event separate from its subject.

### WHP-RI-003 — Authority-bounded force
A reception event has no state-changing force unless the applicable protocol recognizes the actor's authority and the evidence required for that transition.

### WHP-RI-004 — Traceable divergence
Where a receiver's interpretation differs from the canonical claim or omits a recorded limitation, that divergence is recorded explicitly. The divergence does not silently become the canonical claim.

### WHP-RI-005 — Append-only disagreement
Challenges, refusals, corrections, contradictory evidence, reliance conditions, and later determinations are appended to lineage. They do not erase prior provenance or silently overwrite prior states.

## Required separation

WHP systems SHALL distinguish:

1. the source artifact;
2. the evidence-classified record;
3. the bounded determination;
4. the canonical state;
5. the reception event;
6. the external reliance or decision event; and
7. any later authorized state transition.

`Record != Reception != Reliance`.

Each transition between those layers requires its own evidence and authority.

## Reception event minimum record

When a WHP system records an external reception, it SHOULD retain at least:

- reception identifier;
- subject object identifier and digest;
- subject state digest when applicable;
- receiver identity or declared receiver class;
- time received or recorded;
- the interpretation or assertions made;
- standards or requirements invoked;
- decision or response;
- comparison to the canonical record, including unsupported substitutions or omitted limitations when determinable;
- whether the actor possesses recognized state-changing authority;
- the applicable transition type, if any;
- evidence supplied with the reception;
- resulting effect on the underlying object and state.

Default effect:

```text
objectMutated: false
stateMutated: false
externalDecisionRecorded: true
```

## Unknowns

Declared unknowns remain unknowns. They are not silently promoted into favorable facts, adverse facts, omissions, or failures.

## Legal and factual events

This invariant does not make a WHP record immune from reality or law. A payment, executed assignment, amendment, court order, authenticated counterparty act, contradictory evidence, or other legally or factually operative event may require a new state when the applicable transition conditions are met.

Such an event creates or supports a new state. It does not retroactively alter the provenance of the earlier record.

## Reception lineage

WHP systems MAY maintain two related but distinct histories:

- **Object lineage:** what happened to the object.
- **Reception lineage:** what actors believed, asserted, rejected, accepted, relied upon, misunderstood, required, or declined concerning the object.

The two histories interact only through an event carrying the authority and evidence required by the applicable transition rule.

## Scope

This invariant applies across WHP protocols, evaluators, standing systems, vending systems, dossiers, receipts, offers, APIs, schemas, verifier outputs, audit records, and future WHP machine-readable artifacts unless a later canonical protocol version explicitly supersedes it.
