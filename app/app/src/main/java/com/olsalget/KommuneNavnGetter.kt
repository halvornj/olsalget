package com.olsalget

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

class KommuneNavnGetter (val lat : Double, val lon : Double) : ApiGetter {


    override suspend fun makeRequest() : Result<JSONObject>{
        return withContext(Dispatchers.IO) {
            val requestUrl =
                "https://ws.geonorge.no/kommuneinfo/v1/punkt?nord=" + lat + "&koordsys=4326&ost=" + lon
            val url = URL(requestUrl)
            (url.openConnection() as? HttpURLConnection)?.run {
                requestMethod = "GET"
                setRequestProperty("Content-Type", "application/json; utf-8")
                setRequestProperty("Accept", "application/json")
                return@withContext  Result.Success(JSONObject(inputStream.bufferedReader().readLine()))
            }
            return@withContext Result.Error(Exception("Cannot open HttpURLConnection"))
        }
    }
}