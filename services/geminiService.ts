
import { GoogleGenAI, Type } from "@google/genai";
import { SlideContent, AspectRatio, DesignTone, DesignStyle } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export async function generateCarouselStructure(
  theme: string, 
  count: number, 
  tone: DesignTone,
  ctaOverride?: string
): Promise<SlideContent[]> {
  const prompt = `Create a high-engaging Instagram carousel structure about "${theme}". 
  The carousel should have exactly ${count} slides. 
  Tone of voice: ${tone}.
  ${ctaOverride ? `Final Slide Call to Action target: ${ctaOverride}.` : ''}
  
  Each slide must follow this structure:
  - Slide 1: Strong hook (Headline & brief intro).
  - Middle slides: Educational or story content.
  - Last slide: Explicit Call to Action (CTA) based on the target.
  
  Provide a specific visual description for an image prompt for each slide. 
  The image prompt should be a description of a high-quality, professional photograph or 3D render.
  
  The response must be in JSON format. All slide text must be in Portuguese.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING, description: "The main big text for the slide (Portuguese)" },
            body: { type: Type.STRING, description: "Secondary smaller text for the slide (Portuguese)" },
            imagePrompt: { type: Type.STRING, description: "A detailed visual description for AI image generation (English). Describe lighting, style, and subject." }
          },
          required: ["headline", "body", "imagePrompt"]
        }
      }
    }
  });

  try {
    const json = JSON.parse(response.text || "[]");
    return json;
  } catch (e) {
    console.error("Failed to parse carousel structure", e);
    return [];
  }
}

export async function regenerateSingleSlideText(
  theme: string,
  tone: DesignTone,
  slideIndex: number,
  totalSlides: number
): Promise<SlideContent | null> {
  const prompt = `Rewrite the content for slide index ${slideIndex + 1} of a ${totalSlides}-slide Instagram carousel about "${theme}".
  Tone: ${tone}.
  Return a new Headline, Body, and Image Prompt.
  The response must be in JSON format. All slide text must be in Portuguese.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          headline: { type: Type.STRING },
          body: { type: Type.STRING },
          imagePrompt: { type: Type.STRING }
        },
        required: ["headline", "body", "imagePrompt"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "null");
  } catch (e) {
    return null;
  }
}

export async function generateSlideImage(prompt: string, ratio: AspectRatio, style?: DesignStyle): Promise<string | undefined> {
  const apiRatio = ratio === AspectRatio.PORTRAIT ? "3:4" : (ratio === AspectRatio.STORY ? "9:16" : "1:1");

  const styleModifiers: Record<DesignStyle, string> = {
    'Cinematográfico': 'Cinematic lighting, high dynamic range, professional photography, dramatic shadows, 8k resolution.',
    '3D Render': '3D digital render, Octane render, stylized, clean textures, Unreal Engine 5 style, hyper-detailed.',
    'Minimalista': 'Minimalist composition, clean lines, vast negative space, simple color palette, modern aesthetics.',
    'Cyberpunk': 'Cyberpunk aesthetic, neon lighting, blue and magenta tones, futuristic, high-tech, urban night vibe.',
    'Aquarela': 'Soft watercolor painting, artistic textures, hand-painted feel, delicate color washes, white paper background.',
    'Fotorealista': 'Photorealistic, natural soft lighting, real-world textures, 35mm lens, sharp focus, authentic look.',
    'Retro/Vintage': '70s film photography, grainy texture, warm vintage tones, slightly faded colors, nostalgic vibe, kodachrome.',
    'Colagem Digital': 'Digital collage art, mixed media, paper textures, overlapping cutout elements, artistic composition.',
    'Neon Futurista': 'High contrast neon glow, electric blue and hot pink, dark backgrounds, glowing light trails, futuristic tech.',
    'Minimalista Japonês': 'Zen aesthetic, high-end materials, wood textures, balanced composition, muted natural tones, Wabi-sabi style.',
    'Ilustração 3D': 'Playful 3D characters and objects, soft clay-like textures, bright pastel colors, studio lighting, cute style.',
    'Editorial High-End': 'Fashion magazine editorial style, high contrast, clean studio lighting, sophisticated subject, vogue aesthetic.'
  };

  const activeStyle = style ? styleModifiers[style] : 'Professional social media aesthetic.';

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `${activeStyle} Subject: ${prompt}. Solid background, clear focus.` }]
    },
    config: {
      imageConfig: {
        aspectRatio: apiRatio as any
      }
    }
  });

  const parts = response.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return undefined;
}
