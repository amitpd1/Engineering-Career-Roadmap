import { jsx, jsxs } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable, json } from "@remix-run/node";
import { RemixServer, Outlet, Meta, Links, ScrollRestoration, Scripts, useActionData, useNavigation, Form } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { useState } from "react";
const ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, remixContext, loadContext) {
  return isbot(request.headers.get("user-agent") || "") ? handleBotRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  ) : handleBrowserRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  );
}
function handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
function handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: "Module" }));
const links = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous"
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
  }
];
function Layout({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
      /* @__PURE__ */ jsx(Meta, {}),
      /* @__PURE__ */ jsx(Links, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(ScrollRestoration, {}),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
}
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Layout,
  default: App,
  links
}, Symbol.toStringTag, { value: "Module" }));
const meta = () => {
  return [
    { title: "Engineering Career Roadmap Generator" },
    { name: "description", content: "Generate your personalized 4-year engineering career roadmap." }
  ];
};
function generateSimulatedRoadmap(formData) {
  const discipline = formData.get("discipline");
  const goals = formData.get("goals");
  const interests = formData.get("interests");
  let roadmapData = {
    year1: { skills: [], books: [], courses: [], routine: "Establish strong foundational knowledge. Focus on core math and science. Practice basic programming daily (1-2 hours)." },
    year2: { skills: [], books: [], courses: [], routine: "Deepen discipline-specific knowledge. Start exploring technical interests through projects. Join student clubs." },
    year3: { skills: [], books: [], courses: [], routine: "Focus on advanced topics and specialization. Seek internships. Develop soft skills (communication, teamwork)." },
    year4: { skills: [], books: [], courses: [], routine: "Complete capstone project. Refine job-seeking skills (resume, interviews). Network actively. Prepare for transition to career or further studies." }
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
      roadmapData.year1.skills = ["Core Math/Science", "Basic Problem Solving"];
      roadmapData.year2.skills = ["Introductory Discipline Courses", "Teamwork"];
      roadmapData.year3.skills = ["Advanced Discipline Topics", "Internship Skills"];
      roadmapData.year4.skills = ["Specialization", "Project Completion", "Job Search"];
  }
  if (goals == null ? void 0 : goals.toString().toLowerCase().includes("entrepreneur")) {
    roadmapData.year3.skills.push("Business Basics");
    roadmapData.year4.skills.push("Pitching & Funding Basics");
  }
  if ((interests == null ? void 0 : interests.toString().toLowerCase().includes("ai")) && discipline === "Computer Science") {
    roadmapData.year3.courses.push("Intro to AI/ML");
    roadmapData.year4.courses.push("Advanced ML");
  }
  return roadmapData;
}
const action = async ({ request }) => {
  const formData = await request.formData();
  const roadmap = generateSimulatedRoadmap(formData);
  return json({ roadmap });
};
function Index() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [discipline, setDiscipline] = useState("");
  const [goals, setGoals] = useState("");
  const [interests, setInterests] = useState("");
  const [strengths, setStrengths] = useState("");
  const [weaknesses, setWeaknesses] = useState("");
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900 p-4 sm:p-8 text-gray-800 dark:text-gray-200", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-10", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-3xl sm:text-4xl font-bold text-center mb-8 text-indigo-700 dark:text-indigo-400", children: "Personalized Engineering Career Roadmap" }),
    /* @__PURE__ */ jsxs(Form, { method: "post", className: "space-y-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold mb-4 border-b pb-2 border-gray-300 dark:border-gray-600", children: "Your Information" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "discipline", className: "block text-sm font-medium mb-1", children: "Engineering Discipline:" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            id: "discipline",
            name: "discipline",
            value: discipline,
            onChange: (e) => setDiscipline(e.target.value),
            required: true,
            className: "w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Select Discipline" }),
              /* @__PURE__ */ jsx("option", { value: "Computer Science", children: "Computer Science" }),
              /* @__PURE__ */ jsx("option", { value: "Electrical Engineering", children: "Electrical Engineering" }),
              /* @__PURE__ */ jsx("option", { value: "Mechanical Engineering", children: "Mechanical Engineering" }),
              /* @__PURE__ */ jsx("option", { value: "Civil Engineering", children: "Civil Engineering" }),
              /* @__PURE__ */ jsx("option", { value: "Chemical Engineering", children: "Chemical Engineering" }),
              /* @__PURE__ */ jsx("option", { value: "Other", children: "Other" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "goals", className: "block text-sm font-medium mb-1", children: "Career Goals:" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            id: "goals",
            name: "goals",
            value: goals,
            onChange: (e) => setGoals(e.target.value),
            rows: 3,
            required: true,
            placeholder: "e.g., Software Engineer at a FAANG company, Robotics Engineer, Start my own tech company",
            className: "w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "interests", className: "block text-sm font-medium mb-1", children: "Technical Interests:" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            id: "interests",
            name: "interests",
            value: interests,
            onChange: (e) => setInterests(e.target.value),
            rows: 3,
            required: true,
            placeholder: "e.g., Artificial Intelligence, Renewable Energy, Embedded Systems, Web Development",
            className: "w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "strengths", className: "block text-sm font-medium mb-1", children: "Strengths:" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            id: "strengths",
            name: "strengths",
            value: strengths,
            onChange: (e) => setStrengths(e.target.value),
            rows: 2,
            placeholder: "e.g., Problem-solving, Coding, Teamwork, Math",
            className: "w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "weaknesses", className: "block text-sm font-medium mb-1", children: "Weaknesses / Areas for Improvement:" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            id: "weaknesses",
            name: "weaknesses",
            value: weaknesses,
            onChange: (e) => setWeaknesses(e.target.value),
            rows: 2,
            placeholder: "e.g., Public speaking, Time management, Specific technical area",
            className: "w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "text-center", children: /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: isSubmitting,
          className: "px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600",
          children: isSubmitting ? "Generating..." : "Generate Roadmap"
        }
      ) })
    ] }),
    (actionData == null ? void 0 : actionData.roadmap) && /* @__PURE__ */ jsxs("div", { className: "mt-10 pt-6 border-t border-gray-300 dark:border-gray-600", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold mb-6 text-center", children: "Your 4-Year Roadmap" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-8", children: Object.entries(actionData.roadmap).map(([year, data], index) => /* @__PURE__ */ jsxs("div", { className: "p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 shadow-sm", children: [
        /* @__PURE__ */ jsxs("h3", { className: "text-xl font-semibold mb-3 text-indigo-600 dark:text-indigo-400", children: [
          "Year ",
          index + 1
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm sm:text-base", children: [
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Skills to Develop:" }),
            " ",
            data.skills.join(", ") || "N/A"
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Recommended Books:" }),
            " ",
            data.books.join(", ") || "N/A"
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Suggested Courses:" }),
            " ",
            data.courses.join(", ") || "N/A"
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Daily Routine Guidance:" }),
            " ",
            data.routine || "N/A"
          ] })
        ] })
      ] }, year)) }),
      /* @__PURE__ */ jsx("p", { className: "mt-6 text-xs text-center text-gray-500 dark:text-gray-400", children: "Note: This is a simulated roadmap. A real application would use an LLM for more personalized and detailed results." })
    ] })
  ] }) });
}
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  default: Index,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-BQuqgpiY.js", "imports": ["/assets/components-BoSsIssq.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-B75VbNUd.js", "imports": ["/assets/components-BoSsIssq.js"], "css": ["/assets/root-9DbGPHA8.css"] }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_index-4fGPb1bf.js", "imports": ["/assets/components-BoSsIssq.js"], "css": [] } }, "url": "/assets/manifest-a4f31947.js", "version": "a4f31947" };
const mode = "production";
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "v3_fetcherPersist": true, "v3_relativeSplatPath": true, "v3_throwAbortReason": true, "v3_routeConfig": false, "v3_singleFetch": false, "v3_lazyRouteDiscovery": false, "unstable_optimizeDeps": false };
const isSpaMode = false;
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  mode,
  publicPath,
  routes
};
