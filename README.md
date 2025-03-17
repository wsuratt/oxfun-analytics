# Cryptocurrency Analytics Dashboard

A React-based web application that visualizes comprehensive analytics for various cryptocurrencies. The application fetches data from the OxFun Data Server API and displays it in multiple interactive charts, providing insights into open interest, price movements, and funding rates.

## Features

- Search and select from 290+ cryptocurrency trading pairs
- Multiple interactive charts showing:
  - Open interest data
  - Market price and index price comparison
  - Funding rate analysis
- 5-minute interval data for real-time monitoring
- Responsive design that works on desktop and mobile devices
- Detailed tooltips with precise timestamp and value information

## API Endpoints

The application uses the following API endpoints:

- `https://oxfun-data-server-production.up.railway.app/api/coins` - Retrieves the list of available cryptocurrency symbols
- `https://oxfun-data-server-production.up.railway.app/api/coins/:coin` - Retrieves 5-minute interval analytics data (open interest, market price, index price, and funding rate) for a specific cryptocurrency

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view the application in your browser

## Dependencies

- React - JavaScript library for building user interfaces
- Axios - Promise-based HTTP client for making API requests
- Recharts - Composable charting library built on React components
- React-Select - Flexible and customizable select input control

## Usage

1. When the application loads, you'll see a search bar at the top of the page
2. Type or select a cryptocurrency symbol from the dropdown menu
3. Once a cryptocurrency is selected, the application will fetch and display its hourly open interest data
4. Hover over the chart to see detailed information for specific data points

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.
