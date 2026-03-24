import { motion } from "motion/react";
import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router";
import AuthLayout from "../../layout/AuthLayout";
import Card from "../../components/Card";
import { XCircle } from "lucide-react";
import Button from "../../components/Button";

const RootErrorBoundary = () => {
    const navigate = useNavigate()
  const error = useRouteError();

  if (isRouteErrorResponse(error))
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );

 if(error instanceof Error) return (
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
              Server Error! (500)
            </h2>

            <p className="mb-8 leading-relaxed text-slate-600">
              {error.message}
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
export default RootErrorBoundary;
