{-# LANGUAGE OverloadedStrings #-}

module Lib
    (routes
    ,db
    ,getAllMunicipalities
    ,getMunicipality
    ,getAllNames
    ) where

import Web.Scotty
import Database.PostgreSQL.Simple
import Data.Configurator
import Data.Configurator.Types


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


db::Config -> IO Connection
db conf = do
    dbName <- require conf "POSTGRES_DB"
    user <- require conf "POSTGRES_USER"
    password <- require conf "POSTGRES_PASSWORD"

    let connectInfo = defaultConnectInfo {
        connectHost = "0.0.0.0",
        connectDatabase = dbName,      -- Use the String value obtained from the IO action
        connectUser = user,            -- Use the String value
        connectPassword = password     -- Use the String value
    }
    connect connectInfo


-- Connection is conn to db
routes :: Connection -> IO ()
routes conn = scotty 8088 $ do
    get "/" $ text "foobar"
    get "/municipalities/" $ getAllMunicipalities conn
    get "/municipalities/:name" $ getMunicipality conn
    get "/municipalities/names/" $ getAllNames conn

getAllMunicipalities :: Connection -> ActionM ()
getAllMunicipalities conn = do
    let result = query conn "SELECT * FROM municipalities"
	...
