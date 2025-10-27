# Feature Extraction - Signal Processing Application

A modern Next.js application for wavelet-based signal processing and feature extraction.

## Features

- Upload and process `.lvm` and `.txt` signal files
- Wavelet decomposition with 14 different biorthogonal wavelets
- Interactive visualizations using Plotly.js:
  - Source Signal (Raw/Denoised)
  - Wavelet Coefficients
  - FFT Analysis
  - Time-Frequency Spectrum (STFT)
- Statistical parameter extraction
- CSV download of computed features

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Visualization**: Plotly.js
- **Icons**: Lucide React
- **Backend**: FastAPI (Python) - see `/backend` folder

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Python 3.11+ (for backend)
- Backend API running on port 8000

### Installation

```bash
# Install frontend dependencies
bun install

# Run development server
bun dev
```

### Backend Setup

See `/backend` directory for FastAPI setup instructions.

## Project Structure

```
feature-extraction/
├── app/                # Next.js app directory
│   ├── page.tsx       # Main dashboard page
│   ├── layout.tsx     # Root layout
│   └── globals.css    # Global styles
├── components/         # React components
│   ├── SignalPlot.tsx
│   ├── WaveletPlot.tsx
│   ├── FFTPlot.tsx
│   └── SpectrumPlot.tsx
├── lib/               # Utilities
│   └── api.ts         # API client functions
├── types/             # TypeScript types
│   └── signal.ts      # Signal data interfaces
└── public/            # Static assets
    └── design.png     # Application logo
```

## Deployment

### Frontend (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variable: `NEXT_PUBLIC_API_URL` pointing to your backend

### Backend (Oracle ARM Server)

See `/backend/Dockerfile` and deployment instructions.

## License

MIT
