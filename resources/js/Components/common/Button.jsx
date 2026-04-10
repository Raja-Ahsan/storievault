import React from 'react'

const Button = ({children, className='', style={}}) => {
  return (
    <button className={`btn py-11 px-32 radius-60 ${className}`} style={style}>
      {children}
    </button>
  )
}

export default Button
