import { Link } from "react-router";
import NavBar from "../../components/NavBar";
import Section from "../../components/Section";
import Button from "../../components/Button";
import {
  ArrowRight,
  BarChart3,
  ChevronDown,
  FileText,
  LinkIcon,
  Play,
  Receipt,
  Truck,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Card from "../../components/Card";
import { useState } from "react";
import cn from "../../utils/cn";
import Footer from "../../components/Footer";

const FAQItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="border-b border-slate-200 pb-6 not-first:py-6"
    >
      <button
        onClick={() => setIsOpen((open) => !open)}
        className="group flex w-full cursor-pointer items-center justify-between text-left"
      >
        <span className="group-hover:text-brand text-lg font-semibold text-slate-900 transition-colors">
          {question}
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-slate-500 transition-transform duration-300",
            isOpen && "text-brand rotate-180",
          )}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="mt-4 leading-relaxed text-slate-600">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      {/* Hero Section */}
      <Section>
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-brand/10 text-brand ring-brand/20 max-mobile:mb-4 mb-8 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset"
          >
            Now in Beta: Structured Negotiation Engine
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-medium-tablet:text-6xl max-mobile:text-5xl max-small-mobile:text-4xl text-7xl font-extrabold tracking-tight text-slate-900"
          >
            Affordable Container Freight <br />
            <span className="text-brand">Negotiated for You</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-mobile:text-lg max-mobile:mt-4 mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-slate-600"
          >
            Freight Afford connects shippers and carriers in a transparent
            marketplace designed for efficiency, compliance, and
            cost-effectiveness.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-mobile:flex-col max-mobile:mt-8 mt-12 flex justify-center gap-4 px-4"
          >
            <Link to="/register">
              <Button size="lg" className="gap-2">
                Get Started <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>

            <Link to="/freight-rules">
              <Button size="lg" variant="outline">
                View Freight Rules
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="max-mobile:mt-14 max-mobile:px-0 mx-auto mt-20 max-w-5xl px-4"
          >
            <div className="group max-medium-mobile:h-94 relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-2xl">
              <img
                src="https://picsum.photos/seed/freight/1200/675"
                alt="Platform Preview"
                className="h-full w-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="bg-brand flex h-20 w-20 cursor-pointer items-center justify-center rounded-full text-white shadow-xl transition-transform hover:scale-110">
                  <Play className="ml-1 h-8 w-8 fill-current" />
                </button>
              </div>
              <div className="absolute right-0 bottom-0 left-0 bg-linear-to-t from-black/80 to-transparent p-6 text-left">
                <p className="font-semibold text-white">
                  Watch how Freight Afford simplifies your logistics
                </p>
                <p className="text-sm text-slate-300">
                  2:45 • Platform Overview
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* How It Works */}
      <Section>
        <div className="mb-16 text-center">
          <h2 className="max-small-mobile:text-3xl text-4xl font-bold tracking-tight text-slate-900">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            A streamlined 4-step process to secure your freight.
          </p>
        </div>
        <div className="max-small-desktop:grid-cols-2 max-medium-mobile:grid-cols-1 grid grid-cols-4 gap-6">
          {[
            {
              step: "01",
              title: "Submit Request",
              desc: "Define your cargo details, origin, and destination.",
            },
            {
              step: "02",
              title: "Propose Price",
              desc: "Carriers submit competitive bids through our engine.",
            },
            {
              step: "03",
              title: "Admin Approval",
              desc: "Our team verifies compliance and finalizes the deal.",
            },
            {
              step: "04",
              title: "Booking & Docs",
              desc: "Manage Bill of Lading and tracking in one place.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="absolute top-4 right-4 text-5xl font-black text-slate-50">
                {item.step}
              </span>
              <h3 className="relative z-10 mb-3 text-xl font-bold text-slate-900">
                {item.title}
              </h3>
              <h3 className="relative z-10 leading-relaxed text-slate-600">
                {item.desc}
              </h3>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Core Capabilities */}
      <Section className="bg-slate-900 text-white">
        <div className="mb-16 text-center">
          <h2 className="max-small-mobile:text-3xl text-4xl font-bold tracking-tight">
            Core Capabilities
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Everything you need to manage global logistics.
          </p>
        </div>

        <div className="max-small-tablet:grid-cols-2 max-medium-mobile:grid-cols-1 grid grid-cols-3 gap-6">
          {[
            {
              icon: Zap,
              title: "Negotiation Engine",
              desc: "Dynamic bidding system for the best possible rates.",
            },
            {
              icon: BarChart3,
              title: "Booking Management",
              desc: "Access to centralized dashboard for all your shipments.",
            },
            {
              icon: LinkIcon,
              title: "Container Linkage",
              desc: "Real-time association of cargo to containers (freights).",
            },
            {
              icon: FileText,
              title: "Bill of Lading Control",
              desc: "Digital document management and verification control.",
            },
            {
              icon: Truck,
              title: "Shipment Tracking",
              desc: "End-to-end visibility of your freight journey seamlessly.",
            },
            {
              icon: Receipt,
              title: "Invoice Management",
              desc: "Automated billing and payment reconciliation services.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="border-slate-700 bg-slate-800 text-white">
                <div className="bg-brand/10 mb-6 flex h-12 w-12 items-center justify-center rounded-lg">
                  <item.icon className="text-brand h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-bold">{item.title}</h3>
                <p className="leading-relaxed text-slate-400">{item.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* FAQ Section */}
      <Section>
        <div className="mx-auto max-w-3xl">
          <div className="mb-16 text-center">
            <h2 className="max-small-mobile:text-3xl text-4xl font-bold tracking-tight text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Everything you need to know about the platform.
            </p>
          </div>

          <div className="space-y-2">
            <FAQItem
              question="How does the negotiation engine work?"
              answer="Our engine allows shippers to post their requirements and carriers to submit competitive bids. The system uses a structured approach to ensure transparency and fairness, helping both parties reach an optimal price quickly."
            />
            <FAQItem
              question="What types of containers are supported?"
              answer="We support all standard ISO container types, including 20ft, 40ft, and 40ft High Cube. Specialized containers like reefers or open-tops can also be linked through our advanced container linkage system."
            />
            <FAQItem
              question="Is my commercial data secure?"
              answer="Yes. We use industry-standard encryption for data at rest and in transit. Role-based access control ensures that only authorized personnel can view sensitive negotiation details and documentation."
            />
            <FAQItem
              question="How are Bill of Ladings managed?"
              answer="Freight Afford provides a digital repository for all shipping documents. You can generate, verify, and share Bill of Ladings directly through the platform, reducing paperwork and errors."
            />
            <FAQItem
              question="What are the platform fees?"
              answer="Phase I registration is free. Our fee structure is based on successful bookings and is designed to be transparent and competitive. Contact our sales team for detailed enterprise pricing."
            />
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section className="bg-slate-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-brand max-mobile:px-6 relative overflow-hidden rounded-3xl p-12 text-center text-white shadow-xl"
        >
          <div className="bg-grid-slate-200 absolute inset-0 opacity-10" />
          <div className="relative z-10">
            <h2 className="max-mobile:mb-2 max-small-mobile:text-3xl mb-6 text-4xl font-bold tracking-tight">
              Ready to optimize your freight?
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-lg text-white/80">
              Join Freight Afford today and experience a new standard in
              container logistics negotiation.
            </p>
            <Link to="/register">
              <Button
                size="lg"
                className="text-brand bg-white px-10 hover:bg-slate-100"
              >
                Create Free Account
              </Button>
            </Link>
          </div>
        </motion.div>
      </Section>

      <Footer />
    </div>
  );
};
export default LandingPage;
