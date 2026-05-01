import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  HelpCircle,
  Info,
  Mail,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { useState } from "react";

const CustomerSupport = () => {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText("exports.ng@info.freightafford.com");

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy email");
    }
  };
  return (
    <div className="space-y-12">
      {/* Left Column: Hero & Message */}
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-brand/10 text-brand inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold tracking-wider uppercase">
            <HelpCircle className="h-5 w-5" />
            Help Center
          </div>
          <h1 className="max-medium-mobile:text-4xl text-5xl leading-[1.1] font-bold tracking-tight text-slate-900">
            Need assistance with your{" "}
            <span className="text-brand font-serif italic">shipment?</span>
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-slate-500">
            Whether it's export processes, documentation, or logistics requests,
            our dedicated support team is here to ensure your goods move
            smoothly across borders.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-medium-mobile:px-4 relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50"
        >
          <div className="-tr-y-1/2 tr-x-1/2 bg-brand/5 absolute top-0 right-0 h-32 w-32 rounded-full blur-3xl" />

          <div className="relative space-y-6">
            <div className="max-medium-mobile:flex-col max-medium-mobile:items-start flex items-center gap-4">
              <div className="bg-brand shadow-brand/20 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg">
                <Mail className="h-7.5 w-7.5" />
              </div>
              <div>
                <p className="font-medium text-slate-400">
                  Direct Support Email
                </p>
                <div className="flex items-center">
                  <Link
                    to="mailto:devfranklinandrew@gmail.com"
                    className="hover:text-brand max-medium-mobile:text-xl max-small-mobile:text-lg text-2xl font-bold break-all text-slate-900 transition-colors"
                  >
                    exports.ng@info.freightafford.com
                  </Link>
                  <button
                    type="button"
                    onClick={copyEmail}
                    className="hover:bg-brand/5 hover:text-brand flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-colors"
                  >
                    {copied ? (
                      <Check className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <Zap className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <p className="leading-relaxed font-medium text-emerald-800">
                A support ticket will be created{" "}
                <span className="font-bold underline decoration-emerald-300 underline-offset-2">
                  automatically
                </span>{" "}
                once your email is received. Our customer support officers
                typically respond within 2-4 hours.
              </p>
            </div>
            {/* 
            <Button
              onClick={() =>
                navigator.clipboard.writeText(
                  "exports.ng@info.freightafford.com",
                )
              }
              className="group h-14 w-full rounded-2xl text-base"
            >
              Send Support Email
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button> */}
          </div>
        </motion.div>
      </div>

      {/* Right Column: Instructions & Checklist */}
      <div className=":w-100 shrink-0 space-y-6">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-2xl"
        >
          <div className="absolute right-0 bottom-0 opacity-10">
            <ShieldCheck className="-mr-12 -mb-12 h-48 w-48" />
          </div>

          <h3 className="max-medium-mobile:flex-col max-medium-mobile:items-start mb-6 flex items-center gap-3 text-xl font-bold">
            <Info className="text-brand h-7 w-7 shrink-0" />
            While sending issues, ensure:
          </h3>

          <ul className="max-medium-mobile:grid-cols-1 grid grid-cols-2 gap-6">
            {[
              {
                label: "Your Full Name",
                sub: "Matches your registration details",
              },
              {
                label: "Shipment / Tracking Ref",
                sub: "If available for existing orders",
              },
              {
                label: "Clear Description",
                sub: "Brief explanation of the challenge",
              },
              {
                label: "Screenshots/Attachments",
                sub: "Help us visualize the issue faster",
              },
            ].map((item, idx) => (
              <li key={idx} className="group flex items-start gap-4">
                <div className="border-brand/30 group-hover:border-brand mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors">
                  <div className="bg-brand h-1.5 w-1.5 rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div>
                  <p className="font-bold text-slate-100">{item.label}</p>
                  <p className="mt-0.5 text-sm text-slate-400">{item.sub}</p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="max-small-mobile:grid-cols-1 grid grid-cols-2 gap-4"
        >
          <div className="flex flex-col items-center rounded-3xl border border-slate-100 bg-white p-6 text-center">
            <Clock className="mb-3 h-8 w-8 text-slate-400" />
            <p className="mb-1 text-xs font-bold tracking-wider text-slate-400 uppercase">
              Availability
            </p>
            <p className="text-sm font-bold text-slate-900">24/7 Monitoring</p>
          </div>
          <div className="flex flex-col items-center rounded-3xl border border-slate-100 bg-white p-6 text-center">
            <CheckCircle2 className="mb-3 h-8 w-8 text-emerald-500" />
            <p className="mb-1 text-xs font-bold tracking-wider text-slate-400 uppercase">
              Status
            </p>
            <p className="text-sm font-bold text-slate-900">Always Open</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
export default CustomerSupport;
