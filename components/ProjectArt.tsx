
export default function Art({ i }: { i: number }) {
  const v = i % 3;
  const bg = ["bg-navy", "bg-steel", "bg-cream"][v];
  return (
    <div className={`${bg} aspect-[16/10]`} aria-hidden>
      <svg viewBox="0 0 400 200" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        {v === 0 && (
          <>
            {[50, 80, 60, 110, 90, 130].map((h, k) => (
              <rect key={k} x={40 + k * 56} y={170 - h} width="34" height={h} rx="6"
                fill={k === 5 ? "#8FB2DB" : "#C3D0E0"} opacity={k === 5 ? 1 : 0.45} />
            ))}
            <polyline points="57,95 113,70 169,85 225,45 281,60 337,30" fill="none" stroke="#fff"
              strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
          </>
        )}
        {v === 1 && (
          <>
            <path d="M0 150 L60 120 120 132 180 85 240 100 300 55 360 70 400 40 V200 H0Z" fill="#fff" opacity="0.22" />
            <polyline points="0,150 60,120 120,132 180,85 240,100 300,55 360,70 400,40" fill="none"
              stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
          </>
        )}
        {v === 2 &&
          ([[300, "#1B2F4B"], [210, "#2F5D8C"], [130, "#5E9BE0"]] as const).map(([w, c], k) => (
            <rect key={k} x="40" y={40 + k * 46} width={w} height="26" rx="13" fill={c} />
          ))}
      </svg>
    </div>
  );
}
