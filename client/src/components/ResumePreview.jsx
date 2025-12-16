import React from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import ClassicTemplate from './templates/ClassicTemplate'
import ModernTemplate from './templates/ModernTemplate'
import MinimalTemplate from './templates/MinimalTemplate'
import MinimalImageTemplate from './templates/MinimalImageTemplate'

const ResumePreview = ({ data, template, accentColor, sectionOrder, onSectionOrderChange }) => {
    const sections = sectionOrder || ['summary', 'experience', 'education', 'projects', 'skills']

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Reduced distance for easier activation
            }
        })
    )

    const handleDragEnd = (event) => {
        const { active, over } = event

        if (active && over && active.id !== over.id) {
            const oldIndex = sections.indexOf(active.id)
            const newIndex = sections.indexOf(over.id)
            
            if (oldIndex !== -1 && newIndex !== -1) {
                const newOrder = arrayMove(sections, oldIndex, newIndex)
                
                if (onSectionOrderChange) {
                    onSectionOrderChange(newOrder)
                }
            }
        }
    }

    const renderTemplate = () => {
        const templateProps = {
            data,
            accentColor,
            sectionOrder: sections,
            isDraggable: !!onSectionOrderChange
        }

        switch (template) {
            case "modern":
                return <ModernTemplate {...templateProps} />
            case "minimal":
                return <MinimalTemplate {...templateProps} />
            case "minimal-image":
                return <MinimalImageTemplate {...templateProps} />
            default:
                return <ClassicTemplate {...templateProps} />
        }
    }

    return (
        <div className='w-full bg-white rounded-lg shadow-lg'>
            <div id='resume-preview' className='print:shadow-none'>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={sections} strategy={verticalListSortingStrategy}>
                        {renderTemplate()}
                    </SortableContext>
                </DndContext>
            </div>
            <style jsx>{`
                @page {
                    size: letter;
                    margin: 0;
                }
                @media print {
                    html, body {
                        width: 8.5in;
                        height: 11in;
                        overflow: hidden;
                    }
                    body * {
                        visibility: hidden;
                    }
                    #resume-preview, #resume-preview * {
                        visibility: visible;
                    }
                    #resume-preview {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: auto;
                        margin: 0;
                        padding: 0;
                        box-shadow: none !important;
                        border: none !important;
                    }
                }
            `}</style>
        </div>
    )
}

export default ResumePreview