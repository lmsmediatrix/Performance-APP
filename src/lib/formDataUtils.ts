const envPath = import.meta.env.VITE_CLOUDINARY_PATH;
const env = envPath === "test" ? "test" : "dev";

interface OrganizationFormData {
  name: string;
  orgCode: string;
  description: string;
  type: string;
  logo?: File | string | null;
  coverPhoto?: File | string | null;
  _id?: string;
  organizationType: "corporate" | "school";
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    success?: string;
    warning?: string;
    danger?: string;
    info?: string;
    light?: string;
    dark?: string;
    neutral?: string;
  };
}

export const createOrganizationFormData = (
  data: OrganizationFormData
): FormData => {
  const formData = new FormData();

  // Add basic organization data
  formData.append("name", data.name);
  formData.append("code", data.orgCode);
  formData.append("description", data.description);
  formData.append("type", data.type);
  formData.append("path", `/lms/${env}/organizations/${data.orgCode}/assets`);

  // Add ID if provided
  if (data._id) {
    formData.append("_id", data._id);
  }

  // Always include logo in the formData, even if it's null
  if (data.logo) {
    if (data.logo instanceof File) {
      formData.append("branding.logo", data.logo);
    } else if (typeof data.logo === "string") {
      formData.append("branding.logo", data.logo);
    }
  } else {
    formData.append("branding.logo", "");
  }

  if (data.coverPhoto) {
    if (data.coverPhoto instanceof File) {
      formData.append("branding.coverPhoto", data.coverPhoto);
    } else if (typeof data.coverPhoto === "string") {
      formData.append("branding.coverPhoto", data.coverPhoto);
    }
  } else {
    formData.append("branding.coverPhoto", "");
  }

  // Add colors with dot notation for each color property
  if (data.colors) {
    Object.entries(data.colors).forEach(([key, value]) => {
      if (value) {
        formData.append(`branding.colors.${key}`, value);
      }
    });
  }

  return formData;
};

interface AdminFormData {
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role?: string;
  orgCode?: string;
  orgId?: string;
  avatarFile?: File;
  avatar?: File;
}

export const createAdminFormData = (data: AdminFormData): FormData => {
  const formData = new FormData();

  formData.append("firstName", data.firstName);
  formData.append("lastName", data.lastName);
  formData.append("email", data.email);

  formData.append("role", "admin");

  if (data.userId) formData.append("_id", data.userId);

  if (data.password !== undefined) {
    formData.append("password", data.password);
  }

  if (data.orgId !== undefined) {
    formData.append("organizationId", data.orgId);
  }
  if (data.avatar) {
    formData.append("avatar", data.avatar);
  }

  formData.append(
    "path",
    `/lms/${env}/organizations/${data.orgCode}/admin/${data.email}/assets`
  );
  return formData;
};

export const createInstructorFormData = (data: any): FormData => {
  const formData = new FormData();

  if (data.userId) formData.append("_id", data.userId);
  formData.append("firstName", data.firstName);
  formData.append("lastName", data.lastName);
  formData.append("email", data.email);

  if (data.bio) formData.append("bio", data.bio);

  if (data.employmentType !== undefined) {
    formData.append("employmentType", data.employmentType);
  }
  if (data.faculty) formData.append("faculty", data.faculty);

  // Expertise array
  if (data.expertise)
    formData.append("expertise", JSON.stringify(data.expertise));
  // Qualifications array
  if (data.qualifications)
    formData.append("qualifications", JSON.stringify(data.qualifications));

  // Social links
  if (data.qualifications)
    formData.append("socialLinks", JSON.stringify(data.socialLinks));

  // Avatar file
  if (data.avatar) {
    formData.append("avatar", data.avatar);
  }

  formData.append(
    "path",
    `/lms/${env}/organizations/${data.orgCode}/instructors/${data.email}/assets`
  );

  return formData;
};

export const createStudentFormData = (data: any): FormData => {
  const formData = new FormData();
  formData.append("firstName", data.firstName);
  formData.append("lastName", data.lastName);
  formData.append("email", data.email);
  formData.append("orgId", data.orgId);
  formData.append("orgCode", data.orgCode);

  if (data.studentId) formData.append("studentId", data.studentId);
  if (data.yearLevel) formData.append("yearLevel", data.yearLevel);
  if (data.program) formData.append("program", data.program);
  if (data._id) formData.append("_id", data._id); //include _id if update
  if (data.socialLinks)
    formData.append("socialLinks", JSON.stringify(data.socialLinks));
  if (data.avatar) formData.append("avatar", data.avatar);

  formData.append(
    "path",
    `/lms/${env}/organizations/${data.orgCode}/students/${data.email}/assets`
  );

  return formData;
};

export const createLessonFormData = (data: any): FormData => {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("startDate", data.startDate);
  formData.append("endDate", data.endDate);
  formData.append("description", data.description);
  formData.append("moduleId", data.moduleId);

  if (data.lessonId) {
    formData.append("_id", data.lessonId);
  }

  if (data.mainContent) {
    formData.append("mainContent", data.mainContent);
  }

  if (data.additionalFiles && Array.isArray(data.additionalFiles)) {
    data.additionalFiles.forEach((file: File) => {
      formData.append("files", file);
    });
  }

  formData.append(
    "path",
    `/lms/${env}/organizations/${data.orgCode}/sections/${data.sectionCode}/lessons/${data.title}/files`
  );

  return formData;
};

export const createCourseFormData = (data: any): FormData => {
  const formData = new FormData();

  formData.append("organizationId", data.orgId);
  formData.append("title", data.title);
  formData.append("code", data.code);
  formData.append("description", data.description);
  formData.append("status", data.status);
  formData.append("level", data.level);
  formData.append("category", data.category);
  formData.append(
    "path",
    `/lms/${env}/organizations/${data.orgCode}/courses/${data.code}/assets`
  );

  if (data._id) {
    formData.append("_id", data._id);
  }
  if (data.thumbnail) {
    formData.append("thumbnail", data.thumbnail);
  }

  return formData;
};

export const uploadCloudinary = (data: any): FormData => {
  const formData = new FormData();
  formData.append("file", data.file);

  formData.append(
    "path",
    `/lms/${env}/organizations/${data.orgCode}/sections/${data.sectionCode}/announcements`
  );

  return formData;
};

export const createAssessmentFormData = (data: any): FormData => {
  const formData = new FormData();

  // Append top-level fields
  if (data._id) formData.append("_id", data._id);
  formData.append("organizationId", data.organizationId);
  formData.append("section", data.section);
  formData.append("title", data.title);
  formData.append("startDate", data.startDate);
  formData.append("endDate", data.endDate);
  formData.append("timeLimit", data.timeLimit.toString());
  formData.append("gradeMethod", data.gradeMethod);
  formData.append("attemptsAllowed", data.attemptsAllowed.toString());
  formData.append("description", data.description);
  formData.append("type", data.type);
  formData.append("shuffleQuestions", data.shuffleQuestions);
  formData.append(
    "path",
    `/lms/${env}/organizations/${data.orgCode}/sections/${data.sectionCode}/assessments/${data.title}/assets`
  );
  if (data.isQuestionBankEnabled)
    formData.append("isShuffled", data.isQuestionBankEnabled);
  if (data.questionsToDisplay)
    formData.append("numberOfQuestionsToShow", data.questionsToDisplay);
  if (data.totalPoints) formData.append("totalPoints", data.totalPoints);

  // Track file upload stats for debugging
  let questionImagesCount = 0;
  let optionImagesCount = 0;

  // Handle questions array
  if (data.questions && Array.isArray(data.questions)) {
    try {
      // Process each question, handling both the JSON representation and file uploads
      const formattedQuestions = data.questions.map(
        (question: any, qIndex: number) => {
          // Create a clean copy of the question without file objects for JSON string
          const questionCopy = {
            ...question,
            questionText: question.questionText || "",
            // Ensure points is a number
            points: Number(question.points),
            options: [],
          };

          // Handle question image
          if (question.image instanceof File) {
            const fieldName = `questions[${qIndex}][image]`;

            // Append the actual file to formData
            formData.append(fieldName, question.image);

            // Store field name reference for backend processing
            questionCopy.questionImageField = fieldName;
            questionImagesCount++;

            // Remove the actual file object from JSON
            delete questionCopy.image;
          } else if (
            question.image &&
            typeof question.image === "object" &&
            Object.keys(question.image).length === 0
          ) {
            // Remove empty image objects
            delete questionCopy.image;
          }

          // Handle options if they exist
          if (question.options && Array.isArray(question.options)) {
            questionCopy.options = question.options.map(
              (option: any, optIndex: number) => {
                // Create a clean copy of the option
                const optionCopy = {
                  ...option,
                  text: option.text || "",
                  // Ensure isCorrect is a boolean
                  isCorrect:
                    option.isCorrect === true || option.isCorrect === "true",
                };

                // Handle option image
                if (option.image instanceof File) {
                  const fieldName = `questions[${qIndex}][options][${optIndex}][image]`;

                  // Append the file to formData
                  formData.append(fieldName, option.image);

                  // Store field name reference for backend processing
                  optionCopy.imageField = fieldName;
                  optionImagesCount++;

                  // Remove the actual file object from JSON
                  delete optionCopy.image;
                } else if (
                  option.image &&
                  typeof option.image === "object" &&
                  Object.keys(option.image).length === 0
                ) {
                  // Remove empty image objects
                  delete optionCopy.image;
                }

                return optionCopy;
              }
            );
          }

          return questionCopy;
        }
      );

      // Add the complete questions array as a JSON string
      formData.append("questions", JSON.stringify(formattedQuestions));
    } catch (error) {
      console.error("Error processing questions for form data:", error);
    }
  }

  return formData;
};
