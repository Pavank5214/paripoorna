const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Project = require("../models/project");
const Task = require("../models/task");
const Cost = require("../models/cost");
const Issue = require("../models/issue");
const Log = require("../models/logs");
const Material = require("../models/material");
const Payment = require("../models/payment");
const Worker = require("../models/worker");
const Chat = require("../models/chat"); // Chat model

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/plan", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  try {
    const lowerPrompt = prompt.toLowerCase();

    // Determine relevant data types
    const isProjectQuery = /project|budget|deadline|manager|status/i.test(lowerPrompt);
    const isTaskQuery = /task|pending|progress|complete/i.test(lowerPrompt);
    const isCostQuery = /cost|expense|spend|spent/i.test(lowerPrompt);
    const isIssueQuery = /issue|risk|problem/i.test(lowerPrompt);
    const isPaymentQuery = /payment|fund|client/i.test(lowerPrompt);
    const isWorkerQuery = /worker|labour|employee/i.test(lowerPrompt);
    const isMaterialQuery = /material|inventory|supply/i.test(lowerPrompt);
    const isLogQuery = /log|activity|record/i.test(lowerPrompt);

    const relevantData = {};
    const projects = await Project.find({}, "name _id manager plannedBudget status deadline").lean();
    const projectMap = Object.fromEntries(projects.map(p => [p._id.toString(), p.name]));

    // Fetch relevant data based on query type
    if (isProjectQuery) relevantData.projects = projects.map(p => ({
      name: p.name,
      manager: p.manager,
      status: p.status,
      plannedBudget: p.plannedBudget,
      deadline: p.deadline,
    }));

    if (isTaskQuery) {
      const tasks = await Task.find({}, "name status assignedTo projectId deadline").lean();
      relevantData.tasks = tasks.map(t => ({
        name: t.name,
        status: t.status,
        assignedTo: t.assignedTo || "Unassigned",
        project: projectMap[t.projectId?.toString()] || "Unknown Project",
        deadline: t.deadline,
      }));
    }

    if (isCostQuery) {
      const costs = await Cost.find({}, "name value projectId").lean();
      relevantData.costs = costs.map(c => ({
        name: c.name,
        amount: c.value,
        project: projectMap[c.projectId?.toString()] || "Unknown Project",
      }));
    }

    if (isIssueQuery) {
      const issues = await Issue.find({}, "title severity status projectId").lean();
      relevantData.issues = issues.map(i => ({
        title: i.title,
        severity: i.severity,
        status: i.status,
        project: projectMap[i.projectId?.toString()] || "Unknown Project",
      }));
    }

    if (isPaymentQuery) {
      const payments = await Payment.find({}, "amount date status projectId").lean();
      relevantData.payments = payments.map(p => ({
        project: projectMap[p.projectId?.toString()] || "Unknown Project",
        amount: p.amount || 0,
        date: p.date || "Unknown Date",
        status: p.status || "Pending",
      }));
    }

    if (isWorkerQuery) {
      const workers = await Worker.find({}, "name role status projectId").lean();
      relevantData.workers = workers.map(w => ({
        name: w.name,
        role: w.role,
        status: w.status,
        project: projectMap[w.projectId?.toString()] || "Unknown Project",
      }));
    }

    if (isMaterialQuery) {
      const materials = await Material.find({}, "name quantity cost projectId").lean();
      relevantData.materials = materials.map(m => ({
        name: m.name,
        quantity: m.quantity,
        cost: m.cost,
        project: projectMap[m.projectId?.toString()] || "Unknown Project",
      }));
    }

    if (isLogQuery) {
      const logs = await Log.find({}, "message type createdAt projectId").lean();
      relevantData.logs = logs.map(l => ({
        message: l.message,
        type: l.type,
        date: new Date(l.createdAt).toLocaleDateString("en-IN"),
        project: projectMap[l.projectId?.toString()] || "Unknown Project",
      }));
    }

    // Build AI prompt
    const aiPrompt = Object.keys(relevantData).length
      ? `
You are an expert construction project management assistant.

User Query: "${prompt}"

Data available:
${JSON.stringify(relevantData, null, 2)}

Instructions:
1. Answer the user's question directly and concisely.
2. Do NOT use markdown formatting (no bolding **, no headers #, no italics *).
3. Use plain text only.
4. For lists, use simple dashes (-) or numbers.
5. Format money as ₹ with commas (e.g., ₹1,00,000).
6. Format dates as DD-MM-YYYY.
7. If the data is empty or not found, simply state: "No relevant data found."
8. Avoid conversational filler; be professional and precise.

Current Date: ${new Date().toISOString().split("T")[0]}
`
      : `
You are an expert construction project management assistant.

User Query: "${prompt}"

Task: Provide a concise, plain text answer in 1-2 sentences.
- Do NOT use markdown.
- If no data makes sense for the query, say: "No relevant data found."
`;

    // Generate AI response
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(aiPrompt);
    let summary = result.response.text().trim().replace(/```json|```/g, "") || "No relevant data found.";

    // Save chat with auto-expiry of 1 day
    await Chat.create({
      userId: req.user?._id || null,
      prompt,
      response: summary,
      createdAt: new Date(),
      expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
    });

    res.json({ summary });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: `Failed to process request: ${err.message}` });
  }
});

module.exports = router;
