type SystemBridgeLoaderProps = {
  title: string;
  subtitle: string;
  fromLabel?: string;
  toLabel?: string;
};

export default function SystemBridgeLoader({
  title,
  subtitle,
  fromLabel = "LMS",
  toLabel = "Performance",
}: SystemBridgeLoaderProps) {
  return (
    <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-2xl backdrop-blur">
      <div className="mx-auto max-w-lg">
        <svg viewBox="0 0 520 190" className="w-full">
          <defs>
            <linearGradient id="bridgeBasePs" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3e5b93" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
            <linearGradient id="bridgeFlowPs" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3e5b93" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
          </defs>

          <path
            d="M104 95 C 170 28, 350 162, 416 95"
            fill="none"
            stroke="url(#bridgeBasePs)"
            strokeOpacity="0.22"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M104 95 C 170 28, 350 162, 416 95"
            fill="none"
            stroke="url(#bridgeFlowPs)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="12 14"
            style={{ animation: "bridgeFlowPs 1.8s linear infinite" }}
          />

          <circle
            cx="104"
            cy="95"
            r="34"
            fill="#3e5b93"
            style={{ animation: "nodePulsePs 1.9s ease-in-out infinite" }}
          />
          <circle
            cx="104"
            cy="95"
            r="45"
            fill="#3e5b93"
            opacity="0.14"
            style={{ animation: "haloPulsePs 1.9s ease-in-out infinite" }}
          />
          <text
            x="104"
            y="100"
            textAnchor="middle"
            fontSize="13"
            fontWeight="700"
            fill="#ffffff"
            letterSpacing="0.5"
          >
            LMS
          </text>

          <circle
            cx="416"
            cy="95"
            r="34"
            fill="#16a34a"
            style={{ animation: "nodePulsePs 1.9s ease-in-out infinite", animationDelay: "0.2s" }}
          />
          <circle
            cx="416"
            cy="95"
            r="45"
            fill="#16a34a"
            opacity="0.14"
            style={{ animation: "haloPulsePs 1.9s ease-in-out infinite", animationDelay: "0.2s" }}
          />
          <text
            x="416"
            y="100"
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fill="#ffffff"
            letterSpacing="0.5"
          >
            PS
          </text>
        </svg>
      </div>

      <div className="mt-5 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
        <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
          {fromLabel} to {toLabel}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full bg-[#3e5b93]"
          style={{ animation: "dotPulsePs 1.2s ease-in-out infinite" }}
        />
        <span
          className="h-2.5 w-2.5 rounded-full bg-[#0ea5e9]"
          style={{ animation: "dotPulsePs 1.2s ease-in-out infinite", animationDelay: "0.2s" }}
        />
        <span
          className="h-2.5 w-2.5 rounded-full bg-[#16a34a]"
          style={{ animation: "dotPulsePs 1.2s ease-in-out infinite", animationDelay: "0.4s" }}
        />
      </div>

      <style>{`
        @keyframes bridgeFlowPs {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -130; }
        }
        @keyframes nodePulsePs {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.14); }
        }
        @keyframes haloPulsePs {
          0%, 100% { transform: scale(1); opacity: 0.12; }
          50% { transform: scale(1.06); opacity: 0.2; }
        }
        @keyframes dotPulsePs {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

