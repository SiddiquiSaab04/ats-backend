import { z } from "zod";

const createSkillSchema = z.object({
    name: z.string().min(1, "Skill name is required"),
});

const updateSkillSchema = z.object({
    name: z.string().min(1, "Skill name is required"),
});

const skillIdSchema = z.object({
    id: z.coerce.number().min(1, "Skill ID is required and must be positive"),
});

export {
    createSkillSchema,
    updateSkillSchema,
    skillIdSchema
};
