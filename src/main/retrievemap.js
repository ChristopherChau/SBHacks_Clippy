import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { OpenRouter } from '@openrouter/sdk';
import { eq } from 'drizzle-orm';
import { db, searchCache, allocationCache, contentCache } from './db/index.js';

// Load .env from project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../../.env') });

const openRouter = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
});

// Search for different categories (if possible) or generic beginner, intermediate, advanced
const searchOpenRouter = async (skill, level_description, end_goal) => {
    // Check cache first
    const cached = await db
        .select()
        .from(searchCache)
        .where(eq(searchCache.skill, skill))
        .get();

    if (cached) {
        console.log('Cache hit for skill:', skill);
        return JSON.parse(cached.response);
    }
    
    const difficultyPrompt = `Search and find the list of intermediate difficulty tiers/ranks for 
    the skill of ${skill}, given that the user describes themselves with ${level_description}
    and is for the end goal the user wants ${end_goal}, 
    Organize into the format { ranking: [ranks]} such as for rock climbing if the user is level v4 and wants to 
    reach v7 there is { ranking: [v4, v5, v6, v7] }. If there are no standard tiers use general skills that the user 
    should be able to perform until they reach their end goal`

    // Not in cache, make API call
    const response = await openRouter.chat.send({
        model: 'google/gemini-3-flash-preview',
        messages: [
            {
                role: 'user',
                content: difficultyPrompt,
            },
        ],
        stream: false,
        responseFormat: {
            type: "json_object",
        }
    });

    const target = JSON.parse(response.choices[0].message.content);

    // Store in cache
    await db.insert(searchCache).values({
        skill,
        response: JSON.stringify(target),
        createdAt: new Date(),
    });

    console.log('Cached response for skill:', skill);
    return target;
};

// Search for lower-level skill for the target skill and place them into the given tiers
const allocationSkillAgent = async (topic, tiers) => {
    // Create cache key from parameters
    const cacheKey = `${topic}:${JSON.stringify(tiers)}`;

    // Check cache first
    const cached = await db
        .select()
        .from(allocationCache)
        .where(eq(allocationCache.cacheKey, cacheKey))
        .get();

    if (cached) {
        console.log('Cache hit for allocation:', topic);
        return JSON.parse(cached.response);
    }

    // 1. Find overall list of technical skill
    const skillPrompt = `Search and find a list of technical skills related to learning the skill of ${topic}.
    Output the format in { skills: [...]}. Include skills used across all people of varying experience for the skill.
    For example for rock climbing one could learn crimping, hip positioning, etc.`;
    const skillResponse = await openRouter.chat.send({
        model: 'google/gemini-3-flash-preview',
        messages: [
            {
                role: 'user',
                content: skillPrompt,
            },
        ],
        stream: false,
        responseFormat: {
            type: "json_object",
        }
    });
    const skillTarget = JSON.parse(skillResponse.choices[0].message.content);

    // 2. Catergorise which skill belongs to which difficulty (search) (5-6 max), and determine percentage time for each skill
    const catergorizationPrompt = `For the topic of ${topic} consider the skill list : ${skillTarget.skill} and the tiers/ranks ${tiers}.
    Search the web for context on each tier and for each tier, place skills that would necessary and optimal to learn at that skill. Skills
    don't have to be uniquely placed within a tier and can exist within multiple tiers. Output the format in
    { tier1: [skill1, skill4, ...], tier2: [skill2, skill4, ...], ...}`;
    const catergorizationResponse = await openRouter.chat.send({
        model: 'google/gemini-3-flash-preview',
        messages: [
            {
                role: 'user',
                content: catergorizationPrompt,
            },
        ],
        stream: false,
        responseFormat: {
            type: "json_object",
        }
    });
    const catergorizationTarget = JSON.parse(catergorizationResponse.choices[0].message.content);
    
    const response = { roadmap: catergorizationTarget, node_skills: [...new Set(Object.values(catergorizationTarget).flat())]}

    // Store in cache
    await db.insert(allocationCache).values({
        cacheKey,
        response: JSON.stringify(response),
        createdAt: new Date(),
    });

    console.log('Cached response for allocation:', topic);
    return response;
}

// Find content / tips for each skill
const contentSkill = async (topic, skills) => {
    // Create cache key from parameters
    const cacheKey = `${topic}:${JSON.stringify(skills)}`;

    // Check cache first
    const cached = await db
        .select()
        .from(contentCache)
        .where(eq(contentCache.cacheKey, cacheKey))
        .get();

    if (cached) {
        console.log('Cache hit for content:', topic);
        return JSON.parse(cached.response);
    }

    // 3. For each technical skill find content
    // Content information -> text / tips / youtube -> link
    const contentPrompt = `For the topic of ${topic} consider the skill list : ${skills}. For each skill web search and find:
    1. a short description of the skill, 2. 1-3 tips for the skill, 3. a web resource
    If there is no reasonable resource found for the skill put null. Output the format in
    { skill1: {description: ..., tips: [...], url: ...}, skill2: ..., ...}`;
    const contentResponse = await openRouter.chat.send({
        model: 'google/gemini-3-flash-preview',
        messages: [
            {
                role: 'user',
                content: contentPrompt,
            }
        ],
        stream: false,
        responseFormat: {
            type: "json_object",
        }
    });
    const contentTarget = JSON.parse(contentResponse.choices[0].message.content);

    // Store in cache
    await db.insert(contentCache).values({
        cacheKey,
        response: JSON.stringify(contentTarget),
        createdAt: new Date(),
    });

    console.log('Cached response for content:', topic);
    return contentTarget;
}

export const generateRoadmap = async (topic, level_description, end_goal) => {
    const response = await searchOpenRouter(topic, level_description, end_goal);
    const {roadmap, node_skills } = await allocationSkillAgent(topic, response.ranking);
    const contentResponse = await contentSkill(topic, node_skills);

    const levels = [];
    const keys = Object.keys(roadmap);
    
    for(let i = 0; i < keys.length; ++i){
        const skills = roadmap[keys[i]];
        const parsedSkills = [];
        for(let j = 0; j < skills.length; ++j){
            // TODO IF HAVE TIME: fix up formatting to prevent querying
            // of contentResponse
            const parsedSkill = {
                id: `d${i}-s${j}`,
                name: skills[j],
                tips: contentResponse[skills[j]].tips,
                url: contentResponse[skills[j]].url,
                description: contentResponse[skills[j]].description,
            }
            parsedSkills.push(parsedSkill);
        }
        const layer = {
            difficulty: i,
            skills: parsedSkills,
        }
        levels.push(layer);
    }
    return levels;
}