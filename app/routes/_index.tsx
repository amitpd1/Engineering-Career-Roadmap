import type { MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { json } from "@remix-run/node";
import { useState } from "react";
import { generateRoadmapWithGemini, GeneratedRoadmap, RoadmapYear } from "~/services/gemini.server"; // Import the Gemini service

export const meta: MetaFunction = () => {
  return [
    { title: "Engineering Career Roadmap Generator" },
    { name: "description", content: "Generate your personalized 4-year engineering career roadmap." },
  ];
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const discipline = formData.get("discipline")?.toString() || "";
  const goals = formData.get("goals")?.toString() || "";
  const interests = formData.get("interests")?.toString() || "";
  const strengths = formData.get("strengths")?.toString();
  const weaknesses = formData.get("weaknesses")?.toString();

  // Basic validation
  if (!discipline || !goals || !interests) {
    return json({ error: "Discipline, Goals, and Interests are required." }, { status: 400 });
  }

  try {
    const result = await generateRoadmapWithGemini({
      discipline,
      goals,
      interests,
      strengths,
      weaknesses,
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


export default function Index() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [discipline, setDiscipline] = useState("");
  const [goals, setGoals] = useState("");
  const [interests, setInterests] = useState("");
  const [strengths, setStrengths] = useState("");
  const [weaknesses, setWeaknesses] = useState("");

  // Type assertion for roadmap data
  const roadmap = actionData?.roadmap as GeneratedRoadmap | undefined;
  const apiError = actionData?.error;

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
              <option value="Aerospace Engineering">Aerospace Engineering</option>
              <option value="Biomedical Engineering">Biomedical Engineering</option>
              <option value="Software Engineering">Software Engineering</option>
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
              placeholder="e.g., AI Researcher, Lead Hardware Engineer at a startup, Develop sustainable energy solutions"
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
              placeholder="e.g., Machine Learning, Robotics, Quantum Computing, Materials Science, Control Systems"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="strengths" className="block text-sm font-medium mb-1">Strengths (Optional):</label>
            <textarea
              id="strengths"
              name="strengths"
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              rows={2}
              placeholder="e.g., Strong analytical skills, Proficient in C++, Excellent team collaborator"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="weaknesses" className="block text-sm font-medium mb-1">Weaknesses / Areas for Improvement (Optional):</label>
            <textarea
              id="weaknesses"
              name="weaknesses"
              value={weaknesses}
              onChange={(e) => setWeaknesses(e.target.value)}
              rows={2}
              placeholder="e.g., Need to improve presentation skills, Less familiar with cloud platforms"
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

        {isSubmitting && (
           <div className="mt-10 text-center">
             <p className="text-lg text-indigo-600 dark:text-indigo-400 animate-pulse">Generating your personalized roadmap with AI...</p>
           </div>
        )}

        {apiError && (
          <div className="mt-10 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-md">
            <h3 className="font-bold">Error Generating Roadmap</h3>
            <p>{apiError}</p>
          </div>
        )}

        {roadmap && !apiError && (
          <div className="mt-10 pt-6 border-t border-gray-300 dark:border-gray-600">
            <h2 className="text-2xl font-semibold mb-6 text-center">Your 4-Year Roadmap</h2>
            <div className="space-y-8">
              {roadmap.years.map((yearData: RoadmapYear) => (
                <div key={yearData.year} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 shadow-sm">
                  <h3 className="text-xl font-semibold mb-3 text-indigo-600 dark:text-indigo-400">Year {yearData.year}: {yearData.focus || 'Focus Area'}</h3>
                  <div className="space-y-3 text-sm sm:text-base">
                    <p><strong>Skills to Develop:</strong> {yearData.skills?.join(', ') || 'N/A'}</p>
                    <p><strong>Project Ideas:</strong> {yearData.projects?.join('; ') || 'N/A'}</p>
                    <p><strong>Suggested Courses:</strong> {yearData.courses?.join(', ') || 'N/A'}</p>
                    <p><strong>Recommended Books:</strong> {yearData.books?.join(', ') || 'N/A'}</p>
                    {yearData.networking && <p><strong>Networking:</strong> {yearData.networking.join('; ') || 'N/A'}</p>}
                    {yearData.internships && <p><strong>Internships:</strong> {yearData.internships.join('; ') || 'N/A'}</p>}
                    {yearData.routine && <p><strong>Routine Guidance:</strong> {yearData.routine || 'N/A'}</p>}
                    {yearData.advice && <p><strong>Additional Advice:</strong> {yearData.advice || 'N/A'}</p>}
                  </div>
                </div>
              ))}
            </div>
            {roadmap.overall_advice && (
              <div className="mt-8 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-indigo-50 dark:bg-indigo-900 shadow-sm">
                 <h3 className="text-lg font-semibold mb-2 text-indigo-700 dark:text-indigo-300">Overall Advice</h3>
                 <p className="text-sm sm:text-base">{roadmap.overall_advice}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
