import { Sparkles, Loader2 } from 'lucide-react'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import api from '../configs/api'
import toast from 'react-hot-toast'
import VoiceInputButton from './VoiceInputButton'

const ProfessionalSummaryForm = ({data, onChange, setResumeData}) => {
    const { token } = useSelector(state => state.auth)
    const [isEnhancing, setIsEnhancing] = useState(false)

    const handleEnhance = async () => {
        if (!data || data.trim().length === 0) {
            toast.error('Please write a summary first before enhancing')
            return
        }

        setIsEnhancing(true)
        try {
            const response = await api.post(
                '/api/ai/enhance-pro-sum',
                { userContent: data },
                { headers: { Authorization: token } }
            )

            if (response.data.enhancedContent) {
                onChange(response.data.enhancedContent)
                toast.success('Summary enhanced successfully!')
            }
        } catch (error) {
            console.error('Enhance error:', error)
            toast.error(
                error.response?.data?.message || 
                'Failed to enhance summary. Please try again.'
            )
        } finally {
            setIsEnhancing(false)
        }
    }

    return (  
        <div className='space-y-4'>
            <div className='flex items-center justify-between'>
                <div>
                    <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-9000'>Professional Summary</h3>
                    <p className='text-sm text-gray-500'>Add Summary for Your Resume Here</p>
                </div>

                <button 
                    onClick={handleEnhance}
                    disabled={isEnhancing || !data}
                    className='flex items-center gap-2 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                    {isEnhancing ? (
                        <>
                            <Loader2 className='size-4 animate-spin'/> 
                            Enhancing...
                        </>
                    ) : (
                        <>
                            <Sparkles className='size-4'/> 
                            AI Enhance
                        </>
                    )}
                </button>
            </div>

            <div className='mt-6'>
                <div className='relative'>
                    <textarea 
                        value={data || ""} 
                        onChange={(e)=>onChange(e.target.value)} 
                        rows={7} 
                        className='w-full p-3 px-4 pr-12 mt-2 border text-sm border-gray-300 rounded-lg focus:ring focus:ring-green-500 focus:border-green-500 outline-none transition-colors resize-none' 
                        placeholder='Write a Compelling Professional Summary that Highlights Your Key Strength and Career Objectives...'
                    />
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