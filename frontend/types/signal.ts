export interface SignalData {
  time: number[];
  raw_signal: number[];
  denoised_signal: number[];
  wavelet_coeffs: {
    approximation: number[];
    detail: number[][];
  };
  statistics: StatisticsData;
  filename: string;
}

export interface StatisticsData {
  Mean: number;
  Median: number;
  Mode: number;
  "Std Dev": number;
  Variance: number;
  "Mean Square": number;
  RMS: number;
  Max: number;
  "Peak-to-Peak": number;
  "Peak-to-RMS": number;
  Skewness: number;
  Kurtosis: number;
  Energy: number;
  Power: number;
  "Crest Factor": number;
  "Impulse Factor": number;
  "Shape Factor": number;
  "Shannon Entropy": number;
  "Signal-to-Noise Ratio": number;
  "Root Mean Square Error": number;
  "Maximum Error": number;
  "Mean Absolute Error": number;
  "Peak Signal-to-Noise Ratio": number;
  "Coefficient of Variation": number;
}

export interface UploadResponse {
  filename: string;
  columns: number;
  rows: number;
  status: string;
}

export interface ProcessingParams {
  time_column: number;
  signal_column: number;
  wavelet_type: string;
  n_levels: number;
}

