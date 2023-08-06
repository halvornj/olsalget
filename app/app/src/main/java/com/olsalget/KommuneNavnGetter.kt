package com.olsalget

import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

class KommuneNavnGetter (val lat : Float, val lon : Float) : ApiGetter {


    override fun makeRequest() : Result<JSONObject>{
        val requestUrl = "https://ws.geonorge.no/kommuneinfo/v1/punkt?nord="+lat + "&koordsys=4326&ost=" +lon
        val url = URL(requestUrl)
        (url.openConnection() as? HttpURLConnection)?.run {
            requestMethod = "GET"
            setRequestProperty("Content-Type", "application/json; utf-8")
            setRequestProperty("Accept", "application/json")
            return Result.Success(JSONObject(inputStream.read().toString()))
        }
        return Result.Error(Exception("Cannot open HttpURLConnection"))

    }
}