export type TRole = "superadmin" | "admin" | "student" | "instructor";
export type dateFilter = "today" | "week" | "month" | "year";
type TUserStatus = "active" | "inactive" | "pending";
export type TAttendanceStatus =
  | "present"
  | "absent"
  | "late"
  | "noClass"
  | "class not started yet";

export interface ICurrentUser {
  user: {
    id: string;
    email: string;
    firstname: string;
    lastname: string;
    status: "active" | "inactive";
    avatar?: string;
    role: TRole;
    isPasswordChanged?: boolean;
    organization: {
      _id: string;
      code: string;
      name: string;
      type: "school" | "corporate";
      branding: {
        logo: string;
        coverPhoto: string;
      };
    };
  };
}

// types/interfaces.ts
export interface IBaseUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  role: TRole;
  status?: TUserStatus;
}

export interface IInstructor extends IBaseUser {
  bio?: string;
  expertise?: string[];
  qualifications?: string[];
  experienceYears?: number;
  employmentType:
    | "full_time"
    | "part_time"
    | "probationary"
    | "internship"
    | "freelance"
    | "temporary"
    | "volunteer"
    | "retired"
    | "resigned";
  faculty: { _id: string; name: string };
  socialLinks: {
    linkedIn: string;
    twitter: string;
    website: string;
  };
}
export interface IStudent extends IBaseUser {
  studentId: string;
  program?: { _id: string; name: string };
  yearLevel?: number;
  gpa?: number;
  socialLinks: {
    linkedIn: string;
    twitter: string;
    website: string;
  };
}

export interface orgAdmiUser extends IBaseUser {
  // Add any org admin-specific fields if needed in the future
}

export interface RegisterData {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export type IconType = React.ComponentType<{ className?: string }>;
export interface StatCardProps {
  value: number | string;
  label: string;
  icon: IconType;
}

export interface ComingUpCardProps {
  type: string;
  title: string;
  points: number;
  dueDate: string;
  status: "Tomorrow" | "Today" | "Upcoming";
}

export interface AnnouncementsCardProps {
  authorName: string;
  authorImage: string;
  content: string;
  postedAt: string;
}

export interface ICourse {
  _id: string;
  title: string;
  code: string;
  thumbnail: string;
  status: "published" | "unpublished";
  updatedAt: string;
}

export interface OrgCardProps {
  _id?: string;
  name: string;
  code: string;
  type: string;
  lastUpdated?: string;
  imageUrl?: string;
  onClick?: () => void;
  actions?: React.ReactNode;
}

export interface IOrganization {
  _id: string;
  name: string;
  code: string;
  type: "school" | "corporate";
  updatedAt: string;
  branding: {
    logo: string;
    coverPhoto: string;
  };
}

export type TActiveTab =
  | "basics"
  | "modules"
  | "announcements"
  | "grades"
  | "assessments"
  | "rubrics"
  | "analytics"
  | "attendance"
  | "students";

export type TAssessmentTab =
  | "assignments"
  | "quizzes"
  | "activity"
  | "monthly_test"
  | "periodical_test"
  | "students";

export type TActiveView = "day" | "week" | "month";

export type TQuestionType =
  | "multiple_choice"
  | "true_false"
  | "essay"
  | "enumeration"
  | "fill_in_the_blank"
  | "checkbox";

export interface IQuestion {
  _id?: string;
  type: TQuestionType;
  questionText: string;
  points: number;
  options?: {
    option: string;
    text: string;
    isCorrect: boolean;
    image?: File | string;
    isStudentAnswer?: string;
  }[];
  correctAnswers?: string[];
  createdBy?: string;
  questionImage?: File | string;
}

export interface ICourseBasic {
  _id: string;
  title: string;
  code: string;
  description?: string;
  thumbnail?: string;
}

export interface IInstructorBasic {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  faculty?: IFaculty;
  avatar?: string;
}

export interface ISchedule {
  startDate: string;
  endDate: string;
  breakdown: Array<{
    day: string;
    time: {
      start: string;
      end: string;
    };
    _id: string;
  }>;
}

export interface ISection {
  _id: string;
  name: string;
  code: string;
  course?: ICourseBasic;
  instructor?: IInstructorBasic;
  schedule?: ISchedule;
  status?: "upcoming" | "active" | "completed";
  students?: IStudent[];
  totalStudent?: number;
  maxStudents?: number;
  updatedAt?: string;
}

export interface ILesson {
  _id: string;
  title: string;
  updatedAt: string;
  endDate: string;
  status: "published" | "unpublished";
}

export interface IModule {
  _id: string;
  title: string;
  lessons: ILesson[];
}

export interface IAnnouncement {
  _id: string;
  title: string;
  textBody: string;
  publishDate: string;
}

type TAssessmentType =
  | "quiz"
  | "monthly_test"
  | "periodical_test"
  | "assignment"
  | "activity";

export interface IAssessment {
  _id: string;
  startDate: string;
  endDate: string;
  title: string;
  description: string;
  numberOfItems: number;
  totalPoints: number;
  gradeMethod: "manual" | "auto";
  timeLimit: number;
  attemptsAllowed: number;
  type: TAssessmentType;
  assessmentNo: number;
  isCompleted: boolean;
  passingScore: number;
}

// Add this type for the form data
export interface EditSectionFormData {
  code: string;
  name: string;
  course: string;
  instructor: string;
  schedule: {
    startDate: string;
    endDate: string;
    days: string[];
    time: {
      start: string; // In 24-hour format for form handling
      end: string; // In 24-hour format for form handling
    };
  };
}

export interface IVoucher {
  _id: string;
  name: string;
  code: string;
  description: string;
  discount: number;
  expiryDate: string;
}

export interface ICategory {
  _id: string;
  name: string;
  isActive: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IFaculty {
  _id: string;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
  organizationId: string;
  archive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICategory {
  _id: string;
  name: string;
  isActive: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IProgram {
  _id: string;
  name: string;
  code: string;
  description: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiParams {
  sort?: string;
  skip?: number;
  limit?: number;
  searchTerm?: string;
  filter?: {
    key: string;
    value: string;
  };
  filters?: Array<{
    key: string;
    value: string;
  }>;
  organizationId?: string;
  archiveStatus?: "none" | "include" | "only";
  activeTab?: string;
  sectionCode?: string;
}

export interface IGradeCategory {
  category: string;
  weight: number;
  _id?: string;
}

export interface IGradeScale {
  gradeLabel: string;
  percentageRange: {
    startRange: number;
    endRange: number;
  };
  pointValue?: number;
  _id?: string;
}

export interface IGradeData {
  _id: string;
  gradingMethod: "points_based" | "letter_grade";
  totalCoursePoints: number;
  minPassingGrade: number;
  lateSubmissionPenalty: number;
  gradeDistribution: IGradeCategory[];
  gradingScale: IGradeScale[];
}
