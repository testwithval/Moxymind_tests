# Moxymind tests — Sauce Demo and ReqRes

Playwright + TypeScript automation for [Sauce Demo](https://www.saucedemo.com/) UI flows and the [ReqRes](https://reqres.in/) REST API.

This repo covers the main shop journey: **login**, **blocked account**, **add to cart**, and **checkout**.

It also covers the Moxymind API task: **GET — List Users** and **POST — Create a User**.

The suite contains **7 automated tests**: 4 UI tests and 3 API tests.

## Test cases

| # | What it checks | Why this is essential |
|---|----------------|------------------------|
| **TC1** | `standard_user` logs in and sees the product catalog | Login is the gateway. Inventory, cart, and checkout are behind authentication. If a valid customer cannot sign in, nothing else in the shop works. |
| **TC2** | `locked_out_user` is refused and sees an error | Suspended accounts must stay out, and the UI must explain why. A silent failure (or letting a locked user in) is a security and support problem. |
| **TC3** | Adding a backpack updates the cart badge **and** the cart page | Add-to-cart is the core shopping action. Badge and cart contents must match, or customers lose trust and may pay for the wrong items. |
| **TC4** | Full checkout: cart → details → overview → confirmation | Checkout is the revenue path. If any step drops the item or fails to confirm, the shop cannot complete a purchase. |

Specs live in `tests/ui/` and `tests/api/` and repeat the “why essential” rationale above each test.

## Prerequisites

- Node.js **22** (or 20+)
- npm
- Network access to `https://www.saucedemo.com/`

UI tests launch the Chromium build Playwright downloads. If that binary is not on disk yet, the run falls back to a locally installed Google Chrome, so `npm test` does not stop only because the download service timed out.

## Run locally

```bash
git clone https://github.com/testwithval/Moxymind_tests.git
cd Moxymind_tests
npm install
npx playwright install chromium
npm test
```

That is the command-line demo: all UI and API tests. UI tests run in visible Playwright Chromium locally; API tests run without a browser. CI runs the suite headless.

### Other useful commands

| Command | What it does |
|---------|----------------|
| `npm test` | Run the suite with visible Playwright Chromium locally |
| `npx playwright test --headed` | Watch the browser |
| `npx playwright test tests/ui` | Run only the UI tests |
| `npx playwright test tests/api` | Run only the ReqRes API tests |
| `npx playwright test tests/ui/01-login.spec.ts` | Run one UI file |
| `npx playwright test tests/api/04-api.spec.ts` | Run one API file |
| `npx playwright test --ui` | Playwright UI mode |
| `npx playwright show-report` | Open the last HTML report |
| `npm run typecheck` | TypeScript check only |

HTML report is written to `playwright-report/` after each run.

## API scenarios

| Scenario | Assertions |
|----------|------------|
| `GET /api/users?page=1&per_page=12` | Status `200`, `total`, first two `last_name` values, `data.length === total`, and response data types |
| `POST /api/users` | Data-driven requests from `src/data/api-test-data.ts`, status `201`, response time under the configured `6,500 ms` limit, echoed `name` and `job`, plus generated `id` and `createdAt` |

## Demo credentials

These are **public** Sauce Labs demo accounts (also listed on the login page). They are not secrets.

| Username | Password | Used in |
|----------|----------|---------|
| `standard_user` | `secret_sauce` | TC1, TC3, TC4 |
| `locked_out_user` | `secret_sauce` | TC2 |

## Project structure

```
├── playwright.config.ts      # baseURL, data-test locators, Chromium
├── src/
│   ├── data/test-data.ts     # users, product, checkout details
│   ├── data/api-test-data.ts  # data-driven API payloads and response-time limit
│   ├── fixtures/saucedemo.ts # page-object fixtures
│   └── pages/                # Page Object Model
│       ├── login.page.ts
│       ├── inventory.page.ts
│       ├── cart.page.ts
│       └── checkout.page.ts
└── tests/
    ├── ui/
    │   ├── 01-login.spec.ts      # TC1 + TC2
    │   ├── 02-cart.spec.ts       # TC3
    │   └── 03-checkout.spec.ts   # TC4
    └── api/
        └── 04-api.spec.ts        # GET list users + POST create user
```

Locators use Sauce Demo’s `data-test` attributes (`testIdAttribute: 'data-test'` in Playwright), not CSS class names.

## CI

GitHub Actions (`.github/workflows/playwright.yml`) runs `npm test` on every push to `main` and on pull requests.
