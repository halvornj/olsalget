package com.olsalget

import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.android.volley.Request
import com.android.volley.RequestQueue
import com.android.volley.toolbox.JsonObjectRequest
import com.android.volley.toolbox.Volley
import org.json.JSONObject
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Date

class HolidayGetter (val volleyQueue : RequestQueue, val activity : MainActivity): Runnable {
    private val TAG = "HolidayGetter"

    override fun run(){
        val url =  "https://webapi.no/api/v1/holidays/" + LocalDate.now().year
        var yearJSON = JSONObject()
        val jsonObjectRequest = JsonObjectRequest(
            Request.Method.GET, url, null,
            { response ->
                //successfully got response
                Log.d(TAG, "in successfull HolidayGetter")
                yearJSON = response
            },
            { error ->
                // log the error message in the error stream
                Log.e(TAG, "error: ${error.localizedMessage}")

            })
        volleyQueue.add(jsonObjectRequest)

        activity.setHolidays(yearJSON)
    }
}