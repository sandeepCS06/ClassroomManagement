import { useState, useEffect } from "react";
import axios from "axios";
import { LineChart } from "../components/linechart";

const Teacher = () => {
  const [assignments, setAssignments] = useState([]);
  const [newAssignmentName, setNewAssignmentName] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [editingGrade, setEditingGrade] = useState(null);
  const [editingMarks, setEditingMarks] = useState("");
  const [newGradeStudent, setNewGradeStudent] = useState("");
  const [newGradeMarks, setNewGradeMarks] = useState("");
  const [loading, setLoading] = useState(true);

  const data = {
    labels: assignments.map((assignment) => assignment.assignment_name),
    datasets: [
      {
        label: "Highest Marks",
        data: assignments.map((assignment) => assignment.highest_marks),
        fill: false,
        backgroundColor: "rgb(255, 99, 132)",
        borderColor: "rgba(255, 99, 132, 0.2)",
      },
      {
        label: "Lowest Marks",
        data: assignments.map((assignment) => assignment.lowest_marks),
        fill: false,
        backgroundColor: "rgb(54, 162, 235)",
        borderColor: "rgba(54, 162, 235, 0.2)",
      },
      {
        label: "Average Marks",
        data: assignments.map((assignment) => assignment.average_marks),
        fill: false,
        backgroundColor: "rgb(75, 192, 192)",
        borderColor: "rgba(75, 192, 192, 0.2)",
      },
      {
        label: "Submitted",
        data: assignments.map((assignment) => assignment.grade_count),
        fill: false,
        backgroundColor: "rgb(255, 205, 86)",
        borderColor: "rgba(255, 205, 86, 0.2)",
      },
    ],
  };

  // Fetch all assignments
  const fetchAssignments = async () => {
    try {
      const response = await axios.get("http://localhost:8000/assignments/");
      setAssignments(response.data.assignments);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  // Fetch student grades for a selected assignment
  const fetchGradesForAssignment = async (aid) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/grades/assignment/${aid}`
      );
      setGrades(response.data.grades);
    } catch (error) {
      console.error("Error fetching grades for assignment:", error);
    }
  };

  //   Fetch all students
  const fetchStudents = async () => {
    try {
      const response = await axios.get("http://localhost:8000/login/");

      // filter role to get only students, only name and id
      const students = response.data.users.filter(
        (user) => user.role === "student"
      );
      setStudents(students);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  // Add new assignment
  const addAssignment = async () => {
    try {
      await axios.post("http://localhost:8000/assignments/", {
        assignment_name: newAssignmentName,
      });
      setNewAssignmentName("");
      fetchAssignments(); // Refresh assignments after adding a new one
    } catch (error) {
      console.error("Error adding assignment:", error);
    }
  };

  // Edit existing grade
  const editGrade = async () => {
    try {
      await axios.post(
        `http://localhost:8000/grades/assignment/${selectedAssignment.aid}`,
        {
          marks: editingMarks,
          uid: editingGrade.uid,
        }
      );
      setEditingGrade(null);
      setEditingMarks("");
      fetchGradesForAssignment(selectedAssignment.aid); // Refresh grades after editing
    } catch (error) {
      console.error("Error editing grade:", error);
    }
  };

  // Grade new student
  const gradeNewStudent = async () => {
    try {
      await axios.post(
        `http://localhost:8000/grades/assignment/${selectedAssignment.aid}`,
        {
          uid: newGradeStudent,
          aid: selectedAssignment.aid,
          marks: newGradeMarks,
        }
      );
      setNewGradeStudent("");
      setNewGradeMarks("");
      fetchGradesForAssignment(selectedAssignment.aid); // Refresh grades after grading new student
    } catch (error) {
      console.error("Error grading new student:", error);
    }
  };

  const handleAssignmentClick = (assignment) => {
    setSelectedAssignment(assignment);
    fetchGradesForAssignment(assignment.aid);
  };

  useEffect(() => {
    fetchAssignments();
    fetchStudents();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f0f0f0",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          padding: "2rem",
          border: "1px solid #ccc",
          borderRadius: "8px",
          backgroundColor: "#fff",
          width: "80%",
        }}
      >
        <div
          style={{
            backgroundColor: "#333",
            color: "#fff",
            padding: "1rem",
            borderRadius: "8px 8px 0 0",
          }}
        >
          <h1 style={{ textAlign: "center" }}>Teacher Dashboard</h1>
        </div>
        {loading ? (
          <p style={{ color: "#333" }}>Loading...</p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h2 style={{ color: "#333" }}>All Assignments</h2>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "2px",
              }}
            >
              <div
                style={{
                  width: "29%",
                }}
              >
                {assignments.length === 0 ? (
                  <p style={{ color: "#333" }}>No assignments available</p>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #ccc" }}>
                        <th style={{ padding: "0.5rem", color: "#333" }}>
                          Assignment
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map((assignment) => (
                        <button
                          key={assignment.aid}
                          onClick={() => handleAssignmentClick(assignment)}
                          style={{
                            padding: "0.5rem",
                            color: "#333",
                            marginBottom: "2px",
                            textAlign: "left",
                            width: "100%",
                            border: "1px solid",
                            cursor: "pointer",
                          }}
                        >
                          {assignment.assignment_name}
                        </button>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div
                style={{
                  width: "69%",
                  paddingLeft: "1rem",
                }}
              >
                <LineChart data={data} />
              </div>
            </div>
          </div>
        )}
        <h2 style={{ color: "#333" }}>Add New Assignment</h2>
        <input
          type="text"
          value={newAssignmentName}
          onChange={(e) => setNewAssignmentName(e.target.value)}
          placeholder="Enter assignment name"
        />
        <button onClick={addAssignment}>Add Assignment</button>

        {selectedAssignment && (
          <>
            <h2 style={{ color: "#333" }}>
              {selectedAssignment.assignment_name} Grades
            </h2>
            {grades.length === 0 ? (
              <p style={{ color: "#333" }}>No grades available</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #ccc" }}>
                    <th
                      style={{
                        padding: "0.5rem",
                        color: "#333",
                        textAlign: "left",
                        fontSize: "1.2rem",
                      }}
                    >
                      Roll
                    </th>
                    <th
                      style={{
                        padding: "0.5rem",
                        color: "#333",
                        textAlign: "left",
                        fontSize: "1.2rem",
                      }}
                    >
                      Name
                    </th>
                    <th
                      style={{
                        padding: "0.5rem",
                        color: "#333",
                        textAlign: "left",
                        fontSize: "1.2rem",
                      }}
                    >
                      Marks
                    </th>
                    <th
                      style={{
                        padding: "0.5rem",
                        color: "#333",
                        textAlign: "left",
                        fontSize: "1.2rem",
                      }}
                    >
                      Edit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((grade) => (
                    <tr key={grade.gid}>
                      <td
                        style={{
                          padding: "0.5rem",
                          color: "#333",
                          textAlign: "left",
                        }}
                      >
                        {grade.uid}
                      </td>
                      <td
                        style={{
                          padding: "0.5rem",
                          color: "#333",
                          textAlign: "left",
                        }}
                      >
                        {grade.username}
                      </td>
                      <td
                        style={{
                          padding: "0.5rem",
                          color: "#333",
                          textAlign: "left",
                        }}
                      >
                        {grade.marks}
                      </td>
                      <td
                        style={{
                          padding: "0.5rem",
                          color: "#333",
                          textAlign: "left",
                        }}
                      >
                        <button
                          onClick={() => {
                            setEditingGrade(grade);
                            setEditingMarks(grade.marks);
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {editingGrade && (
              <div>
                <input
                  type="text"
                  value={editingMarks}
                  onChange={(e) => setEditingMarks(e.target.value)}
                  placeholder="Enter new marks"
                />
                <button onClick={editGrade}>Save</button>
              </div>
            )}

            <h2 style={{ color: "#333" }}>Grade New Student</h2>
            <select
              value={newGradeStudent}
              onChange={(e) => setNewGradeStudent(e.target.value)}
            >
              <option value="">Select Student</option>
              {students.map((student) => (
                <option key={student.uid} value={student.uid}>
                  {student.username}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={newGradeMarks}
              onChange={(e) => setNewGradeMarks(e.target.value)}
              placeholder="Enter marks"
            />
            <button onClick={gradeNewStudent}>Grade</button>
          </>
        )}
      </div>
    </div>
  );
};

export default Teacher;
