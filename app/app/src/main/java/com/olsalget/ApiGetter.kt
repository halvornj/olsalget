package com.olsalget

import org.json.JSONObject

sealed class Result<out R> {
    data class Success<out T>(val data: T) : Result<T>()
    data class Error(val exception: Exception) : Result<Nothing>()
}

interface ApiGetter {

suspend fun makeRequest() : Result<JSONObject>

}