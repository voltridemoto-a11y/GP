import { useState } from 'react';
import { Copy, Check, ExternalLink, RefreshCw, Package, Truck, MapPin, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

// ─── Carrier Detection ────────────────────────────────────────────────
export interface CarrierInfo {
  name: string;
  code: string;
  color: string;
  trackUrl: (num: string) => string;
}

export function detectCarrier(tracking: string): CarrierInfo {
  const t = tracking.replace(/\s/g, '');

  // UPS: starts with 1Z, 18 chars
  if (/^1Z[A-Z0-9]{16}$/.test(t))
    return { name: 'UPS', code: 'ups', color: '#F5A623',
      trackUrl: n => `https://www.ups.com/track?tracknum=${n}` };

  // FedEx: 12, 15, or 20 digits
  if (/^\d{12}$/.test(t) || /^\d{15}$/.test(t) || /^\d{20}$/.test(t))
    return { name: 'FedEx', code: 'fedex', color: '#4D148C',
      trackUrl: n => `https://www.fedex.com/fedextrack/?trknbr=${n}` };

  // USPS: 20 or 22 digits, or starts with 94/92/93/95
  if (/^(94|92|93|95)\d{18,20}$/.test(t) || /^\d{20,22}$/.test(t))
    return { name: 'USPS', code: 'usps', color: '#333366',
      trackUrl: n => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${n}` };

  // DHL: starts with JD, or 10-11 digits
  if (/^JD\d{18}$/.test(t) || /^\d{10,11}$/.test(t))
    return { name: 'DHL', code: 'dhl', color: '#FFCC00',
      trackUrl: n => `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${n}` };

  // OnTrac: starts with C
  if (/^C\d{14}$/.test(t))
    return { name: 'OnTrac', code: 'ontrac', color: '#FF6600',
      trackUrl: n => `https://www.ontrac.com/tracking/?number=${n}` };

  // Amazon Logistics: starts with TBA
  if (/^TBA\d{12}/.test(t))
    return { name: 'Amazon', code: 'amazon', color: '#FF9900',
      trackUrl: n => `https://track.amazon.com/tracking/${n}` };

  // Default: show all carriers
  return { name: 'Unknown', code: 'unknown', color: '#6B7280',
    trackUrl: n => `https://www.aftership.com/track/${n}` };
}

// ─── Mock Tracking Data (universal fallback since no API key needed) ───
export interface TrackingEvent {
  timestamp: string;
  location: string;
  status: string;
  detail: string;
}

export interface TrackingResult {
  trackingNumber: string;
  carrier: CarrierInfo;
  status: 'pre-transit' | 'in-transit' | 'out-for-delivery' | 'delivered' | 'exception' | 'unknown';
  statusLabel: string;
  estimatedDelivery?: string;
  lastUpdate?: string;
  currentLocation?: string;
  delayAlert?: string;
  events: TrackingEvent[];
}

// Simulate a realistic tracking response based on tracking number pattern
function simulateTracking(trackingNumber: string, carrier: CarrierInfo): TrackingResult {
  const hash = trackingNumber.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const statuses: TrackingResult['status'][] = ['pre-transit', 'in-transit', 'in-transit', 'out-for-delivery', 'delivered'];
  const status = statuses[hash % statuses.length];

  const now = new Date();
  const dayMs = 86400000;

  const events: TrackingEvent[] = [];

  if (status !== 'pre-transit') {
    events.push({ timestamp: new Date(now.getTime() - 4 * dayMs).toISOString(), location: 'Origin Facility, CA', status: 'Picked Up', detail: 'Package received at origin facility.' });
  }
  if (status === 'in-transit' || status === 'out-for-delivery' || status === 'delivered') {
    events.push({ timestamp: new Date(now.getTime() - 3 * dayMs).toISOString(), location: 'Los Angeles, CA', status: 'Departed', detail: 'Package departed sorting hub.' });
    events.push({ timestamp: new Date(now.getTime() - 2 * dayMs).toISOString(), location: 'Phoenix, AZ', status: 'In Transit', detail: 'Package in transit to destination.' });
  }
  if (status === 'out-for-delivery' || status === 'delivered') {
    events.push({ timestamp: new Date(now.getTime() - 1 * dayMs).toISOString(), location: 'Destination Sort Facility', status: 'Arrived', detail: 'Package arrived at local facility.' });
    events.push({ timestamp: new Date(now.getTime() - 4 * 3600000).toISOString(), location: 'Local Delivery Route', status: 'Out for Delivery', detail: 'Package loaded onto delivery vehicle.' });
  }
  if (status === 'delivered') {
    events.push({ timestamp: new Date(now.getTime() - 1 * 3600000).toISOString(), location: 'Destination', status: 'Delivered', detail: 'Package delivered. Signed by recipient.' });
  }

  const statusLabels: Record<TrackingResult['status'], string> = {
    'pre-transit': 'Label Created',
    'in-transit': 'In Transit',
    'out-for-delivery': 'Out for Delivery',
    'delivered': 'Delivered',
    'exception': 'Exception',
    'unknown': 'Unknown',
  };

  const delay = hash % 7 === 0 ? 'Weather delay reported. Package may arrive 1–2 days late.' : undefined;

  return {
    trackingNumber,
    carrier,
    status,
    statusLabel: statusLabels[status],
    estimatedDelivery: status !== 'delivered' ? new Date(now.getTime() + (2 - (hash % 3)) * dayMs).toLocaleDateString() : undefined,
    lastUpdate: events[events.length - 1]?.timestamp,
    currentLocation: events[events.length - 1]?.location,
    delayAlert: delay,
    events: events.reverse(),
  };
}

// ─── Status color ─────────────────────────────────────────────────────
function statusStyle(status: TrackingResult['status']) {
  switch (status) {
    case 'delivered': return { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30', icon: CheckCircle2 };
    case 'out-for-delivery': return { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30', icon: Truck };
    case 'in-transit': return { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30', icon: Truck };
    case 'exception': return { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', icon: AlertTriangle };
    default: return { bg: 'bg-gray-500/15', text: 'text-gray-400', border: 'border-gray-500/30', icon: Package };
  }
}

// ─── Component ────────────────────────────────────────────────────────
interface Props {
  trackingNumber: string;
  carrier?: string;
  expanded?: boolean;
}

export default function TrackingBadge({ trackingNumber, carrier: carrierOverride, expanded = false }: Props) {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);

  const detectedCarrier = detectCarrier(trackingNumber);
  // If a carrier name was passed manually, try to use that name
  const finalCarrier: CarrierInfo = carrierOverride
    ? { ...detectedCarrier, name: carrierOverride }
    : detectedCarrier;

  const copy = async () => {
    await navigator.clipboard.writeText(trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchTracking = () => {
    setLoading(true);
    // Simulate async fetch (replace with real API integration if needed)
    setTimeout(() => {
      setResult(simulateTracking(trackingNumber, finalCarrier));
      setLoading(false);
      setShowDetails(true);
    }, 1200);
  };

  const toggle = () => {
    if (showDetails) {
      setShowDetails(false);
    } else if (result) {
      setShowDetails(true);
    } else {
      fetchTracking();
    }
  };

  const style = result ? statusStyle(result.status) : null;
  const StatusIcon = style?.icon ?? Package;

  return (
    <div className="rounded-xl border border-gray-700/60 bg-gray-900/60 overflow-hidden">
      {/* Main row */}
      <div className="flex items-center gap-3 px-3 py-2.5">
        {/* Carrier pill */}
        <span
          className="shrink-0 text-[10px] font-black tracking-wider px-2 py-0.5 rounded"
          style={{ background: finalCarrier.code !== 'unknown' ? `${finalCarrier.color}22` : '#374151', color: finalCarrier.code !== 'unknown' ? finalCarrier.color : '#9CA3AF', border: `1px solid ${finalCarrier.color}44` }}
        >
          {finalCarrier.name.toUpperCase()}
        </span>

        {/* Tracking number */}
        <span className="font-mono text-xs text-gray-200 flex-1 truncate">{trackingNumber}</span>

        {/* Status badge (after lookup) */}
        {result && (
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${style!.bg} ${style!.text} ${style!.border} flex items-center gap-1`}>
            <StatusIcon size={10} />
            {result.statusLabel}
          </span>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={copy} title="Copy" className="p-1.5 rounded text-gray-500 hover:text-white hover:bg-gray-800 transition-colors">
            {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
          </button>
          <button
            onClick={toggle}
            title={showDetails ? 'Hide details' : 'Track'}
            className={`p-1.5 rounded transition-colors ${loading ? 'text-orange-400' : 'text-gray-500 hover:text-white hover:bg-gray-800'}`}
          >
            {loading
              ? <RefreshCw size={12} className="animate-spin" />
              : <MapPin size={12} />}
          </button>
          <a
            href={finalCarrier.trackUrl(trackingNumber)}
            target="_blank"
            rel="noopener noreferrer"
            title="Open carrier site"
            className="p-1.5 rounded text-gray-500 hover:text-orange-400 hover:bg-gray-800 transition-colors"
          >
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Expanded tracking panel */}
      {showDetails && result && (
        <div className="border-t border-gray-800 px-4 py-4 space-y-4">
          {/* Summary row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-800/60 rounded-lg p-3 text-center">
              <p className="data-label mb-1">Status</p>
              <p className={`text-sm font-semibold ${style!.text}`}>{result.statusLabel}</p>
            </div>
            {result.estimatedDelivery && (
              <div className="bg-gray-800/60 rounded-lg p-3 text-center">
                <p className="data-label mb-1">Est. Delivery</p>
                <p className="text-sm font-semibold text-white">{result.estimatedDelivery}</p>
              </div>
            )}
            {result.currentLocation && (
              <div className="bg-gray-800/60 rounded-lg p-3 text-center">
                <p className="data-label mb-1">Last Location</p>
                <p className="text-xs font-medium text-gray-300 leading-tight">{result.currentLocation}</p>
              </div>
            )}
          </div>

          {/* Delay alert */}
          {result.delayAlert && (
            <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-2.5">
              <AlertTriangle size={14} className="text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-yellow-300 text-xs">{result.delayAlert}</p>
            </div>
          )}

          {/* Timeline */}
          <div>
            <p className="data-label mb-2">Tracking History</p>
            <div className="space-y-0">
              {result.events.map((ev, i) => (
                <div key={i} className="flex gap-3 group">
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full border-2 shrink-0 mt-0.5 ${
                      i === 0 ? 'bg-red-500 border-red-500' : 'bg-gray-700 border-gray-600'
                    }`} />
                    {i < result.events.length - 1 && <div className="w-px flex-1 bg-gray-800 my-1" />}
                  </div>
                  <div className={`pb-3 ${i === 0 ? '' : 'opacity-70'}`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold ${i === 0 ? 'text-white' : 'text-gray-300'}`}>{ev.status}</span>
                      <span className="text-gray-600 text-[10px] font-mono">{new Date(ev.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">{ev.location} — {ev.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Last update + refresh */}
          <div className="flex items-center justify-between pt-1 border-t border-gray-800">
            <div className="flex items-center gap-1.5 text-gray-600 text-[10px] font-mono">
              <Clock size={10} />
              {result.lastUpdate ? `Updated ${new Date(result.lastUpdate).toLocaleTimeString()}` : 'No update time'}
            </div>
            <button
              onClick={fetchTracking}
              className="flex items-center gap-1.5 text-gray-500 hover:text-orange-400 text-[10px] font-mono transition-colors"
            >
              <RefreshCw size={10} />
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
