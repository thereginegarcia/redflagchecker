import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const industryContext = {
  designer: {
    redFlags: "Low budgets (under $500 for logos, under $2000 for websites), vague creative direction, unlimited revisions, 'make it pop', spec work requests, comparing to Fiverr prices",
    greenFlags: "Clear brand guidelines, specific deliverables, realistic budgets, professional communication, reference materials provided",
    budgetRanges: "Logo: $500-5000, Website: $2000-15000, Brand Identity: $1500-8000"
  },
  developer: {
    redFlags: "Unrealistic timelines, scope creep, 'simple' projects that aren't simple, comparing to overseas developers, unclear requirements",
    greenFlags: "Technical specifications provided, realistic timeline, understanding of development process, clear feature requirements",
    budgetRanges: "Website: $3000-25000, Web App: $10000-100000, Mobile App: $15000-200000"
  },
  photographer: {
    redFlags: "Usage rights confusion, weather-dependent unrealistic expectations, 'just a few quick shots', trying to negotiate after seeing work",
    greenFlags: "Clear usage requirements, backup date planning, professional timeline, understanding of photography process",
    budgetRanges: "Portrait: $200-800, Wedding: $1500-8000, Commercial: $500-5000"
  },
  consultant: {
    redFlags: "Undefined deliverables, expecting implementation not just strategy, hourly vs project confusion, 'quick advice' requests",
    greenFlags: "Clear objectives defined, understanding consultant role, specific deliverables requested, realistic timeline",
    budgetRanges: "Strategy: $2000-15000, Process Improvement: $3000-25000, Training: $1000-10000"
  },
  copywriter: {
    redFlags: "'Just needs to sound professional', unlimited revisions, no brand guidelines, comparing to AI writing tools",
    greenFlags: "Brand voice guidelines, target audience defined, specific copy requirements, realistic revision rounds",
    budgetRanges: "Website Copy: $800-5000, Blog Content: $100-500/post, Sales Pages: $500-3000"
  },
  other: {
    redFlags: "Vague scope, unrealistic budget expectations, poor communication, unrealistic timelines",
    greenFlags: "Clear requirements, professional communication, realistic expectations, proper planning",
    budgetRanges: "Varies by industry and project complexity"
  }
};

const experienceContext = {
  beginner: "Be more cautious with red flags. New freelancers should avoid risky clients while building their portfolio and reputation.",
  experienced: "Balanced analysis. Can handle some challenging clients but should still avoid major red flags.",
  expert: "Can handle more complex clients. Focus on major red flags that even experienced professionals should avoid."
};

export async function POST(request: NextRequest) {
  try {
    const { message, industry = 'designer', experience = 'experienced', projectType = '' } = await request.json();
    
    if (!message || message.trim().length < 10) {
      return NextResponse.json(
        { error: 'Message too short. Please provide more details.' }, 
        { status: 400 }
      );
    }

    const industryData = industryContext[industry as keyof typeof industryContext] || industryContext.other;
    const experienceData = experienceContext[experience as keyof typeof experienceContext];

    const prompt = `You are a witty but helpful business consultant analyzing a potential client message for a ${experience} ${industry} professional working on ${projectType || 'various projects'}.

Industry Context for ${industry}:
- Common red flags: ${industryData.redFlags}
- Positive signs: ${industryData.greenFlags}  
- Typical budget ranges: ${industryData.budgetRanges}

Experience Level: ${experienceData}

Client message: "${message}"

Return ONLY valid JSON in this exact format:
{
  "overallScore": 1-10,
  "redFlags": [
    {
      "type": "Budget Red Flag",
      "severity": "High/Medium/Low", 
      "evidence": "exact quote from message",
      "explanation": "industry-specific explanation of why this is problematic for ${industry}s"
    }
  ],
  "greenFlags": ["positive signs as simple strings"],
  "advice": "industry-specific, experience-appropriate advice with personality",
  "verdict": "short verdict like 'Dream Client' or 'Proceed with Caution' or 'Run for the Hills'"
}

Scoring for ${experience} ${industry}:
- Adjust severity based on experience level
- Consider industry-specific budget and timeline norms
- ${experience === 'beginner' ? 'Be more cautious - flag more issues' : experience === 'expert' ? 'Focus on major red flags only' : 'Balanced analysis appropriate for experienced professional'}

Keep explanations concise but memorable. Be helpful, not mean. Include specific advice for ${industry} professionals.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const responseText = completion.choices[0].message.content;
    
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    const analysis = JSON.parse(responseText);
    
    if (!analysis.overallScore || !Array.isArray(analysis.redFlags)) {
      throw new Error('Invalid response format');
    }

    return NextResponse.json(analysis);
    
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' }, 
      { status: 500 }
    );
  }
}