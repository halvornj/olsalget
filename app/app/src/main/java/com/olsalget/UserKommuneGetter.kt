package com.olsalget

import android.location.Location
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.android.volley.Request
import com.android.volley.RequestQueue
import com.android.volley.toolbox.JsonObjectRequest
import com.android.volley.toolbox.Volley
import org.json.JSONObject

class UserKommuneGetter {

    companion object {
        private val TAG = "UserKommuneGetter"

        fun getResponse(volleyQueue : RequestQueue, location: Location): String?{
            val geoNorgeUrl =
                "https://ws.geonorge.no/kommuneinfo/v1/punkt?nord=" +
                        location.latitude +
                        "&koordsys=4326&ost=" +
                        location.longitude

            var geoNorgeResponse : String? = null
            val jsonObjectRequest = JsonObjectRequest(
                Request.Method.GET,geoNorgeUrl, null,
                { response ->
                    //successfully got response
                    Log.d(TAG, "in successfull HolidayGetter")

                    geoNorgeResponse = response.get("kommunenavn") as String
                },
                { error ->
                    // todo make a Toast telling the user that something went wrong
                    // log the error message in the error stream
                    Log.e(TAG, " error in UserKommuneGetter${error.localizedMessage}")
                })
            volleyQueue.add(jsonObjectRequest)
            return geoNorgeResponse

        }
    }
}