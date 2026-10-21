import { Assets } from "pixi.js"

const t = [ 
  {src:"/assets/symbols/react.webp", alias:"react"}, 
  {src:"/assets/symbols/pixi.webp", alias:"pixi"}, 
  {src:"/assets/symbols/scatter.webp", alias:"scatter"}, 
  {src:"/assets/symbols/wild.webp", alias:"wild"},
  {src:"/assets/symbols/ts.webp", alias:"ts"}
]

export const assetsLoader = async() =>{ 
  await Assets.load(t)
}