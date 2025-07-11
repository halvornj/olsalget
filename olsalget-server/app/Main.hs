{-# LANGUAGE OverloadedStrings #-}


module Main (main) where
import Data.Configurator
import Data.Configurator.Types
import Web.Scotty


main :: IO ()

main = scotty 3000 $ do
    get "/" $ text "foobar"
