import { Plus, Sparkle, Sparkles, X } from 'lucide-react'
import React, { useState } from 'react'

const SkillsForm = ({data,onChange}) => {
    const [newSkill,setNewSkill] = useState("")
    const addSkill = ()=>{
        if(newSkill.trim() && !data.includes(newSkill.trim())){
            onChange([...data, newSkill.trim()])
            setNewSkill("")
        }
    }

    const removeSkill = (indexToRemove) => {
        onChange(data.filter((_, index)=>index !==indexToRemove));
    }

    const handleKeyPress = (e)=>{
        if(e.key === "Enter"){
            e.preventDefault();
            addSkill()
        }
    }
  return (
    <div className='space-y-4'>
        <div>
            <h3 className='flex items-center gap-2 text-lg font-semibokd text-gray-900'> Skills</h3>
            <p className='text-sm text-gray-500'>Add Your SKills</p>
        </div>

        <div className='flex gap-2'>
            <input type="text" placeholder='Enter Your Skill(e.g Javascript,python,react..)' className='flex-1 px-3 pt-2 text-sm' onChange={(e)=>setNewSkill(e.target.value)} value={newSkill} onKeyDown={handleKeyPress}/>

            <button onClick={addSkill} disabled={!newSkill.trim} className='flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
                <Plus className='size-4'/> Add
            </button>
        </div>

        {data.length>0 ?(
            <div className='flex flex-wrap gap-2'>
                {data.map((skill,index)=>(
                    <span key={index} className='flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm'>
                        {skill}
                        <button onClick={()=>removeSkill(index)} className='ml-1 hover:bg-green-200 rounded-full p-0.5 transition-colors'>
                            <X className='w-3 h-3'/>
                        </button>
                    </span>
                ))}
            </div>
        ):(
            <div className='text-center py-6 text-gray-500'>
                <Sparkles className='w-10 h-10 mx-auto text-gray-300'/>
                <p>No Skills Added yet</p>
                <p className='text-sm'>Add Your Technical Skills</p>
            </div>
        )
        }

        <div className='bg-green-500 rounded-lg py-4'>
            <p className='text-sm text-green-800 px-2 font-2xl'><strong>Tips: </strong>Add 5-7 relavant skills. Include both techincal(programming language,tols) and soft skills(leadership,communication).</p>
        </div>
    </div>
  )
}

export default SkillsForm