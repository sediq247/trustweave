# TrustWeave
### Helping important information reach people in ways they can understand.

## The Problem

Information can travel around the world in seconds. But getting people the right information, at the right time, in a way they can understand and trust is still a serious challenge.

During a public-health emergency, natural disaster, or other crisis, people rely on accurate information to make decisions that affect their lives. At the same time, misleading claims, information overload, and uncertainty can make it difficult to know what to believe or what action to take.

This is not just a theoretical concern.

The **World Health Organization (WHO)** describes an *infodemic* as an overabundance of information, including false or misleading information, that can cause confusion, harmful health decisions, and mistrust in health authorities.  
[WHO — Infodemic](https://www.who.int/health-topics/infodemic)

The **United Nations** has also highlighted how misinformation, disinformation, and hate speech threaten information integrity, with consequences for public health, climate action, democracy, peace, security, and humanitarian response. The growing capabilities of AI add another layer of complexity to this challenge.  
[United Nations — Information Integrity](https://www.un.org/en/information-integrity)  
[United Nations — Background on Information Integrity](https://www.un.org/en/information-integrity/background)

During disasters, harmful information can undermine protective actions, disrupt response operations, and erode public trust. The UN Office for Disaster Risk Reduction emphasizes the importance of understanding how people access, interpret, assess, and act on information during a crisis.  
[UNDRR — Harmful Information in Disasters](https://www.undrr.org/publication/documents-and-publications/harmful-information-disasters-risk-communication-safer)

But the problem goes beyond whether a message is factually correct.

A message can be accurate and still fail to reach the people who need it. Language, cultural context, communication preferences, and the way information is presented all influence how people receive a message.

**The challenge is to connect reliable evidence with communication that people can understand and use.**

That is the problem TrustWeave is being built to address.

## What Is TrustWeave?

**TrustWeave is an AI-powered crisis communication platform built for the Qloo Hackathon.**

We are building TrustWeave to help organizations turn reliable information into clear, relevant, and culturally informed public messages.

The platform brings together source-based evidence, AI-assisted analysis, and Qloo’s cultural intelligence. It helps communication teams assess claims against available evidence, explore cultural context, and compare a straightforward message with an alternative shaped by relevant cultural signals.

The idea is simple: important information should remain accurate, but the way it is communicated should consider the people receiving it.

TrustWeave is not designed to replace human judgment. It is designed to help people communicate more effectively while keeping evidence, uncertainty, and review visible throughout the process.

## How TrustWeave Works

TrustWeave brings several parts of the communication process into one workflow.

### 1. Start with a claim

A user submits a claim, identifies the intended audience, and selects the communication objective.

### 2. Examine the evidence

TrustWeave retrieves information from its configured source and assesses the submitted claim within the limits of that evidence.

The current version uses a fixed educational source from the CDC focused on hand hygiene. Claims outside the supported topic are marked as **Not yet verified** rather than being presented as confirmed.

### 3. Explore cultural context with Qloo

When a user provides a cultural reference, TrustWeave uses Qloo's API to resolve the reference and retrieve related entities or taste and genre signals.

These signals can provide optional context for how a message might be presented. They are not used to establish whether a claim is true.

### 4. Generate communication drafts

Google Gemini helps generate two editable drafts:

- A factual baseline message.
- A context-aware alternative informed by the available Qloo signals.

This makes it possible to compare different approaches to communicating the same information.

### 5. Review the output

A separate AI review step examines the generated drafts against the available source. TrustWeave also runs deterministic checks and surfaces review flags.

### 6. Keep people in control

Users can inspect the evidence, compare drafts, review warnings, edit the content, and prepare it for human approval.

TrustWeave does not automatically publish messages or approve them for public use.

## Why Qloo?

Culture influences how people discover, interpret, and engage with information. Yet many communication tools focus primarily on the words being written, without considering the cultural context in which those words may be received.

Qloo gives TrustWeave a way to explore that context.

Through Qloo's API, TrustWeave can resolve a cultural reference—such as an artist, film, book, or podcast—and retrieve related entities or genre signals. These signals can inform optional ideas for how a message might be presented.

This is where Qloo becomes meaningful to the project. It is not simply an API added to an AI application; its cultural intelligence is used to explore a different approach to public communication.

There is an important distinction: **Qloo does not verify facts, determine what a community believes, or establish the preferences of an individual.**

TrustWeave keeps cultural context separate from evidence. Cultural signals are treated as optional, aggregate indicators—not as proof or as a substitute for understanding a community directly.

## Current Use Case

The first version focuses on an educational public-health communication workflow using a configured CDC hand-hygiene source.

A user can submit a claim, review the available source information, and see how TrustWeave approaches the communication task. If a cultural reference is provided, the platform can also generate a Qloo-informed alternative for comparison.

This is an intentionally bounded starting point. The current evidence workflow is not a general-purpose fact-checking service and does not verify every claim on the internet.

The first use case gives us a practical way to explore a broader question:

**How can AI and cultural intelligence help make reliable information more understandable and useful across different audiences?**

## Technology Stack

TrustWeave is built with a modern web stack, with provider integrations handled on the server side.

| Technology | Purpose |
|---|---|
| React 19 | Browser application and user interface |
| Vite 8 | Frontend development and production build |
| Node.js 22+ | Server-side runtime |
| Express 5 | API and production static hosting |
| Zod | Request validation and bounded input sizes |
| Qloo Event API | Entity search and Insights taste analysis |
| Google Gemini Interactions API | Message generation and independent quality review |
| Vitest | Unit tests and mocked HTTP workflow tests |
| MIT License | Open-source licensing |

Runtime versions and API model availability should be checked again during final deployment.

## Project Architecture

The browser application sends a validated request to the Express API. The server coordinates the evidence and AI workflow, then returns the results for the user to review.

```text
User Brief
    |
    v
React + Vite Application
    |
    v
Express API + Zod Validation
    |
    +----> Evidence Retrieval
    |         |
    |         v
    |    Fixed CDC Source
    |         |
    |         v
    |    Claim Assessment
    |
    +----> Qloo API
    |         |
    |         v
    |    Cultural Context
    |
    +----> Gemini API
              |
              v
       Message Generation
              |
              v
       Independent Review
              |
              v
       Deterministic Checks
              |
              v
       Human Review
```

### Data and Privacy

TrustWeave is designed to keep user submissions within the current workflow.

- The server does not store submitted claims or generated drafts.
- Browser state is held in memory.
- Request bodies are size-limited and validated.
- Workflow requests are rate-limited.
- Provider API keys remain on the server.
- The application does not accept arbitrary user-provided evidence URLs.
- The model cannot approve a message for publication.

The Qloo and Gemini integrations are handled server-side so that provider credentials are not exposed to the browser.

## Getting Started

You can run TrustWeave locally using Node.js and npm.

### Prerequisites

Make sure you have:

- [Node.js](https://nodejs.org/) version 22 or newer.
- npm, which is included with Node.js.
- A terminal or command prompt.
- Qloo and Gemini API credentials if you want to run the live provider workflow.

### 1. Clone the repository

```bash
git clone <YOUR_PUBLIC_REPOSITORY_URL>
cd <YOUR_PROJECT_DIRECTORY>
```

Replace the placeholders with your repository URL and project directory.

If you already have the project downloaded, open a terminal in the project folder instead.

### 2. Install dependencies

```bash
npm install
```

This installs the dependencies defined in `package.json`.

### 3. Configure environment variables

Create a local `.env` file from the provided example.

On Linux, macOS, or WSL:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Open `.env` and configure the values:

```env
QLOO_API_KEY=your_qloo_hackathon_key_here
QLOO_BASE_URL=https://hackathon.api.qloo.com
GEMINI_API_KEY=your_google_ai_studio_key_here
GEMINI_MODEL=gemini-3.8-flash
EVIDENCE_MODE=curated
PORT=8787
```

Replace the placeholder values with your actual credentials.

| Variable | Description |
|---|---|
| `QLOO_API_KEY` | Qloo API key issued for the hackathon |
| `QLOO_BASE_URL` | Qloo API origin; defaults to the hackathon API host |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GEMINI_MODEL` | Gemini model used for generation and review |
| `EVIDENCE_MODE` | Evidence configuration; the current workflow uses the curated source |
| `PORT` | Express server port; defaults to `8787` |

**Keep `.env private.** Do not commit API keys or other credentials to GitHub. The repository includes `.env.example` for documenting configuration without exposing secrets.

### 4. Start the development application

Run:

```bash
npm run dev
```

The development script starts the Express API and Vite development server.

Open the frontend in your browser:

```text
http://localhost:5173
```

The API runs at:

```text
http://localhost:8787
```

The API health endpoint is available at:

```text
http://localhost:8787/api/health
```

### 5. Try the workflow

The application provides two distinct ways to run the workflow:

**Run live workflow**

Uses the configured Qloo and Gemini integrations. Both provider credentials must be configured, and the providers must be reachable.

**Try clearly labeled sample**

Uses illustrative cultural cues and local sample copy without calling Qloo or Gemini. The sample workflow still retrieves the configured CDC source, so an internet connection is required.

Sample output is clearly identified and must not be represented as a genuine live provider response.

## Testing the Project

TrustWeave includes unit tests and mocked HTTP workflow tests using Vitest.

Run the test suite:

```bash
npm test
```

Run the project type check:

```bash
npm run typecheck
```

Create a production build:

```bash
npm run build
```

These commands verify different parts of the project:

| Command | What it does |
|---|---|
| `npm test` | Runs the Vitest test suite |
| `npm run typecheck` | Checks the configured JavaScript and TypeScript types |
| `npm run build` | Builds the frontend for production |

The mocked workflow tests do not prove that live Qloo or Gemini requests are successful. Live provider behavior must be verified separately using valid API credentials.

## Running the Production Build

After building the frontend:

```bash
npm run build
```

Start the Express production server:

```bash
npm start
```

The production server uses the configured `PORT` value, which defaults to `8787`.

For an externally hosted deployment, configure the required environment variables in the hosting provider's secret or environment-variable settings. Do not upload the local `.env` file.

## Responsible Use and Limitations

TrustWeave is a communication-support tool. It is not a medical authority, emergency alert system, or general-purpose fact-checking service.

The project is designed around several principles:

- **Evidence comes first.** Cultural context must not change the facts.
- **Uncertainty should be visible.** Unsupported claims are not presented as verified.
- **Cultural signals have limits.** They do not establish individual beliefs or represent an entire community.
- **Human review matters.** Generated messages require review before use.
- **Provider failures remain visible.** Live workflow failures do not silently switch to sample output.
- **Privacy is considered by design.** User claims and drafts are not stored by the server.

The current version is an educational starting point. It does not provide medical advice, diagnose misinformation across the internet, issue emergency alerts, or automatically publish content.

## Our Vision

TrustWeave begins with a focused public-health use case, but the challenge it explores is much broader.

Organizations, public institutions, and communities around the world need ways to communicate important information clearly—especially when people are under pressure, information is changing quickly, or audiences have different cultural contexts.

We want to explore how AI and cultural intelligence can help make that communication more useful without losing sight of evidence, transparency, and human responsibility.

The long-term goal is to help important information travel further—not by changing what is true, but by improving how it reaches people.

**TrustWeave — Weaving evidence, cultural context, and clear communication together.**

## References

The problem TrustWeave explores is documented by international organizations working on public health, information integrity, and disaster risk communication.

1. **World Health Organization (WHO)** — [Infodemic](https://www.who.int/health-topics/infodemic)
2. **United Nations** — [Information Integrity](https://www.un.org/en/information-integrity)
3. **United Nations** — [Background on Information Integrity](https://www.un.org/en/information-integrity/background)
4. **United Nations Office for Disaster Risk Reduction (UNDRR)** — [Harmful Information in Disasters: Risk Communication for Safer Decisions](https://www.undrr.org/publication/documents-and-publications/harmful-information-disasters-risk-communication-safer)
5. **United Nations Office for Disaster Risk Reduction (UNDRR)** — [Risk Communication](https://www.undrr.org/risk-communication)

## License

TrustWeave is released under the MIT License. See the [LICENSE](LICENSE) file for details.