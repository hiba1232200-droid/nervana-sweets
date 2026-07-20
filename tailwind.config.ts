import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#D4AF37",
          light: "#E8C766",
          dark: "#A8842A",
          soft: "#F0E0B0"
        },
        ink: {
          DEFAULT: "#0B0B0B",
          soft: "#1A1A1A",
          muted: "#242424"
        },
        cream: "#F7F1E3"
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"]
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #F0E0B0 0%, #D4AF37 35%, #A8842A 70%, #E8C766 100%)",
        "gold-line": "linear-gradient(90deg, transparent, #D4AF37, transparent)",
        "luxury-radial": "radial-gradient(ellipse at top, #1A1A1A 0%, #0B0B0B 70%)"
      },
      boxShadow: {
        "gold-glow": "0 0 40px rgba(212,175,55,0.25)",
        "gold-glow-lg": "0 0 80px rgba(212,175,55,0.35)",
        "cinematic": "0 30px 80px -20px rgba(0,0,0,0.8)"
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" }
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" }
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
        "fade-up": "fade-up 0.8s cubic-bezier(0.22,1,0.36,1) forwards",
        "spin-slow": "spin-slow 24s linear infinite"
      }
    }
  },
  plugins: []
};

export default config;
