// import OpenAI from "openai";

// const ai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
//     baseURL: process.env.OPENAI_BASE_URL
// });



// export default ai

import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export default groq;

