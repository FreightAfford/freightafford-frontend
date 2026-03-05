import { Link } from "react-router";
import NavBar from "../../components/NavBar";
import Section from "../../components/Section";
import {
  AlertCircle,
  ArrowLeft,
  FileCheck,
  Info,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { motion } from "motion/react";
import Footer from "../../components/Footer";

const FreightRulesPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      {/* Hero Section for Rules */}
      <Section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="bg-brand/20 absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full blur-3xl" />
        <div className="bg-brand/20 absolute bottom-0 left-0 -mt-20 -mr-20 h-64 w-64 rounded-full blur-3xl" />
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
            <h1 className="max-mobile:text-4xl max-medium-tablet:text-5xl max-mobile:mb-3 mb-6 text-6xl font-bold">
              Freight Rules & Regulations
            </h1>
            <p className="max-mobile:text-lg mx-auto max-w-2xl text-xl text-slate-400">
              Ensuring safe, compliant, and efficient global logistics through
              clear standards and rigorous oversight.
            </p>
          </motion.div>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-5xl">
          <div className="max-medium-tablet:gap-4 max-mobile:grid-cols-1 mb-20 grid grid-cols-3 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: "Safety First",
                desc: "All cargo must meet international safety standards for maritime transport.",
              },
              {
                icon: Scale,
                title: "Fair Trade",
                desc: "Transparent pricing and ethical negotiation practices for all parties.",
              },
              {
                icon: FileCheck,
                title: "Compliance",
                desc: "Strict adherence to local and international port regulations.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="max-mobile:p-6 rounded-2xl border border-slate-100 bg-slate-50 p-8"
              >
                <div className="bg-brand/10 mb-6 flex h-12 w-12 items-center justify-center rounded-xl">
                  <item.icon className="text-brand h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="leading-relaxed text-slate-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="space-y-16">
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-8 flex items-center gap-3 text-3xl font-bold text-slate-900">
                <AlertCircle className="text-brand h-8 w-8" /> Prohibited Cargo
              </h2>
              <div className="max-medium-mobile:grid-cols-1 grid grid-cols-2 gap-4">
                {[
                  "Hazardous materials without prior specialized approval.",
                  "Illegal substances or contraband.",
                  "Perishable goods without temperature-controlled container linkage.",
                  "Unlicensed weaponry or military equipment.",
                  "Endangered species or illegal animal products.",
                  "Unsecured heavy machinery or loose bulk items.",
                ].map((rule, i) => (
                  <div
                    key={i}
                    className="flex gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
                  >
                    <div className="bg-brand mt-2 h-2 w-2 shrink-0 rounded-full" />
                    <p className="text-sm text-slate-600">{rule}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="max-medium-mobile:p-6 relative overflow-hidden rounded-3xl bg-slate-900 p-12 text-white"
            >
              <div className="bg-brand/20 absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full blur-3xl" />
              <div className="relative z-10">
                <h2 className="mb-8 text-3xl font-bold">Container Standards</h2>
                <p className="mb-10 max-w-2xl text-slate-400">
                  All containers must be seaworthy and meet ISO standards.
                  Shippers are responsible for ensuring cargo is properly lashed
                  and secured within the container.
                </p>
                <div className="max-small-mobile:grid-cols-1 grid grid-cols-2 gap-6">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                    <span className="text-brand mb-2 block text-xl font-bold">
                      20ft Standard
                    </span>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li>Max Payload: 28,200 kg</li>
                      <li>Internal Volume: 33.2 m³</li>
                      <li>Tare Weight: 2,300 kg</li>
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                    <span className="text-brand mb-2 block text-xl font-bold">
                      40ft High Cube
                    </span>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li>Max Payload: 26,700 kg</li>
                      <li>Internal Volume: 76.4 m³</li>
                      <li>Tare Weight: 3,900 kg</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="border-brand max-medium-mobile:pl-4 border-l-4 py-4 pl-8"
            >
              <h2 className="max-medium-mobile:text-2xl max-medium-mobile:items-start max-medium-mobile:mb-4 mb-6 flex items-center gap-3 text-3xl font-bold text-slate-900">
                <Info className="text-brand h-8 w-8" /> Documentation
                Requirements
              </h2>
              <p className="mb-6 leading-relaxed text-slate-600">
                A valid Bill of Lading (BOL) must be generated for every
                shipment. Freight Afford provides digital BOL management, but
                physical copies may be required at specific ports of entry.
              </p>
              <div className="flex flex-wrap gap-4">
                <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                  Commercial Invoice
                </span>
                <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                  Packing List
                </span>
                <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                  Certificate of Origin
                </span>
              </div>
            </motion.section>
          </div>
        </div>
      </Section>

      <Footer />
    </div>
  );
};
export default FreightRulesPage;
