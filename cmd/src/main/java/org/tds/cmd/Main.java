package org.tds.cmd;

import com.beust.jcommander.JCommander;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.tdf.crypto.CryptoHelpers;
import org.tdf.crypto.sm2.SM2;
import org.tdf.crypto.sm2.SM2PrivateKey;
import org.tdf.crypto.sm2.SM2PublicKey;
import org.tdf.gmhelper.SM2Util;
import org.tdf.gmhelper.SM3Util;
import org.tdf.sunflower.types.CryptoContext;


public class Main {
    static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    public static void initCryptoContext() {
        CryptoContext.setSignatureVerifier((pk, msg, sig) -> new SM2PublicKey(pk).verify(msg, sig));
        CryptoContext.setSigner((sk, msg) -> new SM2PrivateKey(sk).sign(msg));
        CryptoContext.setSecretKeyGenerator(() -> SM2.generateKeyPair().getPrivateKey().getEncoded());
        CryptoContext.setGetPkFromSk((sk) -> new SM2PrivateKey(sk).generatePublicKey().getEncoded());
        CryptoContext.setEcdh((initiator, sk, pk) -> SM2.calculateShareKey(initiator, sk, sk, pk, pk, SM2Util.WITH_ID));
        CryptoContext.setEncrypt(CryptoHelpers.ENCRYPT);
        CryptoContext.setDecrypt(CryptoHelpers.DECRYPT);
        CryptoContext.setPublicKeySize(CryptoContext.getPkFromSk(CryptoContext.generateSecretKey()).length);
        CryptoContext.setHashFunction(SM3Util::hash);
    }

    public static void main(String... args) throws Exception {
        initCryptoContext();
        Deploy d = new Deploy();
        Compile c = new Compile();
        JCommander jc = JCommander.newBuilder()
                .addCommand("deploy", d)
                .addCommand("compile", c)
                .build();
        jc.parse(args);
        switch (jc.getParsedCommand()) {
            case "compile":
                c.run();
                break;
            case "deploy":
                d.run();
                break;
            default:
                throw new RuntimeException("invalid args");
        }
    }

}
