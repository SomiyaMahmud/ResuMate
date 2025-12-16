import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

const DraggableSectionPreview = ({ id, children, isDraggable = true }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ 
        id,
        disabled: !isDraggable 
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    if (!isDraggable) {
        return <div>{children}</div>
    }

    return (
        <div ref={setNodeRef} style={style} className='relative group'>
            {/* Drag Handle - Positioned to the left with better visibility */}
            <div
                {...attributes}
                {...listeners}
                className='absolute -left-10 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-gray-100 hover:bg-opacity-50 rounded transition-all print:hidden z-50'
                title="Drag to reorder"
            >
                <div className='bg-gray-700 hover:bg-gray-900 p-1.5 rounded-md shadow-md transition-colors'>
                    <GripVertical className='size-5 text-white' />
                </div>
            </div>
            {children}
        </div>
    )
}

export default DraggableSectionPreview