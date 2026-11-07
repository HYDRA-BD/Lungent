'use client'

import { Hero3DPeople } from './hero-3d-people'

export function Hero3DWorried(props: {
  x?: any
  y?: any
  rotate?: any
  opacity?: any
}) {
  return <Hero3DPeople parallaxY={props.y} parallaxOpacity={props.opacity} />
}
