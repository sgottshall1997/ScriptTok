import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { countUp } from "@/lib/animations";

interface Metric {
  value: number;
  label: string;
  suffix: string;
}

const metrics: Metric[] = [
  { value: 50000, label: "Scripts Generated", suffix: "+" },
  { value: 2000000, label: "Views Created", suffix: "+" },
  { value: 10000, label: "Creators", suffix: "+" },
];

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + "K";
  }
  return num.toString();
}

function Counter({ target, suffix, inView }: { target: number; suffix: string; inView: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const stepDuration = duration / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [target, inView]);

  return (
    <span>
      {formatNumber(count)}
      {suffix}
    </span>
  );
}

export default function MetricsCounter() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto my-8">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          variants={countUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          custom={{ delay: index * 0.1 }}
          data-testid={`metric-${index}`}
        >
          <Card className="rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800 glow-purple-sm">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {inView ? (
                  <Counter target={metric.value} suffix={metric.suffix} inView={inView} />
                ) : (
                  <span>0</span>
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
