import java.net.HttpURLConnection;
import java.net.URL;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.BufferedReader;

import java.io.File;

public class Main {
    public static void main(String[] args) {

        int storeId = 111;
        Store response;

        String urlString = "https://apis.vinmonopolet.no/stores/v0/details?storeId=";
        try {
            // create file and writer
            File outputFile = new File("stores.json");
            if (outputFile.createNewFile()) {
                System.out.println("File created: " + outputFile.getName());
            }

            FileWriter writer = new FileWriter("stores.json");
            writer.write("[");

            // get an initial value
            response = getStore((urlString + storeId));
            storeId++;
            /*
             * while (response != null) {
             * // do stuff
             * // ?template: ",{obj}\n"
             * writer.write(",{" + "}");
             * // finally
             * Thread.sleep(1000);
             * storeId++;
             * response = getStore(urlString + storeId);
             * }
             */
            writer.write("]");
            writer.close();
        } catch (IOException e) {
            System.out.println("IOException occured, aborting...");
            System.exit(1);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    static public Store getStore(String urlString) {
        try {
            URL url = new URL(urlString);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();

            // Request headers
            connection.setRequestProperty("Cache-Control", "no-cache");
            connection.setRequestProperty("Ocp-Apim-Subscription-Key", "5e84979b75fe4d4e87348476bd1d89a5");
            connection.setRequestMethod("GET");

            BufferedReader responseReader = new BufferedReader(
                    new InputStreamReader(connection.getInputStream()));
            String jsonString = responseReader.readLine();
            System.out.println(jsonString);

            // no need to construct an actual JSON object, we're just interrested in ID and
            // lat/lon
            connection.disconnect();

            for (int i = 0; i < jsonString.length(); i++) {

            }

            return null;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}