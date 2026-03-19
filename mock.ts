import { StatCardProps } from "./src/types/interfaces";
import { ComingUpCardProps } from "./src/types/interfaces";

export const stats: StatCardProps[] = [
  { value: 1200, label: "Total Students", icon: "students" },
  { value: 150, label: "New Enrollments", icon: "courses" },
  { value: 85, label: "Retention Rate", icon: "assignments" },
  { value: 5, label: "Critical Issues", icon: "critical" },
];


export const summary = [
  {
    value: "1,200",
    label: "Total Enrolled Students"
  },
  {
    value: "150",
    label: "New Enrollment This Month"
  },
  {
    value: "85%",
    label: "Retention Rate (Last 3 Months)"
  }
];

export const assignmentData = {
  total: 5,
  critical: 5
}


export const continueWorking = [
  {
    value: "Homework Sheet",
    label: "Progress (50%)"
  },
  {
    value: "Web Development",
    label: "Progress (50%)"
  },
  {
    value: "History",
    label: "Progress (50%)"
  }
];

export const comingUp: ComingUpCardProps[] = [
  {
    type: "Live Q&A Session",
    title: "Digital Marketing",
    points: 35,
    dueDate: "October 21, 2024, 11:00 AM",
    status: "Today",
  },
  {
    type: "Assignment Grading",
    title: "Instagram Marketing",
    points: 35,
    dueDate: "October 22, 2024, 11:00 AM",
    status: "Tomorrow",
  },
  {
    type: "Final Quiz",
    title: "Social Meduia Strategy",
    points: 30,
    dueDate: "2023-10-15",
    status: "Upcoming",
  },
];

export const announcements = [
  {
    authorName: "John Doe",
    authorImage: "https://ui-avatars.com/api/?name=John+Doe&background=random",
    content: "New course materials have been uploaded.",
    postedAt: "2023-10-01",
  },
  {
    authorName: "Jane Smith",
    authorImage:
      "https://ui-avatars.com/api/?name=Jane+Smith&background=random",
    content: "Upcoming exam schedule has been released.",
    postedAt: "2023-10-02",
  },
];

export const sections = [
  {
      "_id": "67be89f0f61d2b43422e88c6",
      "code": "SEC001",
      "organizationId": "67b3fee16e8ada80c57e0513",
      "course": {
          "_id": "67b80e3c463ecfe94bc3da00",
          "title": "Introduction to Web Development",
          "thumbnail": "https://cdn.slidesharecdn.com/ss_thumbnails/introtowebdevelopment-200724053238-thumbnail.jpg?width=640&height=640&fit=bounds"
      },
      "status": "ongoing",
      "updatedAt": "2025-02-28T01:21:43.166Z"
  },
  {
      "_id": "67bec88beafe356d82b30518",
      "code": "SEC002SECONDSECTION",
      "organizationId": "67b3fee16e8ada80c57e0513",
      "course": {
          "_id": "67b82f55ed44bb164e27e4f4",
          "title": "capstone IV",
          "thumbnail": "https://cdn.prod.website-files.com/5e98914ac6941ec9f6417987/65def533a96f16a398409396_Capstone%20Project%20Ideas%20-(Compressify.io).webp"
      },
      "status": "ongoing",
      "updatedAt": "2025-02-27T06:40:20.678Z"
  }
];


export const gradeData = {
  labels: ["10", "20", "30", "40", "50", "60", "70", "80", "90", "100"],
  values: [320, 310, 290, 420, 230, 330, 340, 180, 420, 170],
};
