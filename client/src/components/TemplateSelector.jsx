import { Check, Layout } from 'lucide-react'
import React, { useState } from 'react'

const TemplateSelector = ({selectedTemplate, onChange}) => {
    const [isOPen, setIsOpen] = useState(false)

    const templates = [
        {
            id: "classic",
            name: "Classic",
            preview: "A clean, traditional resume format with clear section and professional typography"
        },
        {
            id: "modern",
            name: "Modern",
            preview: "Sleek design with stratigic use of color and modern font choice"
        },
        {
            id: "minimal-image",
            name: "Minimal Image",
            preview: "Minimal Design with a single image and clean typography"
        },
        {
            id: "minimal",
            name: "Minimal",
            preview: "Ultra clean desing that puts your content front and center"
        }
    ]
  return (
    <div className='relative'>
        <button onClick={()=> setIsOpen(!isOPen)} className='flex items-center gap-1 text-sm text-green-600 bg-gradient-to-br from-green=50 to-green-100 ring-green-300 hover:ring transition-all px-3 py-2 rounded-lg'>
            <Layout size={14}/><span className='max-sm:hidden'>Template</span>
        </button>
        {isOPen && (
            <div className='absolute top-full w-xs p-3 mt-2 space-y-3 z-10 bg-white rounded-md border border-gray-200 shadow-sm'>
                {templates.map((template)=>(
                    <div key={template.id} onClick={()=>{onChange(template.id);setIsOpen(false)}} className={`realtive p-3 border rounded-md cursor-pointer transition-all ${selectedTemplate === template.id ?
                        "boder-green-400 bg-green-100"
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-100"

                    }`}>
                        {selectedTemplate===template.id && (
                            <div className='absolute top-2 right-2'>
                                <div className='size-5 bg-green-400 rounded-full flex items-center justify-center'>
                                    <Check className='w-3 h-3 text-white'/>
                                </div>
                            </div>
                        )}


                        <div className='space-y-1'>
                            <h4 className='font-medium text-gray-800'>{template.name}</h4>
                            <div className='mt-2 p-2 bg-green-50 rounded text-xs text-gray-500 italic'>{template.preview}</div>
                        </div>

                    </div>
                ))}
            </div>
        )}
    </div>
  )
}

export default TemplateSelector