'use client';

import { useState, useEffect } from 'react';
import { Upload, Download } from 'lucide-react';
import { uploadFile, processSignal, downloadCSV, getSignalPlot, getFFTPlot, getWaveletPlot, getSpectrumPlot } from '@/lib/api';
import { SignalData } from '@/types/signal';
import ServerPlot from '@/components/ServerPlot';

const waveletOptions = [
  'bior1.3', 'bior1.5', 'bior2.2', 'bior2.4', 
  'bior2.6', 'bior3.1', 'bior3.3', 'bior3.5', 
  'bior3.7', 'bior3.9', 'bior4.4', 'bior5.5', 'bior6.8'
];

export default function Home() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [signalData, setSignalData] = useState<SignalData | null>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Server-generated plot data
  const [signalPlotData, setSignalPlotData] = useState<any>(null);
  const [waveletPlotData, setWaveletPlotData] = useState<any>(null);
  const [fftPlotData, setFFTPlotData] = useState<any>(null);
  const [spectrumPlotData, setSpectrumPlotData] = useState<any>(null);
  const [plotLoading, setPlotLoading] = useState({
    signal: false,
    wavelet: false,
    fft: false,
    spectrum: false
  });
  
  // Processing parameters
  const [timeColumn, setTimeColumn] = useState(0);
  const [signalColumn, setSignalColumn] = useState(1);
  const [waveletType, setWaveletType] = useState('bior2.4');
  const [nLevels, setNLevels] = useState(7);
  
  // Visualization options
  const [sourceSignal, setSourceSignal] = useState<'raw' | 'denoised'>('raw');
  const [waveletOption, setWaveletOption] = useState<'approx' | 'detail' | 'pearson_approx' | 'pearson_detail'>('approx');
  const [fftOption, setFftOption] = useState<'raw' | 'denoised' | 'approx' | 'detail'>('raw');
  const [spectrumOption, setSpectrumOption] = useState<'raw' | 'denoised'>('raw');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    setError(null);
    
    try {
      for (const file of Array.from(files)) {
        await uploadFile(file);
        setUploadedFiles(prev => [...prev, file]);
      }
      if (files.length > 0 && !selectedFile) {
        setSelectedFile(files[0].name);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const handleProcess = async () => {
    const file = uploadedFiles.find(f => f.name === selectedFile);
    if (!file) return;

    setLoading(true);
    setError(null);
    
    try {
      // Get statistics from old endpoint
      const data = await processSignal(file, {
        time_column: timeColumn,
        signal_column: signalColumn,
        wavelet_type: waveletType,
        n_levels: nLevels
      });
      
      setSignalData(data);
      setStatistics(data.statistics);
      
      // Fetch all plots from server (with ALL data points!)
      loadAllPlots(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed');
    } finally {
      setLoading(false);
    }
  };

  const loadAllPlots = async (file: File) => {
    const params = {
      time_column: timeColumn,
      signal_column: signalColumn,
      wavelet_type: waveletType,
      n_levels: nLevels
    };

    // Load signal plot
    setPlotLoading(prev => ({ ...prev, signal: true }));
    try {
      const signalPlot = await getSignalPlot(file, { ...params, signal_type: sourceSignal });
      setSignalPlotData(signalPlot);
    } catch (err) {
      console.error('Signal plot error:', err);
    } finally {
      setPlotLoading(prev => ({ ...prev, signal: false }));
    }

    // Load wavelet plot
    setPlotLoading(prev => ({ ...prev, wavelet: true }));
    try {
      const waveletPlot = await getWaveletPlot(file, { ...params, wavelet_option: waveletOption });
      setWaveletPlotData(waveletPlot);
    } catch (err) {
      console.error('Wavelet plot error:', err);
    } finally {
      setPlotLoading(prev => ({ ...prev, wavelet: false }));
    }

    // Load FFT plot
    setPlotLoading(prev => ({ ...prev, fft: true }));
    try {
      const fftPlot = await getFFTPlot(file, { ...params, fft_type: fftOption });
      setFFTPlotData(fftPlot);
    } catch (err) {
      console.error('FFT plot error:', err);
    } finally {
      setPlotLoading(prev => ({ ...prev, fft: false }));
    }

    // Load spectrum plot
    setPlotLoading(prev => ({ ...prev, spectrum: true }));
    try {
      const spectrumPlot = await getSpectrumPlot(file, { ...params, spectrum_type: spectrumOption });
      setSpectrumPlotData(spectrumPlot);
    } catch (err) {
      console.error('Spectrum plot error:', err);
    } finally {
      setPlotLoading(prev => ({ ...prev, spectrum: false }));
    }
  };

  const handleDownloadStats = () => {
    if (signalData?.statistics) {
      downloadCSV(signalData.statistics, signalData.filename);
    }
  };

  const handleClearFiles = () => {
    setUploadedFiles([]);
    setSelectedFile(null);
    setSignalData(null);
  };

  const getColumnOptions = (columns: number) => {
    return Array.from({ length: columns }, (_, i) => `Column ${i + 1}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-transparent bg-clip-text">
              <h1 className="text-6xl font-bold font-[var(--font-space-grotesk)] tracking-tight">
                Feature Extraction
              </h1>
            </span>
          </div>
          <p className="text-xl text-gray-700 font-medium mb-2">Digital Signal Processing Platform</p>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Advanced wavelet-based signal analysis with real-time visualization and feature extraction capabilities
          </p>
        </div>

        {/* File Upload */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 mb-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold font-[var(--font-space-grotesk)] flex items-center gap-3 text-gray-800">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <Upload className="w-6 h-6 text-white" />
              </div>
              File Upload
            </h2>
            {uploadedFiles.length > 0 && (
              <button
                onClick={handleClearFiles}
                className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="mb-6">
            <label className="flex items-center justify-center w-full px-6 py-8 border-2 border-dashed border-indigo-300 rounded-xl cursor-pointer bg-gradient-to-br from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-all duration-200 group">
              <div className="text-center">
                <Upload className="w-12 h-12 mx-auto mb-3 text-indigo-500 group-hover:text-indigo-600 transition-colors" />
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">LVM or TXT files</p>
              </div>
              <input
                type="file"
                accept=".lvm,.txt"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-3 text-gray-700">
                Select File:
              </label>
              <select
                value={selectedFile || ''}
                onChange={(e) => setSelectedFile(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-200 bg-white font-medium"
              >
                {uploadedFiles.map((file) => (
                  <option key={file.name} value={file.name}>
                    {file.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
              <p className="font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Processing Controls */}
        {uploadedFiles.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 mb-8 hover:shadow-2xl transition-all duration-300">
            <h2 className="text-2xl font-bold font-[var(--font-space-grotesk)] mb-6 text-gray-800 flex items-center gap-2">
              <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
              Processing Parameters
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Time Column</label>
                <select
                  value={timeColumn}
                  onChange={(e) => setTimeColumn(Number(e.target.value))}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-200 bg-white font-medium"
                >
                  {getColumnOptions(10).map((col, i) => (
                    <option key={i} value={i}>{col}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Signal Column</label>
                <select
                  value={signalColumn}
                  onChange={(e) => setSignalColumn(Number(e.target.value))}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-200 bg-white font-medium"
                >
                  {getColumnOptions(10).map((col, i) => (
                    <option key={i} value={i}>{col}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-6 space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Wavelet Type
              </label>
              <select
                value={waveletType}
                onChange={(e) => setWaveletType(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-200 bg-white font-medium"
              >
                {waveletOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="mb-6 space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-gray-700">
                  Decomposition Levels
                </label>
                <span className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold rounded-xl shadow-lg">
                  {nLevels}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={nLevels}
                onChange={(e) => setNLevels(Number(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${((nLevels - 1) / 19) * 100}%, #e5e7eb ${((nLevels - 1) / 19) * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 font-medium">
                <span>1</span>
                <span>20</span>
              </div>
            </div>

            <button
              onClick={handleProcess}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-4 rounded-xl hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-200 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : 'Process Signal'}
            </button>
          </div>
        )}

        {/* Results */}
        {signalData && (
          <>
            {/* Source Signal Visualization */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 mb-8 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-[var(--font-space-grotesk)] text-gray-800 flex items-center gap-2">
                  <div className="w-2 h-8 bg-gradient-to-b from-teal-500 to-emerald-600 rounded-full"></div>
                  Source Signal
                </h2>
                <select
                  value={sourceSignal}
                  onChange={(e) => {
                    const newType = e.target.value as 'raw' | 'denoised';
                    setSourceSignal(newType);
                    // Reload signal plot with new type
                    const file = uploadedFiles.find(f => f.name === selectedFile);
                    if (file) {
                      setPlotLoading(prev => ({ ...prev, signal: true }));
                      getSignalPlot(file, {
                        time_column: timeColumn,
                        signal_column: signalColumn,
                        wavelet_type: waveletType,
                        n_levels: nLevels,
                        signal_type: newType
                      }).then(setSignalPlotData)
                        .finally(() => setPlotLoading(prev => ({ ...prev, signal: false })));
                    }
                  }}
                  className="p-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all duration-200 bg-white font-medium"
                >
                  <option value="raw">Raw Signal</option>
                  <option value="denoised">Denoised Signal</option>
                </select>
              </div>
              <ServerPlot plotData={signalPlotData} loading={plotLoading.signal} />
            </div>

            {/* Wavelet Denoising */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 mb-8 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-[var(--font-space-grotesk)] text-gray-800 flex items-center gap-2">
                  <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-cyan-600 rounded-full"></div>
                  Wavelet Denoising
                </h2>
                <select
                  value={waveletOption}
                  onChange={(e) => {
                    const newOption = e.target.value as typeof waveletOption;
                    setWaveletOption(newOption);
                    const file = uploadedFiles.find(f => f.name === selectedFile);
                    if (file) {
                      setPlotLoading(prev => ({ ...prev, wavelet: true }));
                      getWaveletPlot(file, {
                        time_column: timeColumn,
                        signal_column: signalColumn,
                        wavelet_type: waveletType,
                        n_levels: nLevels,
                        wavelet_option: newOption
                      }).then(setWaveletPlotData)
                        .finally(() => setPlotLoading(prev => ({ ...prev, wavelet: false })));
                    }
                  }}
                  className="p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 bg-white font-medium"
                >
                  <option value="approx">Approximate Coefficients</option>
                  <option value="detail">Detailed Coefficients</option>
                  <option value="pearson_approx">Pearson CC (Approximate)</option>
                  <option value="pearson_detail">Pearson CC (Detailed)</option>
                </select>
              </div>
              <ServerPlot plotData={waveletPlotData} loading={plotLoading.wavelet} />
            </div>

            {/* FFT */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 mb-8 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-[var(--font-space-grotesk)] text-gray-800 flex items-center gap-2">
                  <div className="w-2 h-8 bg-gradient-to-b from-violet-500 to-fuchsia-600 rounded-full"></div>
                  FFT of Signals
                </h2>
                <select
                  value={fftOption}
                  onChange={(e) => {
                    const newOption = e.target.value as typeof fftOption;
                    setFftOption(newOption);
                    const file = uploadedFiles.find(f => f.name === selectedFile);
                    if (file) {
                      setPlotLoading(prev => ({ ...prev, fft: true }));
                      getFFTPlot(file, {
                        time_column: timeColumn,
                        signal_column: signalColumn,
                        wavelet_type: waveletType,
                        n_levels: nLevels,
                        fft_type: newOption
                      }).then(setFFTPlotData)
                        .finally(() => setPlotLoading(prev => ({ ...prev, fft: false })));
                    }
                  }}
                  className="p-3 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all duration-200 bg-white font-medium"
                >
                  <option value="raw">FFT of Raw Signal</option>
                  <option value="denoised">FFT of Denoised Signal</option>
                  <option value="approx">FFT of Approx Coefficients</option>
                  <option value="detail">FFT of Detail Coefficients</option>
                </select>
              </div>
              <ServerPlot plotData={fftPlotData} loading={plotLoading.fft} />
            </div>

            {/* Spectrum */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 mb-8 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-[var(--font-space-grotesk)] text-gray-800 flex items-center gap-2">
                  <div className="w-2 h-8 bg-gradient-to-b from-amber-500 to-orange-600 rounded-full"></div>
                  Time-Frequency Spectrum
                </h2>
                <select
                  value={spectrumOption}
                  onChange={(e) => {
                    const newOption = e.target.value as 'raw' | 'denoised';
                    setSpectrumOption(newOption);
                    const file = uploadedFiles.find(f => f.name === selectedFile);
                    if (file) {
                      setPlotLoading(prev => ({ ...prev, spectrum: true }));
                      getSpectrumPlot(file, {
                        time_column: timeColumn,
                        signal_column: signalColumn,
                        wavelet_type: waveletType,
                        n_levels: nLevels,
                        spectrum_type: newOption
                      }).then(setSpectrumPlotData)
                        .finally(() => setPlotLoading(prev => ({ ...prev, spectrum: false })));
                    }
                  }}
                  className="p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all duration-200 bg-white font-medium"
                >
                  <option value="raw">Raw Signal</option>
                  <option value="denoised">Denoised Signal</option>
                </select>
              </div>
              <ServerPlot plotData={spectrumPlotData} loading={plotLoading.spectrum} />
            </div>

            {/* Download Stats */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white">
              <div className="text-center">
                <h3 className="text-2xl font-bold font-[var(--font-space-grotesk)] mb-3">Download Results</h3>
                <p className="text-indigo-100 mb-6">Export consolidated parameters and statistics</p>
                <button
                  onClick={handleDownloadStats}
                  className="bg-white text-indigo-600 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all duration-200 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 flex items-center gap-3 mx-auto"
                >
                  <Download className="w-6 h-6" />
                  Download All Stats
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
