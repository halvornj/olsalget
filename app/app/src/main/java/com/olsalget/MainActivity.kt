package com.olsalget

import android.Manifest
import android.annotation.SuppressLint
import android.content.pm.PackageManager
import android.location.Location
import android.os.Bundle
import android.util.Log
import android.widget.ArrayAdapter
import android.widget.AutoCompleteTextView
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import com.android.volley.Request
import com.android.volley.toolbox.JsonObjectRequest
import com.android.volley.toolbox.Volley
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationServices
import com.google.android.gms.tasks.CancellationToken
import com.google.android.gms.tasks.CancellationTokenSource
import com.google.android.gms.tasks.OnTokenCanceledListener
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL


class MainActivity : AppCompatActivity() {

    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private val TAG = "MainTag"
    companion object {
        private const val COARSE_LOCATION_PERMISSION_CODE = 100
    }
    private lateinit var cancelLocationToken : CancellationTokenSource
    override fun onCreate(savedInstanceState: Bundle?) {
        //standard stuff, no touching for now
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        //get the users location
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        cancelLocationToken = CancellationTokenSource()
        //android studio says i need this :(
        if (ActivityCompat.checkSelfPermission(this,
                Manifest.permission.ACCESS_COARSE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            Log.d("TESTBUG", "A. we don't have permission, calling request here")
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.ACCESS_COARSE_LOCATION), COARSE_LOCATION_PERMISSION_CODE)
        }else{
            Log.d("TESTBUG", "B. already have Manifest.permission, calling getCurrentLocation")
            fusedLocationClient.getCurrentLocation(LocationRequest.PRIORITY_HIGH_ACCURACY, cancelLocationToken.token)
                .addOnSuccessListener { location ->
                    Log.d("TESTBUG", "B.1 got loc, calling geoLocSucces")
                    geoLocSuccess(location)
                }
                .addOnFailureListener { exception ->
                    Log.d("Location", "Oops location failed with exception: $exception")
                }
        }

        // Get a reference to the AutoCompleteTextView in the layout.
        val textView = findViewById<AutoCompleteTextView>(R.id.kommunenavnInput)
        // Get the string array.
        val countries: Array<out String> = resources.getStringArray(R.array.kommunenavn_array)
        // Create the adapter and set it to the AutoCompleteTextView.
        ArrayAdapter<String>(this, android.R.layout.simple_list_item_1, countries).also { adapter ->
            textView.setAdapter(adapter)
        }

        findViewById<Button>(R.id.comingWeekButton).setOnClickListener{
            Log.d("BUTTONS", "User tapped the button")
        }

    }

    @SuppressLint("MissingPermission")
    override fun onRequestPermissionsResult(requestCode: Int,
                                            permissions: Array<String>,
                                            grantResults: IntArray){
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)

        if(requestCode == COARSE_LOCATION_PERMISSION_CODE){
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Log.d("TESTBUG", "A.1 coarse location granted, calling getCurrentLocation")
                fusedLocationClient.getCurrentLocation(LocationRequest.PRIORITY_HIGH_ACCURACY, cancelLocationToken.token)
                    .addOnSuccessListener { location ->
                        Log.d("TESTBUG", "A.2 got location, calling geoLocSuccess")
                        geoLocSuccess(location)
                    }
                    .addOnFailureListener { exception ->
                        Log.d("Location", "Oops location failed with exception: $exception")
                    }
            }else{
                geoLocSuccess(null)
            }
        }
    }

    fun geoLocSuccess(location: Location?) {
        cancelLocationToken.cancel()
        if (location == null) {
            Log.d(TAG, "location is null")
            geoLocDone("Oslo")
        } else {
            Log.d(TAG, "loc not null")
            Log.d(TAG, "lat: "+location.latitude)
            Log.d(TAG, "lon: "+location.longitude)
            val geoNorgeUrl =
                "https://ws.geonorge.no/kommuneinfo/v1/punkt?nord=" +
                        location.latitude +
                        "&koordsys=4326&ost=" +
                        location.longitude

            //trying new method: https://www.geeksforgeeks.org/how-to-make-an-http-request-with-android/
            var geoNorgeResponse : String
            val volleyQueue = Volley.newRequestQueue(this)
            val jsonObjectRequest = JsonObjectRequest(Request.Method.GET,geoNorgeUrl, null,
                { response ->
                //successfully got response
                 geoNorgeResponse = response.get("kommunenavn") as String
                Log.d(TAG, "geoNorgeResponse: "+geoNorgeResponse)
                    geoLocDone(geoNorgeResponse)
                },
                { error ->
                // make a Toast telling the user
                // that something went wrong
                Toast.makeText(this, "Some error occurred! Cannot fetch municipality name", Toast.LENGTH_LONG).show()
                // log the error message in the error stream
                Log.e(TAG, "geoLocSuccess error: ${error.localizedMessage}")
            })
            volleyQueue.add(jsonObjectRequest)

        }
    }

    fun geoLocDone(kommuneNavn : String){
        Toast.makeText(this, kommuneNavn, Toast.LENGTH_SHORT).show()
        Log.d(TAG, "in geolocDone w/" +kommuneNavn)
        findViewById<TextView>(R.id.salesTimes).text = kommuneNavn
    }

}