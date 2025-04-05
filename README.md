# Advanced Stock Tracker with AI Predictions

A modern, responsive web application for tracking stock prices and performance in real-time, enhanced with AI-powered prediction models. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 📊 Real-time stock quotes and data
- 📈 Interactive charts with customizable time ranges
- 🔍 Powerful stock search functionality
- 📱 Responsive design (mobile, tablet, desktop)
- 🔄 Automatic refresh of stock data at customizable intervals
- 💾 Persistent watchlist saved to local storage
- ✨ Smooth animations and transitions
- 🤖 AI-powered stock price predictions and analysis:
  - Technical analysis with statistical models
  - Large Language Model (LLM) market analysis
  - Support and resistance level identification
  - Trend detection and confidence scoring

## AI Prediction Features

The application offers advanced stock prediction capabilities using two complementary approaches:

### 1. Statistical Prediction Model

Our statistical model combines several technical analysis techniques:
- Time series analysis with ARIMA-inspired methods
- Moving averages (simple and exponential)
- Support and resistance level detection
- Trend analysis and confidence scoring

This model provides forecasts for the next day and next week along with visualizations comparing historical predictions with actual prices.

### 2. LLM-Based Market Analysis

The LLM-powered analysis leverages either Hugging Face's Mixtral model or OpenAI's GPT models to provide:
- Market sentiment analysis (bullish, bearish, neutral)
- Key factors influencing the stock's performance
- Price targets for short-term horizons
- Risk assessment and suggested actions (buy, sell, hold, watch)
- Detailed rationale for predictions

This approach combines the power of large language models with historical price data to provide context-aware analysis.

## Getting Started

### Prerequisites

- Node.js 16.8.0 or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd stock-tracker
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with your API keys:
```
# Optional - Only needed if you want real data instead of mock data
NEXT_PUBLIC_YAHOO_FINANCE_API_KEY=your_yahoo_finance_key_here

# Choose ONE of the following for AI predictions
NEXT_PUBLIC_HUGGINGFACE_API_KEY=your_huggingface_key_here
# or
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
```

### Development

Run the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Build for Production

```bash
npm run build
npm start
# or
yarn build
yarn start
```

### Deploying to GitHub Pages

1. Create a GitHub repository for your project

2. Connect your local repository to GitHub:
```bash
git remote add origin https://github.com/yourusername/your-repo-name.git
```

3. Push your code to GitHub:
```bash
git push -u origin main
```

4. Set up GitHub Pages in your repository settings:
   - Go to your repository on GitHub
   - Click on "Settings"
   - Navigate to "Pages" in the sidebar
   - Select "GitHub Actions" as the source
   - Use the Next.js GitHub Pages workflow

5. Create a `.github/workflows/nextjs.yml` file with the Next.js deployment configuration

## Technologies Used

- **Next.js**: React framework for server-side rendering and static site generation
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Composable charting library
- **Framer Motion**: Animation library
- **React Query**: Data fetching and state management
- **Axios**: HTTP client
- **date-fns**: Date manipulation library
- **Alpha Vantage API**: Stock market data provider
- **Hugging Face API**: Large language model provider for AI analysis (Mixtral)
- **OpenAI API** (optional): Alternative large language model provider

## Project Structure

```
stock-tracker/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── page.tsx      # Main page component
│   │   └── layout.tsx    # Root layout
│   ├── components/       # Reusable React components
│   │   ├── StockSearch.tsx
│   │   ├── StockQuote.tsx
│   │   ├── StockChart.tsx
│   │   ├── WatchList.tsx
│   │   ├── StockPrediction.tsx
│   │   ├── LLMStockAnalysis.tsx
│   │   └── PredictionTabs.tsx
│   ├── lib/              # Utility functions
│   │   ├── api.ts        # API functions for stock data
│   │   ├── prediction.ts # Statistical prediction model
│   │   └── llm-prediction.ts # LLM-based prediction
│   └── styles/           # Global styles
│       └── globals.css   # Global CSS with Tailwind
├── public/              # Static assets
├── .env.local           # Environment variables (create this file)
├── next.config.js       # Next.js configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Project dependencies
```

## Limitations and Disclaimers

- The free tier of the Alpha Vantage API has rate limits (5 API requests per minute and 500 requests per day)
- Hugging Face API has a free tier with its own rate limits
- OpenAI API usage incurs costs based on your usage (if you choose to use it)
- AI predictions are for informational purposes only and should not be considered as financial advice
- Stock market investments involve risk, and past performance is not indicative of future results
- The prediction models have limitations and may not account for unexpected market events

## License

This project is licensed under the MIT License.

## Acknowledgements

- [Alpha Vantage](https://www.alphavantage.co/) for providing the stock market data API
- [Hugging Face](https://huggingface.co/) for the Mixtral LLM API
- [OpenAI](https://openai.com/) (optional) for the GPT LLM API
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Next.js](https://nextjs.org/) for the React framework 