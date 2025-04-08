import { jsx, jsxs } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable, json } from "@remix-run/node";
import { RemixServer, Outlet, Meta, Links, ScrollRestoration, Scripts, useActionData, useNavigation, Form } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { useState } from "react";
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
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
const MODEL_NAME = "gemini-1.5-flash";
function getApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in the environment variables.");
  }
  return apiKey;
}
const genAI = new GoogleGenerativeAI(getApiKey());
const model = genAI.getGenerativeModel({ model: MODEL_NAME });
const generationConfig = {
  temperature: 0.8,
  // Adjust for creativity vs. predictability
  topK: 1,
  topP: 1,
  maxOutputTokens: 8192
  // Adjust based on expected roadmap length
};
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE }
];
function buildPrompt(input) {
  return `
Generate a detailed, personalized 4-year career roadmap for an aspiring engineer with the following profile:

**Discipline:** ${input.discipline}
**Career Goals:** ${input.goals}
**Technical Interests:** ${input.interests}
${input.strengths ? `**Strengths:** ${input.strengths}` : ""}
${input.weaknesses ? `**Weaknesses / Areas for Improvement:** ${input.weaknesses}` : ""}

**Instructions:**
1.  Create a year-by-year plan covering 4 years.
2.  For each year, provide specific, actionable advice including:
    *   **Focus:** The main theme or objective for the year.
    *   **Skills:** Key technical and soft skills to develop (list 3-5).
    *   **Projects:** Ideas for personal or academic projects to build skills (list 1-3).
    *   **Courses:** Relevant university courses or online certifications (list 2-4).
    *   **Books:** Foundational or advanced books to read (list 1-3).
    *   **Networking:** Suggestions for connecting with peers and professionals.
    *   **Internships:** When and how to seek internships (especially for years 2-4).
    *   **Routine:** Guidance on daily/weekly study and practice habits.
    *   **Advice:** Any other relevant tips for that year.
3.  Include overall advice applicable throughout the 4 years.
4.  Tailor the roadmap specifically to the provided discipline, goals, and interests. Consider strengths and weaknesses if provided.
5.  **CRITICAL: Output ONLY the raw JSON object.** Do not include markdown formatting like \`\`\`json or any introductory/explanatory text before or after the JSON object. The entire response must be the JSON object itself.
6.  **JSON Structure:** The JSON object MUST strictly follow this structure:
    \`\`\`json
    {
      "years": [
        {
          "year": 1,
          "focus": "...",
          "skills": ["...", "..."],
          "projects": ["...", "..."],
          "courses": ["...", "..."],
          "books": ["...", "..."],
          "networking": ["...", "..."],
          "internships": ["..."],
          "routine": "...",
          "advice": "..."
        },
        // ... years 2, 3, 4
      ],
      "overall_advice": "..."
    }
    \`\`\`
7.  Ensure the JSON is well-formed and complete.
`;
}
function extractJson(text) {
  const codeBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    return codeBlockMatch[1].trim();
  }
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch && jsonMatch[0]) {
    return jsonMatch[0].trim();
  }
  return null;
}
async function generateRoadmapWithGemini(input) {
  try {
    const prompt = buildPrompt(input);
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings
    });
    const response = result.response;
    const rawText = response.text();
    console.log("Raw Gemini Response Text:", rawText);
    const jsonString = extractJson(rawText);
    if (!jsonString) {
      console.error("Could not extract valid JSON from LLM response.");
      console.error("Raw LLM Response:", rawText);
      return { error: "Failed to process the roadmap generated by the AI. The format was invalid or JSON could not be extracted." };
    }
    console.log("Extracted JSON String:", jsonString);
    try {
      const roadmap = JSON.parse(jsonString);
      if (!roadmap || !Array.isArray(roadmap.years) || roadmap.years.length === 0) {
        console.error("Invalid JSON structure after parsing:", roadmap);
        throw new Error("LLM returned an invalid roadmap structure.");
      }
      if (!roadmap.years.every((y) => typeof y.year === "number")) {
        console.error("Invalid year structure in roadmap:", roadmap.years);
        throw new Error("LLM returned roadmap with invalid year structure.");
      }
      return roadmap;
    } catch (parseError) {
      console.error("Failed to parse extracted JSON string:", parseError);
      console.error("Extracted JSON String Attempted:", jsonString);
      console.error("Original Raw LLM Response:", rawText);
      return { error: "Failed to process the roadmap generated by the AI. The format was invalid after extraction." };
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes("API key not valid")) {
      return { error: "Invalid Gemini API Key. Please check your .env file." };
    }
    if (error instanceof Error && error.message.includes("SAFETY")) {
      return { error: "The AI response was blocked due to safety settings. Try adjusting your input or the safety thresholds." };
    }
    return { error: "An error occurred while generating the roadmap with the AI." };
  }
}
const meta = () => {
  return [
    { title: "Engineering Career Roadmap Generator" },
    { name: "description", content: "Generate your personalized 4-year engineering career roadmap." }
  ];
};
const action = async ({ request }) => {
  var _a, _b, _c, _d, _e;
  const formData = await request.formData();
  const discipline = ((_a = formData.get("discipline")) == null ? void 0 : _a.toString()) || "";
  const goals = ((_b = formData.get("goals")) == null ? void 0 : _b.toString()) || "";
  const interests = ((_c = formData.get("interests")) == null ? void 0 : _c.toString()) || "";
  const strengths = (_d = formData.get("strengths")) == null ? void 0 : _d.toString();
  const weaknesses = (_e = formData.get("weaknesses")) == null ? void 0 : _e.toString();
  if (!discipline || !goals || !interests) {
    return json({ error: "Discipline, Goals, and Interests are required." }, { status: 400 });
  }
  try {
    const result = await generateRoadmapWithGemini({
      discipline,
      goals,
      interests,
      strengths,
      weaknesses
    });
    if ("error" in result) {
      return json({ error: result.error }, { status: 500 });
    }
    return json({ roadmap: result });
  } catch (error) {
    console.error("Action error:", error);
    return json({ error: "Failed to generate roadmap due to an unexpected server error." }, { status: 500 });
  }
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
  const roadmap = actionData == null ? void 0 : actionData.roadmap;
  const apiError = actionData == null ? void 0 : actionData.error;
  const safeJoin = (arr, separator = ", ") => {
    return Array.isArray(arr) && arr.length > 0 ? arr.join(separator) : "N/A";
  };
  const handleDownload = () => {
    console.log("handleDownload called");
    if (!roadmap) {
      console.error("Download attempted but roadmap data is missing.");
      return;
    }
    console.log("Roadmap data for download:", roadmap);
    try {
      const jsonString = JSON.stringify(roadmap, null, 2);
      console.log("Generated JSON string for download:", jsonString);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `engineering_roadmap_${discipline.toLowerCase().replace(/\s+/g, "_") || "custom"}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      console.log("Download triggered successfully.");
    } catch (error) {
      console.error("Error during download process:", error);
    }
  };
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
              /* @__PURE__ */ jsx("option", { value: "Aerospace Engineering", children: "Aerospace Engineering" }),
              /* @__PURE__ */ jsx("option", { value: "Biomedical Engineering", children: "Biomedical Engineering" }),
              /* @__PURE__ */ jsx("option", { value: "Software Engineering", children: "Software Engineering" }),
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
            placeholder: "e.g., AI Researcher, Lead Hardware Engineer at a startup, Develop sustainable energy solutions",
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
            placeholder: "e.g., Machine Learning, Robotics, Quantum Computing, Materials Science, Control Systems",
            className: "w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "strengths", className: "block text-sm font-medium mb-1", children: "Strengths (Optional):" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            id: "strengths",
            name: "strengths",
            value: strengths,
            onChange: (e) => setStrengths(e.target.value),
            rows: 2,
            placeholder: "e.g., Strong analytical skills, Proficient in C++, Excellent team collaborator",
            className: "w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "weaknesses", className: "block text-sm font-medium mb-1", children: "Weaknesses / Areas for Improvement (Optional):" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            id: "weaknesses",
            name: "weaknesses",
            value: weaknesses,
            onChange: (e) => setWeaknesses(e.target.value),
            rows: 2,
            placeholder: "e.g., Need to improve presentation skills, Less familiar with cloud platforms",
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
    isSubmitting && /* @__PURE__ */ jsx("div", { className: "mt-10 text-center", children: /* @__PURE__ */ jsx("p", { className: "text-lg text-indigo-600 dark:text-indigo-400 animate-pulse", children: "Generating your personalized roadmap with AI..." }) }),
    apiError && /* @__PURE__ */ jsxs("div", { className: "mt-10 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-md", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold", children: "Error Generating Roadmap" }),
      /* @__PURE__ */ jsx("p", { children: apiError })
    ] }),
    roadmap && !apiError && /* @__PURE__ */ jsxs("div", { className: "mt-10 pt-6 border-t border-gray-300 dark:border-gray-600", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold text-center flex-grow", children: "Your 4-Year Roadmap" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleDownload,
            className: "px-4 py-1 bg-green-600 text-white text-sm font-semibold rounded-md shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600",
            children: "Download JSON"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-8", children: roadmap.years.map((yearData) => /* @__PURE__ */ jsxs("div", { className: "p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 shadow-sm", children: [
        /* @__PURE__ */ jsxs("h3", { className: "text-xl font-semibold mb-3 text-indigo-600 dark:text-indigo-400", children: [
          "Year ",
          yearData.year,
          ": ",
          yearData.focus || "Focus Area"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm sm:text-base", children: [
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Skills to Develop:" }),
            " ",
            safeJoin(yearData.skills)
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Project Ideas:" }),
            " ",
            safeJoin(yearData.projects, "; ")
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Suggested Courses:" }),
            " ",
            safeJoin(yearData.courses)
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Recommended Books:" }),
            " ",
            safeJoin(yearData.books)
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Networking:" }),
            " ",
            safeJoin(yearData.networking, "; ")
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Internships:" }),
            " ",
            safeJoin(yearData.internships, "; ")
          ] }),
          " ",
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Routine Guidance:" }),
            " ",
            yearData.routine || "N/A"
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Additional Advice:" }),
            " ",
            yearData.advice || "N/A"
          ] })
        ] })
      ] }, yearData.year)) }),
      roadmap.overall_advice && /* @__PURE__ */ jsxs("div", { className: "mt-8 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-indigo-50 dark:bg-indigo-900 shadow-sm", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold mb-2 text-indigo-700 dark:text-indigo-300", children: "Overall Advice" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm sm:text-base", children: roadmap.overall_advice })
      ] })
    ] })
  ] }) });
}
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  default: Index,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-BQuqgpiY.js", "imports": ["/assets/components-BoSsIssq.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-CT9bneFI.js", "imports": ["/assets/components-BoSsIssq.js"], "css": ["/assets/root-Ck42eRAG.css"] }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_index-CyTzNhzq.js", "imports": ["/assets/components-BoSsIssq.js"], "css": [] } }, "url": "/assets/manifest-044b7c3c.js", "version": "044b7c3c" };
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
