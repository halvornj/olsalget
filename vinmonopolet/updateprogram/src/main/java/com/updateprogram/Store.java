package com.updateprogram;

public class Store {

    final int id;
    final double lat, lon;

    public Store(int id, double lat, double lon) {
        this.id = id;
        this.lat = lat;
        this.lon = lon;
    }

    public int getId() {
        return id;
    }

    public double getLat() {
        return lat;
    }

    public double getLon() {
        return lon;
    }

    static public int getDistance(Store a, Store B) {
        // todo
        return 0;
    }

}
