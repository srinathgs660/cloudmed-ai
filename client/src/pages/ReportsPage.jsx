import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  FolderOpen,
  Upload,
  Brain,
  FileText,
  Copy,
  Check,
  Calendar,
  ExternalLink,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Card, Badge, Button, Modal, Loader, EmptyState } from '../components/UI';
import { getCached, setCached, invalidateCache } from '../services/clientCache';

export const ReportsPage = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState(() => getCached('reports') || []);
  const [patients, setPatients] = useState(() => getCached('patients') || []);
  const [loading, setLoading] = useState(() => !getCached('reports'));

  // Upload Modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadPatientId, setUploadPatientId] = useState('');
  const [reportType, setReportType] = useState('Laboratory Blood Panel');

  // AI Summarizer State
  const [summarizeModalOpen, setSummarizeModalOpen] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [summarizing, setSummarizing] = useState(false);
  const [summaryResult, setSummaryResult] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReports();
    if (user?.role !== 'PATIENT') {
      fetchPatients();
    }
  }, []);

  const fetchReports = async () => {
    try {
      if (!reports.length) setLoading(true);
      const res = await api.get('/reports');
      const list = res.data.data || [];
      setReports(list);
      setCached('reports', list);
    } catch (e) {
      console.error('Failed to load reports:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      setPatients(res.data.data || []);
      if (res.data.data?.length > 0) {
        setUploadPatientId(res.data.data[0]._id);
      }
    } catch (e) {}
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return alert('Please select a file');

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('reportType', reportType);
    if (uploadPatientId) formData.append('patientId', uploadPatientId);

    try {
      await api.post('/reports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      invalidateCache('reports');
      setUploadModalOpen(false);
      setSelectedFile(null);
      fetchReports();
    } catch (err) {
      alert(err.response?.data?.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenSummarizer = (rep) => {
    setSelectedReportId(rep._id);
    setSummaryText(
      rep.summary ||
        `Clinical report for ${rep.fileName}. Observed values include fasting metabolic metrics, patient presents with mild cough and intermittent fatigue. Clinical follow-up recommended in 3 weeks.`
    );
    setSummaryResult(rep.structuredSummary || null);
    setSummarizeModalOpen(true);
  };

  const handleRunSummarizer = async () => {
    if (!summaryText.trim()) return;
    setSummarizing(true);
    try {
      if (selectedReportId) {
        const res = await api.post(`/reports/${selectedReportId}/summarize`, {
          textToSummarize: summaryText,
        });
        invalidateCache('reports');
        setSummaryResult(res.data.aiSummary);
        fetchReports();
      } else {
        const res = await api.post('/ai/summarize-report', {
          reportText: summaryText,
          reportType: 'Clinical Note',
        });
        setSummaryResult(res.data.data);
      }
    } catch (err) {
      alert('Summarization failed');
    } finally {
      setSummarizing(false);
    }
  };

  const handleCopySummary = () => {
    if (!summaryResult) return;
    const textToCopy = summaryResult.summary || JSON.stringify(summaryResult);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Medical Document Archive</h1>
          <p className="text-xs text-slate-500 mt-1">
            Cloudinary-backed medical file storage with integrated clinical NLP summarization.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            icon={Sparkles}
            onClick={() => {
              setSelectedReportId(null);
              setSummaryText('');
              setSummaryResult(null);
              setSummarizeModalOpen(true);
            }}
          >
            AI Note Summarizer
          </Button>
          <Button icon={Upload} onClick={() => setUploadModalOpen(true)}>
            Upload Document
          </Button>
        </div>
      </div>

      {loading ? (
        <Loader message="Loading medical documents..." />
      ) : reports.length === 0 ? (
        <EmptyState
          title="No medical reports archived"
          description="Upload diagnostic lab PDFs, scans, or test reports to archive in the cloud."
          action={<Button size="sm" onClick={() => setUploadModalOpen(true)}>Upload Report</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((rep) => (
            <Card key={rep._id} className="flex flex-col justify-between hover:border-teal-400">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-teal-50 text-teal-600">
                      <FolderOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm max-w-[220px] truncate" title={rep.fileName}>
                        {rep.fileName}
                      </h3>
                      <p className="text-xs text-teal-600 font-semibold">{rep.reportType}</p>
                    </div>
                  </div>
                  <Badge variant="neutral">{(rep.fileSize / 1024).toFixed(0)} KB</Badge>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>Patient:</span>
                    <strong className="text-slate-800">{rep.patientId?.userId?.name || 'Patient'}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Uploaded by:</span>
                    <Badge variant="neutral">{rep.uploadedBy}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Date:</span>
                    <span>{new Date(rep.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {rep.summary && (
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block mb-1">
                      AI Generated Clinical Summary
                    </span>
                    <p className="whitespace-pre-line text-slate-600 line-clamp-3">{rep.summary}</p>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleOpenSummarizer(rep)}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" /> AI Summarizer
                </button>
                <a
                  href={rep.cloudinaryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  Download / View <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Medical Document to Cloud"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
          {user?.role !== 'PATIENT' && (
            <div>
              <label className="block font-bold text-slate-600 mb-1">Select Patient</label>
              <select
                required
                value={uploadPatientId}
                onChange={(e) => setUploadPatientId(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 text-xs"
              >
                <option value="">Choose Patient</option>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.userId?.name} ({p.bloodGroup})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-600 mb-1">Document Category</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-300 text-xs"
            >
              <option value="Laboratory Blood Panel">Laboratory Blood Panel</option>
              <option value="Diagnostic Imaging / Radiology">Diagnostic Imaging / Radiology</option>
              <option value="Cardiovascular Diagnostic">Cardiovascular Diagnostic</option>
              <option value="Pathology Report">Pathology Report</option>
              <option value="Discharge Summary">Discharge Summary</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1">Select File (PDF, PNG, JPG)</label>
            <input
              type="file"
              required
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="w-full p-2 border border-dashed border-slate-300 rounded-lg text-xs"
            />
            <p className="text-[10px] text-slate-400 mt-1">Maximum file size: 10 MB</p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={uploading}>
              Upload to Cloud Storage
            </Button>
          </div>
        </form>
      </Modal>

      {/* AI Summarizer Modal */}
      <Modal
        isOpen={summarizeModalOpen}
        onClose={() => setSummarizeModalOpen(false)}
        title="AI Medical Report Summarization"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-600 mb-1">
              Clinical Report Text / Physician Observation Notes:
            </label>
            <textarea
              rows={5}
              placeholder="Paste unstructured laboratory findings, clinical discharge notes, or consultation text here..."
              value={summaryText}
              onChange={(e) => setSummaryText(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-teal-500"
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-400">
              NLP Engine: CloudMed Clinical Extractive Summarizer
            </span>
            <Button
              size="sm"
              icon={Sparkles}
              loading={summarizing}
              onClick={handleRunSummarizer}
            >
              Generate AI Summary
            </Button>
          </div>

          {summaryResult && (
            <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-900 uppercase tracking-wider text-[11px]">
                  Structured AI Extraction:
                </span>
                <button
                  onClick={handleCopySummary}
                  className="flex items-center gap-1 text-[11px] text-purple-700 font-semibold hover:underline"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Summary'}
                </button>
              </div>

              {summaryResult.urgency && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-600 font-medium">Assessed Urgency:</span>
                  <Badge variant={summaryResult.urgency === 'Urgent' ? 'danger' : summaryResult.urgency === 'Attention' ? 'warning' : 'success'}>
                    {summaryResult.urgency}
                  </Badge>
                </div>
              )}

              <div className="bg-white p-3.5 rounded-lg border border-purple-100 whitespace-pre-line text-slate-800 leading-relaxed font-sans text-xs">
                {summaryResult.summary}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
