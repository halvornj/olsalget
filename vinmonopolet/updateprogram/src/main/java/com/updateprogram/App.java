package com.updateprogram;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;
import java.io.UnsupportedEncodingException;
import java.io.DataInputStream;
import java.io.InputStream;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Scanner;
import org.apache.commons.lang3.StringUtils;
import java.io.File;

public class App {
    public static void main(String[] args) {
        try {
            String apiKey = null;
            Scanner keyScanner = new Scanner(new File("../../../resources/api_key.txt"));
            apiKey = keyScanner.nextLine();
            keyScanner.close();
            // testing
            System.out.println(apiKey);

            String urlString = "https://apis.vinmonopolet.no/stores/v0/details";
            URL url = new URL(urlString);

            Store[] stores = getStores(url, apiKey);

        } catch (MalformedURLException e) {
            System.out.println("malformed url exception");
            e.printStackTrace();
            System.exit(1);
        } catch (FileNotFoundException e) {
            System.out.println(
                    "couldn't find file with api key. this should be stored in a file called api_key.txt, in src/main/resources/");
            System.exit(1);
        }
    }

    public static Store[] getStores(URL url, String key) {
        try {
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        } catch (IOException e) {
            e.printStackTrace();
            System.exit(1);
        }
        // !makes linter happy, remove later
        return null;
    }
}
