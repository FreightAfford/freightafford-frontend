import { useCallback, useState } from "react";

// Counts uploads in progress across a step's upload fields, so the step
// isn't saved with the old file while a new one is still on its way.
export const useUploadTracker = () => {
  const [inProgress, setInProgress] = useState(0);
  const onBusyChange = useCallback(
    (busy: boolean) =>
      setInProgress((count) => Math.max(0, count + (busy ? 1 : -1))),
    [],
  );
  return { uploading: inProgress > 0, onBusyChange };
};
