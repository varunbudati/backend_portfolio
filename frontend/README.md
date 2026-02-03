# WebsiteV2 - Portfolio

A modern, interactive portfolio website built with Next.js 16, featuring an embedded ShadeFinder geospatial application for urban shadow mapping.

## Features

- **Interactive Portfolio**: Showcase of projects including ShadeFinder, trading algorithms, and financial tools
- **ShadeFinder Integration**: Real-time building shadow visualization using Mapbox and geospatial data
- **Live Stock Ticker**: Real-time market data (S&P 500, NASDAQ, VIX, Bitcoin, Ethereum) via yfinance
- **Gallery**: Expandable photo gallery with 25+ cat photos and 8 event photos
- **Responsive Design**: Beautiful animations and smooth transitions with Framer Motion
- **Contact Modal**: Easy way to reach out with email copy functionality

### Frontend
- **Next.js 16.1.1** with Turbopack
- **React 18** with TypeScript
- **Framer Motion** for animations
- **Mapbox GL** for geospatial visualization

### Backend
- **FastAPI** (Python)
- **yfinance** for stock data
- **OSMnx**, **Pysolar**, **Shapely** for geospatial processing
- **OpenWeatherMap API** for weather data


## 📁 Structure

- `app/` - Next.js pages and layouts
- `app/shadefinder/` - ShadeFinder embedded application
- `components/` - React components
- `public/images/` - Portfolio images and gallery photos

