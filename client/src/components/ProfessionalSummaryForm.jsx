import { Sparkle } from 'lucide-react'
import React from 'react'
import VoiceInputButton from './VoiceInputButton'

const ProfessionalSummaryForm = ({data,onChange,setResumeData}) => {
  return (  
    <div className='space-y-4'>
        <div className='flex items-center justify-between'>
            <div>
                <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-9000'>Professional Summary</h3>
                <p className='text-sm text-gray-500'>Add Summary for Your Resume Here</p>
            </div>

            <button className='flex items-center gap-2 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors disabled:opacity-50'>
                <Sparkle className='size-4'/> AI Enhance
            </button>
        </div>

        <div className='mt-6'>
            <div className='relative'>
                <textarea value={data || ""} onChange={(e)=>onChange(e.target.value)} rows={7} className='w-full p-3 px-4 pr-12 mt-2 border text-sm border-gray-300 rounded-lg focus:ring focus:ring-green-500 focus:border-green-500 outline-none transition-colors resize-none' placeholder='Write a Compilling Professional Summary that Highlights Your Key Strength and Career Objectives...'/>
                <VoiceInputButton 
                    value={data || ""} 
                    onChange={onChange}
                    className="top-4"
                />
            </div>
            <p className='text-xs text-gray-500 max-w-4/5 mx-auto text-center'>
                Keep it concise (3/4 sentences) and focus on your most relevant achievements and skills.  
            </p>
        </div>
    </div>
  )
}

export default ProfessionalSummaryForm