import { XCircle } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import Button from "../../components/Button";
import Card from "../../components/Card";
import AuthLayout from "../../layout/AuthLayout";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <AuthLayout>
      <div className="mx-auto w-full max-w-md">
        <motion.div
          initial={{ rotate: 0 }}
          animate={{
            rotate: [0, -6, 6, -6, 6, -3, 3, 0],
            x: [0, -8, 8, -8, 8, -4, 4, 0],
          }}
          transition={{
            duration: 0.6,
            ease: "easeInOut",
          }}
        >
          <Card className="max-mobile:p-4 rounded-2xl border border-white/20 bg-white/95 p-8 text-center shadow-2xl backdrop-blur-sm">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>

            <h2 className="mb-2 text-2xl font-bold text-slate-900">
              Not Found! (404)
            </h2>

            <p className="mb-8 leading-relaxed text-slate-600">
              This page might have been removed or doesn't exist.
            </p>

            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="h-12 w-full"
            >
              Go back
            </Button>
          </Card>
        </motion.div>
      </div>
    </AuthLayout>
  );
};

export default NotFound;
