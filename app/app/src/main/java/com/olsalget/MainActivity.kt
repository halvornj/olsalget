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
import androidx.constraintlayout.motion.widget.Debug.getLocation
import androidx.core.app.ActivityCompat
import com.android.volley.Request
import com.android.volley.toolbox.JsonObjectRequest
import com.android.volley.toolbox.Volley
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationServices
import com.google.android.gms.tasks.CancellationToken
import com.google.android.gms.tasks.CancellationTokenSource
import java.util.concurrent.locks.ReentrantLock
import java.util.concurrent.locks.Condition
import com.google.android.gms.tasks.OnTokenCanceledListener
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.time.LocalDate
import java.time.format.DateTimeFormatter


class MainActivity : AppCompatActivity() {

    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private val TAG = "MainTag"
    private val volleyQueue = Volley.newRequestQueue(this)
    private lateinit var kommuner : JSONObject
    private lateinit var holidays : JSONObject
    companion object {
        private const val COARSE_LOCATION_PERMISSION_CODE = 100
    }
    private lateinit var cancelLocationToken : CancellationTokenSource
    private val networkRequestThreads = ArrayList<Thread>()

    override fun onCreate(savedInstanceState: Bundle?) {
        //standard stuff, no touching for now
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        //start all http-request threads here, do some work, and then await the conditions
        //* we do all network requests AND PARSING in separate threads!
        val kommuneCollectionThread = Thread(KommuneCollectionGetter(volleyQueue, this))
        networkRequestThreads.add(kommuneCollectionThread)
        kommuneCollectionThread.start()

        val holidayGetterThread = Thread(HolidayGetter(volleyQueue, this))
        networkRequestThreads.add(holidayGetterThread)
        holidayGetterThread.start()



        //get the users location
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        cancelLocationToken = CancellationTokenSource()
        //android studio says i need this :( - they're probably right
        if (ActivityCompat.checkSelfPermission(this,
                Manifest.permission.ACCESS_COARSE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            Log.d("TESTBUG", "A.1 need permission, calling requestPermissions")
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.ACCESS_COARSE_LOCATION), COARSE_LOCATION_PERMISSION_CODE)
        }else{
            Log.d("TESTBUG", "B.1 Already had permission, calling getUserLocation")
            getUserLocation()
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
    private fun getUserLocation(){
        Log.d("TESTBUG", "in getUserLocation")
        fusedLocationClient.getCurrentLocation(LocationRequest.PRIORITY_HIGH_ACCURACY, cancelLocationToken.token)
            .addOnSuccessListener { location ->
                Log.d("TESTBUG","getUserLocation success, calling geoLocSucces w/ location")
                geoLocSuccess(location)
            }
            .addOnFailureListener { exception ->
                Log.d("Location", "Oops location failed with exception: $exception")
                geoLocSuccess(null)
            }
    }

    @SuppressLint("MissingPermission")
    override fun onRequestPermissionsResult(requestCode: Int,
                                            permissions: Array<String>,
                                            grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        Log.d("TESTBUG", "A.2 onRequestPermissionsResult() called")
        if (requestCode == COARSE_LOCATION_PERMISSION_CODE) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Log.d("TESTBUG", "A.3 permission granted, calling geoLocSuccess w/ Position")
                getUserLocation()
            }else{
                Log.d("TESTBUG", "permission not granted, calling geoLocSuccess() w/ null")
                geoLocSuccess(null)
            }
        }
    }

    private fun geoLocSuccess(location: Location?) {
        cancelLocationToken.cancel()
        var userKommune : String = "Oslo"
        if (location == null) {
            Log.d(TAG, "location is null")
            //todo maybe a toast of some sort here, explaining why oslo
        } else {
            Log.d(TAG, "loc not null")
            Log.d(TAG, "lat: "+location.latitude)
            Log.d(TAG, "lon: "+location.longitude)
            val userLocationThread = Thread(Runnable {
                @Override
                fun run(){
                    userKommune = UserKommuneGetter.getResponse(volleyQueue, location) ?:"Oslo"
                }
            })
            networkRequestThreads.add(userLocationThread)
            userLocationThread.start()
        }


        for(thread in networkRequestThreads){
            thread.join()
        }
        //all api-calls are now done
        geoLocDone(userKommune)
    }

    fun setHolidays(jsonobj : JSONObject){
        holidays = jsonobj
    }

    fun setKommuner(jsonobj: JSONObject){
        kommuner = jsonobj
    }


    private fun geoLocDone(kommuneNavn : String){
        //!this is the join-point after all async api-calls and permission-requests
        Toast.makeText(this, kommuneNavn, Toast.LENGTH_SHORT).show()
        Log.d(TAG, "in geolocDone w/" +kommuneNavn)
        findViewById<TextView>(R.id.salesTimes).text = kommuneNavn

        Log.d(TAG, kommuner.toString())
        Log.d(TAG, holidays.toString())
        Log.d(TAG, kommuneNavn)

        val today = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)


        //note to self: at this point, all info should be gotten, and the logic should be the final part
    }

}