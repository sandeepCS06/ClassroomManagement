import { useRouter } from "next/router";
import { useState, useEffect } from "react"; // Import useState and useEffect
import axios from "axios";
import "chart.js/auto";
import { LineChart } from "../components/linechart";
import { Chart } from "react-chartjs-2";

const Student = () => {
  const router = useRouter();
  const { uid } = router.query;
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  const getStudentGrades = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/grades/user/${uid}`
      );
      setGrades(response.data.grades);
      console.log("Grades:", response.data.grades);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching grades:", error);
    }
  };

  useEffect(() => {
    if (uid) {
      getStudentGrades();
    }
  }, [uid]);

  const data = {
    labels: grades.map((grade) => grade.assignment_name),
    datasets: [
      {
        label: "Marks",
        data: grades.map((grade) => grade.marks),
        fill: false,
        backgroundColor: "rgb(255, 99, 132)",
        borderColor: "rgba(255, 99, 132, 0.2)",
      },
      {
        label: "Highest Marks",
        data: grades.map((grade) => grade.highest_marks),
        fill: false,
        backgroundColor: "rgb(54, 162, 235)",
        borderColor: "rgba(54, 162, 235, 0.2)",
      },
      {
        label: "Lowest Marks",
        data: grades.map((grade) => grade.lowest_marks),
        fill: false,
        backgroundColor: "rgb(75, 192, 192)",
        borderColor: "rgba(75, 192, 192, 0.2)",
      },
      {
        label: "Average Marks",
        data: grades.map((grade) => grade.average_marks),
        fill: false,
        backgroundColor: "rgb(255, 205, 86)",
        borderColor: "rgba(255, 205, 86, 0.2)",
      },
    ],
  };

  // data for bargraph x-axis: assignment name, y-axis: count
  const barData = {
    labels: grades.map((grade) => grade.assignment_name),
    datasets: [
      {
        label: "Submissions",
        data: grades.map((grade) => grade.count),
        fill: false,
        backgroundColor: "rgb(255, 99, 132)",
        borderColor: "rgba(255, 99, 132, 0.2)",
      },
    ],
  };

  const barOptions = {
    indexAxis: "x",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  const chartContainerStyle = {
    backgroundColor: "#fff !important",
    padding: "2rem",
    paddingTop: "0",
    display: "flex",
    textAlign: "center",
    justifyContent: "center",
  };

  const piechartContainerStyle = {
    height: "400px",
    display: "flex",
    textAlign: "center",
    justifyContent: "center",
  };

  // data for piechart
  // should contain total_assignments / toatal_I_submitted / total_I_did_not_submit
  if (grades.length === 0) {
    grades.push({ total_assignments: 0 });
  }

  const pieData = {
    labels: ["Submitted", "Not Submitted"],
    datasets: [
      {
        label: "Assignments",
        data: [grades.length, grades[0].total_assignments - grades.length],
        fill: false,
        backgroundColor: ["rgb(255, 99, 132)", "rgb(54, 162, 235)"],
        borderColor: "rgba(255, 99, 132, 0.2)",
      },
    ],
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f0f0f0",
        padding: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          padding: "2rem",
          paddingTop: "0",
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
          <h1 style={{ textAlign: "center" }}>Student</h1>
          <h5 style={{ textAlign: "center" }}>
            Welcome, {grades[0] ? grades[0].username : "Student"}
          </h5>
        </div>
        {loading ? (
          <p style={{ color: "#333" }}>Loading...</p>
        ) : (
          <div>
            <h2 style={{ color: "#333" }}>Grades</h2>
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
                      Assignment
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
                        <strong>
                          {grade.assignment_name}({grade.count}){" "}
                        </strong>
                        - H: {grade.highest_marks}, L: {grade.lowest_marks}
                      </td>
                      <td
                        style={{
                          padding: "0.5rem",
                          color: "#333",
                          textAlign: "left",
                        }}
                      >
                        {/* If greater than average_marks then green else red */}
                        <span
                          style={{
                            color:
                              grade.marks >= grade.average_marks
                                ? "green"
                                : "red",
                          }}
                        >
                          {grade.marks}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        {grades.length > 0 && (
          <div
            style={{
              backgroundColor: "#fff",
              padding: "2rem",
              display: "flex",
              textAlign: "center",
              justifyContent: "center",
            }}
          >
            <LineChart data={data} />
          </div>
        )}
        {grades.length > 0 && (
          <div style={chartContainerStyle}>
            <Chart type="bar" data={barData} options={barOptions} />
          </div>
        )}

        {grades.length > 0 ? (
          <div style={piechartContainerStyle}>
            <Chart type="pie" data={pieData} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Student;
