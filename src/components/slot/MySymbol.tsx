"use client"

import { Assets } from "pixi.js"

export default function MySymbol(){
  const texture = Assets.get("react")
  return(
    <pixiSprite
    texture={texture}
    width={100}
    height={100}
    />
  )
}