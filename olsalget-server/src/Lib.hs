{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE DeriveAnyClass #-}
{-# LANGUAGE DeriveGeneric  #-}
module Lib
    (routes
    ,db
    ,getAllMunicipalities
    ,getMunicipality
    ,getAllNames
    ) where

import GHC.Generics (Generic)
import Web.Scotty
import Database.PostgreSQL.Simple
import Database.PostgreSQL.Simple.FromRow
import Data.Configurator
import Data.Configurator.Types
import Data.Aeson
import Network.HTTP.Types.Status (status200, status400)

import Data.Monoid ((<>))

data Municipality = Municipality{ -- because of stupid norwegian laws (and my database design) some holidays do not have special rules. I've set these to null in db, and its a bad backend that doesn't support nulls but relies on the database storing empty strings!
    kommuneNavn          :: String,
    altNavn              :: Maybe String,
    electionday          :: Maybe String,
    forstejuledag        :: Maybe String,
    forstenyttarsdag     :: Maybe String,
    forstepinsedag       :: Maybe String,
    grunnlovsdag         :: Maybe String,
    kristihimmelfartsdag :: Maybe String,
    offentlighoytidsdag  :: Maybe String,
    skjertorsdag         :: Maybe String,
    forstepaskedag       :: Maybe String,
    standard             :: Maybe String,
    saturday             :: Maybe String,
    palmesondag          :: Maybe String
}
  deriving (Show, Generic, FromRow)

instance ToJSON Municipality where
    toJSON (Municipality kommuneNavn altNavn electionday forstejuledag forstenyttarsdag forstepinsedag grunnlovsdag kristihimmelfartsdag offentlighoytidsdag skjertorsdag forstepaskedag standard saturday palmesondag) =
	object
	    ["kommuneNavn" .= kommuneNavn,
	    "altNavn" .= altNavn,
	    "electionday" .= electionday,
	    "forstejuledag" .= forstejuledag,
	    "forstenyttarsdag" .= forstenyttarsdag,
	    "forstepinsedag" .= forstepinsedag,
	    "grunnlovsdag" .= grunnlovsdag,
	    "kristihimmelfartsdag" .= kristihimmelfartsdag,
	    "offentlighoytidsdag" .= offentlighoytidsdag,
	    "skjertorsdag" .= skjertorsdag,
	    "forstepaskedag" .= forstepaskedag,
	    "standard" .= standard,
	    "saturday" .= saturday,
	    "palmesondag" .= palmesondag
	]



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
    get "/municipalities" $ getAllMunicipalities conn
    get "/municipalities/names" $ getAllNames conn
    get "/municipalities/:name" $ getMunicipality conn
    
    get "/hello" $ do
	text "hello world!"
    get "/hello/:name" $ do
        name <- param "name"
        text ("hello " <> name <> "!")


getAllMunicipalities :: Connection -> ActionM ()
getAllMunicipalities conn = do
    munics <- (liftIO $ query_ conn "SELECT * FROM municipalities") :: ActionM [Municipality]
    Web.Scotty.json $ object["municipalities" .= munics]


getMunicipality :: Connection -> ActionM ()
getMunicipality conn = do
    _kommuneNavn <- param "name" :: ActionM String
    let res = query conn "SELECT * FROM municipalities WHERE kommunenavn = ?" (Only _kommuneNavn)
    munic <- liftIO res :: ActionM [Municipality]
    case munic of
	[] -> do
	    status status400
	    Web.Scotty.json $ object ["error" .= ("not found" :: String)]
 	_ -> do
	    status status200
	    Web.Scotty.json (head munic)


getAllNames :: Connection -> ActionM ()
getAllNames conn = do
    let res = query_ conn "SELECT municipalities.kommunenavn FROM municipalities"
    names <- liftIO res :: ActionM[String]
    case names of
	[] -> do
	    status status400
	    Web.Scotty.json $ object["error" .= ("empty database. contact admin" :: String)]
	_ -> do
	    status status200
	    Web.Scotty.json names
