# ShopReach CRM - Campaign Builder Frontend

A premium, responsive, and animated Single-Page Application (SPA) dashboard built with **Next.js**, **React**, and **Tailwind CSS**. It serves as the customer management and campaign strategist portal for ShopReach AI.

## 🚀 Key Features

* **📊 Interactive Dashboard**: Visualizes global analytics metrics, including total customer base, revenue recovery stats, conversion rates, and live campaign tables.
* **🤖 AI Copilot Strategic Planner**: Natural language chat interface powered by the Gemini model. Strategizes campaigns and auto-drafts message copies on the fly.
* **👥 Customer Directory**: Full search-enabled directory to view, filter, and add customer profiles directly to the CRM database.
* **⚙️ Campaigns Builder**: A 5-step checkout-style campaign creator (Audience Selection ➔ Channel Configuration ➔ Message Copywriting with merge tags ➔ Send Scheduling ➔ Launch).
* **📈 Funnel Analytics**: Dynamic visualizations of the message conversion funnel (Sent ➔ Delivered ➔ Opened ➔ Clicked ➔ Converted) and active campaign trends.
* **⚡ Live Activity Feed**: Polls and animates live event actions (message delivery, opens, clicks, order receipts) in real-time.

## 🛠️ Technology Stack

* **Framework**: Next.js 14+ (App Router)
* **Styling**: Vanilla CSS, Tailwind CSS, Tailwind CSS custom variables
* **Animations**: Framer Motion (premium micro-interactions, spring transitions, page entries)
* **Charts**: Recharts (fully responsive SVG charts)
* **Icons**: Lucide React
* **AI Integration**: Vercel AI SDK (`useChat` custom stream parser)

## 📦 Getting Started

### Prerequisites
Make sure you have Node.js and a package manager installed (npm, yarn, or **pnpm**).

### Installation
1. Navigate into the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   pnpm install
   ```

### Running Locally
Start the Next.js development server:
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

> [!NOTE]
> The frontend proxies all API calls starting with `/api` to the Laravel backend (running at `http://127.0.0.1:8000`). Make sure your backend service is running simultaneously.
