package updateprogram;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.io.IOException;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;

public class App {
    public static void main(String[] args) {
        try {
            String apiKey = null;
            if (args.length != 1) {
                System.out.println(
                        "run this program with the api key as a parameter.\ncontact the owner if you're missing this.");
                System.exit(1);
            }
            apiKey = args[0];

            String urlString = "https://apis.vinmonopolet.no/stores/v0/details";
            URL url = new URL(urlString);

            getStores(url, apiKey);

        } catch (MalformedURLException e) {
            System.out.println("malformed url exception");
            e.printStackTrace();
            System.exit(1);
        }
    }

    public static void getStores(URL url, String key) {
        try {
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            // Request headers
            connection.setRequestProperty("Cache-Control", "no-cache");
            connection.setRequestProperty("Ocp-Apim-Subscription-Key", key);
            connection.setRequestMethod("GET");

            // make sure response is good
            int status = connection.getResponseCode();
            System.out.println("status: " + status);
            if (status != 200) {
                System.out.println("error in request: response code " + status);
                System.exit(1);
            }
            // response is ok

            BufferedReader in = new BufferedReader(
                    new InputStreamReader(connection.getInputStream()));
            String inputLine;
            StringBuffer content = new StringBuffer();
            while ((inputLine = in.readLine()) != null) {
                content.append(inputLine);
            }
            in.close();
            connection.disconnect();
            System.out.println("successful api-response, connection closed.");

            // now we parse json
            JSONArray fullArray = new JSONArray(content.toString());
            JSONArray newArray = new JSONArray(fullArray.length());
            for (int i = 0; i < fullArray.length(); i++) {
                JSONObject currentStore = fullArray.getJSONObject(i);
                JSONObject writeStore = new JSONObject();
                writeStore.put("storeId", currentStore.get("storeId"));
                writeStore.put("gpsCoord", ((JSONObject) currentStore.get("address")).get("gpsCoord"));
                writeStore.put("storeName", currentStore.get("storeName"));
                newArray.put(writeStore);
            }
            System.out.println("json parsed.");
            // now, write newArray to file
            File myObj = new File("../stores.json");
            // this bit just makes sure the file exists. 'if' can be removed later
            if (myObj.createNewFile()) {
                System.out.println("File created: " + myObj.getName());
            } else {
                System.out.println("Found file ../stores.json");
            }
            PrintWriter myFile = new PrintWriter("../stores.json", "UTF-8");
            System.out.println("writing to file...");
            myFile.println(newArray.toString(4));
            myFile.close();
            System.out.println("stores.json is now updated.");
        } catch (IOException e) {
            e.printStackTrace();
            System.exit(1);
        }
    }
}
