import type { MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { json } from "@remix-run/node";
import { useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Engineering Career Roadmap Generator" },
    { name: "description", content: "Generate your personalized 4-year engineering career roadmap." },
  ];
};

// Simulate LLM response generation
function generateSimulatedRoadmap(formData: FormData) {
  const discipline = formData.get("discipline");
  const goals = formData.get("goals");
  const interests = formData.get("interests");
  // In a real app, send this data to an LLM backend
  // For now, return placeholder data based on discipline

  let roadmapData: Record<string, any> = {
    year1: { skills: [], books: [], courses: [], routine: "Establish strong foundational knowledge. Focus on core math and science. Practice basic programming daily (1-2 hours)." },
    year2: { skills: [], books: [], courses: [], routine: "Deepen discipline-specific knowledge. Start exploring technical interests through projects. Join student clubs." },
    year3: { skills: [], books: [], courses: [], routine: "Focus on advanced topics and specialization. Seek internships. Develop soft skills (communication, teamwork)." },
    year4: { skills: [], books: [], courses: [], routine: "Complete capstone project. Refine job-seeking skills (resume, interviews). Network actively. Prepare for transition to career or further studies." },
  };

  switch (discipline) {
    case "Computer Science":
      roadmapData.year1.skills = ["Basic Python/Java", "Data Structures (Arrays, Lists)", "Algorithms (Sorting, Searching)", "Version Control (Git Basics)"];
      roadmapData.year1.books = ["'Structure and Interpretation of Computer Programs'", "'Clean Code'"];
      roadmapData.year1.courses = ["Intro to Programming", "Calculus I & II", "Discrete Mathematics"];
      roadmapData.year2.skills = ["Object-Oriented Programming", "Advanced Data Structures (Trees, Graphs)", "Database Fundamentals (SQL)", "Web Development Basics (HTML, CSS, JS)"];
      roadmapData.year2.books = ["'Introduction to Algorithms (CLRS)'", "'Database System Concepts'"];
      roadmapData.year2.courses = ["Data Structures & Algorithms", "Computer Architecture", "Linear Algebra"];
      roadmapData.year3.skills = ["Operating Systems Concepts", "Networking Fundamentals", "Software Engineering Principles", "Frameworks (React/Angular/Vue or Django/Spring)"];
      roadmapData.year3.books = ["'Operating System Concepts'", "'Computer Networking: A Top-Down Approach'"];
      roadmapData.year3.courses = ["Operating Systems", "Software Engineering", "Electives based on interests (AI, Security, etc.)"];
      roadmapData.year4.skills = ["System Design", "Cloud Computing Basics (AWS/Azure/GCP)", "Advanced Algorithms", "Specialization Skills (e.g., ML, Cybersecurity)"];
      roadmapData.year4.books = ["'Designing Data-Intensive Applications'", "Specialization-specific books"];
      roadmapData.year4.courses = ["Capstone Project", "Advanced Electives", "Professional Development"];
      break;
    case "Electrical Engineering":
      roadmapData.year1.skills = ["Circuit Analysis Basics", "Basic Programming (Python/C)", "Problem-Solving"];
      roadmapData.year1.books = ["'Fundamentals of Electric Circuits'", "'Calculus: Early Transcendentals'"];
      roadmapData.year1.courses = ["Intro to EE", "Calculus I & II", "Physics I & II (E&M)"];
      roadmapData.year2.skills = ["Digital Logic Design", "Signals and Systems", "Electronics I (Diodes, Transistors)"];
      roadmapData.year2.books = ["'Microelectronic Circuits'", "'Signals and Systems'"];
      roadmapData.year2.courses = ["Circuit Theory", "Digital Systems", "Differential Equations"];
      roadmapData.year3.skills = ["Electromagnetics", "Control Systems", "Communication Systems Basics", "Embedded Systems (Microcontrollers)"];
      roadmapData.year3.books = ["'Engineering Electromagnetics'", "'Control Systems Engineering'"];
      roadmapData.year3.courses = ["Electromagnetics", "Electronics II", "Signals & Systems II"];
      roadmapData.year4.skills = ["Advanced Specialization (e.g., Power, RF, VLSI)", "Project Management", "Technical Writing"];
      roadmapData.year4.books = ["Specialization-specific textbooks"];
      roadmapData.year4.courses = ["Capstone Design", "Advanced Electives", "Engineering Ethics"];
      break;
    case "Mechanical Engineering":
      roadmapData.year1.skills = ["Statics & Dynamics Basics", "CAD Software Basics", "Problem-Solving"];
      roadmapData.year1.books = ["'Engineering Mechanics: Statics & Dynamics'", "'Calculus: Early Transcendentals'"];
      roadmapData.year1.courses = ["Intro to Engineering Design", "Calculus I & II", "Physics I (Mechanics)", "Chemistry"];
      roadmapData.year2.skills = ["Thermodynamics", "Fluid Mechanics Basics", "Strength of Materials", "Manufacturing Processes"];
      roadmapData.year2.books = ["'Fundamentals of Thermodynamics'", "'Fundamentals of Fluid Mechanics'"];
      roadmapData.year2.courses = ["Thermodynamics", "Solid Mechanics", "Materials Science", "Differential Equations"];
      roadmapData.year3.skills = ["Heat Transfer", "Machine Design", "Control Systems Basics", "FEA Software Basics"];
      roadmapData.year3.books = ["'Fundamentals of Heat and Mass Transfer'", "'Shigley's Mechanical Engineering Design'"];
      roadmapData.year3.courses = ["Heat Transfer", "Machine Design", "Fluid Mechanics II", "Dynamic Systems & Control"];
      roadmapData.year4.skills = ["Advanced Specialization (e.g., Robotics, Energy Systems)", "Project Management", "Technical Communication"];
      roadmapData.year4.books = ["Specialization-specific textbooks"];
      roadmapData.year4.courses = ["Capstone Design", "Advanced Electives", "Engineering Economics"];
      break;
    default:
      // Generic roadmap if discipline not matched
      roadmapData.year1.skills = ["Core Math/Science", "Basic Problem Solving"];
      roadmapData.year2.skills = ["Introductory Discipline Courses", "Teamwork"];
      roadmapData.year3.skills = ["Advanced Discipline Topics", "Internship Skills"];
      roadmapData.year4.skills = ["Specialization", "Project Completion", "Job Search"];
  }

  // Add goals and interests influence (simple simulation)
  if (goals?.toString().toLowerCase().includes("entrepreneur")) {
     roadmapData.year3.skills.push("Business Basics");
     roadmapData.year4.skills.push("Pitching & Funding Basics");
  }
   if (interests?.toString().toLowerCase().includes("ai") && discipline === "Computer Science") {
     roadmapData.year3.courses.push("Intro to AI/ML");
     roadmapData.year4.courses.push("Advanced ML");
   }


  return roadmapData;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  // TODO: Add validation here
  const roadmap = generateSimulatedRoadmap(formData);
  return json({ roadmap });
};


export default function Index() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [discipline, setDiscipline] = useState("");
  const [goals, setGoals] = useState("");
  const [interests, setInterests] = useState("");
  const [strengths, setStrengths] = useState("");
  const [weaknesses, setWeaknesses] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900 p-4 sm:p-8 text-gray-800 dark:text-gray-200">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-indigo-700 dark:text-indigo-400">
          Personalized Engineering Career Roadmap
        </h1>

        <Form method="post" className="space-y-6">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2 border-gray-300 dark:border-gray-600">Your Information</h2>
          <div>
            <label htmlFor="discipline" className="block text-sm font-medium mb-1">Engineering Discipline:</label>
            <select
              id="discipline"
              name="discipline"
              value={discipline}
              onChange={(e) => setDiscipline(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select Discipline</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
              <option value="Chemical Engineering">Chemical Engineering</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="goals" className="block text-sm font-medium mb-1">Career Goals:</label>
            <textarea
              id="goals"
              name="goals"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              rows={3}
              required
              placeholder="e.g., Software Engineer at a FAANG company, Robotics Engineer, Start my own tech company"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="interests" className="block text-sm font-medium mb-1">Technical Interests:</label>
            <textarea
              id="interests"
              name="interests"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              rows={3}
              required
              placeholder="e.g., Artificial Intelligence, Renewable Energy, Embedded Systems, Web Development"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="strengths" className="block text-sm font-medium mb-1">Strengths:</label>
            <textarea
              id="strengths"
              name="strengths"
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              rows={2}
              placeholder="e.g., Problem-solving, Coding, Teamwork, Math"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="weaknesses" className="block text-sm font-medium mb-1">Weaknesses / Areas for Improvement:</label>
            <textarea
              id="weaknesses"
              name="weaknesses"
              value={weaknesses}
              onChange={(e) => setWeaknesses(e.target.value)}
              rows={2}
              placeholder="e.g., Public speaking, Time management, Specific technical area"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              {isSubmitting ? "Generating..." : "Generate Roadmap"}
            </button>
          </div>
        </Form>

        {actionData?.roadmap && (
          <div className="mt-10 pt-6 border-t border-gray-300 dark:border-gray-600">
            <h2 className="text-2xl font-semibold mb-6 text-center">Your 4-Year Roadmap</h2>
            <div className="space-y-8">
              {Object.entries(actionData.roadmap).map(([year, data]: [string, any], index) => (
                <div key={year} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 shadow-sm">
                  <h3 className="text-xl font-semibold mb-3 text-indigo-600 dark:text-indigo-400">Year {index + 1}</h3>
                  <div className="space-y-2 text-sm sm:text-base">
                    <p><strong>Skills to Develop:</strong> {data.skills.join(', ') || 'N/A'}</p>
                    <p><strong>Recommended Books:</strong> {data.books.join(', ') || 'N/A'}</p>
                    <p><strong>Suggested Courses:</strong> {data.courses.join(', ') || 'N/A'}</p>
                    <p><strong>Daily Routine Guidance:</strong> {data.routine || 'N/A'}</p>
                  </div>
                </div>
              ))}
            </div>
             <p className="mt-6 text-xs text-center text-gray-500 dark:text-gray-400">
                Note: This is a simulated roadmap. A real application would use an LLM for more personalized and detailed results.
             </p>
          </div>
        )}
      </div>
    </div>
  );
}
