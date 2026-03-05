import { ArrowLeft, BookOpen, Gavel, Lock, Shield, Users } from "lucide-react";
import NavBar from "../../components/NavBar";
import Section from "../../components/Section";
import { motion } from "motion/react";
import { Link } from "react-router";
import Footer from "../../components/Footer";

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      {/* Hero Section for Terms */}
      <Section className="bg-brand relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-white/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-white/40 blur-3xl" />
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link
              to="/register"
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Register
            </Link>
            <h1 className="max-mobile:text-4xl max-medium-tablet:text-5xl max-mobile:mb-3 mb-6 text-6xl font-bold">
              Terms & Conditions
            </h1>
            <p className="max-mobile:text-lg mx-auto max-w-2xl text-xl text-white/80">
              Clear, fair, and transparent guidelines for all users of the
              Freight Afford platform.
            </p>
          </motion.div>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-4xl">
          <div className="max-mobile:gap-8 grid gap-12">
            {[
              {
                icon: BookOpen,
                title: "1. Acceptance of Terms",
                content:
                  "By accessing and using the Freight Afford platform, you agree to be bound by these Terms and Conditions and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.",
              },
              {
                icon: Users,
                title: "2. Platform Usage",
                content:
                  "Freight Afford provides a digital marketplace for freight negotiation. We do not act as a carrier but as a facilitator of commercial agreements between shippers and verified logistics providers. Our role is to provide the technology and framework for these interactions.",
              },
              {
                icon: Shield,
                title: "3. User Responsibilities",
                content:
                  "Users are responsible for the accuracy of all data submitted to the platform, including cargo descriptions, weights, and dimensions. Misrepresentation of cargo or commercial intent may lead to immediate account suspension and potential legal action.",
              },
              {
                icon: Gavel,
                title: "4. Negotiation Rules",
                content:
                  "All bids submitted through the negotiation engine are binding commercial offers. Once an administrator approves a negotiated rate, both parties are legally committed to the transaction under the terms specified in the booking.",
              },
              {
                icon: Lock,
                title: "5. Confidentiality",
                content:
                  "Commercial rates, carrier identities, and specific shipment terms negotiated on the platform are strictly confidential. Users agree not to disclose this information to third parties without explicit written consent from Freight Afford.",
              },
            ].map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="hover:border-brand/20 group max-small-mobile:flex-col flex gap-8 rounded-3xl border border-slate-100 bg-slate-50 p-8 transition-colors"
              >
                <div className="group-hover:bg-brand flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm transition-colors group-hover:text-white">
                  <section.icon className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="mb-4 text-2xl font-bold text-slate-900">
                    {section.title}
                  </h2>
                  <p className="leading-relaxed text-slate-600">
                    {section.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-20 rounded-3xl bg-slate-900 p-8 text-center text-white"
          >
            <h3 className="mb-4 text-xl font-bold">
              Questions about our terms?
            </h3>
            <p className="mb-8 text-slate-400">
              Our legal team is here to help you understand your rights and
              responsibilities.
            </p>
            <Link to="/register">
              <button className="bg-brand cursor-pointer rounded-xl px-8 py-3 font-bold text-white transition-opacity hover:opacity-90">
                Contact Legal Support
              </button>
            </Link>
          </motion.div>
        </div>
      </Section>
      <Footer />
    </div>
  );
};
export default TermsPage;
