export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "finalized":
      return "text-green-600 bg-green-50 border-green-100";
    case "pending_amendment":
      return "text-amber-600 bg-amber-50 border-amber-100";
    default:
      return "text-slate-600 bg-slate-50 border-slate-100";
  }
};