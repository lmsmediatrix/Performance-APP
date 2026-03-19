export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatDateMMMDDYYY = (
  dateString: string,
  useFullMonth: boolean = false
) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const shortMonths = [
    "Jan.",
    "Feb.",
    "Mar.",
    "Apr.",
    "May.",
    "Jun.",
    "Jul.",
    "Aug.",
    "Sep.",
    "Oct.",
    "Nov.",
    "Dec.",
  ];

  const fullMonths = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const months = useFullMonth ? fullMonths : shortMonths;

  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

export const convert24to12Format = (time24h: string) => {
  const [hours, minutes] = time24h.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

// Add this helper function before the CreateSection component
export const convert12to24Format = (time12h: string) => {
  const [time, modifier] = time12h.split(" ");
  let [hours, minutes] = time.split(":");

  if (hours === "12") {
    hours = "00";
  }

  if (modifier === "PM") {
    hours = String(parseInt(hours, 10) + 12);
  }

  return `${hours.padStart(2, "0")}:${minutes}`;
};

// Get current UTC date (midnight)
export const getCurrentUTCDate = (): Date => {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
};

// Check if a date is today or in the future (current)
export const isCurrentAnnouncement = (publishDate: string | Date): boolean => {
  const currentDate = getCurrentUTCDate();
  const date = new Date(publishDate);
  return date >= currentDate;
};

// Check if a date is in the past
export const isPastAnnouncement = (publishDate: string | Date): boolean => {
  const currentDate = getCurrentUTCDate();
  const date = new Date(publishDate);
  return date < currentDate;
};

// Format date to relative time (e.g., "2 hours ago", "3 days ago")
export const formatDateTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffSeconds = Math.floor(diffTime / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMonths > 3) {
    return formatDateMMMDDYYY(dateString);
  }

  if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 30) return `${diffDays} days ago`;
  return `${diffMonths} months ago`;
};

export const generateTimestamp = (): string => {
  return new Date()
    .toISOString()
    .replace(/T/, "-") // Replace T with -
    .replace(/:/g, "") // Remove colons
    .replace(/\..+/, ""); // Remove milliseconds and Z
};

export const formatDateTimeFull = (dateString: string): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

export const calculateDurationMinutes = (startTime: string, endTime: string): number => {
  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 0; // Return 0 if dates are invalid
  }
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
};