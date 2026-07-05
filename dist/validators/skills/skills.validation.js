"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.skillIdSchema = exports.updateSkillSchema = exports.createSkillSchema = void 0;
const zod_1 = require("zod");
const createSkillSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Skill name is required"),
});
exports.createSkillSchema = createSkillSchema;
const updateSkillSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Skill name is required"),
});
exports.updateSkillSchema = updateSkillSchema;
const skillIdSchema = zod_1.z.object({
    id: zod_1.z.coerce.number().min(1, "Skill ID is required and must be positive"),
});
exports.skillIdSchema = skillIdSchema;
