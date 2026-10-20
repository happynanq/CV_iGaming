"use client"
import { useCallback } from "react"
import {Container, Graphics, Sprite} from "pixi.js"
import {extend, Application} from "@pixi/react"
import MySymbol from "./MySymbol";



extend({Container, Graphics, Sprite}); 

export default function SlotCanvas(){ 
  const draw = useCallback(
    (graphics: Graphics)=>{
      graphics.clear(); 
      graphics.setFillStyle({color:0x24182f});
      graphics.roundRect(0, 0, 500, 300, 24);
      graphics.fill()

    }, []
  )


  return(
    <div className="w-full overflow-hidden flex justify-center items-center">
      <Application resizeTo={undefined} background={0x100d17} antialias autoDensity resolution={Math.min(
        typeof window !== "undefined"
            ? window.devicePixelRatio
            : 1,
          2

      )}>

        <pixiContainer>
          <pixiGraphics draw={draw}/>
        </pixiContainer>
        <pixiContainer>
          <MySymbol/>
        </pixiContainer>

      </Application>
    </div>
  )
}