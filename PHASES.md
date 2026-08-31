```text
Farm simulator
      ↓
Sample farm data
      ↓
Anomaly detection
      ↓
Strands agent
      ↓
Tools
```

The one part that may incur AWS usage is **calling Amazon Bedrock**, because you're using an actual model. We can keep those calls minimal while developing.

### I would build it in this order

**Phase 1 — Farm simulator**

Create fake sensor data:

```text
Temperature: 28°C
Water: 81 L
Feed: 42 kg
Eggs: 410
```

and deliberately create anomalies.

**Phase 2 — FarmWatch logic**

Build the deterministic code that calculates:

```text
Expected water: 81 L
Current water: 43 L
Deviation: -47%
→ anomaly
```

**Phase 3 — Agentic Investigation (Strands Agent)**

Goal: Investigate abnormal farm conditions and determine whether human intervention is required.

Give the agent the data and tools and have it investigate:

For example:

```
getCurrentFarmData()
checkForAnomalies()
getHistoricalData()
getWeather()
getRelatedMetrics()
getRecentFarmEvents()
```

Now the agent can decide what to investigate.

For the water scenario:

```
New readings
     ↓
Agent
     ↓
checkForAnomalies()
     ↓
Water consumption abnormal
     ↓
Agent decides:
"I need historical context."
     ↓
getHistoricalData()
     ↓
Agent decides:
"I should check environmental conditions."
     ↓
getWeather()
     ↓
Agent decides:
"I should check whether other farm
metrics changed."
     ↓
getRelatedMetrics()
```

That's the part that demonstrates agentic behavior.

**Phase 4 — Recommendation**

Now the agent takes everything it discovered and produces something structured.

e.g

```json
{
  "finding": "Abnormally low water consumption",
  "likely_cause": "Possible water-system failure",
  "confidence": 0.87,
  "severity": "high",
  "recommended_action": "Inspect House 2 water lines",
  "requires_approval": true
}
```

**Phase 5 — Human approval**

```text
┌─────────────────────────────────────┐
│ ⚠️ FarmWatch Recommendation         │
│                                     │
│ House 2 water consumption is        │
│ 46% below its normal pattern.       │
│                                     │
│ Investigation suggests a possible   │
│ water-system issue.                 │
│                                     │
│ Confidence: 87%                     │
│                                     │
│ Recommended action:                 │
│ Inspect House 2 water lines         │
│                                     │
│ [ APPROVE ]       [ DISMISS ]       │
└─────────────────────────────────────┘
```

Then

```
APPROVE
   ↓
createInspectionTask()
   ↓
Task created
```
