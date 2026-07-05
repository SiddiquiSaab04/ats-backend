"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeResumeService = void 0;
const client_1 = require("../prisma/client");
const supabase_1 = __importDefault(require("../config/supabase"));
const AppError_1 = require("../utils/AppError");
const axios_1 = __importDefault(require("axios"));
require("dotenv/config");
const pdf_parse_1 = require("pdf-parse");
const cleanJsonResponse = (text) => {
    let cleaned = text.trim();
    if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```[a-zA-Z]*\s*/, "");
        cleaned = cleaned.replace(/\s*```$/, "");
    }
    return cleaned.trim();
};
const analyzeResumeService = async (jobId) => {
    try { // 1. Fetch the Job details and related skills
        const job = await client_1.prisma.job.findUnique({
            where: {
                id: jobId
            },
            include: {
                jobSkills: {
                    include: {
                        skill: true
                    }
                }
            }
        });
        if (!job) {
            throw new AppError_1.AppError("Job not found", 404);
        }
        // 2. Fetch all applications with status = APPLIED for this job
        const applications = await client_1.prisma.application.findMany({
            where: {
                jobId: jobId,
                status: "APPLIED"
            }
        });
        if (!applications || applications.length === 0) {
            throw new AppError_1.AppError("No applied applications found for the given job ID", 404);
        }
        const bucketName = "ATS";
        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) {
            throw new AppError_1.AppError("GEMINI_API_KEY is not defined in environment variables", 500);
        }
        const requiredSkills = job.jobSkills.map((js) => js.skill.name);
        await Promise.all(applications.map(async (app) => {
            try {
                if (!app.resumeUrl) {
                    throw new Error("Application does not have a resume URL");
                }
                const { data: resumeBlob, error: downloadError } = await supabase_1.default.storage.from(bucketName).download(app.resumeUrl);
                if (downloadError) {
                    throw new Error(`Failed to download resume from Supabase: ${downloadError.message}`);
                }
                if (!resumeBlob) {
                    throw new Error("Resume download returned empty content");
                }
                const buffer = Buffer.from(await resumeBlob.arrayBuffer());
                let resumeText = "";
                try {
                    const parser = new pdf_parse_1.PDFParse({ data: buffer });
                    const parsedResult = await parser.getText();
                    resumeText = parsedResult.text;
                }
                catch (parseErr) {
                    throw new Error(`Failed to parse PDF file content: ${parseErr.message}`);
                }
                if (!resumeText || !resumeText.trim()) {
                    throw new Error("Extracted resume text is empty or invalid");
                }
                const prompt = `
You are an expert recruitment assistant and Applicant Tracking System (ATS).
Compare the candidate's resume text against the job specifications below:

Job Title: ${job.title}
Job Description: ${job.description}
Job Requirements: ${job.requirements}
Required Skills: ${requiredSkills.join(", ")}

Candidate Resume Text:
${resumeText}

Analyze how well the candidate fits the job. Evaluate:
- atsScore: A match percentage from 0 to 100.
- matchingSkills: Skills from the required list (or key skills from the job description) that are present in the resume.
- missingSkills: Required/highly relevant skills for the job that are missing from the resume.
- strengths: Key strengths of the candidate that match the job description/requirements.
- weaknesses: Gaps or weaknesses in the candidate's experience/skills relative to the job.
- summary: A professional 2-3 sentence summary of the evaluation.
`;
                const response = await axios_1.default.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt
                                },
                            ]
                        },
                    ],
                    generationConfig: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: "OBJECT",
                            properties: {
                                atsScore: {
                                    type: "INTEGER"
                                },
                                matchingSkills: {
                                    type: "ARRAY",
                                    items: {
                                        type: "STRING"
                                    }
                                },
                                missingSkills: {
                                    type: "ARRAY",
                                    items: {
                                        type: "STRING"
                                    }
                                },
                                strengths: {
                                    type: "ARRAY",
                                    items: {
                                        type: "STRING"
                                    }
                                },
                                weaknesses: {
                                    type: "ARRAY",
                                    items: {
                                        type: "STRING"
                                    }
                                },
                                summary: {
                                    type: "STRING"
                                }
                            },
                            required: [
                                "atsScore",
                                "matchingSkills",
                                "missingSkills",
                                "strengths",
                                "weaknesses",
                                "summary",
                            ]
                        }
                    }
                }, {
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!rawText) {
                    throw new Error("Gemini API did not return any content parts text");
                }
                let analysisResult;
                try {
                    const cleaned = cleanJsonResponse(rawText);
                    analysisResult = JSON.parse(cleaned);
                }
                catch (jsonErr) {
                    throw new Error(`Failed to parse Gemini output as JSON: ${jsonErr.message}. Output was: ${rawText}`);
                }
                await client_1.prisma.resumeAnalysis.upsert({
                    where: {
                        applicationId: app.id
                    },
                    update: {
                        atsScore: Number(analysisResult.atsScore),
                        matchingSkills: analysisResult.matchingSkills,
                        missingSkills: analysisResult.missingSkills,
                        strengths: analysisResult.strengths,
                        weaknesses: analysisResult.weaknesses,
                        summary: analysisResult.summary
                    },
                    create: {
                        applicationId: app.id,
                        atsScore: Number(analysisResult.atsScore),
                        matchingSkills: analysisResult.matchingSkills,
                        missingSkills: analysisResult.missingSkills,
                        strengths: analysisResult.strengths,
                        weaknesses: analysisResult.weaknesses,
                        summary: analysisResult.summary
                    }
                });
            }
            catch (appError) {
                throw new Error(`[Application ID ${app.id}] ${appError.message}`);
            }
        }));
        const result = await client_1.prisma.application.findMany({
            where: {
                jobId: jobId,
                status: "APPLIED"
            },
            include: {
                resumeAnalysis: true
            }
        });
        return result;
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            throw error;
        }
        throw new AppError_1.AppError(error.message || "An error occurred during resume analysis", 500);
    }
};
exports.analyzeResumeService = analyzeResumeService;
