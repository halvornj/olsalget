{-# LANGUAGE OverloadedStrings #-}


module Main (main) where
import Data.Configurator


main :: IO ()
main = do
    config <- load[Required "db-info.env"]
    display config