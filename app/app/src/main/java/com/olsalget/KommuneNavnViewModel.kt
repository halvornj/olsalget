package com.olsalget

import android.app.Activity
import android.icu.lang.UCharacter.GraphemeClusterBreak.T
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.android.gms.tasks.Tasks.await
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.json.JSONObject
class KommuneNavnViewModel(val activity : Activity) : ViewModel() {
    private val TAG ="KommuneNavnViewModel"
     fun getKommuneNavn(lat : Double, lon : Double)  {
        val getter = KommuneNavnGetter(lat, lon)
        CoroutineScope(Dispatchers.IO).launch {
            val response = getter.makeRequest()
            when(response){
                is Result.Success<JSONObject> -> Log.d(TAG, "succes in KommuneNavnViewModel, got "+response.data.get("kommunenavn"))
                else -> Log.e(TAG,"error in KommuneNavnViewModel")
            }

        }
    }
}

