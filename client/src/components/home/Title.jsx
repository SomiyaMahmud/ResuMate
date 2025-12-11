import React from 'react'

const Title = ({title, description}) => {
  return (
    <div className='text-center mt-6 text-slate-700 dark:text-slate-200 transition-colors'>
        <h2 className='text-3xl sm:text-4xl font-medium'>{title}</h2>
        <p className='max-w-2xl mt-4 text-slate-500 dark:text-slate-400 mx-auto'>{description}</p>
    </div>
  )
}

export default Title