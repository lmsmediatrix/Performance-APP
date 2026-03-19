import { toast } from "react-toastify";
import { generateTimestamp } from "./dateUtils";

interface ExportToCSVOptions {
  mutationFn: (params: any) => Promise<Blob>; // Mutation function returning a Blob
  mutationParams?: any; // Parameters for the mutation (e.g., { limit: 1000 })
  filenamePrefix: string; // e.g., '1bislms-sections' or '1bislms-instructors'
  toastMessages?: {
    pending?: string;
    success?: string;
    error?: string;
  };
  onError?: (error: unknown) => void; // Optional custom error handler
}

export const exportToCSVUtil = async ({
  mutationFn,
  mutationParams,
  filenamePrefix,
  toastMessages = {
    pending: 'Exporting data to CSV...',
    success: 'Successfully exported data to CSV',
    error: 'Failed to export data to CSV',
  },
  onError = (error) => console.error('Export error:', error),
}: ExportToCSVOptions): Promise<void> => {
  try {
    const data = await toast.promise(
      mutationFn(mutationParams),
      {
        pending: toastMessages.pending,
        success: toastMessages.success,
        error: toastMessages.error,
      }
    );

    if (!(data instanceof Blob)) {
      throw new Error('Expected a Blob response');
    }

    const blob = data;
    const url = window.URL.createObjectURL(blob);
    const timestamp = generateTimestamp();
    const filename = `${filenamePrefix}-${timestamp}.csv`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    onError(error);
    throw error; 
  }
};