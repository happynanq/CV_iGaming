import { Assets } from "pixi.js"

export const assetsLoader = async() =>{ 
  await Assets.load([{src:"/assets/symbols/react.webp", alias:"react"}])
}