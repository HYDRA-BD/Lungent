'use client'

import { Hero3DLungs } from './hero-3d-lungs'

export function Hero3DHeart(props: {
  x?: any
  y?: any
  rotate?: any
  opacity?: any
}) {
  return <Hero3DLungs parallaxY={props.y} parallaxOpacity={props.opacity} />
}
