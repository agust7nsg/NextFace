import React, { useMemo } from 'react';

const PHOTO_SRC =
  'https://hebwatwkpszebonmrige.supabase.co/storage/v1/object/public/nextface%20images/Retrato%20recortado%20de%20joven%20de%20cabello%20oscuro.png';

const VIEW_W = 480;
const VIEW_H = 640;

const HEAD_TOP_PCT = 1.4;
const HEAD_BOTTOM_PCT = 65.7;

const MESH_POINTS: [number, number][] = [
  [149.7, 246.3], [151.9, 274.5], [155.8, 302.5], [160.9, 329.7], [170.7, 354.1],
  [185.4, 376.5], [204.2, 394.7], [225.1, 409.6], [248.9, 412.7], [273.0, 408.9],
  [292.2, 394.2], [308.7, 375.1], [322.5, 352.8], [331.5, 327.6], [336.1, 300.7],
  [339.2, 271.9], [340.2, 241.9], [161.9, 243.4], [177.0, 233.0], [195.8, 231.3],
  [215.3, 234.1], [234.8, 239.7], [257.8, 237.6], [277.8, 230.7], [297.7, 227.5],
  [317.8, 229.2], [331.4, 241.2], [246.1, 250.8], [246.7, 269.7], [247.4, 288.5],
  [248.3, 307.5], [228.0, 318.4], [237.3, 321.9], [247.6, 324.8], [257.7, 321.5],
  [267.0, 317.5], [185.6, 252.7], [196.3, 247.4], [209.2, 246.8], [221.0, 254.4],
  [208.9, 256.6], [196.0, 257.2], [271.1, 252.6], [282.9, 244.5], [295.6, 244.3],
  [306.2, 249.4], [296.1, 254.3], [283.3, 254.4], [212.1, 353.6], [224.3, 347.9],
  [236.6, 344.0], [247.5, 347.1], [258.2, 343.3], [270.3, 346.0], [283.1, 351.4],
  [271.2, 360.9], [259.9, 364.9], [249.0, 366.2], [237.3, 366.0], [225.0, 362.4],
  [218.3, 353.7], [236.7, 352.2], [247.8, 353.2], [258.4, 351.5], [276.9, 352.3],
  [259.1, 352.1], [248.5, 354.0], [237.5, 352.9], [246.1, 211.0], [162.5, 213.9],
  [329.2, 210.6], [140.9, 230.8], [349.1, 226.5],
];

const MESH_EDGES: [number, number][] = [
  [0, 1], [0, 17], [0, 71], [1, 2], [1, 17], [1, 36], [1, 41], [1, 71],
  [2, 3], [2, 31], [2, 41], [2, 71], [3, 4], [3, 31], [3, 48], [3, 71],
  [4, 5], [4, 48], [5, 6], [5, 48], [6, 7], [6, 48], [6, 58], [6, 59],
  [7, 8], [7, 58], [8, 9], [8, 56], [8, 57], [8, 58], [9, 10], [9, 56],
  [10, 11], [10, 55], [10, 56], [11, 12], [11, 54], [11, 55], [12, 13],
  [12, 54], [13, 14], [13, 35], [13, 54], [14, 15], [14, 35], [14, 46],
  [14, 72], [15, 16], [15, 26], [15, 45], [15, 46], [15, 72], [16, 26],
  [16, 72], [17, 18], [17, 36], [17, 69], [17, 71], [18, 19], [18, 36],
  [18, 37], [18, 69], [19, 20], [19, 37], [19, 38], [19, 68], [19, 69],
  [20, 21], [20, 38], [20, 39], [20, 68], [21, 22], [21, 27], [21, 39],
  [21, 68], [22, 23], [22, 27], [22, 42], [22, 68], [23, 24], [23, 42],
  [23, 43], [23, 68], [24, 25], [24, 43], [24, 44], [24, 45], [24, 68],
  [24, 70], [25, 26], [25, 45], [25, 70], [26, 45], [26, 70], [26, 72],
  [27, 28], [27, 39], [27, 42], [28, 29], [28, 39], [28, 42], [29, 30],
  [29, 31], [29, 35], [29, 39], [29, 40], [29, 42], [29, 47], [30, 31],
  [30, 32], [30, 33], [30, 34], [30, 35], [31, 32], [31, 40], [31, 41],
  [31, 48], [31, 49], [31, 50], [32, 33], [32, 50], [33, 34], [33, 50],
  [33, 51], [33, 52], [34, 35], [34, 52], [34, 53], [35, 46], [35, 47],
  [35, 53], [35, 54], [36, 37], [36, 41], [37, 38], [37, 40], [37, 41],
  [38, 39], [38, 40], [39, 40], [40, 41], [42, 43], [42, 47], [43, 44],
  [43, 47], [44, 45], [44, 46], [44, 47], [45, 46], [46, 47], [48, 49],
  [48, 59], [48, 60], [49, 50], [49, 59], [49, 60], [49, 61], [50, 51],
  [50, 61], [50, 67], [51, 52], [51, 62], [51, 63], [51, 66], [51, 67],
  [52, 53], [52, 63], [52, 65], [53, 54], [53, 55], [53, 64], [53, 65],
  [54, 55], [54, 64], [55, 56], [55, 64], [55, 65], [56, 57], [56, 65],
  [56, 66], [57, 58], [57, 66], [58, 59], [58, 66], [58, 67], [59, 60],
  [59, 61], [59, 67], [61, 67], [62, 66], [62, 67], [63, 65], [63, 66],
  [65, 66], [66, 67], [68, 69], [68, 70], [69, 71], [70, 72],
];

const PULSE_POINTS: [number, number][] = [
  [202.8, 252.5], [289.2, 249.9], [248.3, 307.5], [248.2, 356.6], [248.9, 412.7],
];

export default function FaceScanAnimation() {
  const edgeLines = useMemo(
    () =>
      MESH_EDGES.map(([i, j], idx) => (
        <line
          key={idx}
          x1={MESH_POINTS[i][0]}
          y1={MESH_POINTS[i][1]}
          x2={MESH_POINTS[j][0]}
          y2={MESH_POINTS[j][1]}
          stroke="#7dd3fc"
          strokeOpacity={0.4}
          strokeWidth={0.6}
        />
      )),
    [],
  );

  return (
    <>
      <style>{`
        @keyframes scanSweep {
          0%   { top: ${HEAD_TOP_PCT}%; opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { top: ${HEAD_BOTTOM_PCT}%; opacity: 0; }
        }
        @keyframes meshFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 0.55; r: 1.6; }
          50%      { opacity: 1; r: 2.6; }
        }
        .scan-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #7dd3fc, transparent);
          box-shadow: 0 0 6px 1px rgba(125, 211, 252, 0.6);
          animation: scanSweep 3.6s ease-in-out infinite;
        }
        .mesh-layer { animation: meshFadeIn 1s ease-out; }
        .pulse-dot { animation: pulseDot 2.2s ease-in-out infinite; transform-origin: center; }
      `}</style>

      <div
        className="relative overflow-hidden rounded-2xl border-2 border-cyan-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/80 shadow-lg shadow-blue-500/10 mx-auto"
        style={{ width: 286, aspectRatio: `${VIEW_W} / ${VIEW_H}` }}
      >
        <img
          src={PHOTO_SRC}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />

        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/35 via-transparent to-blue-950/30" />

        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(6,16,32,0.12) 0%, rgba(6,16,32,0.02) 45%, rgba(6,16,32,0.22) 100%)',
          }}
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-1/2 bg-gradient-to-b from-transparent via-slate-900/60 to-slate-900" />

        <svg
          className="absolute inset-0 mesh-layer"
          width="100%"
          height="100%"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="none"
        >
          {edgeLines}
          {MESH_POINTS.map(([x, y], idx) => (
            <circle key={idx} cx={x} cy={y} r={1} fill="#bae6fd" fillOpacity={0.65} />
          ))}
          {PULSE_POINTS.map(([x, y], idx) => (
            <circle
              key={`pulse-${idx}`}
              cx={x}
              cy={y}
              r={2}
              fill="#e0f2fe"
              className="pulse-dot"
            />
          ))}
        </svg>

        <div className="scan-line" />
      </div>
    </>
  );
}
