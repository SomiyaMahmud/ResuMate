import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const callGeminiAPI = async (systemPrompt, userPrompt) => {
    const apiKey = process.env.OPENAI_API_KEY
    const model = process.env.OPENAI_MODEL
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    
    const payload = {
        contents: [
            {
                role: "user",
                parts: [
                    {
                        text: `${systemPrompt}\n\n${userPrompt}`
                    }
                ]
            }
        ],
        generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 4096
        }
    }
    
    console.log('Making request to:', url.split('?')[0] + '?key=[REDACTED]')
    const response = await axios.post(url, payload)
    
    let extractedText = ''
    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        extractedText = response.data.candidates[0].content.parts[0].text
    } else {
        console.log('Response structure:', JSON.stringify(response.data, null, 2))
        throw new Error('Unexpected response format from Gemini API')
    }
    
    return extractedText
}

const testLinkedInImport = async () => {
    try {
        const profileText = `John Smith
Senior Software Engineer at Tech Company
San Francisco, CA

About
Experienced software engineer with 5+ years in full-stack development.

Experience
Senior Software Engineer at Tech Company
Jan 2022 - Present
• Led development of cloud-based platform
• Managed team of 3 developers

Software Engineer at StartupXYZ
Jun 2020 - Dec 2021
• Built REST APIs using Node.js
• Frontend development with React

Education
BS Computer Science
University of California, 2020`;

        const systemPrompt = `You are an expert AI agent that extracts professional information from LinkedIn profile text.`
        
        const userPrompt = `Extract professional information and return ONLY this JSON with no markdown:
        {
            "professional_summary": "A brief professional summary",
            "skills": ["skill1", "skill2"],
            "personal_info": {
                "full_name": "Full Name",
                "profession": "Current Position",
                "email": "",
                "phone": "",
                "location": "City, Country",
                "linkedin": "",
                "website": ""
            },
            "experience": [],
            "project": [],
            "education": []
        }

        LinkedIn profile:
        ${profileText}`

        console.log('Testing Gemini API direct call...\n')
        const result = await callGeminiAPI(systemPrompt, userPrompt)
        
        console.log('Response received! Extracting JSON...')
        console.log('First 300 chars:', result.substring(0, 300))
        
        const jsonMatch = result.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            console.log('ERROR: No JSON found!')
            return
        }
        
        const parsed = JSON.parse(jsonMatch[0])
        console.log('\n✅ Success! Parsed JSON:')
        console.log('Full name:', parsed.personal_info?.full_name)
        console.log('Profession:', parsed.personal_info?.profession)
        console.log('Skills:', parsed.skills)

    } catch (error) {
        console.error('\n❌ Error:', error.message)
        if (error.response?.data) {
            console.error('Response:', error.response.data)
        }
    }
};

testLinkedInImport();
