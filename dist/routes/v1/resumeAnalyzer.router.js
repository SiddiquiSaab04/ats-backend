"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const resumeAnalyzer_controller_1 = require("../../controllers/resumeAnalyzer.controller");
const router = (0, express_1.Router)();
router.post("/resume-analyzer/:id", resumeAnalyzer_controller_1.analyzeResume);
exports.default = router;
