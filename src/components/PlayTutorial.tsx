import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";

const PlayTutorial = ({
  playTutorial,
  onCloseTutorial,
}: {
  playTutorial: boolean;
  onCloseTutorial: () => void;
}) => {
  useEffect(() => {
    if (playTutorial) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [playTutorial]);
  return (
    <AnimatePresence>
      {playTutorial && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="fixed inset-0 top-0 z-50 flex items-center justify-center bg-black/90"
        >
          <button
            onClick={() => onCloseTutorial()}
            className="group absolute top-5 right-5 flex h-14 w-14 items-center justify-center rounded-sm bg-black"
          >
            <X className="text-white transition-colors duration-500 group-hover:text-red-500" />
          </button>
          <iframe
            className="max-small-tablet:h-125 max-small-mobile:h-100 h-150 w-5xl rounded-[10px]"
            src="https://embed.app.guidde.com/playbooks/tzebpni6auYjZkJ8fh8qkh?mode=videoOnly"
            title="Create and Submit Freight Requests on Freight Afford Platform"
            referrerPolicy="unsafe-url"
            allowFullScreen={true}
            allow="clipboard-write"
            sandbox="allow-popups allow-popups-to-escape-sandbox allow-scripts allow-forms allow-same-origin allow-presentation"
          ></iframe>
          <div className="hidden">
            <p>
              00:00: This tutorial guides you through creating freight requests
              on the Freight Afford
            </p>
            <p>00:03: Logistics platform.</p>
            <p>
              00:05: You will learn how to log in, enter shipment details, and
              submit your request for
            </p>
            <p>00:10: processing and booking generation.</p>
            <p>
              00:17: In this video, I'm going to show you how to create freight
              requests on your
            </p>
            <p>00:20: dashboard.</p>
            <p>
              00:21: The first step you need to take is either login to your
              dashboard
            </p>
            <p>
              00:24: if you have an existing account or simply create a free
              account, get verified and
            </p>
            <p>00:28: login to your dashboard.</p>
            <p>
              00:30: In this case, I'm going to log into the dashboard with an
              existing freight afford
            </p>
            <p>00:34: customer account.</p>
            <p>
              00:36: To log into the dashboard, simply input your registered
              email address and password
            </p>
            <p>00:40: to proceed.</p>
            <p>
              00:41: So after logging into your dashboard, you'll be redirected
              to the overview page
            </p>
            <p>
              00:45: where you can see analytics based on what you've done so
              far on your dashboard, which
            </p>
            <p>00:49: includes active requests, active bookings,</p>
            <p>
              00:53: bill of lading documents, and also outstanding invoices.
            </p>
            <p>
              00:57: Now to create or submit a freight request, simply navigate
              to the Freight Request
            </p>
            <p>
              01:02: Page in the dashboard. Then, click on Add New Request to
              input the necessary
            </p>
            <p>01:07: freight request information.</p>
            <p>
              01:09: Firstly, Select any container size of your choice which
              includes 20ft Standard, 40ft
            </p>
            <p>01:14: Standard, 40ft High Cube or 45ft High Cube Containers.</p>
            <p>01:18: Cube containers</p>
            <p>
              01:20: In this case, I will select a 40 feet standard container
              and add the container
            </p>
            <p>01:24: quantity.</p>
            <p>
              02:29: Once you click on the submit request button, the
              information will be sent to the
            </p>
            <p>02:33: Freight Afford Logistics team,</p>
            <p>02:35: and a freight request will be created immediately.</p>
            <p>
              02:41: So here I can simply click to view the details of the
              freight request.
            </p>
            <p>
              02:47: The freight request details will be displayed along with
              pending status which will
            </p>
            <p>
              02:51: be updated overtime when the logistics team attends to your
              request. And
            </p>
            <p>
              02:54: that's how you make freight requests on your Freight Afford
              Logistics Dashboard.
            </p>
            <p>02:57: dashboard.</p>
            <p>
              03:04: You have successfully created and submitted a freight
              request
            </p>
            <p>03:07: using the Freight Afford Logistics platform.</p>
            <p>
              03:09: Next, you can track your requests or explore additional
              features
            </p>
            <p>
              03:13: like to manage your shipments efficiently. Have a great
              experience
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default PlayTutorial;
