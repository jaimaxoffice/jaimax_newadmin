import React from "react";

export default function NeonSection() {
  return (
    <div className="min-h-screen bg-[#111214] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        {/* Top Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 sm:p-10 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
          <div className="flex flex-col gap-6 sm:gap-8">
            {/* Title */}
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#b6ff56]/30 bg-[#b6ff56]/10 px-3 py-1 text-xs font-semibold text-[#b6ff56]">
                <span className="h-2 w-2 rounded-full bg-[#b6ff56] shadow-[0_0_18px_#b6ff56]" />
                Neon UI
              </span>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                Build modern UI with{" "}
                <span className="text-[#b6ff56] drop-shadow-[0_0_22px_rgba(182,255,86,0.35)]">
                  #b6ff56
                </span>
              </h1>

              <p className="text-white/70 max-w-2xl">
                A sleek component template using your dark background{" "}
                <span className="text-white/90 font-medium">#111214</span> and neon
                accent <span className="text-[#b6ff56] font-medium">#b6ff56</span>.
              </p>
            </div>

            {/* Input + Button */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <input
                placeholder="Enter something..."
                className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#b6ff56]/60 focus:ring-4 focus:ring-[#b6ff56]/15 transition"
              />

              <button className="rounded-xl px-5 py-3 text-sm font-semibold text-[#111214] bg-[#b6ff56] hover:opacity-90 active:opacity-80 transition shadow-[0_0_20px_rgba(182,255,86,0.28)]">
                Get Started
              </button>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {[
                {
                  title: "Fast Setup",
                  desc: "Drop in and customize quickly with Tailwind utilities.",
                },
                {
                  title: "Neon Accent",
                  desc: "Glow effects built with shadows + subtle gradients.",
                },
                {
                  title: "Clean Layout",
                  desc: "Responsive grid, readable typography, modern spacing.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:border-[#b6ff56]/25 transition"
                >
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#b6ff56] shadow-[0_0_14px_#b6ff56]" />
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-white/70">{item.desc}</p>
                  <button className="mt-4 text-sm font-semibold text-[#b6ff56] hover:underline underline-offset-4">
                    Learn more →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <p className="mt-6 text-center text-xs text-white/40">
          Colors used: <span className="text-white/70">#111214</span> (bg) &{" "}
          <span className="text-[#b6ff56]">#b6ff56</span> (accent)
        </p>
      </div>
    </div>
  );
}
