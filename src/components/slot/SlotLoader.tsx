"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { assetsLoader } from "./utils/load/assetsLoader"




const SlotCanvas = dynamic(
  ()=>import("./SlotCanvas"), 
  {
    ssr:false, 
    loading:()=> <div className="">Loading Slot...</div>
  }
)

export default function SlotLoader(){

  const [loading, setLoading] = useState<boolean>(true)


  useEffect(()=>{

    assetsLoader().then(()=>{
      console.log("Asset Loaded!")
      setLoading(false)
    }).catch(e=>{
      console.error("Asset wasn't loaded", e )
    })
  }, [])

  if(loading){
    return <div> Assets loadings now</div>
  }
  return <>123</>
}