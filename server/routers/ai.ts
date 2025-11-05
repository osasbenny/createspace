import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";

export const aiRouter = router({
  // Generate pricing suggestions based on service type and experience
  generatePricingSuggestion: protectedProcedure
    .input(z.object({
      serviceType: z.string(),
      experience: z.string().optional(),
      location: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const prompt = `You are a pricing expert for creative services. Based on the following information, provide realistic pricing suggestions:
      
Service Type: ${input.serviceType}
Experience Level: ${input.experience || "Not specified"}
Location: ${input.location || "Not specified"}

Provide pricing in JSON format with fields: basePrice (in USD), hourlyRate (in USD), depositPercentage (0-100), and reasoning.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a pricing expert for creative services. Always respond with valid JSON." },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "pricing_suggestion",
            strict: true,
            schema: {
              type: "object",
              properties: {
                basePrice: { type: "number", description: "Suggested base price in USD" },
                hourlyRate: { type: "number", description: "Suggested hourly rate in USD" },
                depositPercentage: { type: "number", description: "Suggested deposit percentage" },
                reasoning: { type: "string", description: "Explanation for pricing" },
              },
              required: ["basePrice", "hourlyRate", "depositPercentage", "reasoning"],
              additionalProperties: false,
            },
          },
        },
      });

      try {
        const content = response.choices[0].message.content;
        const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
        return JSON.parse(contentStr);
      } catch (error) {
        return {
          basePrice: 500,
          hourlyRate: 75,
          depositPercentage: 50,
          reasoning: "Default pricing. Please adjust based on your experience and market.",
        };
      }
    }),

  // Generate portfolio captions for images
  generateCaption: protectedProcedure
    .input(z.object({
      serviceType: z.string(),
      description: z.string().optional(),
      style: z.enum(["professional", "casual", "creative"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const prompt = `Generate a compelling portfolio caption for a ${input.serviceType} professional. 
Description: ${input.description || "Not provided"}
Style: ${input.style || "professional"}

The caption should be engaging, highlight the work quality, and encourage potential clients to book. Keep it under 150 words.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a creative copywriter specializing in portfolio captions." },
          { role: "user", content: prompt },
        ],
      });

      return {
        caption: response.choices[0].message.content,
      };
    }),

  // Generate response templates for client inquiries
  generateResponseTemplate: protectedProcedure
    .input(z.object({
      inquiryType: z.enum(["availability", "pricing", "customization", "general"]),
      context: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const inquiryDescriptions = {
        availability: "client asking about availability",
        pricing: "client asking about pricing",
        customization: "client asking about custom services",
        general: "general client inquiry",
      };

      const prompt = `Generate a professional response template for a ${inquiryDescriptions[input.inquiryType]}.
Context: ${input.context || "Not provided"}

The response should be:
- Professional and friendly
- Clear and concise
- Include a call-to-action
- Be customizable by the creative

Provide the template with [PLACEHOLDER] for areas the creative should customize.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a professional communication expert helping creatives respond to clients." },
          { role: "user", content: prompt },
        ],
      });

      return {
        template: response.choices[0].message.content,
      };
    }),

  // Generate profile bio
  generateProfileBio: protectedProcedure
    .input(z.object({
      name: z.string(),
      serviceType: z.string(),
      experience: z.string().optional(),
      specialties: z.string().optional(),
      style: z.enum(["professional", "creative", "friendly"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const prompt = `Create a compelling professional bio for ${input.name}, a ${input.serviceType}.
Experience: ${input.experience || "Not specified"}
Specialties: ${input.specialties || "Not specified"}
Tone: ${input.style || "professional"}

The bio should:
- Be 100-150 words
- Highlight unique value proposition
- Include relevant experience or achievements
- End with a call-to-action
- Be suitable for a portfolio website`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are an expert at writing compelling professional bios for creatives." },
          { role: "user", content: prompt },
        ],
      });

      return {
        bio: response.choices[0].message.content,
      };
    }),

  // Generate service description
  generateServiceDescription: protectedProcedure
    .input(z.object({
      serviceName: z.string(),
      details: z.string().optional(),
      targetAudience: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const prompt = `Create a compelling service description for "${input.serviceName}".
Details: ${input.details || "Not provided"}
Target Audience: ${input.targetAudience || "General"}

The description should:
- Clearly explain what the service includes
- Highlight benefits for the client
- Be 75-150 words
- Use engaging language
- Include what to expect`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are an expert at writing service descriptions that convert." },
          { role: "user", content: prompt },
        ],
      });

      return {
        description: response.choices[0].message.content,
      };
    }),

  // Analyze and suggest improvements to profile
  analyzeProfile: protectedProcedure
    .input(z.object({
      bio: z.string().optional(),
      serviceTypes: z.string().optional(),
      portfolioCount: z.number().optional(),
      reviewCount: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const prompt = `Analyze this creative professional's profile and suggest improvements:
Bio: ${input.bio || "Not provided"}
Service Types: ${input.serviceTypes || "Not specified"}
Portfolio Items: ${input.portfolioCount || 0}
Reviews: ${input.reviewCount || 0}

Provide specific, actionable suggestions in JSON format with fields: strengths (array), improvements (array), and priority (high/medium/low).`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are an expert profile optimizer for creative professionals." },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "profile_analysis",
            strict: true,
            schema: {
              type: "object",
              properties: {
                strengths: { type: "array", items: { type: "string" } },
                improvements: { type: "array", items: { type: "string" } },
                priority: { type: "string", enum: ["high", "medium", "low"] },
              },
              required: ["strengths", "improvements", "priority"],
              additionalProperties: false,
            },
          },
        },
      });

      try {
        const content = response.choices[0].message.content;
        const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
        return JSON.parse(contentStr);
      } catch (error) {
        return {
          strengths: ["Profile exists"],
          improvements: ["Add more portfolio items", "Encourage client reviews"],
          priority: "medium",
        };
      }
    }),
});
