package org.tds.cmd;

import org.tdf.sunflower.types.Transaction;

public class Test {

    static {
        Main.initCryptoContext();
    }

    private final HttpUtil httpUtil = new HttpUtil("120.76.101.153", 7010);


    public static void main(String[] args) {
    }
}
