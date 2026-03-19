# CRUD Implementation Guidelines

## Folder Structure
```
src/
├── components/
│   ├── common/          # Shared components
│   ├── student/         # Student-specific components
│       ├── DeleteStudentModal.tsx
│       ├── UpsertStudentModal.tsx
├── hooks/               # Custom hooks
│   ├── useStudent.ts
├── pages/               # Page components
│   ├── orgAdmin/
│       ├── StudentDatabase.tsx
├── services/            # API services
│   ├── studentApi.tsx
```

## CRUD Pattern Implementation

### Key Features:
1. **Search Params Modal Pattern**
   - Uses URL search params to manage modal state
   - Example: `?modal=create-student` or `?modal=edit-student&id=123`
   - Clean URL state management
   - Back button support

2. **Zod Validation**
   - Schema definition for form validation
   - Type safety with `z.infer`
   - Example:
     ```typescript
     const studentSchema = z.object({
       firstName: z.string().min(2),
       lastName: z.string().min(2),
       email: z.string().email(),
       studentId: z.string().min(1),
       program: z.string().min(5).max(30)
     });
     ```

3. **React Hook Form Integration**
   - Form state management
   - Validation integration with Zod
   - Example:
     ```typescript
     const { register, handleSubmit, formState: { errors } } = useForm<StudentFormData>({
       resolver: zodResolver(studentSchema)
     });
     ```

4. **API Service Layer**
   - Centralized API calls
   - Type-safe request/response handling
   - Example:
     ```typescript
     const studentService = {
       createStudent: async (data: object) => {
         return axios.post(`${BASE_URL}${STUDENT.CREATE}`, data);
       }
     };
     ```

5. **React Query Integration**
   - Data fetching and caching
   - Mutation handling
   - Example:
     ```typescript
     const { mutate: createStudent } = useCreateStudent();
     ```

### Implementation Steps:

1. **Create Component**
   - Use `UpsertStudentModal` for both create and edit
   - Manage form state with RHF
   - Validate with Zod schema
   - Handle file uploads if needed

2. **Read Component**
   - Use `Table` component for listing
   - Implement search/filter/pagination
   - Use `useGetAllStudents` hook

3. **Update Component**
   - Reuse `UpsertStudentModal`
   - Pre-fill form with existing data
   - Use `useUpdateStudent` hook

4. **Delete Component**
   - Use `DeleteStudentModal` for confirmation
   - Implement soft/hard delete
   - Use `useDeleteStudent` hook

### Best Practices:

1. **State Management**
   - Use URL params for modal state
   - Local state for form data
   - React Query for server state

2. **Error Handling**
   - Display user-friendly error messages
   - Use toast notifications
   - Handle API errors gracefully

3. **Performance**
   - Implement pagination
   - Use React Query caching
   - Optimize re-renders

4. **Security**
   - Validate all inputs
   - Sanitize data
   - Handle file uploads securely

### Example Workflow:

1. User clicks "Add Student"
2. URL updates to `?modal=create-student`
3. `UpsertStudentModal` opens
4. User fills form and submits
5. Data validated with Zod
6. `createStudent` mutation called
7. On success:
   - Toast notification shown
   - Modal closes
   - Student list refreshes
```

This documentation provides a comprehensive guide for implementing CRUD operations using the pattern shown in the code, including folder structure, key features, implementation steps, and best practices.
