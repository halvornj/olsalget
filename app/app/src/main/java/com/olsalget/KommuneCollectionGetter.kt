package com.olsalget

import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.android.volley.Request
import com.android.volley.RequestQueue
import com.android.volley.toolbox.JsonObjectRequest
import com.android.volley.toolbox.Volley
import org.json.JSONObject

class KommuneCollectionGetter (private val volleyQueue:RequestQueue, val activity : MainActivity) : Runnable{
    private val TAG = "KommuneCollectionGetter"

    override fun run() {
        val url = "https://www.olsalget.no/kommuner.json"
        var responseObject : JSONObject = JSONObject()
        val jsonObjectRequest = JsonObjectRequest(Request.Method.GET, url, null,
            { response ->
                //successfully got response
                Log.d(TAG, "in successfull HolidayGetter")

                responseObject = response
            },
            { error ->
                // log the error message in the error stream
                Log.e(TAG, "error: ${error.localizedMessage}")
            })
        volleyQueue.add(jsonObjectRequest)
        if(responseObject.length() == 0){
            //todo: network request failed, get from local backup-file
            //todo (this file doesn't exist yet, remember to add this before shipping)
        }
        activity.setKommuner(responseObject)
    }
}