{-# LANGUAGE OverloadedStrings #-}


module Main (main) where

import Web.Scotty


main :: IO ()

main = scotty 3000 $ do
    get "/" $ text "foobar"