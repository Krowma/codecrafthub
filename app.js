// Import the required packages
const express = require("express");
const fs = require("fs").promises;
const path = require("path");

// Create the Express application
const app = express();

// The server will run on port 5000
const PORT = 5000;

// Store courses.json in the same directory as this app.js file
const COURSES_FILE = path.join(__dirname, "courses.json");

// These are the only valid course status values
const VALID_STATUSES = [
  "Not Started",
  "In Progress",
  "Completed"
];

/*
  Middleware that allows Express to read JSON request bodies.

  For example, this allows the server to read:

  {
    "name": "Node.js Basics",
    "description": "Learn Node.js fundamentals",
    "target_date": "2026-12-31",
    "status": "Not Started"
  }
*/
app.use(express.json());

/*
  Read courses from courses.json.

  If the file does not exist, this function creates it
  automatically with an empty array.
*/
async function readCourses() {
  try {
    const fileContents = await fs.readFile(COURSES_FILE, "utf8");
    return JSON.parse(fileContents);
  } catch (error) {
    // If courses.json does not exist, create it
    if (error.code === "ENOENT") {
      await writeCourses([]);
      return [];
    }

    // This can happen if the file contains invalid JSON
    if (error instanceof SyntaxError) {
      const fileError = new Error("courses.json contains invalid JSON");
      fileError.statusCode = 500;
      throw fileError;
    }

    // Pass other file read errors to the route handler
    throw error;
  }
}

/*
  Write the courses array to courses.json.

  JSON.stringify converts the JavaScript array into
  readable JSON text.
*/
async function writeCourses(courses) {
  await fs.writeFile(
    COURSES_FILE,
    JSON.stringify(courses, null, 2),
    "utf8"
  );
}

/*
  Check whether a date has the exact YYYY-MM-DD format
  and represents a real calendar date.

  Examples:
  - 2026-12-31: valid
  - 2026-02-30: invalid
  - 12-31-2026: invalid
*/
function isValidDate(targetDate) {
  if (typeof targetDate !== "string") {
    return false;
  }

  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(targetDate)) {
    return false;
  }

  const [year, month, day] = targetDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/*
  Validate the data submitted by a client.

  The required fields are:
  - name
  - description
  - target_date
  - status
*/
function validateCourseData(courseData) {
  const errors = [];

  if (
    !courseData.name ||
    typeof courseData.name !== "string" ||
    courseData.name.trim() === ""
  ) {
    errors.push("name is required");
  }

  if (
    !courseData.description ||
    typeof courseData.description !== "string" ||
    courseData.description.trim() === ""
  ) {
    errors.push("description is required");
  }

  if (!courseData.target_date) {
    errors.push("target_date is required");
  } else if (!isValidDate(courseData.target_date)) {
    errors.push("target_date must use the YYYY-MM-DD format");
  }

  if (!courseData.status) {
    errors.push("status is required");
  } else if (!VALID_STATUSES.includes(courseData.status)) {
    errors.push(
      `status must be one of: ${VALID_STATUSES.join(", ")}`
    );
  }

  return errors;
}

function validateCourseUpdateData(courseData) {
  const errors = [];

  // Only validate name if it was included in the request
  if (Object.prototype.hasOwnProperty.call(courseData, "name")) {
    if (
      typeof courseData.name !== "string" ||
      courseData.name.trim() === ""
    ) {
      errors.push("name cannot be empty");
    }
  }

  // Only validate description if it was included
  if (Object.prototype.hasOwnProperty.call(courseData, "description")) {
    if (
      typeof courseData.description !== "string" ||
      courseData.description.trim() === ""
    ) {
      errors.push("description cannot be empty");
    }
  }

  // Only validate target_date if it was included
  if (Object.prototype.hasOwnProperty.call(courseData, "target_date")) {
    if (!isValidDate(courseData.target_date)) {
      errors.push("target_date must use the format YYYY-MM-DD");
    }
  }

  // Only validate status if it was included
  if (Object.prototype.hasOwnProperty.call(courseData, "status")) {
    if (!VALID_STATUSES.includes(courseData.status)) {
      errors.push(
        `status must be one of: ${VALID_STATUSES.join(", ")}`
      );
    }
  }

  // Prevent an empty update request
  const editableFields = [
    "name",
    "description",
    "target_date",
    "status"
  ];

  const hasEditableField = editableFields.some((field) =>
    Object.prototype.hasOwnProperty.call(courseData, field)
  );

  if (!hasEditableField) {
    errors.push(
      "At least one of name, description, target_date, or status must be provided"
    );
  }

  return errors;
}

/*
  POST /api/courses

  Add a new course.
*/
app.post("/api/courses", async (req, res, next) => {
  try {
    // Validate the request body before saving anything
    const validationErrors = validateCourseData(req.body);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: "Validation failed",
        details: validationErrors
      });
    }

    const courses = await readCourses();

    /*
      Generate the next ID.

      IDs begin at 1. Using the highest existing ID plus 1
      prevents duplicate IDs if an earlier course was deleted.
    */
    const highestId = courses.reduce((highest, course) => {
      return Math.max(highest, Number(course.id) || 0);
    }, 0);

    const newCourse = {
      id: highestId + 1,
      name: req.body.name.trim(),
      description: req.body.description.trim(),
      target_date: req.body.target_date,
      status: req.body.status,
      created_at: new Date().toISOString()
    };

    courses.push(newCourse);
    await writeCourses(courses);

    // 201 means that a new resource was successfully created
    res.status(201).json(newCourse);
  } catch (error) {
    next(error);
  }
});

/*
  GET /api/courses

  Return all courses.
*/
app.get("/api/courses", async (req, res, next) => {
  try {
    const courses = await readCourses();

    res.status(200).json(courses);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/courses/stats
 *
 * Returns statistics about all courses, including:
 * - Total number of courses
 * - Number of courses grouped by status
 */
app.get("/api/courses/stats", async (req, res) => {
    // Read all courses from courses.json
    const courses = await readCourses();

    // Count courses for each allowed status
    const byStatus = {
      "Not Started": 0,
      "In Progress": 0,
      "Completed": 0
    };

    courses.forEach((course) => {
      // Only count recognized status values
      if (Object.prototype.hasOwnProperty.call(byStatus, course.status)) {
        byStatus[course.status]++;
      }
    });

    // Return the total and status statistics
    return res.status(200).json({
      total: courses.length,
      byStatus
    });
  }
);

/*
  GET /api/courses/:id

  Return one course by its ID.

  Example:
  GET /api/courses/1
*/
app.get("/api/courses/:id", async (req, res, next) => {
  try {
    const courses = await readCourses();

    // Convert the URL parameter to a number for comparison
    const courseId = Number(req.params.id);

    const course = courses.find((item) => item.id === courseId);

    if (!course) {
      return res.status(404).json({
        error: "Course not found"
      });
    }

    res.status(200).json(course);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/courses/:id
 *
 * Partially updates an existing course.
 *
 * Only the fields included in the request body are changed.
 * The id and created_at values cannot be changed.
 */
app.put(
  "/api/courses/:id", async (req, res) => {
    const validationErrors = validateCourseUpdateData(req.body);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: "Validation failed",
        details: validationErrors
      });
    }

    const courses = await readCourses();
    const requestedId = Number(req.params.id);

    const courseIndex = courses.findIndex(
      (course) => course.id === requestedId
    );

    if (courseIndex === -1) {
      return res.status(404).json({
        error: "Course not found"
      });
    }

    // Get the existing course
    const existingCourse = courses[courseIndex];

    // Start with a copy of the existing course
    const updatedCourse = {
      ...existingCourse
    };

    // Update only fields included in the request body
    if (Object.prototype.hasOwnProperty.call(req.body, "name")) {
      updatedCourse.name = req.body.name.trim();
    }

    if (
      Object.prototype.hasOwnProperty.call(req.body, "description")
    ) {
      updatedCourse.description = req.body.description.trim();
    }

    if (
      Object.prototype.hasOwnProperty.call(req.body, "target_date")
    ) {
      updatedCourse.target_date = req.body.target_date;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "status")) {
      updatedCourse.status = req.body.status;
    }

    // Save the updated course
    courses[courseIndex] = updatedCourse;

    await writeCourses(courses);

    return res.status(200).json(updatedCourse);
  }
);

/*
  DELETE /api/courses/:id

  Delete a course by its ID.

  Example:
  DELETE /api/courses/1
*/
app.delete("/api/courses/:id", async (req, res, next) => {
  try {
    const courses = await readCourses();
    const courseId = Number(req.params.id);

    const courseIndex = courses.findIndex(
      (item) => item.id === courseId
    );

    if (courseIndex === -1) {
      return res.status(404).json({
        error: "Course not found"
      });
    }

    // Remove one course from the array
    courses.splice(courseIndex, 1);

    await writeCourses(courses);

    // 204 means the deletion succeeded and there is no response body
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

/*
  Handle requests to routes that do not exist.

  This middleware runs after all declared routes.
*/
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found"
  });
});

/*
  Global error-handling middleware.

  This catches:
  - File read errors
  - File write errors
  - Invalid JSON files
  - Other unexpected errors
*/
app.use((error, req, res, next) => {
  console.error("Error:", error);

  // Express uses a 400 error for malformed JSON request bodies
  if (error instanceof SyntaxError && error.status === 400) {
    return res.status(400).json({
      error: "Request body contains invalid JSON"
    });
  }

  res.status(error.statusCode || 500).json({
    error: "Internal server error",
    message: error.message || "An unexpected error occurred"
  });
});

/*
  Start the Express server.
*/
app.listen(PORT, () => {
  console.log(`CodeCraftHub API is running on port ${PORT}`);
  console.log(`Courses file: ${COURSES_FILE}`);
});