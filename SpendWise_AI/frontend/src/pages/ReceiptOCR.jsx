import React, { useState } from 'react';
import { Scan, Upload, CheckCircle2, ArrowRight, Save, FileImage } from 'lucide-react';
import { scanReceipt, createExpense } from '../services/api';

export default function ReceiptOCR() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setOcrResult(null);
      setSuccessMsg('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await scanReceipt(formData);
      setOcrResult(res.data.extracted_data);
    } catch (err) {
      console.error('OCR Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSave = async () => {
    if (!ocrResult) return;
    setLoading(true);
    try {
      await createExpense({
        amount: ocrResult.amount,
        category: ocrResult.category,
        description: ocrResult.suggested_description,
        date: ocrResult.date
      });
      setSuccessMsg(`Expense '₹${ocrResult.amount} under ${ocrResult.category}' saved to database!`);
      setOcrResult(null);
      setFile(null);
    } catch (err) {
      console.error('Error saving OCR expense:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-50 tracking-tight flex items-center gap-2">
          <Scan className="w-6 h-6 text-brand-400" />
          Receipt OCR Scan & Auto-Entry
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Upload any paper or digital receipt image to automatically extract items, totals, and save transactions.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* File Upload Box */}
      <div className="glass-panel p-8 rounded-2xl border border-dashed border-slate-700 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center mx-auto">
          <Upload className="w-8 h-8" />
        </div>

        <div>
          <h3 className="font-bold text-slate-200">Select Receipt Image</h3>
          <p className="text-xs text-slate-400 mt-1">Supports PNG, JPG, JPEG, WEBP formats</p>
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="receipt-file-input"
        />

        <div className="flex items-center justify-center space-x-3">
          <label
            htmlFor="receipt-file-input"
            className="cursor-pointer px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition-colors flex items-center space-x-2"
          >
            <FileImage className="w-4 h-4 text-brand-400" />
            <span>{file ? file.name : 'Choose File'}</span>
          </label>

          {file && (
            <button
              onClick={handleUpload}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm transition-colors shadow-md flex items-center space-x-2"
            >
              <span>{loading ? 'Analyzing OCR...' : 'Extract Data'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Extracted Confirmation Card */}
      {ocrResult && (
        <div className="glass-panel p-6 rounded-2xl border border-brand-500/40 space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Proposed Expense Extracted from Receipt
          </h3>

          <div className="grid grid-cols-2 gap-4 text-sm bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-400 text-xs">Merchant:</span>
              <p className="font-semibold text-slate-100">{ocrResult.merchant}</p>
            </div>
            <div>
              <span className="text-slate-400 text-xs">Detected Category:</span>
              <p className="font-semibold text-slate-100">{ocrResult.category}</p>
            </div>
            <div>
              <span className="text-slate-400 text-xs">Date:</span>
              <p className="font-semibold text-slate-100">{ocrResult.date}</p>
            </div>
            <div>
              <span className="text-slate-400 text-xs">Total Amount:</span>
              <p className="font-bold text-emerald-400 font-mono text-base">₹{ocrResult.amount.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              onClick={() => setOcrResult(null)}
              className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-sm font-semibold"
            >
              Discard
            </button>
            <button
              onClick={handleConfirmSave}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Confirm & Save Expense</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
