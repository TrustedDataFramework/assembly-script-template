package org.tds.cmd;

public class Test {

    static {
        Main.initCryptoContext();
    }

    private final HttpUtil httpUtil = new HttpUtil("localhost", 7010);


    public static void main(String[] args) {

    }
}
