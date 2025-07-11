{-# LANGUAGE OverloadedStrings #-}


module Lib
    ( someFunc
        ) where

data Municipality = Municipality{   kommuneNavn          :: String,
    altNavn              :: String,
    utvidet              :: Bool,
    electionday          :: String,
    forstejuledag        :: String,
    forstenyttarsdag     :: String,
    forstepinsedag       :: String,
    grunnlovsdag         :: String,
    kristihimmelfartsdag :: String,
    offentlighoytidsdag  :: String,
    skjertorsdag         :: String,
    forstepaskedag       :: String,
    def                  :: String,
    sat                  :: String,
    palmesondag          :: String
}



someFunc :: IO ()
someFunc = putStrLn "someFunc"

initMunicipalities :: [Municipality]
initMunicipalities = do
    -- now what... db time?
