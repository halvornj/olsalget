{-# LANGUAGE OverloadedStrings #-}


module Main (main) where
import Data.Configurator
import Lib

main :: IO ()
main = do
    config <- load[Required "db-info.env"]
    dbConn <- Lib.db config
    Lib.routes dbConn
