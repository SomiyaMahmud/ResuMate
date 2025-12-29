import { Briefcase, Plus, Sparkles, Trash2, Loader2 } from 'lucide-react'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import api from '../configs/api'
import toast from 'react-hot-toast'
import VoiceInputButton from './VoiceInputButton'

const ExperienceForm = ({data, onChange}) => {
    const { token } = useSelector(state => state.auth)
    const [enhancingIndex, setEnhancingIndex] = useState(null)

    const addExperience = () => {
        const newExperience = {
            company: "",
            position: "",
            start_date: "",
            end_date: "",
            description: "",
            is_current: false
        };
        onChange([...data, newExperience])
    }

    const removeExperience = (index) => {
        const updated = data.filter((_, i) => i !== index);
        onChange(updated)
    }

    const updateExperience = (index, field, value) => {
        const updated = [...data]
        updated[index] = {...updated[index], [field]: value}
        onChange(updated)
    }

    const handleEnhance = async (index) => {
        const description = data[index]?.description
        
        if (!description || description.trim().length === 0) {
            toast.error('Please write a job description first before enhancing')
            return
        }

        setEnhancingIndex(index)
        try {
            const response = await api.post(
                '/api/ai/enhance-job-desc',
                { userContent: description },
                { headers: { Authorization: token } }
            )

            if (response.data.enhancedContent) {
                updateExperience(index, 'description', response.data.enhancedContent)
                toast.success('Description enhanced successfully!')
            }
        } catch (error) {
            console.error('Enhance error:', error)
            toast.error(
                error.response?.data?.message || 
                'Failed to enhance description. Please try again.'
            )
        } finally {
            setEnhancingIndex(null)
        }
    }

    return (
        <div className='space-y-6'>
            <div>
                <div className='flex items-center justify-between'>
                    <div>
                        <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-9000'>Working Experience</h3>
                        <p className='text-sm text-gray-500'>Add Your Job Experience Here</p>
                    </div>

                    <button 
                        onClick={addExperience} 
                        className='flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors'
                    >
                        <Plus className='size-4'/> Add Experience
                    </button>
                </div>
            </div> 

            {data.length === 0 ? (
                <div className='text-center py-8 text-gray-500'>
                    <Briefcase className='w-12 h-12 mx-auto mb-3 text-gray-300'/>
                    <p>No working experience added yet</p>
                    <p className='text-sm'>Click "Add Experience" to get started.</p>
                </div>
            ) : (
                <div className='space-y-4'>
                    {data.map((experience, index) => (
                        <div key={index} className='p-4 border border-gray-200 rounded-lg space-y-3'>
                            <div className='flex justify-between items-start'>
                                <h4>Experience #{index + 1}</h4>
                                <button 
                                    onClick={() => removeExperience(index)} 
                                    className='text-red-500 hover:text-red-700 transition-colors'
                                >
                                    <Trash2 className='size-4'/>
                                </button>
                            </div>

                            <div className='grid md:grid-cols-2 gap-3'>
                                <div className='relative'>
                                    <input 
                                        value={experience.company || ""} 
                                        onChange={(e) => updateExperience(index, "company", e.target.value)} 
                                        type="text" 
                                        placeholder='Company Name' 
                                        className='px-3 py-2 pr-12 text-sm rounded-lg w-full border border-gray-300'
                                    />
                                    <VoiceInputButton 
                                        value={experience.company || ""} 
                                        onChange={(value) => updateExperience(index, "company", value)}
                                    />
                                </div>

                                <div className='relative'>
                                    <input 
                                        value={experience.position || ""} 
                                        onChange={(e) => updateExperience(index, "position", e.target.value)} 
                                        type="text" 
                                        placeholder='Job Title' 
                                        className='px-3 py-2 pr-12 text-sm rounded-lg w-full border border-gray-300'
                                    />
                                    <VoiceInputButton 
                                        value={experience.position || ""} 
                                        onChange={(value) => updateExperience(index, "position", value)}
                                    />
                                </div>

                                <input 
                                    value={experience.start_date || ""} 
                                    onChange={(e) => updateExperience(index, "start_date", e.target.value)} 
                                    type="month" 
                                    className='px-3 py-2 text-sm rounded-lg border border-gray-300'
                                />

                                <input 
                                    value={experience.end_date || ""} 
                                    onChange={(e) => updateExperience(index, "end_date", e.target.value)} 
                                    type="month" 
                                    disabled={experience.is_current} 
                                    className='px-3 py-2 text-sm rounded-lg border border-gray-300 disabled:bg-gray-100'
                                />
                            </div>

                            <label className='flex items-center gap-2'>
                                <input 
                                    type="checkbox" 
                                    checked={experience.is_current || false} 
                                    onChange={(e) => {
                                        updateExperience(index, "is_current", e.target.checked ? true : false);
                                    }} 
                                    className='rounded border-gray-300 text-green-600 focus:ring-green-500' 
                                />
                                <span className='text-sm text-gray-700'>Currently Working Here</span>
                            </label>

                            <div className='space-y-2'>
                                <div className='flex items-center justify-between'>
                                    <label className='text-sm font-medium text-gray-700'>Job Description</label>
                                    <button 
                                        onClick={() => handleEnhance(index)}
                                        disabled={enhancingIndex === index || !experience.description}
                                        className='flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                                    >
                                        {enhancingIndex === index ? (
                                            <>
                                                <Loader2 className='w-3 h-3 animate-spin'/>
                                                Enhancing...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className='w-3 h-3'/>
                                                Enhance With AI
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className='relative'>
                                    <textarea 
                                        value={experience.description || ""} 
                                        onChange={(e) => updateExperience(index, 'description', e.target.value)} 
                                        rows={4} 
                                        className='w-full text-sm px-3 py-2 pr-12 rounded-lg resize-none border border-gray-300' 
                                        placeholder='Describe your key responsibilities and achievements.......'
                                    />
                                    <VoiceInputButton 
                                        value={experience.description || ""} 
                                        onChange={(value) => updateExperience(index, "description", value)}
                                        className="top-2"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ExperienceForm