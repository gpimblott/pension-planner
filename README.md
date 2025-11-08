# Simple Pension Planner

This project is a simple pension planner application built with Next.js. It allows users to input their current age, retirement age, current pension pot, monthly contributions (personal and employer), expected annual return, and details of multiple pensions (including state pension). The application then projects the pension pot value over time, visualizes it in a graph, and provides key metrics like projected retirement pot value, age when funds run out, and overall outcome (shortfall/surplus).

User-entered details are stored in a cookie to persist data across sessions.

## Features

-   **Personalized Projections:** Input various financial details to get a tailored pension projection.
-   **Multiple Pensions:** Add and manage multiple pension sources, including the state pension.
-   **Interactive Graph:** Visualize your pension pot's growth, contributions, withdrawals, and pension income over time.
-   **Key Metrics:** See important figures like projected retirement pot value, fund duration, and potential shortfalls or surpluses.
-   **Persistent Data:** User inputs are saved in a cookie, so your data is available when you return.
-   **Reset Functionality:** Easily clear all saved data and reset the form to default values.

## Getting Started

To run the project locally, follow these steps:

### Prerequisites

Make sure you have Node.js and npm (or yarn, pnpm, bun) installed on your machine.

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/pension-planner.git
    cd pension-planner
    ```
2.  Install the dependencies:
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    # or
    bun install
    ```

### Running the Development Server

To start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The page will hot-reload as you make changes.

### Building for Production

To build the application for production:

```bash
npm run build
# or
yarn build
# or
pnpm build
# or
bun build
```

This command compiles the application into an optimized build.

### Starting the Production Server

To start the production server after building:

```bash
npm run start
# or
yarn start
# or
pnpm start
# or
bun start
```