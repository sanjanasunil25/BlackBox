# Schema — Black Box Game (G4) v2

> ER Diagrams, State Machine, and Flowcharts in Mermaid

---

## 1. Core Data Model

```mermaid
erDiagram
    SESSION {
        string sessionId PK
        string resourceText
        string resourceSummary
        string status
        number totalScore
        Date createdAt
    }

    BLACKBOX_GAME {
        string gameId PK
        string sessionId FK
        string status
        number currentRoundIndex
        number totalRounds
        number totalScore
        Date startedAt
        Date completedAt
    }

    ROUND {
        string roundId PK
        string gameId FK
        number roundNumber
        string concept
        string[] clues
        number cluesRevealed
        boolean hintUsed
        string playerGuess
        boolean isCorrect
        number scoreEarned
    }

    ENV_CONFIG {
        string VITE_GEMINI_API_KEY
        boolean isDemo
    }

    SESSION ||--|| BLACKBOX_GAME : "generates"
    BLACKBOX_GAME ||--|{ ROUND : "has 5 rounds"
    ENV_CONFIG ||--|| BLACKBOX_GAME : "configures"
```

---

## 2. Game State Machine

```mermaid
stateDiagram-v2
    [*] --> START_SCREEN : app loads

    START_SCREEN --> LOADING : user clicks Generate
    LOADING --> ROUND_ACTIVE : Gemini returns 5 rounds
    LOADING --> ERROR : API fails after 2 retries

    ERROR --> LOADING : user clicks Retry

    ROUND_ACTIVE --> ROUND_ACTIVE : Next Clue clicked (clue < 6)
    ROUND_ACTIVE --> ROUND_ACTIVE : Wrong guess + clues remain
    ROUND_ACTIVE --> ROUND_ACTIVE : Hint used
    ROUND_ACTIVE --> ROUND_RESULT_CORRECT : Correct guess
    ROUND_ACTIVE --> ROUND_RESULT_FORFEIT : Wrong guess at clue 6
    ROUND_ACTIVE --> ROUND_RESULT_FORFEIT : Clue 6 shown, no guess
    ROUND_ACTIVE --> EXIT_MODAL : Exit clicked

    EXIT_MODAL --> ROUND_ACTIVE : Keep Playing
    EXIT_MODAL --> FINAL_SUMMARY : Confirm Exit

    ROUND_RESULT_CORRECT --> ROUND_ACTIVE : Next Round (rounds 1-4)
    ROUND_RESULT_CORRECT --> FINAL_SUMMARY : Next Round (round 5)
    ROUND_RESULT_FORFEIT --> ROUND_ACTIVE : Next Round (rounds 1-4)
    ROUND_RESULT_FORFEIT --> FINAL_SUMMARY : Next Round (round 5)

    FINAL_SUMMARY --> START_SCREEN : Play Again
    FINAL_SUMMARY --> [*] : Session ends
```

---

## 3. Gemini API Generation Flow

```mermaid
flowchart TD
    A([User clicks Generate]) --> B{Input type?}
    B -- PDF file --> C[Extract text via PDF.js]
    B -- Pasted text --> D[Use text directly]

    C --> E[Truncate to 4000 chars]
    D --> E

    E --> F[Build Gemini prompt\n5 concepts + 6 clues each]
    F --> G[POST to Gemini API\nwith key in URL]

    G --> H{Response OK?}
    H -- No --> I[Wait 1s backoff]
    I --> J{Retry < 2?}
    J -- Yes --> G
    J -- No --> K[Show Error Screen]

    H -- Yes --> L[Extract text from\ncandidates 0 content parts 0 text]
    L --> M[Strip markdown fences\nand headers]
    M --> N[Find first and last\nbrace to extract JSON]
    N --> O{Valid JSON\nwith 5 rounds?}
    O -- No --> K
    O -- Yes --> P[Store in sessionStorage]
    P --> Q([Show Round 1])
```

---

## 4. Round Gameplay Flowchart

```mermaid
flowchart TD
    A([Round Starts\nclueIndex = 1]) --> B[Show Clue 1\npotentialScore = 1000]

    B --> C{Player action?}

    C -- Submits guess --> D{Correct?}
    C -- Next Clue\nclue < 6 --> E[Reveal next clue\ndrop potential score]
    C -- Hint --> F[Show first letter\n+ word length\n-100 pts]
    C -- Exit --> G[Exit Modal]

    E --> C
    F --> C

    D -- Yes --> H[Calculate score\nbased on clueIndex]
    H --> I[Round Result: Correct]

    D -- No AND clueIndex < 6 --> J[Flash red on input\nallow next clue]
    J --> C

    D -- No AND clueIndex = 6 --> K[Round Result: Forfeit\n0 pts]

    I --> L{Round 5?}
    K --> L

    L -- No --> M([Load Next Round])
    L -- Yes --> N([Final Summary])
```

---

## 5. Scoring Logic

```mermaid
flowchart LR
    A([Correct guess]) --> B{clueIndex?}
    B -- 1 --> C[1000 pts]
    B -- 2 --> D[800 pts]
    B -- 3 --> E[600 pts]
    B -- 4 --> F[400 pts]
    B -- 5 --> G[200 pts]
    B -- 6 --> H[50 pts]
    C & D & E & F & G & H --> I{Hint used?}
    I -- Yes --> J[Subtract 100]
    I -- No --> K[Score unchanged]
    J & K --> L[Add to session total]
    L --> M([Fire onScore callback])
```

---

## 6. TypeScript Type Hierarchy

```mermaid
classDiagram
    class GameConfig {
        +string apiKey
        +boolean isDemo
    }

    class BlackboxGameData {
        +string gameId
        +Round[] rounds
        +string status
        +number totalScore
        +number currentRoundIndex
    }

    class Round {
        +string roundId
        +number roundNumber
        +string concept
        +string[] clues
        +number cluesRevealed
        +boolean hintUsed
        +number scoreEarned
        +boolean isCorrect
    }

    class GeminiRequest {
        +object[] contents
        +object generationConfig
    }

    class GeminiResponse {
        +object[] candidates
    }

    class ScoreEvent {
        +string gameId
        +string roundId
        +number roundScore
        +number sessionTotal
        +number cluesUsed
        +boolean hintUsed
        +boolean isCorrect
    }

    class SessionResult {
        +string gameId
        +number totalScore
        +number roundsPlayed
        +Round[] rounds
        +Date completedAt
    }

    BlackboxGameData "1" --> "5" Round
    GameConfig --> BlackboxGameData
    GeminiResponse --> BlackboxGameData
    BlackboxGameData --> ScoreEvent
    BlackboxGameData --> SessionResult
```

---

## 7. Session Storage Schema

```mermaid
erDiagram
    SESSION_STORAGE {
        string key "game_engine_black_box_{gameId}"
        string value "JSON stringified BlackboxGameData"
    }

    BLACKBOX_GAME_DATA {
        string gameId
        string status
        number currentRoundIndex
        number totalScore
        Round[] rounds
    }

    ROUND_DATA {
        string roundId
        number roundNumber
        string concept
        string[] clues
        number cluesRevealed
        boolean hintUsed
        number scoreEarned
        boolean isCorrect
    }

    SESSION_STORAGE ||--|| BLACKBOX_GAME_DATA : "stores as JSON"
    BLACKBOX_GAME_DATA ||--|{ ROUND_DATA : "contains 5"
```